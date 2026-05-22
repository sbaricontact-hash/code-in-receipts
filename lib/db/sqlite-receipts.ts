import { getDb } from "@/lib/db/sqlite";
import type { InsertReceiptParams, ReceiptRow, StoredReceipt } from "@/lib/db/types";
import { toStoredReceipt } from "@/lib/db/types";

export function sqliteInsertReceipt(params: InsertReceiptParams): StoredReceipt {
  const db = getDb();
  const metadataJson = params.payload.metadata ? JSON.stringify(params.payload.metadata) : null;
  const rawPayloadJson = JSON.stringify(params.payload);
  db.prepare(
    `INSERT INTO receipts (
      id, app_id, type, reference, created_at, payload_hash, privacy_mode, metadata_json,
      codein_record_id, tx_signature, gateway_url, status, raw_payload_json
    ) VALUES (
      @id, @app_id, @type, @reference, @created_at, @payload_hash, @privacy_mode, @metadata_json,
      @codein_record_id, @tx_signature, @gateway_url, @status, @raw_payload_json
    )`,
  ).run({
    id: params.receiptId,
    app_id: params.payload.appId,
    type: params.payload.type,
    reference: params.payload.reference,
    created_at: params.payload.createdAt,
    payload_hash: params.payload.payloadHash,
    privacy_mode: params.payload.privacyMode,
    metadata_json: metadataJson,
    codein_record_id: params.writeResult.codeInRecordId,
    tx_signature: params.writeResult.txSignature,
    gateway_url: params.writeResult.gatewayUrl ?? null,
    status: params.writeResult.status,
    raw_payload_json: rawPayloadJson,
  });

  return sqliteGetReceiptById(params.receiptId)!;
}

export function sqliteGetReceiptById(receiptId: string): StoredReceipt | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM receipts WHERE id = ?").get(receiptId) as ReceiptRow | undefined;
  return row ? toStoredReceipt(row) : null;
}
