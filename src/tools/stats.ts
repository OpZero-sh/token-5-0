import { getAllStats } from "../db.js";

export function handleStats(): {
  total_entries: number;
  total_bytes: number;
  oldest: string | null;
  newest: string | null;
} {
  return getAllStats();
}
