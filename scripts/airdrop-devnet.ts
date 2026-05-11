import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { loadAppEnv } from "@/lib/env/load-env";
import { getConnection, parseSignerFromEnv } from "@/lib/codein/solana";

loadAppEnv();

async function main() {
  const signer = parseSignerFromEnv();
  const connection = getConnection();
  const airdropSignature = await connection.requestAirdrop(signer.publicKey, LAMPORTS_PER_SOL);
  const latest = await connection.getLatestBlockhash("confirmed");
  await connection.confirmTransaction(
    {
      signature: airdropSignature,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight,
    },
    "confirmed",
  );
  const balance = await connection.getBalance(signer.publicKey, "confirmed");
  console.log(`Airdrop signature: ${airdropSignature}`);
  console.log(`Balance SOL: ${balance / LAMPORTS_PER_SOL}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
