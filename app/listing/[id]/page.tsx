"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Gallery from "@/components/Gallery";
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
  sold: "bg-brand-blue text-white",
  paused: "bg-yellow-400 text-gray-900",
  active: "bg-brand-green text-white",
};

export default function ListingPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [listing, setListing] = useState<ListingRow | null>(null);
  const [missing, setMissing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

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

      if (row.status !== "active" && !owner) {
        setMissing(true);
        return;
      }
      setListing(row);

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
        <div className="bg-white rounded-md shadow-sm p-10">
          <p className="text-4xl mb-3" aria-hidden>
            🌴
          </p>
          <p className="font-semibold text-gray-800 mb-1">
            Publicación no disponible
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Puede haber sido vendida, pausada o eliminada.
          </p>
          <Link
            href="/buscar"
            className="inline-block bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold rounded px-5 py-2.5 transition-colors"
          >
            Explorar otras publicaciones
          </Link>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center text-gray-500 text-sm">
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
      <p className="text-xs text-gray-500 mb-3">
        <Link href="/" className="hover:text-brand-blue">
          Inicio
        </Link>
        {" › "}
        {listing.categories && (
          <>
            <Link
              href={`/buscar?cat=${listing.categories.slug}`}
              className="hover:text-brand-blue"
            >
              {listing.categories.name}
            </Link>
            {" › "}
          </>
        )}
        <span className="text-gray-600">{listing.title}</span>
      </p>

      {isOwner && (
        <div className="bg-white border border-brand-yellow rounded-md px-4 py-2.5 mb-3 flex items-center gap-3 text-sm">
          <span className="font-semibold text-gray-800">
            Este es tu anuncio
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CHIP[listing.status] ?? ""}`}
          >
            {STATUS_TEXT[listing.status] ?? listing.status}
          </span>
          <Link
            href="/mi-cuenta"
            className="ml-auto text-brand-blue hover:underline"
          >
            Administrar
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="bg-white rounded-md shadow-sm p-3 sm:p-4">
            <Gallery images={listing.images} alt={listing.title} />
          </div>

          <div className="bg-white rounded-md shadow-sm p-4 sm:p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Descripción</h2>
            {listing.description ? (
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                El vendedor no agregó descripción.
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Condición</p>
                <p className="text-gray-800 font-medium">{conditionLabel}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Ubicación</p>
                <p className="text-gray-800 font-medium">
                  {[listing.city, listing.province].filter(Boolean).join(", ")}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Publicado</p>
                <p className="text-gray-800 font-medium">
                  {timeAgo(listing.created_at)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Vistas</p>
                <p className="text-gray-800 font-medium">
                  {listing.views ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-32">
          <div className="bg-white rounded-md shadow-sm p-4 sm:p-6">
            <p className="text-3xl font-light text-gray-900">
              {formatPrice(listing.price_usd)}
            </p>
            {listing.negotiable && (
              <span className="inline-block mt-2 text-xs font-semibold text-brand-green bg-green-50 rounded px-2 py-1">
                ✔ Precio negociable
              </span>
            )}
            <h1 className="mt-3 text-lg text-gray-800 leading-snug">
              {listing.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {[listing.city, listing.province].filter(Boolean).join(", ")}
            </p>

            {contactPhone && waHref ? (
              <div className="mt-5 flex flex-col gap-2">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-brand-green hover:bg-green-700 text-white font-semibold rounded py-2.5 transition-colors"
                >
                  💬 Escribir por WhatsApp
                </a>
                <a
                  href={`tel:+${waDigits(contactPhone)}`}
                  className="w-full text-center bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold rounded py-2.5 transition-colors"
                >
                  📞 Llamar: {contactPhone}
                </a>
                <p className="text-[11px] text-gray-400 text-center mt-1">
                  Coordiná el pago y la entrega directamente con el vendedor.
                </p>
              </div>
            ) : (
              <div className="mt-5 bg-gray-50 rounded p-3 text-sm text-gray-600 text-center">
                Este vendedor todavía no publicó un teléfono de contacto.
                ¡Pronto lo agregará!
              </div>
            )}
          </div>

          <div className="bg-white rounded-md shadow-sm p-4 sm:p-6">
            <p className="text-xs text-gray-400 mb-1">Vendedor</p>
            <p className="font-semibold text-gray-800">
              {listing.profiles?.username ?? "Usuario de IslaMercado"}
            </p>
            {listing.profiles?.created_at && (
              <p className="text-xs text-gray-400 mt-1">
                Miembro desde{" "}
                {new Date(listing.profiles.created_at).toLocaleDateString(
                  "es-ES",
                  { month: "long", year: "numeric" }
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
