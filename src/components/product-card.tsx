import Image from "next/image";
import Link from "next/link";
import { AddToBagButton } from "@/components/add-to-bag";
import { cardCrop, cardMeta, inr, productHref, type Product } from "@/lib/store";

export function ProductCard({ p }: { p: Product }) {
  const crop = cardCrop(p);
  return (
    <div className="card">
      <div style={{ position: "relative" }}>
        <Link href={productHref(p.id)} className="card-photo">
          <Image
            src={p.image}
            alt={p.name}
            width={p.layout.iw}
            height={p.layout.ih}
            sizes="(max-width: 760px) 80vw, 40vw"
            className="crop-img"
            style={{ width: crop.width, objectFit: crop.fit, objectPosition: crop.position }}
          />
          <span className="card-inset" />
        </Link>
        <span className="badge-painted">Hand-painted</span>
      </div>
      <div className="card-body">
        <Link href={productHref(p.id)} className="card-name">{p.name}</Link>
        <div className="card-meta">{cardMeta(p)}</div>
        <div className="card-price-row">
          <span style={{ fontWeight: 600, fontSize: 16.5 }}>{inr(p.price)}</span>
          {p.sold ? (
            <span className="badge badge-sold">Sold</span>
          ) : p.madeToOrder ? (
            <span className="badge badge-mto">Made to order</span>
          ) : (
            <span className="badge badge-ready">Ready to ship</span>
          )}
        </div>
        {!p.sold && <AddToBagButton product={p} />}
      </div>
    </div>
  );
}
