"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FavoriteButton({
  listingId,
  initial = false,
  big = false,
}: {
  listingId: string;
  initial?: boolean;
  big?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    // Evita navegar cuando el botón vive dentro de un Link (tarjeta)
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    setBusy(true);
    if (active) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);
      if (!error) setActive(false);
    } else {
      const { error } = await supabase
        .from("favorites")
        .upsert(
          { user_id: user.id, listing_id: listingId },
          { onConflict: "user_id,listing_id", ignoreDuplicates: true }
        );
      if (!error) setActive(true);
    }
    setBusy(false);
  }

  const size = big ? "w-10 h-10" : "w-8 h-8";
  const icon = big ? "w-6 h-6" : "w-5 h-5";

  return (
    <button
      onClick={toggle}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={active}
      title={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`${size} ${icon} shrink-0 flex items-center justify-center bg-white/95 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.2)] hover:scale-110 active:scale-95 transition-transform ${big ? "" : ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={active ? "#e62450" : "none"}
        stroke={active ? "#e62450" : "#737373"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[70%] h-[70%]"
        aria-hidden
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>
  );
}
