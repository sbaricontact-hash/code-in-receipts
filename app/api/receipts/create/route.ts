import { createReceipt } from "@/lib/receipts/create-receipt";
import { createReceiptInputSchema } from "@/lib/receipts/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createReceiptInputSchema.parse(body);
    const result = await createReceipt(parsed);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return Response.json({
      ok: true,
      receiptId: result.receiptId,
      receipt: result.receipt,
      codeIn: result.codeIn,
      verifyUrl: `${appUrl}/verify/${result.receiptId}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create receipt";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
