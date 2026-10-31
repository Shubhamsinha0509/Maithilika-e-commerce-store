import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap" style={{ paddingBlock: "80px", minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
      <span className="eyebrow">Page not found</span>
      <h1 className="section-title">This page has wandered off</h1>
      <p className="lede">The piece or page you were looking for isn&apos;t here.</p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: 8 }}>Back to the shop</Link>
    </section>
  );
}
