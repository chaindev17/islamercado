export default function Logo({
  light = false,
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {/* Sol con palma y olas — marca IslaMercado */}
      <svg
        viewBox="0 0 40 40"
        className="w-9 h-9 shrink-0"
        aria-hidden
        role="img"
      >
        <circle
          cx="20"
          cy="20"
          r="18.5"
          fill="#ffc53d"
          stroke="#21322f"
          strokeWidth="2"
        />
        {/* rayos */}
        <g stroke="#21322f" strokeWidth="1.6" strokeLinecap="round">
          <path d="M20 4.5v2.5" />
          <path d="M31 9l-1.8 1.8" />
          <path d="M9 9l1.8 1.8" />
        </g>
        {/* palma */}
        <path
          d="M21.5 29.5c0-5-.8-8.5-3-12.5"
          fill="none"
          stroke="#21322f"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <g fill="none" stroke="#21322f" strokeWidth="2.2" strokeLinecap="round">
          <path d="M18.5 17c-3.5-3.5-7.5-4.2-11-3" />
          <path d="M18.5 17c-1.5-4.5-4.5-7-8.5-7.5" />
          <path d="M18.5 17c1.5-4.5 4.5-6.5 8.5-6.8" />
          <path d="M18.5 17c3.5-3 7.5-3.5 11-2" />
        </g>
        <circle cx="16.8" cy="18.6" r="1.4" fill="#21322f" />
        {/* olas */}
        <path
          d="M6.5 31.5c2.4-2.2 4.8-2.2 7.2 0s4.8 2.2 7.2 0 4.8-2.2 7.2 0 4.6 2 6.9.4"
          fill="none"
          stroke="#0e5e70"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      {!compact && (
        <span
          className={`font-display text-[1.35rem] sm:text-2xl font-black tracking-tight ${
            light ? "text-paper" : "text-ink"
          }`}
        >
          Isla<span className="text-coral">Mercado</span>
        </span>
      )}
    </span>
  );
}
