"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError(
        error.message.includes("Invalid login")
          ? "Correo o contraseña incorrectos. Inténtalo de nuevo."
          : `No pudimos iniciar sesión: ${error.message}`
      );
      setBusy(false);
      return;
    }
    router.push(next || "/mi-cuenta");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white rounded-md shadow-sm p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-1">
          Entrá a tu cuenta
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Comprá y vendé en toda la isla 🌴
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Correo electrónico</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="border border-gray-300 rounded px-3 py-2.5 outline-none focus:border-brand-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border border-gray-300 rounded px-3 py-2.5 outline-none focus:border-brand-blue"
            />
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="bg-brand-blue hover:bg-brand-blue-dark disabled:opacity-60 text-white font-semibold rounded py-2.5 transition-colors"
          >
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          ¿Todavía no tienes cuenta?{" "}
          <Link href="/registro" className="text-brand-blue hover:underline font-medium">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
