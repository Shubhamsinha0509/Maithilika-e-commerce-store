import { useEffect } from "react";

// Counted, so closing one overlay doesn't unfreeze the page under another.
let locks = 0;

/** Freezes the page behind an overlay (bag, menu, filters, payment window) while `active`. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    if (locks++ === 0) {
      // Hiding the scrollbar widens the page; pad it so nothing jumps sideways.
      const scrollbar = window.innerWidth - html.clientWidth;
      html.style.overflow = "hidden";
      if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    }
    return () => {
      if (--locks === 0) {
        html.style.overflow = "";
        document.body.style.paddingRight = "";
      }
    };
  }, [active]);
}
