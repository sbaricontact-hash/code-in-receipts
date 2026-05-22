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

export type ReceiptRow = {
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

export type InsertReceiptParams = {
  receiptId: string;
  payload: CanonicalReceipt;
  writeResult: CodeInWriteResult;
};

export function toStoredReceipt(row: ReceiptRow): StoredReceipt {
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
