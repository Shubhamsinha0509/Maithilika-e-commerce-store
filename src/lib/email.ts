import { serverEnv } from "@/env";
import { CONTACT_EMAIL, inr, SITE_URL } from "@/lib/store";

/**
 * Transactional email through Resend's REST API. Switched off until
 * RESEND_API_KEY is set, like checkout before the Razorpay keys.
 */
const FROM = "Maithilika <orders@maithilika.com>";

type Email = { to: string; subject: string; html: string; text: string; replyTo?: string };
export type SendResult = "sent" | "skipped" | "failed";

async function sendEmail({ to, subject, html, text, replyTo }: Email): Promise<SendResult> {
  const key = serverEnv().RESEND_API_KEY;
  if (!key) return "skipped";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [to], subject, html, text, reply_to: replyTo }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return "sent";
    console.error(`Resend refused an email: ${res.status} ${await res.text()}`);
  } catch (e) {
    console.error("Could not reach Resend", e);
  }
  return "failed";
}

// Customers type these values, and they end up inside HTML.
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const MAROON = "#6E1423";
const GOLD = "#C4A265";
const INK = "#2A1A13";
const MUTED = "#6B5545";
const RULE = "#E5D3B3";
const FONT = "Arial, Helvetica, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

/** The shared frame: maroon header with the logo, cream body, small footer. Inline styles, for mail apps. */
function frame(preview: string, body: string) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Maithilika</title></head>
<body style="margin:0;padding:0;background:#F6ECDB;">
<div style="display:none;max-height:0;overflow:hidden;">${esc(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6ECDB;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FBF5EA;border:1px solid ${GOLD};">
<tr><td align="center" style="background:${MAROON};padding:24px 16px;border-bottom:3px solid ${GOLD};">
<img src="${SITE_URL}/brand/mark.jpg" width="72" height="72" alt="" style="display:block;border-radius:50%;border:2px solid ${GOLD};">
<div style="font-family:${SERIF};font-size:26px;line-height:1.3;color:#FBF5EA;padding-top:10px;">Maithilika</div>
</td></tr>
<tr><td style="padding:28px 24px;font-family:${FONT};font-size:16px;line-height:1.55;color:${INK};">${body}</td></tr>
<tr><td align="center" style="padding:16px 24px;border-top:1px solid ${RULE};font-family:${FONT};font-size:13px;line-height:1.5;color:${MUTED};">
Every piece painted by hand in Mithila.<br><a href="${SITE_URL}" style="color:${MAROON};">www.maithilika.com</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

const heading = (s: string) => `<h1 style="margin:0 0 10px;font-family:${SERIF};font-size:24px;line-height:1.25;font-weight:normal;color:${MAROON};">${s}</h1>`;
const label = (s: string) => `<div style="padding-top:22px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-weight:bold;">${s}</div>`;
const button = (href: string, s: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px auto 4px;"><tr><td align="center" bgcolor="${MAROON}"><a href="${esc(href)}" style="display:inline-block;padding:14px 30px;font-family:${FONT};font-size:16px;font-weight:bold;color:#FBF5EA;text-decoration:none;">${s}</a></td></tr></table>`;

type OrderForEmail = {
  orderNumber: string;
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  items: { name: string; optionLabel: string | null; option: string | null; price: number; qty: number }[];
  subtotal: number;
  shipping: number;
  total: number;
};

export const trackOrderUrl = (orderNumber: string, email: string) =>
  `${SITE_URL}/order?n=${encodeURIComponent(orderNumber)}&e=${encodeURIComponent(email)}`;

export function orderConfirmationEmail(o: OrderForEmail): Email {
  const track = trackOrderUrl(o.orderNumber, o.email);
  const firstName = o.name.split(/\s+/)[0];
  const itemTitle = (i: OrderForEmail["items"][number]) => `${i.name}${i.qty > 1 ? ` × ${i.qty}` : ""}`;
  const shipping = o.shipping === 0 ? "Free" : inr(o.shipping);
  const address = [o.name, o.addressLine1, o.addressLine2, `${o.city}, ${o.state} ${o.pincode}`, o.phone].filter((l): l is string => !!l);

  const row = (left: string, right: string, strong = false, top = false) => {
    const style = `padding:${top ? "12px" : "4px"} 0 4px;${top ? `border-top:1px solid ${RULE};` : ""}${strong ? "font-weight:bold;font-size:17px;" : ""}`;
    return `<tr><td style="${style}">${left}</td><td align="right" style="${style}white-space:nowrap;">${right}</td></tr>`;
  };
  const items = o.items
    .map((i) => {
      const option = i.option ? `<div style="font-size:14px;color:${MUTED};">${esc(i.option)}</div>` : "";
      return `<tr><td style="padding:10px 12px 10px 0;border-bottom:1px solid ${RULE};">${esc(itemTitle(i))}${option}</td><td align="right" valign="top" style="padding:10px 0;border-bottom:1px solid ${RULE};white-space:nowrap;">${inr(i.price * i.qty)}</td></tr>`;
    })
    .join("");

  return {
    to: o.email,
    replyTo: CONTACT_EMAIL,
    subject: `Your Maithilika order ${o.orderNumber} is confirmed`,
    html: frame(
      `We have received your payment for order ${o.orderNumber}.`,
      `${heading(`Thank you, ${esc(firstName)}`)}
<p style="margin:0;">We have received your payment and your order is confirmed.</p>
${label("Order number")}
<div style="font-size:18px;font-weight:bold;">${esc(o.orderNumber)}</div>
${label("Your order")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${FONT};font-size:16px;line-height:1.4;color:${INK};">
${items}
${row("Subtotal", inr(o.subtotal))}
${row("Shipping", shipping)}
${row("Total paid", inr(o.total), true, true)}
</table>
${label("Delivering to")}
<div>${address.map(esc).join("<br>")}</div>
${button(track, "Track your order")}
<p style="margin:18px 0 0;font-size:14px;color:${MUTED};text-align:center;">Questions? Just reply to this email.</p>`,
    ),
    text: [
      `Thank you, ${firstName}.`,
      "We have received your payment and your order is confirmed.",
      "",
      `Order number: ${o.orderNumber}`,
      "",
      ...o.items.map((i) => `${itemTitle(i)}${i.option ? ` (${i.option})` : ""}: ${inr(i.price * i.qty)}`),
      `Subtotal: ${inr(o.subtotal)}`,
      `Shipping: ${shipping}`,
      `Total paid: ${inr(o.total)}`,
      "",
      "Delivering to:",
      ...address,
      "",
      `Track your order: ${track}`,
      "",
      "Questions? Just reply to this email.",
    ].join("\n"),
  };
}

type RequestForEmail = { type: string; fabric: string | null; description: string; name: string; phone: string };

/** To the shop's own inbox, so the owner can call back within the time the customer was promised. */
export function customRequestEmail(r: RequestForEmail): Email {
  const wants = r.fabric ? `${r.type} (${r.fabric})` : r.type;
  const admin = `${SITE_URL}/admin/requests`;
  return {
    to: CONTACT_EMAIL,
    subject: `New custom order: ${wants} from ${r.name}`,
    html: frame(
      `${r.name} asked for a custom ${wants}. Please call within 1-2 hours.`,
      `${heading("New custom order request")}
<p style="margin:0;">The customer was told you will contact them within 1-2 hours.</p>
${label("Customer")}
<div style="font-size:18px;font-weight:bold;">${esc(r.name)}</div>
<div><a href="tel:${esc(r.phone)}" style="color:${MAROON};font-size:18px;">${esc(r.phone)}</a></div>
${label("Wants")}
<div>${esc(wants)}</div>
${label("Description")}
<div style="white-space:pre-wrap;">${esc(r.description)}</div>
${button(admin, "Open custom requests")}`,
    ),
    text: [
      "New custom order request. The customer was told you will contact them within 1-2 hours.",
      "",
      `Customer: ${r.name}`,
      `Phone: ${r.phone}`,
      `Wants: ${wants}`,
      "",
      r.description,
      "",
      `Custom requests: ${admin}`,
    ].join("\n"),
  };
}

export const sendOrderConfirmation = (o: OrderForEmail) => sendEmail(orderConfirmationEmail(o));
export const sendCustomRequestAlert = (r: RequestForEmail) => sendEmail(customRequestEmail(r));
