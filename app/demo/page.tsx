"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";

import { buildDemoMetadata, demoPayloadHash, type DemoReceiptType } from "@/lib/receipts/demo-metadata";

type DemoType = DemoReceiptType;

type CreateSuccess = {
  ok: true;
  receiptId: string;
  verifyUrl: string;
  codeIn: { txSignature: string | null };
};

async function createDemoReceipt(type: DemoType): Promise<CreateSuccess> {
  const runId = Date.now();
  const reference = `demo-${type}-${runId}`;
  const [metadata, payloadHash] = await Promise.all([
    buildDemoMetadata(type, runId),
    demoPayloadHash(reference, type),
  ]);

  const res = await fetch("/api/receipts/create", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      appId: "code-in-receipts-demo",
      type,
      reference,
      payloadHash,
      privacyMode: "hash_only",
      metadata,
    }),
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error(res.statusText || "Failed to create receipt");
  }

  if (!res.ok) {
    const err =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : `Request failed (${res.status})`;
    throw new Error(err);
  }

  const parsed = body as CreateSuccess;
  if (!parsed.ok || !parsed.receiptId) {
    throw new Error("Unexpected response from server");
  }
  return parsed;
}

export default function DemoPage() {
  const [isLoading, setIsLoading] = useState<DemoType | null>(null);
  const [lastSuccess, setLastSuccess] = useState<{
    receiptId: string;
    txSignature: string | null;
    verifyPath: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trigger = async (type: DemoType) => {
    setError(null);
    setLastSuccess(null);
    setIsLoading(type);
    try {
      const result = await createDemoReceipt(type);
      const verifyPath = `/verify/${result.receiptId}`;
      setLastSuccess({
        receiptId: result.receiptId,
        txSignature: result.codeIn?.txSignature ?? null,
        verifyPath,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const busy = isLoading !== null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-bold">Receipt demo</h1>
        <p className="mt-2 text-black/70">
          This demo stores a local SQLite index and writes the receipt proof to IQ Code-In on
          Solana devnet.
        </p>
        <p className="mt-3 text-sm text-black/65">
          All demo receipts use the same Code-In verification envelope, but each demonstrates a
          different application-level proof pattern.
        </p>
        <p className="mt-2 text-sm text-black/65">
          Publishing proofs show how the same Code-In envelope can support decentralized publishing
          and on-chain content verification.
        </p>
      </div>

      {busy ? (
        <div
          className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
          <span>
            Creating receipt on <strong>Solana devnet</strong> via IQ Code-In — buttons are
            disabled until this finishes.
          </span>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => trigger("payment_receipt")}
          className="rounded-md border border-black/10 bg-white px-4 py-3 text-left hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={busy}
        >
          {isLoading === "payment_receipt" ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Creating…
            </span>
          ) : (
            "Create payment receipt"
          )}
        </button>
        <button
          type="button"
          onClick={() => trigger("ai_provenance")}
          className="rounded-md border border-black/10 bg-white px-4 py-3 text-left hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={busy}
        >
          {isLoading === "ai_provenance" ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Creating…
            </span>
          ) : (
            "Create AI provenance receipt"
          )}
        </button>
        <button
          type="button"
          onClick={() => trigger("certificate")}
          className="rounded-md border border-black/10 bg-white px-4 py-3 text-left hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={busy}
        >
          {isLoading === "certificate" ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Creating…
            </span>
          ) : (
            "Create certificate receipt"
          )}
        </button>
        <button
          type="button"
          onClick={() => trigger("publishing_proof")}
          className="rounded-md border border-black/10 bg-white px-4 py-3 text-left hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={busy}
        >
          {isLoading === "publishing_proof" ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Creating…
            </span>
          ) : (
            "Create Publishing Proof"
          )}
        </button>
      </div>

      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          <p className="font-medium">Could not create receipt</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : null}

      {lastSuccess ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-950">
          <p className="font-semibold text-emerald-900">Receipt created</p>
          <dl className="mt-3 grid gap-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-emerald-800/80">
                Receipt ID
              </dt>
              <dd className="break-all font-mono text-xs sm:text-sm">{lastSuccess.receiptId}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-emerald-800/80">
                Transaction signature
              </dt>
              <dd className="break-all font-mono text-xs sm:text-sm">
                {lastSuccess.txSignature ?? "—"}
              </dd>
            </div>
          </dl>
          <div className="mt-4">
            <Link
              href={lastSuccess.verifyPath}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Open verification page
              <ExternalLink className="h-4 w-4 opacity-90" aria-hidden />
            </Link>
          </div>
        </div>
      ) : null}
    </main>
  );
}
