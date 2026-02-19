import { generateHandle, generateSummary, computeChecksum } from "../utils.js";
import { insertEntry } from "../db.js";

export function handleStore(
  payload: string,
  metadata?: object,
): {
  handle: string;
  checksum: string;
  summary: string;
  size_bytes: number;
} {
  const handle = generateHandle();
  const checksum = computeChecksum(payload);
  const summary = generateSummary(payload);
  const sizeBytes = Buffer.byteLength(payload, "utf8");
  const metadataJson = metadata ? JSON.stringify(metadata) : null;

  insertEntry(handle, payload, metadataJson, checksum, summary, sizeBytes);

  return { handle, checksum, summary, size_bytes: sizeBytes };
}
