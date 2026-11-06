"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { sendCustomOrder } from "@/app/custom-order/actions";
import { GoogleButton } from "@/components/google-button";
import { CUSTOM_ORDER_TYPES, SAREE_FABRICS } from "@/lib/custom-order";
import { createLocalStore } from "@/lib/local-store";

type OrderType = (typeof CUSTOM_ORDER_TYPES)[number];
type Fabric = (typeof SAREE_FABRICS)[number];

// Kept in the browser, so the customer's words survive the trip to Google and back.
type Draft = { type?: OrderType; fabric?: Fabric; idea?: string; ideaDone?: boolean };
const draftStore = createLocalStore<Draft>("maithilika-custom-order");
const EMPTY_DRAFT: Draft = {};

// The saree photo has detail shots on its right, so its crop keeps only the main
// picture (the left 60%). The painting's crop centres the sun.
const TYPE_PHOTOS: Record<OrderType, { src: string; width: number; height: number; cropWidth: string; left: string; position: string }> = {
  Saree: { src: "/images/sarees/saree-3.jpg", width: 1145, height: 1374, cropWidth: "166%", left: "0", position: "0 4%" },
  Painting: { src: "/images/paintings/painting-3.jpg", width: 540, height: 450, cropWidth: "135%", left: "-17.5%", position: "50% 50%" },
};

const IDEA_STARTERS: Record<OrderType, string[]> = {
  Saree: ["For a wedding", "A gift", "Peacocks", "Lotus", "Fish"],
  Painting: ["For my home", "A gift", "Peacocks", "Lotus", "Sun"],
};

type Props = {
  customer: { firstName: string; phone: string | null } | null;
  signInEnabled: boolean;
  signInFailed: boolean;
};

export function CustomOrderForm({ customer, signInEnabled, signInFailed }: Props) {
  const router = useRouter();
  const stored = useSyncExternalStore(draftStore.subscribe, draftStore.read, draftStore.serverSnapshot);
  const draft = stored[0] ?? EMPTY_DRAFT;
  const update = (changes: Draft) => draftStore.write((current) => [{ ...current[0], ...changes }]);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { type, fabric, idea = "", ideaDone } = draft;
  const step = sent
    ? "thanks"
    : !type
      ? "type"
      : type === "Saree" && !fabric
        ? "fabric"
        : !ideaDone
          ? "idea"
          : !customer
            ? "signin"
            : "send";

  // Each new question takes the reader's focus, and the top of the page on a phone.
  const heading = useRef<HTMLHeadingElement>(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    heading.current?.focus();
  }, [step]);

  const send = async (phone?: string) => {
    if (!type) return;
    setSending(true);
    setError(null);
    const result = await sendCustomOrder({ type, fabric: fabric ?? null, description: idea }, phone).catch(() => ({
      ok: false as const,
      error: "That didn't go through. Please check your connection and try again.",
      field: undefined,
      signedOut: false,
    }));
    setSending(false);
    if (result.ok) {
      setSent(true);
      draftStore.write(() => []);
      return;
    }
    setError(result.error);
    if (result.field === "description") update({ ideaDone: false });
    if (result.signedOut) router.refresh();
  };

  const finishIdea = () => {
    if (idea.trim().length < 3) {
      setError("Just a few words is enough");
      return;
    }
    setError(null);
    update({ ideaDone: true });
    // Someone we already know needs no more steps.
    if (customer?.phone) void send();
  };

  const addStarter = (word: string) => {
    const text = idea.trim();
    setError(null);
    update({ idea: text ? `${text}, ${word.toLowerCase()}` : word });
  };

  if (step === "thanks") {
    return (
      <div role="status" className="custom-step custom-thanks">
        <div className="dot-band" aria-hidden="true" />
        <h1 ref={heading} tabIndex={-1} className="section-title">Thank you{customer ? `, ${customer.firstName}` : ""}</h1>
        <p className="lede">We will get in contact within 1-2 hr.</p>
        <Link href="/" className="btn btn-primary">Back to the shop</Link>
      </div>
    );
  }

  const chosen = [type, fabric].filter(Boolean).join(" · ");

  return (
    <div key={step} className="custom-step">
      {type && (
        <p className="custom-chosen">
          <span>{chosen}</span>
          <button type="button" onClick={() => { setError(null); update({ type: undefined, fabric: undefined, ideaDone: false }); }}>Change</button>
        </p>
      )}

      {step === "type" && (
        <>
          <h1 ref={heading} tabIndex={-1} className="custom-question">What would you love us to paint for you?</h1>
          <div className="custom-types">
            {CUSTOM_ORDER_TYPES.map((t) => {
              const photo = TYPE_PHOTOS[t];
              return (
                <button key={t} type="button" className="custom-type" onClick={() => update({ type: t })}>
                  <span className="circle-frame">
                    <span className="circle-inner">
                      <Image
                        src={photo.src}
                        alt=""
                        width={photo.width}
                        height={photo.height}
                        sizes="270px"
                        className="crop-img"
                        style={{ width: photo.cropWidth, left: photo.left, objectPosition: photo.position }}
                      />
                    </span>
                  </span>
                  <span className="display">{t}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {step === "fabric" && (
        <>
          <h1 ref={heading} tabIndex={-1} className="custom-question">Lovely. Which fabric feels right?</h1>
          <div className="custom-fabrics">
            {SAREE_FABRICS.map((f) => (
              <button key={f} type="button" className="custom-fabric" onClick={() => update({ fabric: f })}>{f}</button>
            ))}
          </div>
        </>
      )}

      {step === "idea" && (
        <>
          <h1 ref={heading} tabIndex={-1} className="custom-question">Tell us your idea, in your own words</h1>
          <div className="custom-starters">
            {IDEA_STARTERS[type!].map((word) => (
              <button key={word} type="button" className="custom-starter" onClick={() => addStarter(word)}>+ {word}</button>
            ))}
          </div>
          <textarea
            className="custom-idea"
            aria-label="Your idea"
            rows={4}
            maxLength={2000}
            value={idea}
            onChange={(e) => { setError(null); update({ idea: e.target.value }); }}
            placeholder="A peacock border in maroon and gold, for my sister's wedding"
          />
          {error && <p role="alert" className="custom-note">{error}</p>}
          <button type="button" className="btn btn-primary custom-go" disabled={sending} onClick={finishIdea}>
            {sending ? "Sending…" : "Send my idea"}
          </button>
        </>
      )}

      {step === "signin" && (
        <>
          <h1 ref={heading} tabIndex={-1} className="custom-question">Almost there. Who should we reply to?</h1>
          <p className="custom-sub">Sign in once, and we&apos;ll keep your idea safe while you do.</p>
          {signInFailed && <p role="alert" className="custom-note">That sign-in didn&apos;t work. Please try again.</p>}
          {error && <p role="alert" className="custom-note">{error}</p>}
          {signInEnabled ? (
            <GoogleButton next="/custom-order" />
          ) : (
            <p className="custom-sub">Sign-in opens soon. Until then, write to us at <a href="mailto:support@maithilika.com">support@maithilika.com</a>.</p>
          )}
        </>
      )}

      {step === "send" && customer && (
        <SendStep
          firstName={customer.firstName}
          phone={customer.phone}
          sending={sending}
          error={error}
          heading={heading}
          onSend={send}
        />
      )}
    </div>
  );
}

function SendStep({ firstName, phone, sending, error, heading, onSend }: {
  firstName: string;
  phone: string | null;
  sending: boolean;
  error: string | null;
  heading: React.RefObject<HTMLHeadingElement | null>;
  onSend: (phone?: string) => void;
}) {
  const [number, setNumber] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSend(phone ? undefined : number); }} className="custom-send">
      <h1 ref={heading} tabIndex={-1} className="custom-question">
        {phone ? `Ready to send this, ${firstName}?` : `Thanks, ${firstName}. What number should we call you on?`}
      </h1>
      {phone ? (
        <p className="custom-sub">We&apos;ll call you on {phone}. <Link href="/account">Change number</Link></p>
      ) : (
        <>
          <input
            className="custom-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-label="Your mobile number"
            placeholder="98765 43210"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
          <p className="custom-sub">We&apos;ll only ask once. It stays on your profile.</p>
        </>
      )}
      {error && <p role="alert" className="custom-note">{error}</p>}
      <button type="submit" className="btn btn-primary custom-go" disabled={sending}>
        {sending ? "Sending…" : "Send my idea"}
      </button>
    </form>
  );
}
