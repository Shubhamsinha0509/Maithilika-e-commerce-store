import { CONTACT_EMAIL } from "@/lib/store";

/**
 * The owner's business details and rules, used by the policy and contact
 * pages. `null` means the owner hasn't confirmed it yet: the pages then show a
 * visible "to be confirmed" marker instead of an invented value (CLAUDE.md).
 * Fill a value in here and every page that uses it updates.
 */
export const BUSINESS = {
  /** Legal name exactly as given to Razorpay (proprietor's name or the firm's name). */
  legalName: null as string | null,
  /** Postal address of the business. */
  address: null as string | null,
  phone: null as string | null,
  email: CONTACT_EMAIL,
  /** City whose courts handle disputes, usually where the business is registered. */
  jurisdiction: null as string | null,

  /** e.g. "within 2 working days of payment" */
  dispatchTime: null as string | null,
  /** e.g. "3 to 7 working days after dispatch" */
  deliveryTime: null as string | null,
  /** Days after delivery to report a piece damaged in transit. */
  damageReportDays: null as number | null,

  /** Days after delivery to ask for a return. */
  returnDays: null as number | null,
  /** Which pieces can be returned, in the owner's words. */
  returnable: null as string | null,
  /** Who pays for return shipping. */
  returnShipping: null as string | null,
  /** When a paid order can still be cancelled, e.g. "before it is dispatched". */
  cancellation: null as string | null,
};

export const POLICIES_UPDATED = "4 November 2026";

export const POLICY_LINKS = [
  { href: "/contact", label: "Contact us" },
  { href: "/policies/shipping", label: "Shipping" },
  { href: "/policies/refunds", label: "Returns and refunds" },
  { href: "/policies/terms", label: "Terms and conditions" },
  { href: "/policies/privacy", label: "Privacy policy" },
] as const;
