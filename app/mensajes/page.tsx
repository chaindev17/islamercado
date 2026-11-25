"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, timeAgo } from "@/lib/format";

type MsgRow = {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

type Thread = {
  key: string;
  listingId: string;
  peerId: string;
  peerName: string;
  listingTitle: string;
  listingImage: string | null;
  listingPrice: number;
  lastBody: string;
  lastAt: string;
  unread: number;
  mineLast: boolean;
};

export default function MensajesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
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
        router.replace("/login?next=/mensajes");
        return;
      }
      setAuthed(true);
      const me = user.id;

      const { data: msgs } = await supabase
        .from("messages")
        .select(
          "id, listing_id, sender_id, receiver_id, body, read_at, created_at"
        )
        .or(`sender_id=eq.${me},receiver_id=eq.${me}`)
        .order("created_at", { ascending: false })
        .limit(400);

      const rows = (msgs ?? []) as MsgRow[];
      if (!alive) return;

      if (rows.length === 0) {
        setThreads([]);
        setLoading(false);
        return;
      }

      // Agrupa por (publicación + contraparte)
      const map = new Map<string, Thread>();
      for (const m of rows) {
        const peer = m.sender_id === me ? m.receiver_id : m.sender_id;
        const key = `${m.listing_id}|${peer}`;
        const t = map.get(key);
        const unreadInc = m.receiver_id === me && !m.read_at ? 1 : 0;
        if (!t) {
          map.set(key, {
            key,
            listingId: m.listing_id,
            peerId: peer,
            peerName: "",
            listingTitle: "",
            listingImage: null,
            listingPrice: 0,
            lastBody: m.body,
            lastAt: m.created_at,
            unread: unreadInc,
            mineLast: m.sender_id === me,
          });
        } else {
          t.unread += unreadInc;
        }
      }

      const listingIds = [
        ...new Set([...map.values()].map((t) => t.listingId)),
      ];
      const peerIds = [...new Set([...map.values()].map((t) => t.peerId))];

      const [{ data: listings }, { data: profiles }] = await Promise.all([
        supabase
          .from("listings")
          .select("id, title, price_usd, images")
          .in("id", listingIds),
        supabase.from("profiles").select("id, username").in("id", peerIds),
      ]);
      if (!alive) return;

      const lmap = new Map(
        (listings ?? []).map((l) => [
          l.id,
          {
            title: l.title,
            price: Number(l.price_usd),
            img: l.images?.[0] ?? null,
          },
        ])
      );
      const pmap = new Map(
        (profiles ?? []).map((p) => [p.id, p.username ?? "Usuario"])
      );

      const list = [...map.values()].map((t) => {
        const l = lmap.get(t.listingId);
        return {
          ...t,
          peerName: pmap.get(t.peerId) ?? "Usuario",
          listingTitle: l?.title ?? "Publicación eliminada",
          listingImage: l?.img ?? null,
          listingPrice: l?.price ?? 0,
        };
      });
      list.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
      setThreads(list);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  if (!authed && !loading) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="card p-4 sm:p-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Mensajes 💬
        </h1>
        <p className="text-sm text-ink-soft mt-1 mb-5">
          Conversaciones con compradores y vendedores de la isla.
        </p>

        {loading ? (
          <p className="text-sm text-ink-soft/70 py-8 text-center">
            Cargando…
          </p>
        ) : threads.length === 0 ? (
          <div className="py-10 text-center text-ink-soft">
            <p className="text-4xl mb-3" aria-hidden>
              🗨️
            </p>
            <p className="font-semibold text-ink mb-1">
              Todavía no tienes conversaciones
            </p>
            <p className="text-sm">
              Escribe al vendedor desde cualquier publicación con el botón{" "}
              <span className="font-medium text-ink">💬 Chatear</span>.
            </p>
            <Link href="/buscar" className="btn btn-mar mt-4">
              Explorar publicaciones
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-ink/10">
            {threads.map((t) => (
              <li key={t.key}>
                <Link
                  href={`/mensajes/${t.listingId}/${t.peerId}`}
                  className="flex items-center gap-3 py-3 px-1 hover:bg-sand/50 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-sand/70 border border-ink/10 shrink-0">
                    {t.listingImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.listingImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink/20 text-xl">
                        🖼️
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 grow">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm truncate ${t.unread > 0 ? "font-bold text-ink" : "font-medium text-ink"}`}
                      >
                        {t.peerName}
                      </p>
                      <span className="text-xs text-ink-soft/80 shrink-0">
                        {timeAgo(t.lastAt)}
                      </span>
                    </div>
                    <p className="text-xs text-ink-soft truncate">
                      {t.listingTitle} · {formatPrice(t.listingPrice)}
                    </p>
                    <p
                      className={`text-sm truncate mt-0.5 ${t.unread > 0 ? "text-ink font-semibold" : "text-ink-soft"}`}
                    >
                      {t.mineLast && (
                        <span className="text-ink-soft/70">Tú: </span>
                      )}
                      {t.lastBody}
                    </p>
                  </div>
                  {t.unread > 0 && (
                    <span className="shrink-0 min-w-[22px] h-[22px] px-1.5 bg-coral text-white text-xs font-bold rounded-full border-2 border-ink flex items-center justify-center">
                      {t.unread}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
