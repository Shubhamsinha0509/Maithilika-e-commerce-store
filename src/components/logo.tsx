import Image from "next/image";
import mark from "../../public/brand/mark.png";
import wordmarkGold from "../../public/brand/wordmark-gold.png";
import wordmark from "../../public/brand/wordmark.png";

/**
 * The owner's peacock "M" and MAITHILIKA lettering, cut out of their logo
 * (public/brand/logo.jpg) so they sit straight on the page, with no badge.
 */
export function Logo() {
  return (
    <>
      <Image src={mark} alt="" className="brand-mark" sizes="56px" priority />
      <Image src={wordmark} alt="" className="brand-word" sizes="170px" priority />
    </>
  );
}

/** The larger version for the dark footer: lettering in gold. */
export function FooterLogo() {
  return (
    <>
      <Image src={mark} alt="" className="footer-mark" sizes="110px" />
      <Image src={wordmarkGold} alt="Maithilika" className="footer-word" sizes="300px" />
    </>
  );
}
