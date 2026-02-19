import { searchEntries } from "../db.js";

export function handleSearch(
  query: string,
  limit: number = 10,
): Array<{
  handle: string;
  summary: string;
  relevance_snippet: string;
  created_at: string;
}> {
  const entries = searchEntries(query, limit);
  const lowerQuery = query.toLowerCase();

  return entries.map((entry) => {
    const lines = entry.content.split("\n");
    const matchLine = lines.find((line) =>
      line.toLowerCase().includes(lowerQuery),
    );
    const snippet = matchLine
      ? matchLine.slice(0, 200)
      : entry.content.slice(0, 200);

    return {
      handle: entry.handle,
      summary: entry.summary,
      relevance_snippet: snippet,
      created_at: entry.created_at,
    };
  });
}
