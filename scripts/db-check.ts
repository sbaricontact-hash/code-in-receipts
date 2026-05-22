import { loadAppEnv } from "@/lib/env/load-env";
import { getDatabaseProvider } from "@/lib/db/provider";

loadAppEnv();

async function main() {
  const provider = getDatabaseProvider();
  console.log(`Database provider: ${provider}`);

  if (provider === "postgres") {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is required when DATABASE_PROVIDER=postgres");
      process.exit(1);
    }
    const { ensurePostgresSchema } = await import("@/lib/db/postgres");
    await ensurePostgresSchema();
    console.log("Postgres: receipts table and indexes are ready");
    return;
  }

  const { getDb } = await import("@/lib/db/sqlite");
  getDb();
  console.log("SQLite: receipts table and indexes are ready");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Database check failed";
  console.error(message);
  process.exit(1);
});
