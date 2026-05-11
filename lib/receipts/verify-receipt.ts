import { getReceiptById } from "@/lib/db/receipts";

export function verifyReceipt(receiptId: string) {
  return getReceiptById(receiptId);
}
