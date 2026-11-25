"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SearchBar from "./SearchBar";
import type { Category } from "@/lib/constants";

export default function Header({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ? { id: data.user.id } : null);
      if (data.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.user.id)
          .single();
        setUsername(prof?.username ?? null);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id } : null);
      if (!session) setUsername(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

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
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                    >
                      Salir
                    </button>
                  </div>
                )}
              </div>
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
