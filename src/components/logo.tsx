/** The fish mark from the design's header and footer. */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 30) / 40} viewBox="0 0 40 30" aria-hidden="true">
      <path d="M3 15 Q15 3 27 15 Q15 27 3 15 Z" fill="none" stroke="#C9A24B" strokeWidth="2" />
      <path d="M27 15 L37 7 L37 23 Z" fill="none" stroke="#C9A24B" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="10" cy="14" r="1.8" fill="#C9A24B" />
      <path d="M15 9.5 Q19 15 15 20.5" fill="none" stroke="#C9A24B" strokeWidth="1.4" />
    </svg>
  );
}
