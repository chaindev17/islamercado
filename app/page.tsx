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
  }, []);

  return (
    <div className="pb-10">
      {/* Hero */}
      <section className="bg-brand-yellow">
        <div className="max-w-[1200px] mx-auto px-4 py-10 sm:py-14 flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 max-w-2xl leading-tight">
            Todo lo que buscas, en una sola isla 🌴
          </h1>
          <p className="text-gray-700 text-sm sm:text-base">
            Compra y vende en toda Cuba. Publicar es gratis.
          </p>
          <div className="w-full max-w-2xl">
            <SearchBar size="lg" />
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {categories.slice(0, 8).map((c) => (
              <Link
                key={c.slug}
                href={`/buscar?cat=${c.slug}`}
                className="bg-white/90 hover:bg-white text-gray-700 text-xs font-medium rounded-full px-3 py-1.5 shadow-sm transition-colors"
              >
                {c.icon} {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-3 sm:px-4">
        {/* Categorías */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Explorá por categorías
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/buscar?cat=${c.slug}`}
                className="bg-white rounded-md p-4 flex flex-col items-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.18)] transition-shadow"
              >
                <span className="text-3xl" aria-hidden>
                  {c.icon}
                </span>
                <span className="text-xs text-center text-gray-700 leading-snug">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Publicaciones recientes */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Publicaciones recientes
            </h2>
            <Link
              href="/buscar"
              className="text-sm text-brand-blue hover:underline"
            >
              Ver todas
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-md overflow-hidden shadow-sm"
                >
                  <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-5 w-1/2 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-md p-10 text-center text-gray-500 shadow-sm">
              <p className="text-3xl mb-2" aria-hidden>
                📦
              </p>
              Todavía no hay publicaciones. ¡Sé el primero en{" "}
              <Link href="/publicar" className="text-brand-blue hover:underline">
                publicar algo
              </Link>
              !
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
