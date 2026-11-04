import type { Metadata } from "next";
import { Fact, PolicyPage } from "@/components/policy-page";
import { BUSINESS } from "@/lib/policies";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Privacy() {
  const mail = <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>;
  return (
    <PolicyPage href="/policies/privacy" title="Privacy policy" intro="What we collect when you shop with us, and what we do with it.">
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>When you place an order:</strong> your name, email, mobile number, delivery address and the pieces you ordered.
        </li>
        <li>
          <strong>When you pay:</strong> you enter your payment details in Razorpay’s secure window. We receive only a payment reference,
          never your card, UPI or bank details.
        </li>
        <li>
          <strong>Your bag:</strong> the pieces in your bag are saved in your own browser on your device, not on our servers, until you
          check out.
        </li>
      </ul>
      <p>We don’t use advertising or tracking cookies. Razorpay’s payment window may use its own cookies while you pay.</p>

      <h2>Why we use it</h2>
      <p>Only to process, deliver and support your order, to contact you about it, and to keep the records the law requires. We don’t send marketing messages.</p>

      <h2>Who we share it with</h2>
      <ul>
        <li><strong>Razorpay</strong>, our payment partner, to take your payment.</li>
        <li><strong>Our courier partner</strong>: your name, mobile number and address, to deliver your order.</li>
        <li>
          <strong>Our hosting providers</strong> (Vercel for the website and Neon for the database), which store order details for us on
          servers in Singapore.
        </li>
      </ul>
      <p>We never sell your personal details.</p>

      <h2>How long we keep it</h2>
      <p>We keep order details for as long as we need them to handle your order and to meet accounting and tax rules.</p>

      <h2>Your choices</h2>
      <p>
        You can ask to see, correct or delete your details by emailing {mail}. We may need to keep some order records where the law
        requires it.
      </p>

      <h2>Questions or complaints</h2>
      <p>
        Write to <Fact value={BUSINESS.legalName} label="name of the person responsible" /> at {mail}. We reply as soon as we can.
      </p>
    </PolicyPage>
  );
}
