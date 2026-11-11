"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { addressSchema, indianMobile, type FieldErrors } from "@/lib/checkout";
import { currentCustomer, endCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

export type ProfileInput = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
};

export type SaveProfileResult = { ok: true } | { ok: false; error: string; fieldErrors?: FieldErrors };

const contact = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: indianMobile,
});

const issuesToFields = (issues: z.core.$ZodIssue[]) => {
  const fieldErrors: FieldErrors = {};
  for (const issue of issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
  return fieldErrors;
};

/** Saves name and mobile, and the address if any part of it is filled in. */
export async function saveProfile(input: ProfileInput): Promise<SaveProfileResult> {
  const customer = await currentCustomer();
  if (!customer) return { ok: false, error: "Please sign in again to save your details." };

  const details = contact.safeParse(input);
  const addressGiven = [input.addressLine1, input.addressLine2, input.city, input.state, input.pincode].some((v) => String(v ?? "").trim());
  const address = addressGiven ? addressSchema.safeParse(input) : null;

  const fieldErrors = {
    ...(details.success ? {} : issuesToFields(details.error.issues)),
    ...(address && !address.success ? issuesToFields(address.error.issues) : {}),
  };
  if (!details.success || (address && !address.success)) {
    return { ok: false, error: "Please check the highlighted details.", fieldErrors };
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      ...details.data,
      ...(address?.success
        ? address.data
        : { addressLine1: null, addressLine2: null, city: null, state: null, pincode: null }),
    },
  });
  return { ok: true };
}

export async function signOut() {
  await endCustomerSession();
  redirect("/account");
}

/** What checkout can fill in for someone signed in. Null for a guest. */
export async function checkoutPrefill() {
  const c = await currentCustomer();
  return (
    c && {
      name: c.name,
      email: c.email,
      phone: c.phone,
      addressLine1: c.addressLine1,
      addressLine2: c.addressLine2,
      city: c.city,
      state: c.state,
      pincode: c.pincode,
    }
  );
}
