import { loadAppEnv } from "@/lib/env/load-env";
import { parseSignerFromEnv } from "@/lib/codein/solana";

loadAppEnv();

function main() {
  const signer = parseSignerFromEnv();
  // Public key only — never log secret env values.
  console.log(signer.publicKey.toBase58());
}

main();
