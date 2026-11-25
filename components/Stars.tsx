"use client";

const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "#ffc53d" : "none"}
      stroke={filled ? "#21322f" : "#5c6b66"}
      strokeWidth="1.6"
      strokeLinejoin="round"
      className="w-full h-full"
      aria-hidden
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

/** Muestra una valoración con estrellas (solo lectura) */
export function StarDisplay({
  rating,
  size = "w-4 h-4",
  className = "",
}: {
  rating: number;
  size?: string;
  className?: string;
}) {
  const full = Math.round(rating);
  return (
    <span
      className={`inline-flex gap-0.5 ${size.includes("w-") ? "" : ""} ${className}`}
      role="img"
      aria-label={`${rating.toFixed(1)} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={size}>
          <Star filled={i <= full} />
        </span>
      ))}
    </span>
  );
}

/** Selector de estrellas para formularios */
export function StarInput({
  value,
  onChange,
  size = "w-8 h-8",
  disabled = false,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Tu valoración">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} estrella${i !== 1 ? "s" : ""}`}
          disabled={disabled}
          onClick={() => onChange(i)}
          className={`${size} p-0.5 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50`}
        >
          <Star filled={i <= value} />
        </button>
      ))}
    </div>
  );
}
