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
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Verify receipt</h1>
          <p className="mt-2 max-w-2xl text-sm text-black/70">
            {isMemoFallback ? (
              <>
                This record was written using the <strong>devnet memo benchmark</strong> fallback
                (not IQ Code-In). Use the demo with a working{" "}
                <code className="rounded bg-black/5 px-1">@iqlabs-official/solana-sdk</code> setup
                for real Code-In receipts.
              </>
            ) : (
              <>
                This is a <strong>real IQ Code-In receipt on Solana devnet</strong>: proof is on
                chain; this page reads from your local SQLite index.
              </>
            )}
          </p>
          <p className="mt-3 max-w-2xl text-xs text-black/60">
            This demo stores a local SQLite index and writes the receipt proof to IQ Code-In on
            Solana devnet (when the real adapter path succeeds).
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-900">
              Network: Solana Devnet
            </span>
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900">
              {isMemoFallback ? "Storage: memo benchmark" : "Storage: IQ Code-In"}
            </span>
          </div>
        </div>
        <Link href="/demo" className="shrink-0 text-sm text-blue-600 underline">
          Back to demo
        </Link>
      </div>
      <VerifyPanel receipt={receipt} />
    </main>
  );
}
