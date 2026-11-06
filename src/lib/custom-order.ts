import { z } from "zod";
import { normaliseIndianMobile } from "@/lib/checkout";

export const CUSTOM_ORDER_TYPES = ["Saree", "Painting"] as const;
export const SAREE_FABRICS = ["Silk", "Cotton"] as const;

export const customOrderSchema = z
  .object({
    type: z.enum(CUSTOM_ORDER_TYPES, { message: "Please choose what you would like painted" }),
    fabric: z.enum(SAREE_FABRICS).nullable(),
    description: z
      .string()
      .trim()
      .min(10, "Please tell us a little more about what you have in mind")
      .max(2000, "Please keep this under 2000 characters"),
    name: z.string().trim().min(2, "Please enter your name").max(100),
    phone: z.string().transform((v, ctx) => {
      const phone = normaliseIndianMobile(v);
      if (!phone) ctx.addIssue({ code: "custom", message: "Please enter a 10-digit Indian mobile number" });
      return phone ?? "";
    }),
  })
  .superRefine((v, ctx) => {
    if (v.type === "Saree" && !v.fabric) {
      ctx.addIssue({ code: "custom", path: ["fabric"], message: "Please choose a fabric" });
    }
  })
  // Fabric only means something for a saree.
  .transform((v) => ({ ...v, fabric: v.type === "Saree" ? v.fabric : null }));

export type CustomOrderInput = z.input<typeof customOrderSchema>;
