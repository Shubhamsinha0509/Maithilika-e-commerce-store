"use server";

import { after } from "next/server";
import { indianMobile } from "@/lib/checkout";
import { customOrderSchema, type CustomOrderInput } from "@/lib/custom-order";
import { currentCustomer } from "@/lib/customer-auth";
import { sendCustomRequestAlert } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export type CustomOrderResult =
  | { ok: true }
  | { ok: false; error: string; field?: "description" | "phone"; signedOut?: boolean };

/** The customer comes from the session, never from the browser. `phone` is used only if the profile has none. */
export async function sendCustomOrder(input: CustomOrderInput, phone?: string): Promise<CustomOrderResult> {
  const customer = await currentCustomer();
  if (!customer) return { ok: false, error: "Please sign in again to send this.", signedOut: true };

  const parsed = customOrderSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path[0] === "description" ? "description" : undefined };
  }

  let contactPhone = customer.phone;
  if (!contactPhone) {
    const mobile = indianMobile.safeParse(phone ?? "");
    if (!mobile.success) return { ok: false, error: mobile.error.issues[0].message, field: "phone" };
    contactPhone = mobile.data;
    await prisma.customer.update({ where: { id: customer.id }, data: { phone: contactPhone } });
  }

  const request = { ...parsed.data, name: customer.name, phone: contactPhone };
  await prisma.customRequest.create({ data: { ...request, customerId: customer.id } });
  // After the response: the request is saved even if this email has trouble.
  after(async () => {
    if ((await sendCustomRequestAlert({ ...request, email: customer.email })) === "failed") {
      console.error("The new custom order alert could not be sent. The request is in /admin/requests.");
    }
  });
  return { ok: true };
}
