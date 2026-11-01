import Link from "next/link";
import { logout } from "@/app/admin/actions";

export function AdminNav({ current }: { current: "orders" | "products" }) {
  return (
    <div className="admin-nav">
      <span className="display" style={{ fontSize: 22, color: "var(--indigo)" }}>Admin</span>
      <nav style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Link href="/admin" className="pill" aria-pressed={current === "orders"}>Orders</Link>
        <Link href="/admin/products" className="pill" aria-pressed={current === "products"}>Products</Link>
      </nav>
      <form action={logout} style={{ marginLeft: "auto" }}>
        <button type="submit" className="link-button">Log out</button>
      </form>
    </div>
  );
}
