import { getDatabaseProvider } from "@/lib/db/provider";
import { postgresGetReceiptById, postgresInsertReceipt } from "@/lib/db/postgres";
import { sqliteGetReceiptById, sqliteInsertReceipt } from "@/lib/db/sqlite-receipts";
import type { InsertReceiptParams, StoredReceipt } from "@/lib/db/types";

export type { StoredReceipt } from "@/lib/db/types";

/** @alias insertReceipt */
export async function saveReceiptRecord(params: InsertReceiptParams): Promise<StoredReceipt> {
  return insertReceipt(params);
}

export async function insertReceipt(params: InsertReceiptParams): Promise<StoredReceipt> {
  if (getDatabaseProvider() === "postgres") {
    return postgresInsertReceipt(params);
  }
  return sqliteInsertReceipt(params);
}

/** @alias getReceiptById */
export async function getReceiptRecord(receiptId: string): Promise<StoredReceipt | null> {
  return getReceiptById(receiptId);
}

export async function getReceiptById(receiptId: string): Promise<StoredReceipt | null> {
  if (getDatabaseProvider() === "postgres") {
    return postgresGetReceiptById(receiptId);
  }
  return sqliteGetReceiptById(receiptId);
}
