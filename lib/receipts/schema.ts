import { z } from "zod";

export const receiptTypeSchema = z.enum([
  "payment_receipt",
  "certificate",
  "ai_provenance",
  "audit_log",
  "message_receipt",
]);

export const privacyModeSchema = z.enum([
  "hash_only",
  "encrypted_payload",
  "public_payload",
]);

const primitiveValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const receiptMetadataSchema = z.record(z.string(), primitiveValueSchema).optional();

export const createReceiptInputSchema = z.object({
  appId: z.string().min(1),
  type: receiptTypeSchema,
  reference: z.string().min(1),
  payloadHash: z.string().min(1),
  privacyMode: privacyModeSchema.default("hash_only"),
  metadata: receiptMetadataSchema,
});

export const canonicalReceiptSchema = z.object({
  version: z.literal("1.0"),
  appId: z.string(),
  type: receiptTypeSchema,
  reference: z.string(),
  createdAt: z.string(),
  payloadHash: z.string(),
  privacyMode: privacyModeSchema.default("hash_only"),
  metadata: receiptMetadataSchema,
});

export type CreateReceiptInput = z.infer<typeof createReceiptInputSchema>;
export type CanonicalReceipt = z.infer<typeof canonicalReceiptSchema>;
