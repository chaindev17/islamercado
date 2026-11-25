"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ListingCard, { type ListingCardData } from "@/components/ListingCard";

type FavRow = {
  listing_id: string;
  listings: ListingCardData & { status: string };
};

export default function FavoritosPage() {
  const router = useRouter();
  const [items, setItems] = useState<ListingCardData[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let alive = true;
    const supabase = createClient();

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!alive) return;
      if (!user) {
        router.replace("/login?next=/favoritos");
        return;
      }
      setAuthed(true);

      const { data } = await supabase
        .from("favorites")
        .select(
          "listing_id, created_at, listings!inner(id, title, price_usd, images, province, city, negotiable, condition, created_at, status)"
        )
        .eq("user_id", user.id)
        .eq("listings.status", "active")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!alive) return;
      const rows = (data ?? []) as unknown as FavRow[];
      setFavIds(new Set(rows.map((r) => r.listing_id)));
      setItems(rows.map((r) => r.listings));
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  if (!authed && !loading) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Tus favoritos ♥
          </h1>
          <p className="text-sm text-gray-500">
            Las publicaciones que guardaste para volver a ver.
          </p>
        </div>
        <Link
          href="/buscar"
          className="text-sm text-brand-blue hover:underline shrink-0"
        >
          Explorar más
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 py-10 text-center">Cargando…</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-md shadow-sm p-12 text-center text-gray-500">
          <p className="text-4xl mb-3" aria-hidden>
            💔
          </p>
          <p className="font-medium text-gray-700 mb-1">
            Todavía no tienes favoritos
          </p>
          <p className="text-sm">
            Toca el ♥ en cualquier publicación para guardarla aquí.
          </p>
          <Link
            href="/buscar"
            className="inline-block mt-4 bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold rounded px-5 py-2.5 transition-colors"
          >
            Explorar publicaciones
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((l) => (
            <ListingCard key={l.id} listing={l} favSet={favIds} />
          ))}
        </div>
      )}
    </div>
  );
}
