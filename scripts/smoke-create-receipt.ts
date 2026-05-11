import { loadAppEnv } from "@/lib/env/load-env";
import { createReceipt } from "@/lib/receipts/create-receipt";
import { explorerTxUrl } from "@/lib/codein/solana";

loadAppEnv();

async function main() {
  const result = await createReceipt({
    appId: "smoke-test",
    type: "payment_receipt",
    reference: `smoke-${Date.now()}`,
    payloadHash: crypto.randomUUID().replaceAll("-", ""),
    privacyMode: "hash_only",
    metadata: {
      source: "smoke_script",
    },
  });

  console.log(`receiptId: ${result.receiptId}`);
  console.log(`txSignature: ${result.codeIn.txSignature}`);
  if (result.codeIn.txSignature) {
    console.log(`explorer: ${explorerTxUrl(result.codeIn.txSignature)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
