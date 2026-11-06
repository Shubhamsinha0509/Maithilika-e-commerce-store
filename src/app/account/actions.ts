"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { indianMobile } from "@/lib/checkout";
import { currentCustomer, endCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

const profile = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: indianMobile,
});

export async function saveProfile(form: FormData) {
  const customer = await currentCustomer();
  if (!customer) redirect("/account");
  const parsed = profile.safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect(`/account?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  await prisma.customer.update({ where: { id: customer.id }, data: parsed.data });
  redirect("/account?saved=1");
}

export async function signOut() {
  await endCustomerSession();
  redirect("/account");
}

/** What checkout can fill in for someone signed in. Null for a guest. */
export async function checkoutPrefill() {
  const customer = await currentCustomer();
  return customer && { name: customer.name, email: customer.email, phone: customer.phone };
}
