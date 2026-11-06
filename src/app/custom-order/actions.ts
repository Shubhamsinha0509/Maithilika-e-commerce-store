"use server";

import { after } from "next/server";
import { customOrderSchema, type CustomOrderInput } from "@/lib/custom-order";
import type { FieldErrors } from "@/lib/checkout";
import { sendCustomRequestAlert } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export type CustomOrderResult = { ok: true } | { ok: false; error: string; fieldErrors?: FieldErrors };

/** `website` is a hidden field people never see. Bots fill it in, so their request is dropped. */
export async function sendCustomOrder(input: CustomOrderInput, website: string): Promise<CustomOrderResult> {
  if (website) return { ok: true };

  const parsed = customOrderSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fieldErrors[field] ??= issue.message;
    }
    return { ok: false, error: "Please check the highlighted details.", fieldErrors };
  }

  await prisma.customRequest.create({ data: parsed.data });
  // After the response: the request is saved even if this email has trouble.
  after(async () => {
    if ((await sendCustomRequestAlert(parsed.data)) === "failed") {
      console.error("The new custom order alert could not be sent. The request is in /admin/requests.");
    }
  });
  return { ok: true };
}
