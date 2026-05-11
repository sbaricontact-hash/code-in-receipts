import Link from "next/link";

import { VerifyPanel } from "@/components/verify-panel";
import { verifyReceipt } from "@/lib/receipts/verify-receipt";

function isMemoFallbackReceipt(codeInRecordId: string | null): boolean {
  return Boolean(codeInRecordId?.startsWith("memo-"));
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ receiptId: string }>;
}) {
  const { receiptId } = await params;
  const receipt = verifyReceipt(receiptId);
  const isMemoFallback = receipt ? isMemoFallbackReceipt(receipt.codeInRecordId) : false;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12 md:py-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-4xl font-bold tracking-tight text-black md:text-[2.25rem]">
            Verify receipt
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-black/70">
            {isMemoFallback ? (
              <>
                This record was written using the <strong>devnet memo benchmark</strong> fallback
                (not IQ Code-In). Use the demo with a working{" "}
                <code className="rounded-md bg-black/[0.06] px-1.5 py-0.5 font-mono text-sm">
                  @iqlabs-official/solana-sdk
                </code>{" "}
                setup for real Code-In receipts.
              </>
            ) : (
              <>
                This is a <strong>real IQ Code-In receipt on Solana devnet</strong>: proof is on
                chain; this page reads from your local SQLite index.
              </>
            )}
          </p>
          {!isMemoFallback && receipt?.type === "publishing_proof" ? (
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-black/70">
              For publishing proofs, the on-chain record commits to content and identity via{" "}
              <strong>hashes</strong>—not raw author names, URLs, or full article text.
            </p>
          ) : null}
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-black/60">
            This demo stores a local SQLite index and writes the receipt proof to IQ Code-In on
            Solana devnet (when the real adapter path succeeds).
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-violet-200/90 bg-violet-50 px-3.5 py-1.5 text-sm font-medium text-violet-900">
              Network: Solana Devnet
            </span>
            <span className="inline-flex items-center rounded-full border border-sky-200/90 bg-sky-50 px-3.5 py-1.5 text-sm font-medium text-sky-900">
              {isMemoFallback ? "Storage: memo benchmark" : "Storage: IQ Code-In"}
            </span>
            {receipt ? (
              <>
                <span className="inline-flex items-center rounded-full border border-zinc-200/90 bg-zinc-50 px-3.5 py-1.5 text-sm font-medium text-zinc-800">
                  Type: {receipt.type}
                </span>
                <span className="inline-flex items-center rounded-full border border-zinc-200/90 bg-zinc-50 px-3.5 py-1.5 text-sm font-medium text-zinc-800">
                  Status: {receipt.status}
                </span>
              </>
            ) : null}
          </div>
        </div>
        <Link
          href="/demo"
          className="shrink-0 rounded-md text-sm font-medium text-blue-700 underline decoration-blue-700/35 underline-offset-2 hover:text-blue-800"
        >
          Back to demo
        </Link>
      </div>
      <VerifyPanel receipt={receipt} />
    </main>
  );
}
