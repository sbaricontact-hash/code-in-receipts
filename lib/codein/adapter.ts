import type { CanonicalReceipt } from "@/lib/receipts/schema";

export type CodeInWriteResult = {
  codeInRecordId: string;
  txSignature: string;
  gatewayUrl: string | null | undefined;
  status: "confirmed" | "submitted" | "failed";
  provider: "iq_code_in_sdk" | "DEVNET_MEMO_FALLBACK_NOT_CODEIN";
};

export type CodeInReadResult = {
  codeInRecordId: string;
  txSignature: string;
  gatewayUrl: string | null | undefined;
  status: string;
};

export interface CodeInAdapter {
  writeReceipt(payload: CanonicalReceipt): Promise<CodeInWriteResult>;
  readReceipt(recordId: string): Promise<CodeInReadResult | null>;
}
