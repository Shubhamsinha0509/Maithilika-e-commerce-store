import Image from "next/image";
import mark from "../../public/brand/mark.jpg";

/** The peacock "M" from the owner's logo, on a round paper badge for the dark header and footer. */
export function Logo({ size = 44 }: { size?: number }) {
  return <Image src={mark} alt="" width={size} height={size} className="logo-badge" priority />;
}
