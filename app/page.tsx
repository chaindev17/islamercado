"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SearchBar from "@/components/SearchBar";
import ListingCard, { type ListingCardData } from "@/components/ListingCard";
import { FALLBACK_CATEGORIES, type Category } from "@/lib/constants";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([
    ...FALLBACK_CATEGORIES,
  ]);
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("categories")
      .select("slug, name, icon")
      .order("id")
      .then(({ data }) => {
        if (data && data.length) setCategories(data);
      });
    supabase
      .from("listings")
      .select(
        "id, title, price_usd, images, province, city, negotiable, condition, created_at"
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        setListings((data ?? []) as unknown as ListingCardData[]);
        setLoading(false);
      });
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: favs } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", data.user.id);
      setFavs(new Set((favs ?? []).map((f) => f.listing_id)));
    });
  }, []);

  return (
    <div className="pb-10">
      {/* Hero — El Malecón */}
      <section className="relative">
        <div className="h-2.5 tile-strip" aria-hidden />
        <div className="max-w-[1200px] mx-auto px-4 py-8 sm:py-12 grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-4xl sm:text-5xl font-black text-ink leading-[1.05]">
              El mercado de{" "}
              <span className="text-coral">toda la isla</span>, del malecón a
              tu puerta
            </h1>
            <p className="text-ink-soft text-base sm:text-lg">
              Compra y vende en toda Cuba. Publica gratis, chatea sin vueltas
              y coordina tu trato. 🎵
            </p>
            <div className="max-w-xl">
              <SearchBar size="lg" />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.slice(0, 6).map((c) => (
                <Link
                  key={c.slug}
                  href={`/buscar?cat=${c.slug}`}
                  className="bg-white text-ink text-xs font-medium rounded-full px-3 py-1.5 border-2 border-ink/15 hover:border-coral hover:text-coral-dark transition-colors"
                >
                  {c.icon} {c.name}
                </Link>
              ))}
              <Link
                href="/buscar"
                className="text-xs font-semibold text-mar hover:text-mar-dark rounded-full px-2 py-1.5 underline decoration-wavy decoration-coral/70 underline-offset-4"
              >
                Ver las 18 categorías
              </Link>
            </div>
            <p className="text-xs text-ink-soft/80 pt-1">
              🌴 16 provincias · 📢 Publicar es gratis · 💬 Chat entre vecinos
            </p>
          </div>

          <div className="card overflow-hidden shadow-[4px_4px_0_#21322f] rotate-[0.6deg]">
            <div className="relative aspect-[16/10] bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-malecon.jpg"
                alt="Ilustración del Malecón de La Habana con un auto clásico"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between border-t-2 border-ink/10 bg-paper2">
              <p className="text-xs font-semibold text-ink">
                El Malecón — punto de encuentro de la isla
              </p>
              <span className="text-sun" aria-hidden>
                ☀️
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-3 sm:px-4">
        {/* Categorías */}
        <section className="mt-6">
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-ink mb-4">
            ¿Qué buscas hoy?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/buscar?cat=${c.slug}`}
                className="card card-hover p-4 flex flex-col items-center gap-2"
              >
                <span className="text-3xl" aria-hidden>
                  {c.icon}
                </span>
                <span className="text-xs text-center text-ink leading-snug font-medium">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Publicaciones recientes */}
        <section className="mt-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-ink">
              Recién llegados a la vitrina
            </h2>
            <Link
              href="/buscar"
              className="text-sm font-semibold text-mar hover:text-mar-dark underline decoration-wavy decoration-coral/70 underline-offset-4"
            >
              Ver todas
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="aspect-[4/3] bg-sand/70 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-6 w-1/2 bg-sand rounded animate-pulse" />
                    <div className="h-4 w-full bg-sand rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-sand rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="card p-10 text-center text-ink-soft">
              <p className="text-3xl mb-2" aria-hidden>
                📦
              </p>
              Todavía no hay publicaciones. ¡Sé el primero en{" "}
              <Link
                href="/publicar"
                className="text-mar hover:text-mar-dark font-semibold underline decoration-wavy decoration-coral/70 underline-offset-4"
              >
                publicar algo
              </Link>
              !
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} favSet={favs} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
