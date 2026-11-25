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
      className={`flex w-full items-center bg-white rounded-md ${
        big ? "shadow-md p-1.5" : "shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
      } ${className}`}
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Busca en IslaMercado…"
        aria-label="Buscar publicaciones"
        className={`flex-1 min-w-0 px-4 outline-none text-gray-700 italic bg-transparent ${
          big ? "py-2 text-base" : "py-1.5 text-sm"
        }`}
      />
      <button
        type="submit"
        aria-label="Buscar"
        className={`shrink-0 rounded ${
          big ? "px-6 py-2 hover:bg-gray-100" : "px-3 py-1.5 hover:bg-gray-100"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`${big ? "w-6 h-6" : "w-5 h-5"} text-gray-500`}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
}
