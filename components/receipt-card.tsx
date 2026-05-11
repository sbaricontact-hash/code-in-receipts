import Link from "next/link";

import { ReceiptMetadataSummary } from "@/components/receipt-metadata-summary";
import { explorerTxUrl } from "@/lib/codein/solana";
import type { StoredReceipt } from "@/lib/db/receipts";

export function ReceiptCard({ receipt }: { receipt: StoredReceipt }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-7 shadow-sm md:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-black">Receipt details</h2>
      <p className="mt-2 text-sm leading-relaxed text-black/60">
        Explorer links use Solana Explorer with the <strong>devnet</strong> cluster.
      </p>
      <dl className="mt-6 grid gap-4 text-base">
        <div>
          <dt className="text-sm font-medium text-black/55">Receipt ID</dt>
          <dd className="mt-0.5 break-all font-mono text-sm text-black/90">{receipt.id}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-black/55">Status</dt>
          <dd className="mt-0.5 text-black/90">{receipt.status}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-black/55">App ID</dt>
          <dd className="mt-0.5 text-black/90">{receipt.appId}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-black/55">Type</dt>
          <dd className="mt-0.5 font-mono text-sm text-black/90">{receipt.type}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-black/55">Reference</dt>
          <dd className="mt-0.5 break-all text-black/90">{receipt.reference}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-black/55">Payload hash</dt>
          <dd className="mt-0.5 break-all font-mono text-sm text-black/90">{receipt.payloadHash}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-black/55">Privacy mode</dt>
          <dd className="mt-0.5 text-black/90">{receipt.privacyMode}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-black/55">Transaction signature</dt>
          <dd className="mt-0.5 break-all font-mono text-sm">
            {receipt.txSignature ? (
              <Link
                href={explorerTxUrl(receipt.txSignature)}
                target="_blank"
                rel="noopener noreferrer"
                title="View on Solana Explorer (devnet)"
                className="text-blue-700 underline decoration-blue-700/40 underline-offset-2 hover:text-blue-800"
              >
                {receipt.txSignature}
              </Link>
            ) : (
              <span className="text-black/50">—</span>
            )}
          </dd>
        </div>
        {receipt.gatewayUrl ? (
          <div>
            <dt className="text-sm font-medium text-black/55">Gateway URL</dt>
            <dd className="mt-0.5 break-all text-sm">
              <Link
                href={receipt.gatewayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline decoration-blue-700/40 underline-offset-2"
              >
                {receipt.gatewayUrl}
              </Link>
            </dd>
          </div>
        ) : null}
      </dl>
      <ReceiptMetadataSummary receipt={receipt} />
      <div className="mt-8 border-t border-black/5 pt-8">
        <h3 className="text-base font-semibold text-black">Canonical receipt payload</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-black/60">
          This is the structured proof payload used for verification. Sensitive source data should
          remain off-chain or hashed.
        </p>
        <pre className="mt-4 max-h-[min(70vh,32rem)] overflow-auto rounded-lg border border-black/8 bg-zinc-50/80 p-4 font-mono text-xs leading-relaxed text-black/90 md:text-sm">
          {JSON.stringify(receipt.rawPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
}
