"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";

type Msg = {
  id: string;
  listing_id?: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export default function ChatPage() {
  const params = useParams<{ listingId: string; peerId: string }>();
  const router = useRouter();
  const listingId = params?.listingId;
  const peerId = params?.peerId;

  const [me, setMe] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [peerName, setPeerName] = useState("");
  const [listing, setListing] = useState<{
    title: string;
    price_usd: number;
    images: string[];
    seller_id: string;
  } | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const markRead = useCallback(
    async (uid: string) => {
      if (!listingId || !peerId) return;
      const supabase = createClient();
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("receiver_id", uid)
        .eq("sender_id", peerId)
        .eq("listing_id", listingId)
        .is("read_at", null);
    },
    [listingId, peerId]
  );

  const loadMessages = useCallback(
    async (uid: string) => {
      if (!listingId || !peerId) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("messages")
        .select("id, sender_id, body, created_at, read_at")
        .eq("listing_id", listingId)
        .or(
          `and(sender_id=eq.${uid},receiver_id=eq.${peerId}),and(sender_id=eq.${peerId},receiver_id=eq.${uid})`
        )
        .order("created_at", { ascending: true })
        .limit(300);
      const rows = (data ?? []) as Msg[];
      setMsgs(rows);
      await markRead(uid);
    },
    [listingId, peerId, markRead]
  );

  useEffect(() => {
    if (!listingId || !peerId) return;
    let alive = true;
    const supabase = createClient();

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!alive) return;
      if (!user) {
        router.replace(
          `/login?next=/mensajes/${listingId}/${peerId}`
        );
        return;
      }
      if (user.id === peerId) {
        setBlocked(true);
        return;
      }
      setMe(user.id);

      const [{ data: l }, { data: p }] = await Promise.all([
        supabase
          .from("listings")
          .select("title, price_usd, images, seller_id")
          .eq("id", listingId)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("username")
          .eq("id", peerId)
          .single(),
      ]);
      if (!alive) return;
      if (!l) {
        setBlocked(true);
        return;
      }
      setListing(l as { title: string; price_usd: number; images: string[]; seller_id: string });
      setPeerName(p?.username ?? "Usuario");
      await loadMessages(user.id);
    })();

    return () => {
      alive = false;
    };
  }, [listingId, peerId, router, loadMessages]);

  // Tiempo real: mensajes entrantes de esta conversación
  useEffect(() => {
    if (!me || !peerId || !listingId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`chat-${listingId}-${me}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${me}`,
        },
        (payload) => {
          const m = payload.new as Msg;
          if (m.listing_id === listingId && m.sender_id === peerId) {
            setMsgs((prev) =>
              prev.some((x) => x.id === m.id) ? prev : [...prev, m]
            );
            markRead(me);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [me, peerId, listingId, markRead]);

  // Al volver al foco, refresca por si el realtime falló
  useEffect(() => {
    if (!me) return;
    const onFocus = () => loadMessages(me);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [me, loadMessages]);

  // Autoscroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [msgs.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !me || sending) return;
    setSending(true);
    setError("");
    const supabase = createClient();
    const { data, error: insErr } = await supabase
      .from("messages")
      .insert({
        listing_id: listingId,
        sender_id: me,
        receiver_id: peerId,
        body,
      })
      .select("id, sender_id, body, created_at, read_at")
      .single();
    if (insErr || !data) {
      setError("No se pudo enviar el mensaje. Inténtalo de nuevo.");
    } else {
      setMsgs((prev) => [...prev, data as Msg]);
      setText("");
    }
    setSending(false);
  }

  if (blocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-md shadow-sm p-10">
          <p className="text-4xl mb-3" aria-hidden>
            🌴
          </p>
          <p className="font-semibold text-gray-800 mb-1">
            Conversación no disponible
          </p>
          <p className="text-sm text-gray-500 mb-6">
            La publicación puede haber sido eliminada.
          </p>
          <Link
            href="/buscar"
            className="inline-block bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold rounded px-5 py-2.5 transition-colors"
          >
            Explorar publicaciones
          </Link>
        </div>
      </div>
    );
  }

  if (!me || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500 text-sm">
        Cargando…
      </div>
    );
  }

  const isSeller = listing.seller_id === me;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-white rounded-md shadow-sm overflow-hidden flex flex-col h-[calc(100dvh-220px)] min-h-[480px]">
        {/* Cabecera */}
        <div className="flex items-center gap-3 p-3 border-b border-gray-100">
          <Link
            href="/mensajes"
            aria-label="Volver a mensajes"
            className="p-1.5 text-gray-500 hover:text-brand-blue"
          >
            ←
          </Link>
          {listing.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.images[0]}
              alt=""
              className="w-11 h-11 rounded object-cover bg-[#f7f7f7]"
            />
          ) : (
            <div className="w-11 h-11 rounded bg-[#f7f7f7] flex items-center justify-center text-gray-300">
              🖼️
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {peerName}
            </p>
            <Link
              href={`/listing/${listingId}`}
              className="text-xs text-brand-blue hover:underline truncate block max-w-[260px] sm:max-w-md"
            >
              {listing.title} · {formatPrice(listing.price_usd)}
            </Link>
          </div>
          {isSeller && (
            <span className="ml-auto text-[11px] bg-green-100 text-green-800 font-semibold px-2 py-1 rounded-full shrink-0">
              Vendedor
            </span>
          )}
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-2">
          {msgs.length === 0 && (
            <div className="my-auto text-center text-sm text-gray-400 px-6">
              Aún no hay mensajes. ¡Rompe el hielo preguntando por el
              producto! 🌴
            </div>
          )}
          {msgs.map((m) => {
            const mine = m.sender_id === me;
            return (
              <div
                key={m.id}
                className={`max-w-[80%] sm:max-w-[70%] ${mine ? "self-end" : "self-start"}`}
              >
                <div
                  className={`px-3.5 py-2 rounded-2xl text-sm leading-snug break-words ${
                    mine
                      ? "bg-brand-blue text-white rounded-br-md"
                      : "bg-gray-100 text-gray-800 rounded-bl-md"
                  }`}
                >
                  {m.body}
                </div>
                <p
                  className={`text-[10px] text-gray-400 mt-0.5 ${mine ? "text-right" : ""}`}
                >
                  {new Date(m.created_at).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Enviar */}
        <form
          onSubmit={send}
          className="border-t border-gray-100 p-2 sm:p-3 flex gap-2"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            placeholder="Escribe un mensaje…"
            className="flex-1 min-w-0 border border-gray-300 rounded-full px-4 py-2.5 outline-none focus:border-brand-blue text-sm"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="shrink-0 bg-brand-blue hover:bg-brand-blue-dark disabled:opacity-50 text-white font-semibold rounded-full px-5 py-2.5 text-sm transition-colors"
          >
            Enviar
          </button>
        </form>
        {error && (
          <p className="px-3 pb-2 text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
