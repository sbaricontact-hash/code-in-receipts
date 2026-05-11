"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpenText,
  Bot,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ReceiptText,
} from "lucide-react";

import {
  buildDemoMetadata,
  demoPayloadHash,
  type DemoReceiptType,
} from "@/lib/receipts/demo-metadata";

type DemoType = DemoReceiptType;

type CreateSuccess = {
  ok: true;
  receiptId: string;
  verifyUrl: string;
  codeIn: { txSignature: string | null };
};

const demoOptions: Array<{
  type: DemoType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  className: string;
}> = [
  {
    type: "payment_receipt",
    label: "Create payment receipt",
    description: "Proof of purchase, checkout, or SaaS billing event.",
    icon: ReceiptText,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-950 hover:bg-emerald-100",
  },
  {
    type: "ai_provenance",
    label: "Create AI provenance receipt",
    description: "Timestamped proof for AI output, prompt, or generation hash.",
    icon: Bot,
    className: "border-violet-200 bg-violet-50 text-violet-950 hover:bg-violet-100",
  },
  {
    type: "certificate",
    label: "Create certificate receipt",
    description: "Verifiable credential, completion, or attestation proof.",
    icon: Award,
    className: "border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100",
  },
  {
    type: "publishing_proof",
    label: "Create publishing proof",
    description: "Content verification for decentralized publishing patterns.",
    icon: BookOpenText,
    className: "border-sky-200 bg-sky-50 text-sky-950 hover:bg-sky-100",
  },
];

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
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              IQ Labs · Code-In · Solana Devnet
            </div>

            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950">
                Code-In receipt demo
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
                This demo stores a local SQLite index and writes each proof to{" "}
                <strong>IQ Code-In</strong> on <strong>Solana devnet</strong>.
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <div className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
              <p>
                All demo receipts use the same Code-In verification envelope, but each
                demonstrates a different application-level proof pattern.
              </p>
              <p>
                Publishing proofs show how the same envelope can support decentralized
                publishing and on-chain content verification.
              </p>
            </div>
          </div>
        </section>

        {busy ? (
          <div
            className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950 shadow-sm"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
            <span>
              Creating receipt on <strong>Solana devnet</strong> via IQ Code-In — buttons
              are disabled until this finishes.
            </span>
          </div>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Create a proof</h2>
              <p className="mt-1 text-sm text-slate-600">
                Choose one pattern. Each button creates a real devnet Code-In record.
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {demoOptions.map((option) => {
              const Icon = option.icon;
              const active = isLoading === option.type;

              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => trigger(option.type)}
                  className={[
                    "group rounded-xl border p-4 text-left shadow-sm transition",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    "disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-sm",
                    option.className,
                  ].join(" ")}
                  disabled={busy}
                >
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 shadow-sm ring-1 ring-black/5">
                    {active ? (
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    ) : (
                      <Icon className="h-5 w-5" aria-hidden />
                    )}
                  </span>

                  <span className="block text-sm font-semibold">
                    {active ? "Creating…" : option.label}
                  </span>

                  <span className="mt-2 block text-xs leading-5 opacity-80">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {error ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900 shadow-sm"
            role="alert"
          >
            <p className="font-semibold">Could not create receipt</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : null}

        {lastSuccess ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-sm text-emerald-950 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <p className="font-semibold text-emerald-950">Receipt created</p>
                <p className="mt-1 text-emerald-900/80">
                  The proof was written through the Code-In adapter and indexed locally for
                  this starter.
                </p>
              </div>
            </div>

            <div className="my-5 h-px bg-emerald-200/70" />

            <dl className="grid gap-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-emerald-800/80">
                  Receipt ID
                </dt>
                <dd className="mt-1 break-all font-mono text-xs sm:text-sm">
                  {lastSuccess.receiptId}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-emerald-800/80">
                  Transaction signature
                </dt>
                <dd className="mt-1 break-all font-mono text-xs sm:text-sm">
                  {lastSuccess.txSignature ?? "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <Link
                href={lastSuccess.verifyPath}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800"
              >
                Open verification page
                <ExternalLink className="h-4 w-4 opacity-90" aria-hidden />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}