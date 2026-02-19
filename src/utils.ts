import { randomBytes, createHash } from "node:crypto";

export function generateHandle(): string {
  return "v_" + randomBytes(6).toString("hex");
}

export function generateSummary(content: string): string {
  const lines = content.split("\n").length;
  const chars = content.length;
  const preview = content.slice(0, 200);
  if (chars <= 200) return preview;
  return `${preview}... (${lines} lines, ${chars} chars total)`;
}

export function computeChecksum(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}
