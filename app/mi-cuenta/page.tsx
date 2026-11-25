"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, timeAgo } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/constants";

type MyListing = {
  id: string;
  title: string;
  price_usd: number;
  images: string[];
  status: string;
  views: number;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  sold: "bg-blue-100 text-blue-800",
};

export default function MiCuentaPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [savedPhone, setSavedPhone] = useState(false);
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login?next=/mi-cuenta");
      return;
    }
    setUid(user.id);
    const [{ data: prof }, { data: rows }] = await Promise.all([
      supabase.from("profiles").select("username, phone").eq("id", user.id).single(),
      supabase
        .from("listings")
        .select("id, title, price_usd, images, status, views, created_at")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    if (prof) {
      setUsername(prof.username);
      setPhone(prof.phone ?? "");
    }
    setListings((rows ?? []) as unknown as MyListing[]);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function savePhone() {
    if (!uid) return;
    const supabase = createClient();
    await supabase.from("profiles").update({ phone: phone.trim() }).eq("id", uid);
    setSavedPhone(true);
    setTimeout(() => setSavedPhone(false), 2500);
  }

  async function setStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase.from("listings").update({ status }).eq("id", id);
    await load();
  }

  async function removeListing(id: string) {
    if (!window.confirm("¿Seguro que quieres eliminar este anuncio? También se borrarán sus fotos.")) return;
    const supabase = createClient();
    const target = listings.find((l) => l.id === id);
    if (target?.images?.length) {
      const paths = target.images
        .map((url) => {
          try {
            const marker = "/listing-images/";
            const u = new URL(url);
            const i = u.pathname.indexOf(marker);
            return i >= 0 ? decodeURIComponent(u.pathname.slice(i + marker.length)) : null;
          } catch {
            return null;
          }
        })
        .filter((p): p is string => Boolean(p));
      if (paths.length) {
        await supabase.storage.from("listing-images").remove(paths);
      }
    }
    await supabase.from("listings").delete().eq("id", id);
    await load();
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500 text-sm">
        Cargando…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-md shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Hola, {username ?? "usuario"} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Administra tus publicaciones y tu contacto.
            </p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-600 underline"
          >
            Salir
          </button>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:items-end">
          <label className="flex flex-col gap-1 text-sm grow">
            <span className="text-gray-600">Teléfono / WhatsApp de contacto</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="ej: 5 123 4567"
              className="border border-gray-300 rounded px-3 py-2 outline-none focus:border-brand-blue"
            />
          </label>
          <button
            onClick={savePhone}
            className="bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold rounded px-4 py-2 transition-colors"
          >
            Guardar
          </button>
        </div>
        {savedPhone && (
          <p className="text-xs text-green-700 mt-2">✔ Teléfono actualizado</p>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">
          Mis publicaciones ({listings.length})
        </h2>
        <Link
          href="/publicar"
          className="bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold rounded px-4 py-2 transition-colors"
        >
          + Publicar
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-md shadow-sm p-10 text-center text-gray-500">
          <p className="text-3xl mb-2" aria-hidden>
            📢
          </p>
          Todavía no has publicado nada.{" "}
          <Link href="/publicar" className="text-brand-blue hover:underline">
            ¡Publica tu primer anuncio!
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-md shadow-sm p-3 flex gap-3 items-center"
            >
              <Link href={`/listing/${l.id}`} className="shrink-0">
                <div className="w-20 h-20 rounded overflow-hidden bg-[#f7f7f7]">
                  {l.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.images[0]}
                      alt={l.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                      🖼️
                    </div>
                  )}
                </div>
              </Link>

              <div className="min-w-0 grow">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[l.status] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {STATUS_LABELS[l.status] ?? l.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {timeAgo(l.created_at)} · {l.views} vistas
                  </span>
                </div>
                <Link
                  href={`/listing/${l.id}`}
                  className="block text-sm text-gray-800 hover:text-brand-blue font-medium line-clamp-1 mt-1"
                >
                  {l.title}
                </Link>
                <p className="text-lg text-gray-900">
                  {formatPrice(l.price_usd)}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0 text-xs">
                {l.status !== "sold" ? (
                  <button
                    onClick={() => setStatus(l.id, "sold")}
                    className="border border-brand-blue text-brand-blue hover:bg-blue-50 rounded px-3 py-1.5 font-medium"
                  >
                    ✔ Vendido
                  </button>
                ) : (
                  <button
                    onClick={() => setStatus(l.id, "active")}
                    className="border border-brand-blue text-brand-blue hover:bg-blue-50 rounded px-3 py-1.5 font-medium"
                  >
                    ↺ Reactivar
                  </button>
                )}
                {l.status === "active" ? (
                  <button
                    onClick={() => setStatus(l.id, "paused")}
                    className="border border-gray-300 text-gray-600 hover:bg-gray-50 rounded px-3 py-1.5 font-medium"
                  >
                    ⏸ Pausar
                  </button>
                ) : l.status === "paused" ? (
                  <button
                    onClick={() => setStatus(l.id, "active")}
                    className="border border-gray-300 text-gray-600 hover:bg-gray-50 rounded px-3 py-1.5 font-medium"
                  >
                    ▶ Activar
                  </button>
                ) : null}
                <button
                  onClick={() => removeListing(l.id)}
                  className="border border-red-200 text-red-600 hover:bg-red-50 rounded px-3 py-1.5 font-medium"
                >
                  🗑 Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
