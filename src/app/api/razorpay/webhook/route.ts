import { markPaid } from "@/lib/orders";
import { verifyWebhookSignature } from "@/lib/razorpay";

/**
 * Razorpay webhook (event: payment.captured). Marks the order paid even if
 * the customer closed the tab before the checkout callback ran. Safe to
 * receive more than once: markPaid only acts on the first call.
 */
export async function POST(request: Request) {
  const body = await request.text();
  if (!verifyWebhookSignature(body, request.headers.get("x-razorpay-signature"))) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body) as {
    event: string;
    payload?: { payment?: { entity?: { id: string; order_id: string | null; amount: number } } };
  };

  const payment = event.payload?.payment?.entity;
  if (event.event === "payment.captured" && payment?.order_id) {
    const result = await markPaid(payment.order_id, payment.id, payment.amount);
    if (result.status === "unknown-order") {
      // Not one of ours (for example a payment link). Acknowledge so Razorpay stops retrying.
      console.warn("Razorpay webhook: payment for an unknown order");
    }
  }

  return Response.json({ ok: true });
}
