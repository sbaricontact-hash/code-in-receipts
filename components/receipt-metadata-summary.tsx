import type { StoredReceipt } from "@/lib/db/receipts";

/** Display-only shortening for long hash strings in summaries (full value in JSON below). */
function shortHash(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "number" ? String(value) : String(value);
  if (s.length <= 19) return s;
  return `${s.slice(0, 10)}…${s.slice(-8)}`;
}

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
  const display = typeof value === "number" ? String(value) : value;
  return (
    <div>
      <dt className="text-sm text-black/55">{label}</dt>
      <dd className="mt-0.5 break-all text-sm font-medium text-black/90">{display}</dd>
    </div>
  );
}

function HashRow({
  label,
  raw,
}: {
  label: string;
  raw: string | number | null | undefined;
}) {
  if (raw === undefined || raw === null || raw === "") return null;
  const full = typeof raw === "number" ? String(raw) : raw;
  const display = shortHash(full);
  return (
    <div>
      <dt className="text-sm text-black/55">{label}</dt>
      <dd
        className="mt-0.5 font-mono text-sm font-medium tracking-tight text-black/90"
        title={full}
      >
        {display}
      </dd>
    </div>
  );
}

export function ReceiptMetadataSummary({ receipt }: { receipt: StoredReceipt }) {
  const m = receipt.metadata;
  const type = receipt.type;

  if (type === "payment_receipt") {
    return (
      <section className="mt-8 rounded-lg border border-emerald-100 bg-emerald-50/50 p-5">
        <h3 className="text-base font-semibold text-emerald-950">Payment receipt summary</h3>
        <dl className="mt-4 grid gap-4">
          <Row label="Product" value={pick(m, "productName")} />
          <Row label="Amount" value={pick(m, "amount")} />
          <Row label="Currency" value={pick(m, "currency")} />
          <Row label="Provider" value={pick(m, "paymentProvider")} />
          <Row label="Order ID" value={pick(m, "orderId")} />
          <HashRow label="Customer data (hashed only)" raw={pick(m, "customerRefHash")} />
          <HashRow label="Checkout session (hashed only)" raw={pick(m, "checkoutSessionIdHash")} />
        </dl>
      </section>
    );
  }

  if (type === "ai_provenance") {
    return (
      <section className="mt-8 rounded-lg border border-violet-100 bg-violet-50/50 p-5">
        <h3 className="text-base font-semibold text-violet-950">AI provenance summary</h3>
        <dl className="mt-4 grid gap-4">
          <Row label="Model" value={pick(m, "model")} />
          <Row label="Content type" value={pick(m, "contentType")} />
          <Row label="Generation ID" value={pick(m, "generationId")} />
          <HashRow label="Prompt hash" raw={pick(m, "promptHash")} />
          <HashRow label="Output hash" raw={pick(m, "outputHash")} />
          <HashRow label="User data (hashed only)" raw={pick(m, "appUserHash")} />
        </dl>
      </section>
    );
  }

  if (type === "certificate") {
    return (
      <section className="mt-8 rounded-lg border border-amber-100 bg-amber-50/50 p-5">
        <h3 className="text-base font-semibold text-amber-950">Certificate summary</h3>
        <dl className="mt-4 grid gap-4">
          <Row label="Certificate title" value={pick(m, "title")} />
          <Row label="Certificate ID" value={pick(m, "certificateId")} />
          <Row label="Issuer" value={pick(m, "issuer")} />
          <Row label="Issued at" value={pick(m, "issuedAt")} />
          <HashRow label="Credential hash" raw={pick(m, "credentialHash")} />
          <HashRow label="Recipient data (hashed only)" raw={pick(m, "recipientHash")} />
        </dl>
      </section>
    );
  }

  if (type === "publishing_proof") {
    return (
      <section className="mt-8 rounded-lg border border-cyan-100 bg-cyan-50/50 p-5">
        <h3 className="text-base font-semibold text-cyan-950">Publishing proof summary</h3>
        <p className="mt-2 text-sm leading-relaxed text-cyan-950/85">
          Full content is not stored publicly; only hashes and proof metadata are recorded.
        </p>
        <dl className="mt-4 grid gap-4">
          <Row label="Title" value={pick(m, "title")} />
          <Row label="Publication ID" value={pick(m, "publicationId")} />
          <Row label="Content type" value={pick(m, "contentType")} />
          <HashRow label="Content hash" raw={pick(m, "contentHash")} />
          <HashRow label="Author data (hashed only)" raw={pick(m, "authorRefHash")} />
          <HashRow label="Canonical URL (hashed only)" raw={pick(m, "canonicalUrlHash")} />
          <Row label="License" value={pick(m, "license")} />
        </dl>
      </section>
    );
  }

  return null;
}
