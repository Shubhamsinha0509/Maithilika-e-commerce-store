import type { Metadata } from "next";
import { Fact, PolicyPage } from "@/components/policy-page";
import { BUSINESS } from "@/lib/policies";

export const metadata: Metadata = { title: "Returns and refunds" };

export default function RefundPolicy() {
  const mail = <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>;
  return (
    <PolicyPage href="/policies/refunds" title="Returns and refunds" intro="What to do if something isn’t right with your order.">
      <h2>Hand-painted, so every piece is unique</h2>
      <p>
        Every piece is painted by hand, line by line. Small differences in line, colour and placement from the photos are part of
        handmade work, not a defect. Colours can also look slightly different on different screens.
      </p>

      <h2>Returns</h2>
      <p>
        <Fact value={BUSINESS.returnable} label="which pieces can be returned" />
      </p>
      <p>
        To ask for a return, email {mail} within <Fact value={BUSINESS.returnDays === null ? null : `${BUSINESS.returnDays} days`} label="number of days" /> of
        delivery, with your order number and the reason. Return shipping: <Fact value={BUSINESS.returnShipping} label="who pays for return shipping" />.
      </p>

      <h2>Damaged pieces</h2>
      <p>
        If a piece arrives damaged, email us with photos within{" "}
        <Fact value={BUSINESS.damageReportDays === null ? null : `${BUSINESS.damageReportDays} days`} label="number of days" /> of delivery,
        as described in our shipping policy.
      </p>

      <h2>Cancelling an order</h2>
      <p>
        You can cancel a paid order <Fact value={BUSINESS.cancellation} label="until when" />. Email {mail} with your order number.
      </p>

      <h2>If a one-of-a-kind piece sells at the same moment</h2>
      <p>
        Most of our pieces are one of a kind. In the rare case that someone else pays for the same piece a moment before you, we refund
        your payment in full and let you know by email.
      </p>

      <h2>How refunds are paid</h2>
      <p>
        Refunds go back to the original payment method (UPI, card or netbanking) through our payment partner, Razorpay. Once we start a
        refund, it usually takes 5 to 7 working days to reach your account, depending on your bank.
      </p>
    </PolicyPage>
  );
}
