import { getReceiptById } from "@/lib/db/receipts";

export async function verifyReceipt(receiptId: string) {
  return getReceiptById(receiptId);
}
