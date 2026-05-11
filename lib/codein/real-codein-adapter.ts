import {
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import iqlabs from "@iqlabs-official/solana-sdk";
import { nanoid } from "nanoid";

import type { CodeInAdapter, CodeInReadResult, CodeInWriteResult } from "@/lib/codein/adapter";
import { getConnection, getRpcUrl, parseSignerFromEnv } from "@/lib/codein/solana";
import { sha256Hex, stableStringify } from "@/lib/receipts/hash";
import type { CanonicalReceipt } from "@/lib/receipts/schema";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

function warnIqFailure(step: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown SDK error";
  console.warn(`[RealCodeInAdapter] IQ SDK ${step} failed, using fallback path: ${message}`);
}

function safeFilename(reference: string): string {
  return `code-in-receipt-${reference.replace(/[^a-zA-Z0-9._-]+/g, "_")}.json`;
}

async function writeViaRealIqPath(payload: CanonicalReceipt): Promise<CodeInWriteResult> {
  console.info("[RealCodeInAdapter] REAL_IQ_CODEIN_PATH active");
  const signer = parseSignerFromEnv();
  const connection = getConnection();
  const rpcUrl = getRpcUrl();
  const canonicalJson = stableStringify(payload);
  const filename = safeFilename(payload.reference);

  const signature = await iqlabs.writer.codeIn(
    { connection, signer },
    canonicalJson,
    filename,
    0,
    "application/json",
  );

  if (!signature) {
    throw new Error("iqlabs writer.codeIn returned empty signature");
  }

  iqlabs.setRpcUrl(rpcUrl);
  await iqlabs.reader.readCodeIn(signature);
  console.info("[RealCodeInAdapter] REAL_IQ_CODEIN_PATH succeeded");

  return {
    codeInRecordId: signature,
    txSignature: signature,
    gatewayUrl: undefined,
    status: "confirmed",
    provider: "iq_code_in_sdk",
  };
}

// DEVNET_MEMO_FALLBACK_NOT_CODEIN
async function writeViaMemoFallback(payload: CanonicalReceipt): Promise<CodeInWriteResult> {
  const signer = parseSignerFromEnv();
  const connection = getConnection();
  const canonicalJson = stableStringify(payload);
  const memoPayload = JSON.stringify({
    provider: "DEVNET_MEMO_FALLBACK_NOT_CODEIN",
    receiptHash: sha256Hex(canonicalJson),
    version: payload.version,
    appId: payload.appId,
    type: payload.type,
    reference: payload.reference,
    createdAt: payload.createdAt,
  });

  const memoIx = new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [],
    data: Buffer.from(memoPayload, "utf8"),
  });

  // Add a no-op transfer to ensure signer account is explicit in write transaction.
  const noopIx = SystemProgram.transfer({
    fromPubkey: signer.publicKey,
    toPubkey: signer.publicKey,
    lamports: 0,
  });

  const tx = new Transaction().add(memoIx, noopIx);
  const signature = await sendAndConfirmTransaction(connection, tx, [signer], {
    commitment: "confirmed",
  });

  return {
    codeInRecordId: `memo-${nanoid(12)}`,
    txSignature: signature,
    gatewayUrl: null,
    status: "confirmed",
    provider: "DEVNET_MEMO_FALLBACK_NOT_CODEIN",
  };
}

export class RealCodeInAdapter implements CodeInAdapter {
  async writeReceipt(payload: CanonicalReceipt): Promise<CodeInWriteResult> {
    // REAL_IQ_CODEIN_PATH
    try {
      return await writeViaRealIqPath(payload);
    } catch (error) {
      warnIqFailure("write path", error);
    }

    console.info("[RealCodeInAdapter] DEVNET_MEMO_FALLBACK_NOT_CODEIN active");
    return writeViaMemoFallback(payload);
  }

  async readReceipt(recordId: string): Promise<CodeInReadResult | null> {
    try {
      iqlabs.setRpcUrl(getRpcUrl());
      const result = await iqlabs.reader.readCodeIn(recordId);
      const record = typeof result === "object" && result !== null ? (result as Record<string, unknown>) : {};
      const candidateGatewayUrl = record.gatewayUrl ?? record.gatewayURL ?? record.url;
      return {
        codeInRecordId: recordId,
        txSignature: recordId,
        gatewayUrl:
          typeof candidateGatewayUrl === "string" && candidateGatewayUrl.length > 0
            ? candidateGatewayUrl
            : undefined,
        status: "confirmed",
      };
    } catch (error) {
      warnIqFailure("read path", error);
      return null;
    }
  }
}
