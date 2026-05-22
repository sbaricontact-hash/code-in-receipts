export type DatabaseProvider = "sqlite" | "postgres";

export function getDatabaseProvider(): DatabaseProvider {
  const raw = process.env.DATABASE_PROVIDER?.trim().toLowerCase();
  if (raw === "postgres") {
    return "postgres";
  }
  return "sqlite";
}
