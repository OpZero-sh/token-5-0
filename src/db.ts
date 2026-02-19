import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const dbPath =
  process.env.VAULT_DB_PATH || join(homedir(), ".token-5-0", "vault.db");

mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS vault_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    handle TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    metadata TEXT,
    checksum TEXT NOT NULL,
    summary TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    created_at TEXT DEFAULT(datetime('now'))
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS vault_fts USING fts5(
    handle,
    content,
    content=vault_entries,
    content_rowid=id
  );

  CREATE TRIGGER IF NOT EXISTS vault_entries_ai AFTER INSERT ON vault_entries BEGIN
    INSERT INTO vault_fts(rowid, handle, content)
    VALUES (new.id, new.handle, new.content);
  END;

  CREATE TRIGGER IF NOT EXISTS vault_entries_ad AFTER DELETE ON vault_entries BEGIN
    INSERT INTO vault_fts(vault_fts, rowid, handle, content)
    VALUES ('delete', old.id, old.handle, old.content);
  END;
`);

export interface VaultEntry {
  id: number;
  handle: string;
  content: string;
  metadata: string | null;
  checksum: string;
  summary: string;
  size_bytes: number;
  created_at: string;
}

const insertStmt = db.prepare(`
  INSERT INTO vault_entries (handle, content, metadata, checksum, summary, size_bytes)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const getStmt = db.prepare(`
  SELECT * FROM vault_entries WHERE handle = ?
`);

const searchStmt = db.prepare(`
  SELECT ve.* FROM vault_fts fts
  JOIN vault_entries ve ON ve.id = fts.rowid
  WHERE vault_fts MATCH ?
  LIMIT ?
`);

const statsStmt = db.prepare(`
  SELECT
    COUNT(*) as total_entries,
    COALESCE(SUM(size_bytes), 0) as total_bytes,
    MIN(created_at) as oldest,
    MAX(created_at) as newest
  FROM vault_entries
`);

export function insertEntry(
  handle: string,
  content: string,
  metadata: string | null,
  checksum: string,
  summary: string,
  sizeBytes: number,
): void {
  insertStmt.run(handle, content, metadata, checksum, summary, sizeBytes);
}

export function getEntry(handle: string): VaultEntry | undefined {
  return getStmt.get(handle) as VaultEntry | undefined;
}

export function searchEntries(query: string, limit: number): VaultEntry[] {
  return searchStmt.all(query, limit) as VaultEntry[];
}

export function getAllStats(): {
  total_entries: number;
  total_bytes: number;
  oldest: string | null;
  newest: string | null;
} {
  return statsStmt.get() as {
    total_entries: number;
    total_bytes: number;
    oldest: string | null;
    newest: string | null;
  };
}

export function getEntries(handles: string[]): VaultEntry[] {
  if (handles.length === 0) return [];
  const placeholders = handles.map(() => "?").join(",");
  const stmt = db.prepare(
    `SELECT * FROM vault_entries WHERE handle IN (${placeholders})`,
  );
  return stmt.all(...handles) as VaultEntry[];
}
