"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { quickSearch, type QuickResult } from "@/app/search/actions";
import { POPULAR_SEARCHES } from "@/lib/search";
import { SECTIONS, sectionHref } from "@/lib/store";
import { useScrollLock } from "@/lib/use-scroll-lock";

export function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M15.5 15.5 L21 21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const searchHref = (q: string) => `/search?q=${encodeURIComponent(q.trim())}`;

/** The search panel: one box, live results as you type, popular searches before. */
export function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<QuickResult | null>(null);
  const [loading, setLoading] = useState(false);
  const latest = useRef(0);
  useScrollLock(true);

  // Close with Escape, like any other panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Ask the server a moment after typing stops; only the newest answer counts.
  const q = query.trim();
  useEffect(() => {
    if (q.length < 2) return;
    const ticket = ++latest.current;
    const t = setTimeout(() => {
      setLoading(true);
      quickSearch(q)
        .then((r) => ticket === latest.current && setResult(r))
        .catch(() => ticket === latest.current && setResult({ total: 0, items: [] }))
        .finally(() => ticket === latest.current && setLoading(false));
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };
  const showResults = q.length >= 2 && result !== null;

  return (
    <div className="search-layer">
      <button className="search-scrim" aria-label="Close search" onClick={onClose} />
      <div className="search-panel" role="dialog" aria-label="Search">
        <div className="search-top">
          <form
            role="search"
            className="search-pill"
            onSubmit={(e) => {
              e.preventDefault();
              if (q) go(searchHref(q));
            }}
          >
            <SearchIcon />
            <input
              type="search"
              name="q"
              enterKeyHint="search"
              autoComplete="off"
              aria-label="Search Maithilika"
              placeholder="Search sarees, motifs, paintings…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button type="button" className="search-clear" aria-label="Clear search" onClick={() => { setQuery(""); setResult(null); }}>
                ×
              </button>
            )}
          </form>
          <button type="button" className="search-cancel" onClick={onClose}>Close</button>
        </div>

        <div className="search-body" aria-live="polite">
          {!showResults ? (
            <>
              <p className="search-label">Popular searches</p>
              <div className="search-chips">
                {POPULAR_SEARCHES.map((s) => (
                  <button key={s} type="button" className="search-chip" onClick={() => setQuery(s)}>{s}</button>
                ))}
              </div>
              <p className="search-label">Shop by category</p>
              <div className="search-chips">
                {SECTIONS.map((s) => (
                  <Link key={s.key} href={sectionHref(s.key)} className="search-chip" onClick={onClose}>{s.label}</Link>
                ))}
              </div>
              {q.length >= 2 && loading && <p className="search-hint">Searching…</p>}
            </>
          ) : result.total === 0 ? (
            <div className="search-empty">
              <p>Nothing matched “{q}”.</p>
              <p className="search-hint">Try a motif like peacock or lotus, or a fabric like silk.</p>
            </div>
          ) : (
            <>
              <p className="search-label">{result.total === 1 ? "1 piece" : `${result.total} pieces`}</p>
              <ul className="search-results">
                {result.items.map((p) => (
                  <li key={p.id}>
                    <Link href={`/product/${p.id}`} className="search-result" onClick={onClose}>
                      <span className="search-thumb">
                        <Image src={p.image} alt="" fill sizes="112px" className="crop-img" style={{ width: p.crop.width, objectPosition: p.crop.position }} />
                      </span>
                      <span className="search-result-text">
                        <span className="search-result-name">{p.name}</span>
                        <span className="search-result-meta">{p.meta}</span>
                      </span>
                      <span className="search-result-price">{p.sold ? "Sold" : p.price}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={searchHref(q)} className="search-all" onClick={onClose}>
                See all {result.total} {result.total === 1 ? "result" : "results"} for “{q}” →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
