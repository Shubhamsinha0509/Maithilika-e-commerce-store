import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import type { OrderStatus } from "@/generated/prisma/client";
import { AdminNav } from "@/components/admin-nav";
import { formatDate, STATUS_LABEL } from "@/lib/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/store";

export const metadata: Metadata = { title: "Orders · Admin" };

const TABS: { key: string; label: string; statuses?: OrderStatus[] }[] = [
  { key: "to-ship", label: "To ship", statuses: ["PAID"] },
  { key: "shipped", label: "Shipped", statuses: ["SHIPPED"] },
  { key: "delivered", label: "Delivered", statuses: ["DELIVERED"] },
  { key: "unpaid", label: "Unpaid", statuses: ["PENDING_PAYMENT"] },
  { key: "cancelled", label: "Cancelled", statuses: ["CANCELLED"] },
  { key: "all", label: "All" },
];

export default function AdminOrdersPage({ searchParams }: PageProps<"/admin">) {
  return (
    <section className="wrap admin-page">
      <Suspense fallback={<p>Loading…</p>}>
        <Orders query={searchParams} />
      </Suspense>
    </section>
  );
}

async function Orders({ query }: { query: PageProps<"/admin">["searchParams"] }) {
  await requireAdmin();
  const params = await query;
  const tab = TABS.find((t) => t.key === params.tab) ?? TABS[0];
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const orders = await prisma.order.findMany({
    where: {
      ...(tab.statuses && !q ? { status: { in: tab.statuses } } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q.replace(/\s/g, "") } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const counts = await prisma.order.groupBy({ by: ["status"], _count: true });
  const countFor = (statuses?: OrderStatus[]) =>
    counts.filter((c) => !statuses || statuses.includes(c.status)).reduce((n, c) => n + c._count, 0);

  return (
    <>
      <AdminNav current="orders" />
      <div className="admin-toolbar">
        <div className="chip-row" style={{ flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <Link key={t.key} href={`/admin?tab=${t.key}`} className="pill" aria-pressed={!q && t.key === tab.key}>
              {t.label} <span style={{ opacity: 0.7 }}>{countFor(t.statuses)}</span>
            </Link>
          ))}
        </div>
        <form method="get" action="/admin" className="admin-search">
          <input name="q" defaultValue={q} placeholder="Order number, name, email or phone" aria-label="Search orders" />
          <button type="submit" className="btn btn-outline" style={{ minHeight: 44, padding: "0 18px" }}>Search</button>
        </form>
      </div>

      {q && <p className="field-help">Showing results for “{q}” across all statuses. <Link href="/admin">Clear search</Link></p>}

      {orders.length === 0 ? (
        <div className="empty-state"><span style={{ fontSize: 16 }}>No orders here yet.</span></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Order</th><th>Placed</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/orders/${o.orderNumber}`} style={{ fontWeight: 600 }}>{o.orderNumber}</Link>
                    {o.note && <span className="admin-flag" title={o.note}>Note</span>}
                  </td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{o.name}<br /><span className="field-help">{o.city}, {o.state}</span></td>
                  <td>{(o.items as unknown as unknown[]).length}</td>
                  <td>{inr(o.total)}</td>
                  <td><span className={`status status-${o.status.toLowerCase()}`}>{STATUS_LABEL[o.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
