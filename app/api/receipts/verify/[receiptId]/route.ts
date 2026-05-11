import { verifyReceipt } from "@/lib/receipts/verify-receipt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ receiptId: string }> }) {
  const { receiptId } = await context.params;
  const receipt = verifyReceipt(receiptId);
  if (!receipt) {
    return Response.json({ ok: false, error: "Receipt not found" }, { status: 404 });
  }

  return Response.json({
    ok: true,
    receiptId: receipt.id,
    receipt: receipt.rawPayload,
    codeIn: {
      codeInRecordId: receipt.codeInRecordId,
      txSignature: receipt.txSignature,
      gatewayUrl: receipt.gatewayUrl,
      status: receipt.status,
    },
  });
}
