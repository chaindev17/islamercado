"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (form.username.trim().length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          username: form.username.trim(),
          phone: form.phone.trim() || null,
        },
      },
    });

    if (error) {
      setError(
        error.message.includes("already registered")
          ? "Ese correo ya está registrado. Inicia sesión."
          : `No pudimos crear la cuenta: ${error.message}`
      );
      setBusy(false);
      return;
    }

    if (data.session) {
      router.push("/mi-cuenta");
      router.refresh();
    } else {
      setInfo(
        "¡Cuenta creada! Revisa tu correo para confirmarla antes de entrar."
      );
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="card p-6 sm:p-8">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-ink text-center">
          Crea tu cuenta
        </h1>
        <p className="text-sm text-ink-soft text-center mt-1 mb-6">
          Publicar anuncios en IslaMercado es gratis 🌴
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink font-medium">Nombre de usuario *</span>
            <input
              type="text"
              required
              value={form.username}
              onChange={set("username")}
              placeholder="ej: maria_habana"
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink font-medium">Correo electrónico *</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={set("email")}
              placeholder="tucorreo@ejemplo.com"
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink font-medium">Contraseña *</span>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={set("password")}
              placeholder="Mínimo 6 caracteres"
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink font-medium">
              Teléfono / WhatsApp{" "}
              <span className="text-ink-soft font-normal">(opcional)</span>
            </span>
            <input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="ej: 5 123 4567"
              className="input"
            />
            <span className="text-xs text-ink-soft/80">
              Se muestra en tus anuncios para que te contacten.
            </span>
          </label>

          {error && (
            <p className="text-sm text-coral-dark bg-coral/10 border-2 border-coral/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {info && (
            <p className="text-sm text-palm bg-palm/10 border-2 border-palm/40 rounded-lg px-3 py-2">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn btn-coral w-full text-base py-2.5"
          >
            {busy ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className="text-sm text-ink-soft mt-6 text-center">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-mar hover:text-mar-dark font-semibold underline decoration-wavy decoration-coral/70 underline-offset-4"
          >
            Entra aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
