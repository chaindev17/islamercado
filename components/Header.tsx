"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SearchBar from "./SearchBar";
import Logo from "./Logo";
import type { Category } from "@/lib/constants";

export default function Header({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const userIdRef = useRef<string | null>(null);

  const loadUnread = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid) return;
    const supabase = createClient();
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", uid)
      .is("read_at", null);
    setUnread(count ?? 0);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ? { id: data.user.id } : null);
      userIdRef.current = data.user?.id ?? null;
      if (data.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.user.id)
          .single();
        setUsername(prof?.username ?? null);
        loadUnread();
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id } : null);
      userIdRef.current = session?.user?.id ?? null;
      if (!session) {
        setUsername(null);
        setUnread(0);
      } else {
        loadUnread();
      }
    });

    const onFocus = () => loadUnread();
    window.addEventListener("focus", onFocus);

    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, [loadUnread]);

  // Tiempo real: nuevos mensajes entrantes
  useEffect(() => {
    const uid = userIdRef.current;
    if (!uid) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`unread-${uid}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${uid}`,
        },
        () => setUnread((u) => u + 1)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40">
      {/* Cinta de feria */}
      <div className="bg-coral text-white text-[12px] font-medium text-center px-3 py-1 tracking-wide">
        ☀️ ¡Publicar es gratis! — de Pinar del Río a Guantánamo 🌴
      </div>

      <div className="bg-paper border-b-2 border-ink">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-3 sm:gap-5">
          <Link
            href="/"
            className="shrink-0"
            aria-label="IslaMercado — inicio"
          >
            <Logo />
          </Link>

          <SearchBar className="flex-1 max-w-xl" />

          <nav className="ml-auto flex items-center gap-1.5 sm:gap-2.5 text-sm shrink-0">
            {user ? (
              <>
                <Link
                  href="/mensajes"
                  aria-label="Mensajes"
                  title="Mensajes"
                  className="relative p-2 text-ink hover:text-mar rounded-full hover:bg-ink/5"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                    aria-hidden
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-coral text-white text-[10px] font-bold rounded-full border border-paper2 flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
                <Link
                  href="/favoritos"
                  aria-label="Favoritos"
                  title="Favoritos"
                  className="hidden sm:block p-2 text-ink hover:text-coral rounded-full hover:bg-ink/5"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                    aria-hidden
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="font-semibold text-ink hover:text-mar px-1.5 py-1.5"
                  >
                    Hola, {username ?? "usuario"} ▾
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-paper2 border-2 border-ink rounded-xl shadow-[3px_3px_0_#21322f] py-1.5 text-ink overflow-hidden">
                      <Link
                        href="/mi-cuenta"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-sand"
                      >
                        Mis publicaciones
                      </Link>
                      <Link
                        href="/favoritos"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-sand"
                      >
                        ♥ Favoritos
                      </Link>
                      <Link
                        href="/mensajes"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-sand"
                      >
                        💬 Mensajes
                        {unread > 0 && (
                          <span className="ml-2 inline-flex min-w-[20px] h-5 px-1 bg-coral text-white text-[10px] font-bold rounded-full items-center justify-center">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 hover:bg-sand text-coral-dark"
                      >
                        Salir
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/registro"
                  className="hidden sm:block text-ink hover:text-mar font-medium px-1.5"
                >
                  Crea tu cuenta
                </Link>
                <Link
                  href="/login"
                  className="font-semibold text-ink hover:text-mar px-1.5"
                >
                  Entrar
                </Link>
              </>
            )}
            <Link href="/publicar" className="btn btn-coral">
              Publicar gratis
            </Link>
          </nav>
        </div>
      </div>

      <nav className="bg-paper2 border-b border-ink/15">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-4 flex gap-5 overflow-x-auto no-scrollbar py-2 text-[13px] whitespace-nowrap">
          <Link
            href="/buscar"
            className="font-semibold text-ink hover:text-mar"
          >
            Todas
          </Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/buscar?cat=${c.slug}`} className="cat-link">
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
