import { nanoid } from "nanoid";

import { RealCodeInAdapter } from "@/lib/codein/real-codein-adapter";
import { insertReceipt } from "@/lib/db/receipts";
import { canonicalReceiptSchema, createReceiptInputSchema } from "@/lib/receipts/schema";
import type { CreateReceiptInput } from "@/lib/receipts/schema";

export async function createReceipt(input: CreateReceiptInput) {
  const parsed = createReceiptInputSchema.parse(input);
  const receiptId = nanoid(16);
  const payload = canonicalReceiptSchema.parse({
    version: "1.0",
    appId: parsed.appId,
    type: parsed.type,
    reference: parsed.reference,
    createdAt: new Date().toISOString(),
    payloadHash: parsed.payloadHash,
    privacyMode: parsed.privacyMode ?? "hash_only",
    metadata: parsed.metadata,
  });

  const adapter = new RealCodeInAdapter();
  const writeResult = await adapter.writeReceipt(payload);
  const stored = insertReceipt({ receiptId, payload, writeResult });
  return {
    receiptId: stored.id,
    receipt: stored.rawPayload,
    codeIn: {
      codeInRecordId: stored.codeInRecordId,
      txSignature: stored.txSignature,
      gatewayUrl: stored.gatewayUrl,
      status: stored.status,
    },
  };
}
