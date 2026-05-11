import type { StoredReceipt } from "@/lib/db/receipts";

function pick(
  metadata: StoredReceipt["metadata"],
  key: string,
): string | number | null | undefined {
  if (!metadata) return undefined;
  const v = metadata[key];
  if (v === undefined || typeof v === "boolean") return undefined;
  return v;
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <dt className="text-black/60">{label}</dt>
      <dd className="break-all font-medium">{typeof value === "number" ? String(value) : value}</dd>
    </div>
  );
}

export function ReceiptMetadataSummary({ receipt }: { receipt: StoredReceipt }) {
  const m = receipt.metadata;
  const type = receipt.type;

  if (type === "payment_receipt") {
    return (
      <section className="mt-6 rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
        <h3 className="text-sm font-semibold text-emerald-950">Payment receipt summary</h3>
        <dl className="mt-3 grid gap-3 text-sm">
          <Row label="Product" value={pick(m, "productName")} />
          <Row label="Amount" value={pick(m, "amount")} />
          <Row label="Currency" value={pick(m, "currency")} />
          <Row label="Provider" value={pick(m, "paymentProvider")} />
          <Row label="Order ID" value={pick(m, "orderId")} />
          <Row label="Customer data (hashed only)" value={pick(m, "customerRefHash")} />
          <Row label="Checkout session (hashed only)" value={pick(m, "checkoutSessionIdHash")} />
        </dl>
      </section>
    );
  }

  if (type === "ai_provenance") {
    return (
      <section className="mt-6 rounded-lg border border-violet-100 bg-violet-50/40 p-4">
        <h3 className="text-sm font-semibold text-violet-950">AI provenance summary</h3>
        <dl className="mt-3 grid gap-3 text-sm">
          <Row label="Model" value={pick(m, "model")} />
          <Row label="Content type" value={pick(m, "contentType")} />
          <Row label="Generation ID" value={pick(m, "generationId")} />
          <Row label="Prompt hash" value={pick(m, "promptHash")} />
          <Row label="Output hash" value={pick(m, "outputHash")} />
          <Row label="User data (hashed only)" value={pick(m, "appUserHash")} />
        </dl>
      </section>
    );
  }

  if (type === "certificate") {
    return (
      <section className="mt-6 rounded-lg border border-amber-100 bg-amber-50/40 p-4">
        <h3 className="text-sm font-semibold text-amber-950">Certificate summary</h3>
        <dl className="mt-3 grid gap-3 text-sm">
          <Row label="Certificate title" value={pick(m, "title")} />
          <Row label="Certificate ID" value={pick(m, "certificateId")} />
          <Row label="Issuer" value={pick(m, "issuer")} />
          <Row label="Issued at" value={pick(m, "issuedAt")} />
          <Row label="Credential hash" value={pick(m, "credentialHash")} />
          <Row label="Recipient data (hashed only)" value={pick(m, "recipientHash")} />
        </dl>
      </section>
    );
  }

  return null;
}
