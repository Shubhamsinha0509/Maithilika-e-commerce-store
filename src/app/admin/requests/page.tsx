import type { Metadata } from "next";
import { Suspense } from "react";
import { markRequestContacted } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin-nav";
import { formatDate } from "@/lib/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Custom requests · Admin" };

export default function AdminRequestsPage() {
  return (
    <section className="wrap admin-page">
      <Suspense fallback={<p>Loading…</p>}>
        <Requests />
      </Suspense>
    </section>
  );
}

async function Requests() {
  await requireAdmin();
  // Waiting for a call first, then the newest.
  const requests = await prisma.customRequest.findMany({
    orderBy: [{ contactedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    take: 200,
  });

  return (
    <>
      <AdminNav current="requests" />
      {requests.length === 0 ? (
        <div className="empty-state"><span style={{ fontSize: 16 }}>No custom requests yet.</span></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Received</th><th>Customer</th><th>Wants</th><th>Description</th><th>Status</th></tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.createdAt)}</td>
                  <td>{r.name}<br /><a href={`tel:${r.phone}`}>{r.phone}</a></td>
                  <td>{r.type}{r.fabric && <><br /><span className="field-help">{r.fabric}</span></>}</td>
                  <td style={{ whiteSpace: "pre-wrap", minWidth: 240 }}>{r.description}</td>
                  <td>
                    {r.contactedAt ? (
                      <span className="field-help">Contacted {formatDate(r.contactedAt)}</span>
                    ) : (
                      <form action={markRequestContacted}>
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit" className="btn btn-outline" style={{ minHeight: 40, padding: "0 12px" }}>Mark contacted</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
