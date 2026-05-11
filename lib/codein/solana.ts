import bs58 from "bs58";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";

/**
 * Resolves the devnet signer keypair from environment.
 * Prefer `SOLANA_SIGNER_SECRET_KEY` (JSON byte array) when non-empty; otherwise `SOLANA_SIGNER_SECRET_KEY_BASE58`.
 * Never log secret material from these variables.
 */
export function parseSignerFromEnv(): Keypair {
  const jsonRaw = process.env.SOLANA_SIGNER_SECRET_KEY?.trim();
  if (jsonRaw) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonRaw);
    } catch {
      throw new Error("SOLANA_SIGNER_SECRET_KEY must be valid JSON (array of secret key bytes)");
    }
    if (!Array.isArray(parsed)) {
      throw new Error("SOLANA_SIGNER_SECRET_KEY must be a JSON array of bytes");
    }
    const secretBytes = Uint8Array.from(parsed as number[]);
    return Keypair.fromSecretKey(secretBytes);
  }

  const base58Raw = process.env.SOLANA_SIGNER_SECRET_KEY_BASE58?.trim();
  const aliasBase58Raw = process.env.CODEIN_SIGNER_PRIVATE_KEY?.trim();
  const resolvedBase58 = base58Raw || aliasBase58Raw;
  if (resolvedBase58) {
    const secretBytes = bs58.decode(resolvedBase58);
    return Keypair.fromSecretKey(secretBytes);
  }

  throw new Error(
    "Set SOLANA_SIGNER_SECRET_KEY (JSON byte array) or SOLANA_SIGNER_SECRET_KEY_BASE58 / CODEIN_SIGNER_PRIVATE_KEY (base58-encoded secret key)",
  );
}

export function getRpcUrl(): string {
  return process.env.SOLANA_RPC_URL || process.env.CODEIN_RPC_URL || clusterApiUrl("devnet");
}

export function getConnection(): Connection {
  return new Connection(getRpcUrl(), "confirmed");
}

export function getCodeInNetwork(): string {
  return process.env.CODEIN_NETWORK || process.env.CODEIN_SOLANA_NETWORK || "devnet";
}

export function explorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}
