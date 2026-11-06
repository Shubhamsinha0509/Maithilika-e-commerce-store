"use server";

import { customOrderSchema, type CustomOrderInput } from "@/lib/custom-order";
import type { FieldErrors } from "@/lib/checkout";
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
  return { ok: true };
}
