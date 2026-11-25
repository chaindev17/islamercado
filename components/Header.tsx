"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SearchBar from "./SearchBar";
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

    // Actualiza el badge al volver al foco de la pestaña
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
      <div className="bg-brand-yellow">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 shrink-0"
            aria-label="IslaMercado — inicio"
          >
            <span className="text-2xl leading-none">🌴</span>
            <span className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
              Isla<span className="text-brand-blue-dark">Mercado</span>
            </span>
          </Link>

          <SearchBar className="flex-1 max-w-xl" />

          <nav className="ml-auto flex items-center gap-2 sm:gap-4 text-sm shrink-0">
            {user ? (
              <>
                <Link
                  href="/mensajes"
                  aria-label="Mensajes"
                  title="Mensajes"
                  className="relative p-1.5 text-gray-800 hover:text-brand-blue-dark"
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
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#e62450] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="font-semibold text-gray-800 hover:text-brand-blue-dark"
                  >
                    Hola, {username ?? "usuario"} ▾
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-gray-100 py-1 text-gray-700">
                      <Link
                        href="/mi-cuenta"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-gray-50"
                      >
                        Mis publicaciones
                      </Link>
                      <Link
                        href="/favoritos"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-gray-50"
                      >
                        ♥ Favoritos
                      </Link>
                      <Link
                        href="/mensajes"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-gray-50"
                      >
                        💬 Mensajes
                        {unread > 0 && (
                          <span className="ml-2 inline-flex min-w-[20px] h-5 px-1 bg-[#e62450] text-white text-[10px] font-bold rounded-full items-center justify-center">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-50"
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
                  className="hidden sm:block text-gray-800 hover:text-brand-blue-dark"
                >
                  Crea tu cuenta
                </Link>
                <Link
                  href="/login"
                  className="font-semibold text-gray-800 hover:text-brand-blue-dark"
                >
                  Entrar
                </Link>
              </>
            )}
            <Link
              href="/publicar"
              className="bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold rounded px-3 sm:px-4 py-2 transition-colors"
            >
              Publicar gratis
            </Link>
          </nav>
        </div>
      </div>

      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-4 flex gap-5 overflow-x-auto no-scrollbar py-2 text-[13px] whitespace-nowrap">
          <Link
            href="/buscar"
            className="font-semibold text-gray-800 hover:text-brand-blue-dark"
          >
            Todas
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/buscar?cat=${c.slug}`}
              className="text-gray-600 hover:text-brand-blue-dark"
            >
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
