"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

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
      <div className="card p-6 sm:p-8">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-ink text-center">
          Entra a tu cuenta
        </h1>
        <p className="text-sm text-ink-soft text-center mt-1 mb-6">
          Compra y vende en toda la isla 🌴
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink font-medium">Correo electrónico</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink font-medium">Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
            />
          </label>

          {error && (
            <p className="text-sm text-coral-dark bg-coral/10 border-2 border-coral/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn btn-mar w-full text-base py-2.5"
          >
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-ink-soft mt-6 text-center">
          ¿Todavía no tienes cuenta?{" "}
          <Link
            href="/registro"
            className="text-mar hover:text-mar-dark font-semibold underline decoration-wavy decoration-coral/70 underline-offset-4"
          >
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
