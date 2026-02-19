import { getEntries, type VaultEntry } from "../db.js";

export function handlePack(
  handles: string[],
  budgetChars: number = 4000,
  strategy: "recency" | "relevance" | "balanced" = "balanced",
): {
  packed_context: string;
  items_included: number;
  items_omitted: number;
  chars_used: number;
} {
  const entries = getEntries(handles);
  if (entries.length === 0) {
    return { packed_context: "", items_included: 0, items_omitted: 0, chars_used: 0 };
  }

  // Score and sort entries based on strategy
  const now = Date.now();
  const scored = entries.map((entry) => {
    const age = now - new Date(entry.created_at + "Z").getTime();
    const recencyScore = 1 / (1 + age / 3_600_000); // decay per hour
    const sizeScore = 1 / (1 + entry.size_bytes / 1000); // prefer smaller
    let score: number;
    switch (strategy) {
      case "recency":
        score = recencyScore;
        break;
      case "relevance":
        score = sizeScore;
        break;
      case "balanced":
        score = recencyScore * 0.6 + sizeScore * 0.4;
        break;
    }
    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const included: VaultEntry[] = [];
  let charsUsed = 0;
  let packed = "";

  for (const { entry } of scored) {
    const separator = included.length > 0 ? `\n--- ${entry.handle} ---\n` : `--- ${entry.handle} ---\n`;
    const needed = separator.length + entry.content.length;

    if (charsUsed + needed <= budgetChars) {
      packed += separator + entry.content;
      charsUsed += needed;
      included.push(entry);
    } else {
      // Try to fit a truncated version of this entry
      const remaining = budgetChars - charsUsed - separator.length;
      if (remaining > 50) {
        packed += separator + entry.content.slice(0, remaining);
        charsUsed += separator.length + Math.min(entry.content.length, remaining);
        included.push(entry);
      }
      break;
    }
  }

  return {
    packed_context: packed,
    items_included: included.length,
    items_omitted: entries.length - included.length,
    chars_used: charsUsed,
  };
}
