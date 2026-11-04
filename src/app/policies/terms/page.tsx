import type { Metadata } from "next";
import Link from "next/link";
import { Fact, PolicyPage } from "@/components/policy-page";
import { BUSINESS } from "@/lib/policies";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function Terms() {
  return (
    <PolicyPage href="/policies/terms" title="Terms and conditions" intro="The terms that apply when you use this website and buy from Maithilika.">
      <h2>Who we are</h2>
      <p>
        Maithilika (www.maithilika.com) is run by <Fact value={BUSINESS.legalName} label="legal name" />,{" "}
        <Fact value={BUSINESS.address} label="address" />. You can reach us at{" "}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. By placing an order you agree to these terms.
      </p>

      <h2>Our pieces</h2>
      <p>
        Every piece is hand-painted by Mithila artists, so small differences from the photos in line and colour are part of handmade work,
        not a defect. Pieces marked “One of a kind” exist only once. Pieces marked “Made to order” are painted after
        you order.
      </p>

      <h2>Prices and payment</h2>
      <ul>
        <li>Prices are in Indian rupees (₹). The total you pay is the price of the pieces plus the shipping charge shown at checkout.</li>
        <li>We check every price and whether each piece is still available when you pay. If a price has changed, we show you the new total before you pay.</li>
        <li>Payment is online only, through Razorpay (UPI, cards and netbanking). We don’t offer cash on delivery. We never see or store your card or UPI details.</li>
      </ul>

      <h2>Your order</h2>
      <p>
        Your order is confirmed once your payment is received. You get an order number, and you can follow your order on the{" "}
        <Link href="/order">Track your order</Link> page. If a one-of-a-kind piece sells to someone else at the same moment, we refund
        you in full, as explained in our <Link href="/policies/refunds">returns and refunds policy</Link>.
      </p>

      <h2>Shipping, returns and refunds</h2>
      <p>
        These are covered in our <Link href="/policies/shipping">shipping policy</Link> and{" "}
        <Link href="/policies/refunds">returns and refunds policy</Link>.
      </p>

      <h2>Designs and photos</h2>
      <p>The designs, photos and text on this website belong to Maithilika and its artists. Please don’t copy or reuse them without permission.</p>

      <h2>Law and disputes</h2>
      <p>
        These terms are governed by the laws of India. Any dispute is handled by the courts of{" "}
        <Fact value={BUSINESS.jurisdiction} label="city" />. If something goes wrong, please write to us first and we will try to put it right.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. The date at the top shows when they last changed. The terms in place when you ordered apply to that order.</p>
    </PolicyPage>
  );
}
