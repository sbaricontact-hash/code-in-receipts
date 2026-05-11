import { ReceiptCard } from "@/components/receipt-card";
import type { StoredReceipt } from "@/lib/db/receipts";

export function VerifyPanel({ receipt }: { receipt: StoredReceipt | null }) {
  if (!receipt) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-7 md:p-8">
        <h2 className="text-xl font-semibold text-red-800">Receipt not found</h2>
        <p className="mt-3 text-base leading-relaxed text-red-800/90">
          This receipt ID does not exist in the local SQLite index.
        </p>
      </div>
    );
  }

  return <ReceiptCard receipt={receipt} />;
}
