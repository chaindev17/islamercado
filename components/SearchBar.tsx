"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({
  size = "md",
  initial = "",
  className = "",
}: {
  size?: "md" | "lg";
  initial?: string;
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/buscar?q=${encodeURIComponent(term)}` : "/buscar");
  }

  const big = size === "lg";

  return (
    <form
      onSubmit={submit}
      role="search"
      className={`flex w-full items-center bg-white border-2 border-ink rounded-full overflow-hidden shadow-[2px_2px_0_#21322f] ${
        big ? "p-1 pl-1.5" : ""
      } ${className}`}
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={big ? "Busca en la isla…" : "Busca en IslaMercado…"}
        aria-label="Buscar publicaciones"
        className={`flex-1 min-w-0 px-3 outline-none text-ink italic bg-transparent placeholder:text-ink-soft ${
          big ? "py-2 text-base" : "py-1.5 text-sm"
        }`}
      />
      <button
        type="submit"
        aria-label="Buscar"
        className={`shrink-0 rounded-full text-coral hover:text-coral-dark transition-colors ${
          big ? "px-4 py-2 bg-sun border-2 border-ink" : "px-3 py-1.5"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={big ? "#21322f" : "currentColor"}
          strokeWidth={big ? "2.5" : "2.2"}
          strokeLinecap="round"
          className={`${big ? "w-5 h-5" : "w-5 h-5"}`}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
}
