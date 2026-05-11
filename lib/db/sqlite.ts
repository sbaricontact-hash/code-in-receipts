import fs from "fs";
import path from "path";

import Database from "better-sqlite3";

let dbInstance: Database.Database | null = null;

function getDbPath(): string {
  const configured = process.env.DATABASE_PATH || "./data/code-in-receipts.sqlite";
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
}

function init(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      type TEXT NOT NULL,
      reference TEXT NOT NULL,
      created_at TEXT NOT NULL,
      payload_hash TEXT NOT NULL,
      privacy_mode TEXT NOT NULL,
      metadata_json TEXT,
      codein_record_id TEXT,
      tx_signature TEXT,
      gateway_url TEXT,
      status TEXT NOT NULL,
      raw_payload_json TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS receipts_tx_signature_idx ON receipts(tx_signature);
    CREATE INDEX IF NOT EXISTS receipts_reference_idx ON receipts(reference);
    CREATE INDEX IF NOT EXISTS receipts_created_at_idx ON receipts(created_at);
  `);
}

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = getDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  dbInstance = new Database(dbPath);
  init(dbInstance);
  return dbInstance;
}
