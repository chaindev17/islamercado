"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ListingCard, { type ListingCardData } from "@/components/ListingCard";
import { CONDITIONS, PROVINCES, FALLBACK_CATEGORIES, type Category } from "@/lib/constants";

const SORTS = [
  { key: "recientes", label: "Más recientes" },
  { key: "precio_asc", label: "Menor precio" },
  { key: "precio_desc", label: "Mayor precio" },
];

export default function BuscarClient() {
  const sp = useSearchParams();
  const q = sp.get("q")?.trim() ?? "";
  const cat = sp.get("cat")?.trim() ?? "";
  const prov = sp.get("prov")?.trim() ?? "";
  const min = sp.get("min")?.trim() ?? "";
  const max = sp.get("max")?.trim() ?? "";
  const cond = sp.get("cond")?.trim() ?? "";
  const orden = sp.get("orden")?.trim() || "recientes";

  const [categories, setCategories] = useState<Category[]>([
    ...FALLBACK_CATEGORIES,
  ]);
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: favs } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", data.user.id);
      setFavs(new Set((favs ?? []).map((f) => f.listing_id)));
    });
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("categories")
      .select("slug, name, icon")
      .order("id")
      .then(({ data }) => {
        if (data && data.length) setCategories(data);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("listings")
      .select(
        "id, title, price_usd, images, province, city, negotiable, condition, created_at"
      )
      .eq("status", "active")
      .limit(60);

    const safe = q.replace(/[%_(),]/g, " ").trim();
    if (safe) {
      query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
    }
    if (cat) query = query.eq("categories.slug", cat);
    if (prov) query = query.eq("province", prov);
    if (min && !Number.isNaN(Number(min)))
      query = query.gte("price_usd", Number(min));
    if (max && !Number.isNaN(Number(max)))
      query = query.lte("price_usd", Number(max));
    if (cond) query = query.eq("condition", cond);

    if (orden === "precio_asc")
      query = query.order("price_usd", { ascending: true });
    else if (orden === "precio_desc")
      query = query.order("price_usd", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    query.then(({ data }) => {
      setListings((data ?? []) as unknown as ListingCardData[]);
      setLoading(false);
    });
  }, [q, cat, prov, min, max, cond, orden]);

  const catName = categories.find((c) => c.slug === cat)?.name;

  function hrefWith(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const base: Record<string, string> = {
      q,
      cat,
      prov,
      min,
      max,
      cond,
      orden: orden === "recientes" ? "" : orden,
    };
    for (const [k, v] of Object.entries(base)) if (v) p.set(k, v);
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const s = p.toString();
    return `/buscar${s ? `?${s}` : ""}`;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-4">
      <p className="text-xs text-gray-500 mb-3">
        <Link href="/" className="hover:text-brand-blue">
          Inicio
        </Link>
        {" › "}
        <span>
          {catName ?? (q ? `Resultados para "${q}"` : "Todas las publicaciones")}
        </span>
      </p>

      <div className="grid lg:grid-cols-[250px_1fr] gap-4 items-start">
        {/* Filtros */}
        <form
          action="/buscar"
          method="get"
          className="bg-white rounded-md shadow-sm p-4 flex flex-col gap-3 text-sm"
        >
          {q && <input type="hidden" name="q" value={q} />}
          <p className="font-semibold text-gray-800">Filtros</p>

          <label className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">Categoría</span>
            <select
              name="cat"
              defaultValue={cat}
              className="border border-gray-300 rounded px-2 py-2"
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">Provincia</span>
            <select
              name="prov"
              defaultValue={prov}
              className="border border-gray-300 rounded px-2 py-2"
            >
              <option value="">Toda Cuba</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="text-gray-500 text-xs">Precio (USD)</span>
            <div className="flex gap-2 items-center mt-1">
              <input
                name="min"
                type="number"
                min="0"
                placeholder="Mínimo"
                defaultValue={min}
                className="w-full border border-gray-300 rounded px-2 py-2"
              />
              <span className="text-gray-400">–</span>
              <input
                name="max"
                type="number"
                min="0"
                placeholder="Máximo"
                defaultValue={max}
                className="w-full border border-gray-300 rounded px-2 py-2"
              />
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">Condición</span>
            <select
              name="cond"
              defaultValue={cond}
              className="border border-gray-300 rounded px-2 py-2"
            >
              <option value="">Cualquiera</option>
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold rounded py-2 transition-colors"
          >
            Aplicar filtros
          </button>
          <Link
            href="/buscar"
            className="text-center text-gray-400 hover:text-gray-600"
          >
            Limpiar filtros
          </Link>
        </form>

        {/* Resultados */}
        <section>
          <div className="bg-white rounded-md shadow-sm px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-gray-700">
              {loading
                ? "Buscando…"
                : `${listings.length} ${listings.length === 1 ? "resultado" : "resultados"}${catName ? ` en ${catName}` : ""}`}
            </span>
            <span className="ml-auto flex gap-3">
              {SORTS.map((s) => (
                <Link
                  key={s.key}
                  href={hrefWith({
                    orden: s.key === "recientes" ? undefined : s.key,
                  })}
                  className={
                    orden === s.key
                      ? "text-brand-blue font-semibold"
                      : "text-gray-500 hover:text-brand-blue"
                  }
                >
                  {s.label}
                </Link>
              ))}
            </span>
          </div>

          {!loading && listings.length === 0 ? (
            <div className="bg-white rounded-md p-12 mt-3 text-center text-gray-500 shadow-sm">
              <p className="text-3xl mb-3" aria-hidden>
                🔍
              </p>
              <p className="font-medium text-gray-700 mb-1">
                No encontramos publicaciones
              </p>
              <p className="text-sm">
                Prueba con otra búsqueda o{" "}
                <Link
                  href="/publicar"
                  className="text-brand-blue hover:underline"
                >
                  publica lo que buscas vender
                </Link>
                .
              </p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 mt-3 ${loading ? "opacity-60" : ""}`}
            >
              {(loading ? Array.from({ length: 8 }) : listings).map((l, i) =>
                loading ? (
                  <div
                    key={i}
                    className="bg-white rounded-md overflow-hidden shadow-sm"
                  >
                    <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
                    <div className="p-3 space-y-2">
                      <div className="h-5 w-1/2 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <ListingCard
                    key={(l as ListingCardData).id}
                    listing={l as ListingCardData}
                    favSet={favs}
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
