import { getDb } from "@/lib/db/sqlite";
import type { CodeInWriteResult } from "@/lib/codein/adapter";
import type { CanonicalReceipt } from "@/lib/receipts/schema";

export type StoredReceipt = {
  id: string;
  appId: string;
  type: string;
  reference: string;
  createdAt: string;
  payloadHash: string;
  privacyMode: string;
  metadata: Record<string, string | number | boolean | null> | undefined;
  codeInRecordId: string | null;
  txSignature: string | null;
  gatewayUrl: string | null;
  status: string;
  rawPayload: CanonicalReceipt;
};

type ReceiptRow = {
  id: string;
  app_id: string;
  type: string;
  reference: string;
  created_at: string;
  payload_hash: string;
  privacy_mode: string;
  metadata_json: string | null;
  codein_record_id: string | null;
  tx_signature: string | null;
  gateway_url: string | null;
  status: string;
  raw_payload_json: string;
};

function toStoredReceipt(row: ReceiptRow): StoredReceipt {
  return {
    id: row.id,
    appId: row.app_id,
    type: row.type,
    reference: row.reference,
    createdAt: row.created_at,
    payloadHash: row.payload_hash,
    privacyMode: row.privacy_mode,
    metadata: row.metadata_json ? JSON.parse(row.metadata_json) : undefined,
    codeInRecordId: row.codein_record_id,
    txSignature: row.tx_signature,
    gatewayUrl: row.gateway_url,
    status: row.status,
    rawPayload: JSON.parse(row.raw_payload_json),
  };
}

export function insertReceipt(params: {
  receiptId: string;
  payload: CanonicalReceipt;
  writeResult: CodeInWriteResult;
}): StoredReceipt {
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

  return getReceiptById(params.receiptId)!;
}

export function getReceiptById(receiptId: string): StoredReceipt | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM receipts WHERE id = ?").get(receiptId) as ReceiptRow | undefined;
  return row ? toStoredReceipt(row) : null;
}
