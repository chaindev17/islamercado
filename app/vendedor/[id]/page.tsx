"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ListingCard, { type ListingCardData } from "@/components/ListingCard";
import { StarDisplay, StarInput } from "@/components/Stars";
import { timeAgo } from "@/lib/format";

type Review = {
  id: string;
  author_id: string;
  seller_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

type ReviewWithAuthor = Review & { authorName: string };

export default function VendedorPage() {
  const params = useParams<{ id: string }>();
  const sellerId = params?.id;

  const [profile, setProfile] = useState<{
    username: string | null;
    created_at: string;
  } | null>(null);
  const [missing, setMissing] = useState(false);
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(
    async (uid: string | null) => {
      if (!sellerId) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("reviews")
        .select("id, author_id, seller_id, rating, comment, created_at")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false })
        .limit(50);
      const rows = (data ?? []) as Review[];
      const authorIds = [...new Set(rows.map((r) => r.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", authorIds);
      const pmap = new Map(
        (profiles ?? []).map((p) => [p.id, p.username ?? "Usuario"])
      );
      setReviews(rows.map((r) => ({ ...r, authorName: pmap.get(r.author_id) ?? "Usuario" })));

      if (uid) {
        const mine = rows.find((r) => r.author_id === uid);
        if (mine) {
          setRating(mine.rating);
          setComment(mine.comment);
          setEditing(true);
        }
      }
    },
    [sellerId]
  );

  useEffect(() => {
    if (!sellerId) return;
    let alive = true;
    const supabase = createClient();

    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("username, created_at")
        .eq("id", sellerId)
        .maybeSingle();
      if (!alive) return;
      if (!prof) {
        setMissing(true);
        setLoading(false);
        return;
      }
      setProfile(prof as { username: string | null; created_at: string });

      const { data: l } = await supabase
        .from("listings")
        .select(
          "id, title, price_usd, images, province, city, negotiable, condition, created_at"
        )
        .eq("seller_id", sellerId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(24);
      if (!alive) return;
      setListings((l ?? []) as unknown as ListingCardData[]);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!alive) return;
      setMe(user?.id ?? null);

      if (user) {
        const { data: favs } = await supabase
          .from("favorites")
          .select("listing_id")
          .eq("user_id", user.id);
        if (!alive) return;
        setFavs(new Set((favs ?? []).map((f) => f.listing_id)));
      }

      await loadReviews(user?.id ?? null);
      if (alive) setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [sellerId, loadReviews]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!me || !sellerId || rating === 0) {
      setMsg("Elige una valoración de 1 a 5 estrellas.");
      return;
    }
    setBusy(true);
    setMsg("");
    const supabase = createClient();
    const { error } = await supabase.from("reviews").upsert(
      {
        author_id: me,
        seller_id: sellerId,
        rating,
        comment: comment.trim().slice(0, 1000),
      },
      { onConflict: "author_id,seller_id" }
    );
    if (error) {
      setMsg("No se pudo guardar tu reseña. Inténtalo de nuevo.");
    } else {
      setMsg(editing ? "✔ Reseña actualizada" : "✔ ¡Reseña publicada!");
      setEditing(true);
      await loadReviews(me);
    }
    setBusy(false);
  }

  async function deleteReview() {
    if (!me || !sellerId) return;
    if (!window.confirm("¿Eliminar tu reseña?")) return;
    setBusy(true);
    const supabase = createClient();
    await supabase
      .from("reviews")
      .delete()
      .eq("author_id", me)
      .eq("seller_id", sellerId);
    setRating(0);
    setComment("");
    setEditing(false);
    setMsg("");
    await loadReviews(me);
    setBusy(false);
  }

  if (missing) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="card p-10">
          <p className="text-4xl mb-3" aria-hidden>
            🌴
          </p>
          <p className="font-semibold text-ink mb-1">Vendedor no encontrado</p>
          <p className="text-sm text-ink-soft mb-6">
            Puede haber dejado la isla.
          </p>
          <Link href="/buscar" className="btn btn-mar">
            Explorar publicaciones
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center text-ink-soft text-sm">
        Cargando…
      </div>
    );
  }

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length
      : 0;
  const isSelf = me === sellerId;

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-6">
      {/* Cabecera del vendedor */}
      <div className="card p-5 sm:p-6 mb-5">
        <div className="flex items-start gap-4 flex-wrap">
          <span
            className="w-14 h-14 rounded-full bg-sun border-2 border-ink flex items-center justify-center font-display text-2xl font-black text-ink shrink-0"
            aria-hidden
          >
            {(profile.username ?? "U").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 grow">
            <h1 className="font-display text-2xl font-extrabold text-ink leading-tight">
              {profile.username ?? "Usuario de IslaMercado"}
            </h1>
            <p className="text-sm text-ink-soft">
              Miembro desde{" "}
              {new Date(profile.created_at).toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}{" "}
              · {listings.length}{" "}
              {listings.length === 1 ? "publicación activa" : "publicaciones activas"}
            </p>
            {reviews.length > 0 ? (
              <div className="flex items-center gap-2 mt-2">
                <StarDisplay rating={avg} size="w-5 h-5" />
                <span className="text-sm font-semibold text-ink">
                  {avg.toFixed(1)}
                </span>
                <span className="text-sm text-ink-soft">
                  ({reviews.length}{" "}
                  {reviews.length === 1 ? "reseña" : "reseñas"})
                </span>
              </div>
            ) : (
              <p className="text-sm text-ink-soft mt-2">
                Todavía sin reseñas
              </p>
            )}
          </div>
          {isSelf && (
            <span className="text-xs bg-sun text-ink font-semibold px-3 py-1.5 rounded-full border-2 border-ink/20">
              Esta es tu página de vendedor
            </span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
        {/* Publicaciones activas */}
        <section>
          <h2 className="font-display text-xl font-extrabold text-ink mb-3">
            Publicaciones de {profile.username ?? "este vendedor"}
          </h2>
          {listings.length === 0 ? (
            <div className="card p-8 text-center text-ink-soft text-sm">
              No tiene publicaciones activas ahora mismo.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} favSet={favs} />
              ))}
            </div>
          )}
        </section>

        {/* Reseñas */}
        <section className="flex flex-col gap-4">
          <div className="card p-4 sm:p-5">
            <h2 className="font-display text-lg font-extrabold text-ink mb-3">
              Reseñas {reviews.length > 0 && `(${reviews.length})`}
            </h2>

            {/* Formulario */}
            {me && !isSelf ? (
              <form onSubmit={submitReview} className="flex flex-col gap-3 pb-4 mb-4 border-b-2 border-ink/10">
                <p className="text-sm font-medium text-ink">
                  {editing
                    ? "Tu reseña (puedes editarla):"
                    : "¿Compraste o trataste con este vendedor? Deja tu reseña:"}
                </p>
                <StarInput value={rating} onChange={setRating} disabled={busy} />
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  placeholder="¿Cómo fue el trato? ¿El producto era como lo describían?"
                  className="input"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={busy || rating === 0}
                    className="btn btn-mar"
                  >
                    {busy ? "Guardando…" : editing ? "Actualizar" : "Publicar reseña"}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={deleteReview}
                      disabled={busy}
                      className="btn btn-ghost border-coral/50 text-coral-dark hover:bg-coral/10"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
                {msg && <p className="text-xs text-palm font-semibold">{msg}</p>}
              </form>
            ) : !me && !isSelf ? (
              <p className="text-sm text-ink-soft pb-4 mb-4 border-b-2 border-ink/10">
               {" "}
                <Link
                  href={`/login?next=/vendedor/${sellerId}`}
                  className="text-mar font-semibold hover:text-mar-dark"
                >
                  Entra a tu cuenta
                </Link>{" "}
                para dejar una reseña.
              </p>
            ) : null}

            {/* Lista */}
            {reviews.length === 0 ? (
              <p className="text-sm text-ink-soft italic">
                Sé el primero en dejar una reseña.
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {reviews.map((r) => (
                  <li key={r.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={Number(r.rating)} size="w-3.5 h-3.5" />
                      <span className="text-sm font-semibold text-ink">
                        {r.authorName}
                      </span>
                      <span className="text-xs text-ink-soft/70">
                        {timeAgo(r.created_at)}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-ink leading-relaxed">
                        {r.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
