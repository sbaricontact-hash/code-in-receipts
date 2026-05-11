import { ReceiptCard } from "@/components/receipt-card";
import type { StoredReceipt } from "@/lib/db/receipts";

export function VerifyPanel({ receipt }: { receipt: StoredReceipt | null }) {
  if (!receipt) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-700">Receipt not found</h2>
        <p className="mt-2 text-sm text-red-700">
          This receipt ID does not exist in the local SQLite index.
        </p>
      </div>
    );
  }

  return <ReceiptCard receipt={receipt} />;
}
