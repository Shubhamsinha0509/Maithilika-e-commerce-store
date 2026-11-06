import { z } from "zod";

export const CUSTOM_ORDER_TYPES = ["Saree", "Painting"] as const;
export const SAREE_FABRICS = ["Silk", "Cotton"] as const;

export const customOrderSchema = z
  .object({
    type: z.enum(CUSTOM_ORDER_TYPES),
    fabric: z.enum(SAREE_FABRICS).nullable(),
    description: z.string().trim().min(3, "Just a few words is enough").max(2000, "Please keep this under 2000 characters"),
  })
  .refine((v) => v.type !== "Saree" || v.fabric, { path: ["fabric"], message: "Please choose a fabric" })
  // Fabric only means something for a saree.
  .transform((v) => ({ ...v, fabric: v.type === "Saree" ? v.fabric : null }));

export type CustomOrderInput = z.input<typeof customOrderSchema>;
