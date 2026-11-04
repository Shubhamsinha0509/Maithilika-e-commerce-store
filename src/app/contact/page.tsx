import type { Metadata } from "next";
import Link from "next/link";
import { Fact, PolicyPage } from "@/components/policy-page";
import { BUSINESS } from "@/lib/policies";

export const metadata: Metadata = { title: "Contact us" };

export default function Contact() {
  return (
    <PolicyPage href="/contact" title="Contact us" intro="Questions about a piece, an order or a delivery? We’re happy to help.">
      <dl className="contact-card">
        <dt>Email</dt>
        <dd><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></dd>
        <dt>Phone</dt>
        <dd>{BUSINESS.phone ? <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>{BUSINESS.phone}</a> : <Fact value={null} label="phone" />}</dd>
        <dt>Address</dt>
        <dd><Fact value={BUSINESS.address} label="address" /></dd>
        <dt>Business</dt>
        <dd><Fact value={BUSINESS.legalName} label="legal name" /></dd>
      </dl>
      <p>
        Writing about an order? Please include your order number (it starts with MTH-). You can also check your order yourself on the{" "}
        <Link href="/order">Track your order</Link> page.
      </p>
    </PolicyPage>
  );
}
