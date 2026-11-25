"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Gallery from "@/components/Gallery";
import FavoriteButton from "@/components/FavoriteButton";
import { StarDisplay } from "@/components/Stars";
import { formatPrice, timeAgo, waDigits } from "@/lib/format";
import { CONDITIONS } from "@/lib/constants";

type ListingRow = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price_usd: number;
  negotiable: boolean;
  condition: string;
  province: string;
  city: string | null;
  images: string[];
  phone: string | null;
  status: string;
  views: number;
  created_at: string;
  categories: { name: string; slug: string } | null;
  profiles: {
    username: string | null;
    phone: string | null;
    created_at: string;
  } | null;
};

const STATUS_TEXT: Record<string, string> = {
  sold: "Vendido",
  paused: "Pausado",
  active: "Activo",
};

const STATUS_CHIP: Record<string, string> = {
  sold: "bg-mar text-white",
  paused: "bg-sun text-ink",
  active: "bg-palm text-white",
};

export default function ListingPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [listing, setListing] = useState<ListingRow | null>(null);
  const [missing, setMissing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [fav, setFav] = useState(false);
  const [sellerRating, setSellerRating] = useState<{
    avg: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    const supabase = createClient();

    (async () => {
      const { data, error } = await supabase
        .from("listings")
        .select(
          "*, categories(name, slug), profiles(username, phone, created_at)"
        )
        .eq("id", id)
        .maybeSingle();

      if (!alive) return;

      if (error || !data) {
        setMissing(true);
        return;
      }
      const row = data as unknown as ListingRow;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const owner = user?.id === row.seller_id;
      if (!alive) return;
      setIsOwner(owner);
      setAuthed(!!user);

      if (user) {
        const { data: favRow } = await supabase
          .from("favorites")
          .select("listing_id")
          .eq("user_id", user.id)
          .eq("listing_id", id)
          .maybeSingle();
        if (!alive) return;
        setFav(!!favRow);
      }

      if (row.status !== "active" && !owner) {
        setMissing(true);
        return;
      }
      setListing(row);

      // Valoración del vendedor
      const { data: revs } = await supabase
        .from("reviews")
        .select("rating")
        .eq("seller_id", row.seller_id)
        .limit(200);
      if (!alive) return;
      if (revs && revs.length > 0) {
        const avg =
          revs.reduce((s, r) => s + Number(r.rating), 0) / revs.length;
        setSellerRating({ avg, count: revs.length });
      }

      if (!owner) {
        try {
          await supabase.rpc("incrementar_vista", { listing: id });
        } catch {
          // el contador no bloquea la página
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  if (missing) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="card p-10">
          <p className="text-4xl mb-3" aria-hidden>
            🌴
          </p>
          <p className="font-semibold text-ink mb-1">
            Publicación no disponible
          </p>
          <p className="text-sm text-ink-soft mb-6">
            Puede haber sido vendida, pausada o eliminada.
          </p>
          <Link href="/buscar" className="btn btn-mar">
            Explorar otras publicaciones
          </Link>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center text-ink-soft text-sm">
        Cargando…
      </div>
    );
  }

  const conditionLabel =
    CONDITIONS.find((c) => c.value === listing.condition)?.label ??
    listing.condition;

  const contactPhone = listing.phone ?? listing.profiles?.phone ?? null;
  const waText = encodeURIComponent(
    `Hola! Vi tu anuncio "${listing.title}" en IslaMercado 🌴`
  );
  const waHref = contactPhone
    ? `https://wa.me/${waDigits(contactPhone)}?text=${waText}`
    : null;

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-4">
      <p className="text-xs text-ink-soft mb-3">
        <Link href="/" className="hover:text-mar">
          Inicio
        </Link>
        {" › "}
        {listing.categories && (
          <>
            <Link
              href={`/buscar?cat=${listing.categories.slug}`}
              className="hover:text-mar"
            >
              {listing.categories.name}
            </Link>
            {" › "}
          </>
        )}
        <span className="text-ink">{listing.title}</span>
      </p>

      {isOwner && (
        <div className="card border-sun px-4 py-2.5 mb-3 flex items-center gap-3 text-sm">
          <span className="font-semibold text-ink">Este es tu anuncio</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border-2 border-ink/20 ${STATUS_CHIP[listing.status] ?? ""}`}
          >
            {STATUS_TEXT[listing.status] ?? listing.status}
          </span>
          <Link
            href="/mi-cuenta"
            className="ml-auto text-mar hover:text-mar-dark font-medium"
          >
            Administrar
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="card p-3 sm:p-4">
            <Gallery images={listing.images} alt={listing.title} />
          </div>

          <div className="card p-4 sm:p-6">
            <h2 className="font-display text-lg font-extrabold text-ink mb-3">
              Descripción
            </h2>
            {listing.description ? (
              <p className="text-sm text-ink whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            ) : (
              <p className="text-sm text-ink-soft italic">
                El vendedor no agregó descripción.
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 text-sm">
              <div>
                <p className="text-ink-soft text-xs">Condición</p>
                <p className="text-ink font-medium">{conditionLabel}</p>
              </div>
              <div>
                <p className="text-ink-soft text-xs">Ubicación</p>
                <p className="text-ink font-medium">
                  {[listing.city, listing.province].filter(Boolean).join(", ")}
                </p>
              </div>
              <div>
                <p className="text-ink-soft text-xs">Publicado</p>
                <p className="text-ink font-medium">
                  {timeAgo(listing.created_at)}
                </p>
              </div>
              <div>
                <p className="text-ink-soft text-xs">Vistas</p>
                <p className="text-ink font-medium">{listing.views ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-32">
          <div className="card p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-4xl font-extrabold text-ink">
                {formatPrice(listing.price_usd)}
              </p>
              <FavoriteButton
                listingId={listing.id}
                initial={fav}
                big={true}
              />
            </div>
            {listing.negotiable && (
              <span className="inline-block mt-2 text-xs font-semibold text-palm bg-palm/10 border border-palm/40 rounded-full px-2 py-1">
                ✔ Precio negociable
              </span>
            )}
            <h1 className="mt-3 text-lg text-ink leading-snug font-medium">
              {listing.title}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              {[listing.city, listing.province].filter(Boolean).join(", ")}
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {isOwner ? (
                <Link href="/mensajes" className="btn btn-mar w-full">
                  💬 Ver mensajes recibidos
                </Link>
              ) : (
                <Link
                  href={
                    authed
                      ? `/mensajes/${listing.id}/${listing.seller_id}`
                      : `/login?next=/listing/${listing.id}`
                  }
                  className="btn btn-mar w-full"
                >
                  💬 Chatear con el vendedor
                </Link>
              )}
              {contactPhone && waHref && (
                <>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-palm w-full"
                  >
                    🟢 WhatsApp
                  </a>
                  <a
                    href={`tel:+${waDigits(contactPhone)}`}
                    className="btn btn-outline-mar w-full"
                  >
                    📞 Llamar: {contactPhone}
                  </a>
                </>
              )}
              {!contactPhone && !isOwner && (
                <p className="text-xs text-ink-soft text-center">
                  Este vendedor todavía no publicó un teléfono; escríbele por
                  el chat.
                </p>
              )}
              <p className="text-[11px] text-ink-soft/80 text-center mt-1">
                Coordiná el pago y la entrega directamente con el vendedor.
              </p>
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <p className="text-xs text-ink-soft mb-1">Vendedor</p>
            <Link
              href={`/vendedor/${listing.seller_id}`}
              className="font-semibold text-ink hover:text-mar"
            >
              {listing.profiles?.username ?? "Usuario de IslaMercado"}
            </Link>
            {sellerRating && (
              <div className="flex items-center gap-2 mt-1.5">
                <StarDisplay rating={sellerRating.avg} size="w-4 h-4" />
                <span className="text-sm font-semibold text-ink">
                  {sellerRating.avg.toFixed(1)}
                </span>
                <span className="text-xs text-ink-soft">
                  ({sellerRating.count}{" "}
                  {sellerRating.count === 1 ? "reseña" : "reseñas"})
                </span>
              </div>
            )}
            {listing.profiles?.created_at && (
              <p className="text-xs text-ink-soft mt-1">
                Miembro desde{" "}
                {new Date(listing.profiles.created_at).toLocaleDateString(
                  "es-ES",
                  { month: "long", year: "numeric" }
                )}
              </p>
            )}
            <Link
              href={`/vendedor/${listing.seller_id}`}
              className="inline-block mt-3 text-xs font-semibold text-mar hover:text-mar-dark underline decoration-wavy decoration-coral/70 underline-offset-4"
            >
              Ver perfil, anuncios y reseñas →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
