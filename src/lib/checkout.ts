import { z } from "zod";

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
] as const;

/** Accepts "98765 43210", "+91 98765-43210", "098765..."; returns "+919876543210". */
export function normaliseIndianMobile(input: string): string | null {
  let digits = input.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+91")) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? "+91" + digits : null;
}

const text = (min: number, max: number, message: string) => z.string().trim().min(min, message).max(max);

export const checkoutSchema = z.object({
  lines: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        option: z.string().max(100).nullable(),
        qty: z.number().int().min(1).max(10),
      }),
    )
    .min(1, "Your bag is empty")
    .max(50),
  /** The total the customer saw, in rupees. Checked against the server's own total. */
  expectedTotal: z.number().int().min(0),
  name: text(2, 100, "Please enter your full name"),
  email: z.string().trim().toLowerCase().pipe(z.email("Please enter a valid email address")),
  phone: z.string().transform((v, ctx) => {
    const phone = normaliseIndianMobile(v);
    if (!phone) ctx.addIssue({ code: "custom", message: "Please enter a 10-digit Indian mobile number" });
    return phone ?? "";
  }),
  addressLine1: text(5, 200, "Please enter your house number and street"),
  addressLine2: z.string().trim().max(200).optional().transform((v) => v || null),
  city: text(2, 100, "Please enter your city"),
  state: z.enum(INDIAN_STATES, { message: "Please choose your state" }),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Please enter a valid 6-digit PIN code"),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type FieldErrors = Partial<Record<string, string>>;
