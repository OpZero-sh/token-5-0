import { getEntry } from "../db.js";

export function handleRetrieve(
  handle: string,
  query?: string,
  lineStart?: number,
  lineEnd?: number,
  maxLines: number = 50,
): {
  content: string;
  total_lines: number;
  returned_lines: number;
  truncated: boolean;
} {
  const entry = getEntry(handle);
  if (!entry) {
    throw new Error(`Entry not found: ${handle}`);
  }

  let lines = entry.content.split("\n");
  const totalLines = lines.length;

  if (query) {
    const lowerQuery = query.toLowerCase();
    lines = lines.filter((line) => line.toLowerCase().includes(lowerQuery));
  }

  if (lineStart !== undefined || lineEnd !== undefined) {
    const start = lineStart ?? 0;
    const end = lineEnd ?? lines.length;
    lines = lines.slice(start, end);
  }

  const truncated = lines.length > maxLines;
  if (truncated) {
    lines = lines.slice(0, maxLines);
  }

  return {
    content: lines.join("\n"),
    total_lines: totalLines,
    returned_lines: lines.length,
    truncated,
  };
}
