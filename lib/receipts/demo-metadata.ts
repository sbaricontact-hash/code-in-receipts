export type DemoReceiptType =
  | "payment_receipt"
  | "ai_provenance"
  | "certificate"
  | "publishing_proof";

/** SHA-256 hex (Web Crypto) — safe for demo pages; no Node `crypto`. */
export async function sha256HexBrowser(message: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(message));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function buildDemoMetadata(
  type: DemoReceiptType,
  runId: number,
): Promise<Record<string, string | number | boolean | null>> {
  const salt = `${type}:${runId}`;

  switch (type) {
    case "payment_receipt":
      return {
        orderId: `ORD-DEMO-${runId}`,
        productName: "Demo enamel pin set",
        amount: 49.99,
        currency: "USD",
        paymentProvider: "demo_checkout_provider",
        customerRefHash: await sha256HexBrowser(`demo|customer_ref|${salt}`),
        checkoutSessionIdHash: await sha256HexBrowser(`demo|checkout_session|${salt}`),
        source: "demo_page",
      };
    case "ai_provenance":
      return {
        generationId: `GEN-DEMO-${runId}`,
        model: "demo-llm-family/7b-instruct",
        outputHash: await sha256HexBrowser(`demo|model_output|${salt}`),
        promptHash: await sha256HexBrowser(`demo|prompt_template|${salt}`),
        contentType: "application/json",
        appUserHash: await sha256HexBrowser(`demo|app_user|${salt}`),
        source: "demo_page",
      };
    case "certificate": {
      const issuedAt = new Date(runId).toISOString();
      return {
        certificateId: `CERT-DEMO-${runId}`,
        title: "Completion of Code-In Receipts demo track",
        issuer: "IQ Labs Demo Issuing Authority",
        recipientHash: await sha256HexBrowser(`demo|recipient|${salt}`),
        issuedAt,
        credentialHash: await sha256HexBrowser(`demo|credential_body|${salt}`),
        source: "demo_page",
      };
    }
    case "publishing_proof":
      return {
        publicationId: `PUB-DEMO-${runId}`,
        title: "Synthetic demo essay: decentralized publishing patterns",
        contentType: "text/markdown",
        authorRefHash: await sha256HexBrowser(`demo|author_ref|${salt}`),
        contentHash: await sha256HexBrowser(`demo|publication_body|${salt}`),
        canonicalUrlHash: await sha256HexBrowser(`demo|canonical_url|${salt}`),
        license: "CC-BY-4.0 (demo label only)",
        source: "demo_page",
      };
  }
}

export async function demoPayloadHash(reference: string, type: DemoReceiptType): Promise<string> {
  return sha256HexBrowser(`code-in-receipts-demo|v1|${type}|${reference}|hash_only`);
}
