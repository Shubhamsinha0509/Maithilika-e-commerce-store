import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomOrderForm } from "@/components/custom-order-form";
import { currentCustomer, signInEnabled } from "@/lib/customer-auth";

export const metadata: Metadata = { title: "Custom order" };

export default function CustomOrderPage({ searchParams }: PageProps<"/custom-order">) {
  return (
    <section className="wrap custom-page">
      <Suspense fallback={<div className="custom-loading" />}>
        <Flow query={searchParams} />
      </Suspense>
    </section>
  );
}

async function Flow({ query }: { query: PageProps<"/custom-order">["searchParams"] }) {
  const [customer, params] = await Promise.all([currentCustomer(), query]);
  return (
    <CustomOrderForm
      customer={customer && { firstName: customer.name.split(/\s+/)[0], phone: customer.phone }}
      signInEnabled={signInEnabled()}
      signInFailed={params.signin === "failed"}
    />
  );
}
