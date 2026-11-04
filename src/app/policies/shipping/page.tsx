import type { Metadata } from "next";
import Link from "next/link";
import { Fact, PolicyPage } from "@/components/policy-page";
import { BUSINESS } from "@/lib/policies";
import { inr, SHIPPING } from "@/lib/store";

export const metadata: Metadata = { title: "Shipping policy" };

export default function ShippingPolicy() {
  return (
    <PolicyPage href="/policies/shipping" title="Shipping" intro="How and when your hand-painted piece reaches you.">
      <h2>Where we ship</h2>
      <p>We ship to addresses across India. We don’t ship outside India yet.</p>

      <h2>Shipping charges</h2>
      <p>
        Shipping is {inr(SHIPPING.feeRupees)} per order, and free on orders above {inr(SHIPPING.freeAboveRupees)}. The exact amount is shown
        at checkout before you pay.
      </p>

      <h2>When your order is dispatched</h2>
      <ul>
        <li>
          <strong>Ready to ship pieces</strong> are dispatched <Fact value={BUSINESS.dispatchTime} label="dispatch time" />.
        </li>
        <li>
          <strong>Made to order pieces</strong> are painted by hand after you order, so they take longer. They are dispatched as soon as the
          painting is finished and dry.
        </li>
      </ul>

      <h2>Delivery</h2>
      <p>
        We send every order by courier. Delivery usually takes <Fact value={BUSINESS.deliveryTime} label="delivery time" />, depending on
        your location. The courier may call the mobile number you gave at checkout.
      </p>
      <p>
        Once your order is dispatched, a tracking link appears on the <Link href="/order">Track your order</Link> page. You need your order
        number and the email you used at checkout.
      </p>

      <h2>Damaged in transit</h2>
      <p>
        We pack every piece with care. If yours arrives damaged, email us at <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> within{" "}
        <Fact value={BUSINESS.damageReportDays === null ? null : `${BUSINESS.damageReportDays} days`} label="number of days" /> of delivery,
        with your order number and photos of the piece and the packaging, and we will make it right.
      </p>
    </PolicyPage>
  );
}
