import { Pool } from "pg";

import type { InsertReceiptParams, ReceiptRow, StoredReceipt } from "@/lib/db/types";
import { toStoredReceipt } from "@/lib/db/types";

const globalForPg = globalThis as unknown as { pgPool: Pool | undefined };

export function getPgPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required when DATABASE_PROVIDER=postgres");
  }

  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return globalForPg.pgPool;
}

const INIT_SQL = `
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

  CREATE INDEX IF NOT EXISTS receipts_tx_signature_idx ON receipts (tx_signature);
  CREATE INDEX IF NOT EXISTS receipts_reference_idx ON receipts (reference);
  CREATE INDEX IF NOT EXISTS receipts_created_at_idx ON receipts (created_at);
`;

let schemaReady: Promise<void> | null = null;

export async function ensurePostgresSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const pool = getPgPool();
      await pool.query(INIT_SQL);
    })();
  }
  await schemaReady;
}

export async function postgresInsertReceipt(params: InsertReceiptParams): Promise<StoredReceipt> {
  await ensurePostgresSchema();
  const pool = getPgPool();
  const metadataJson = params.payload.metadata ? JSON.stringify(params.payload.metadata) : null;
  const rawPayloadJson = JSON.stringify(params.payload);

  await pool.query(
    `INSERT INTO receipts (
      id, app_id, type, reference, created_at, payload_hash, privacy_mode, metadata_json,
      codein_record_id, tx_signature, gateway_url, status, raw_payload_json
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      params.receiptId,
      params.payload.appId,
      params.payload.type,
      params.payload.reference,
      params.payload.createdAt,
      params.payload.payloadHash,
      params.payload.privacyMode,
      metadataJson,
      params.writeResult.codeInRecordId,
      params.writeResult.txSignature,
      params.writeResult.gatewayUrl ?? null,
      params.writeResult.status,
      rawPayloadJson,
    ],
  );

  const stored = await postgresGetReceiptById(params.receiptId);
  if (!stored) {
    throw new Error("Failed to read receipt after insert");
  }
  return stored;
}

export async function postgresGetReceiptById(receiptId: string): Promise<StoredReceipt | null> {
  await ensurePostgresSchema();
  const pool = getPgPool();
  const result = await pool.query<ReceiptRow>("SELECT * FROM receipts WHERE id = $1", [receiptId]);
  const row = result.rows[0];
  return row ? toStoredReceipt(row) : null;
}
