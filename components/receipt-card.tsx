import Link from "next/link";

import { ReceiptMetadataSummary } from "@/components/receipt-metadata-summary";
import { explorerTxUrl } from "@/lib/codein/solana";
import type { StoredReceipt } from "@/lib/db/receipts";

export function ReceiptCard({ receipt }: { receipt: StoredReceipt }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Receipt details</h2>
      <p className="mt-1 text-xs text-black/55">
        Explorer links use Solana Explorer with the <strong>devnet</strong> cluster.
      </p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div>
          <dt className="font-medium">Receipt ID</dt>
          <dd className="break-all">{receipt.id}</dd>
        </div>
        <div>
          <dt className="font-medium">Status</dt>
          <dd>{receipt.status}</dd>
        </div>
        <div>
          <dt className="font-medium">App ID</dt>
          <dd>{receipt.appId}</dd>
        </div>
        <div>
          <dt className="font-medium">Type</dt>
          <dd>{receipt.type}</dd>
        </div>
        <div>
          <dt className="font-medium">Reference</dt>
          <dd>{receipt.reference}</dd>
        </div>
        <div>
          <dt className="font-medium">Payload Hash</dt>
          <dd className="break-all">{receipt.payloadHash}</dd>
        </div>
        <div>
          <dt className="font-medium">Privacy Mode</dt>
          <dd>{receipt.privacyMode}</dd>
        </div>
        <div>
          <dt className="font-medium">Tx Signature</dt>
          <dd className="break-all">
            {receipt.txSignature ? (
              <Link
                href={explorerTxUrl(receipt.txSignature)}
                target="_blank"
                rel="noopener noreferrer"
                title="View on Solana Explorer (devnet)"
                className="text-blue-600 underline"
              >
                {receipt.txSignature}
              </Link>
            ) : (
              "N/A"
            )}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Gateway URL</dt>
          <dd className="break-all">
            {receipt.gatewayUrl ? (
              <Link
                href={receipt.gatewayUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {receipt.gatewayUrl}
              </Link>
            ) : (
              "N/A"
            )}
          </dd>
        </div>
      </dl>
      <ReceiptMetadataSummary receipt={receipt} />
      <div className="mt-6">
        <h3 className="text-sm font-semibold">Raw JSON disclosure</h3>
        <pre className="mt-2 overflow-auto rounded bg-black/5 p-3 text-xs">
          {JSON.stringify(receipt.rawPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
}
