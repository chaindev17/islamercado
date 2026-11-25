"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CONDITIONS, PROVINCES } from "@/lib/constants";

const MAX_IMAGES = 6;

export default function PublicarPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [checked, setChecked] = useState(false);
  const [cats, setCats] = useState<{ id: number; slug: string; name: string; icon: string }[]>([]);
  const [form, setForm] = useState({
    title: "",
    categoryId: "",
    price: "",
    condition: "usado",
    province: "",
    city: "",
    description: "",
    phone: "",
    negotiable: false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Sesión + categorías
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login?next=/publicar");
        return;
      }
      supabase
        .from("profiles")
        .select("phone")
        .eq("id", data.user.id)
        .single()
        .then(({ data: prof }) => {
          if (prof?.phone)
            setForm((f) => (f.phone ? f : { ...f, phone: prof.phone! }));
        });
      supabase
        .from("categories")
        .select("id, slug, name, icon")
        .order("id")
        .then(({ data }) => {
          if (data && data.length) setCats(data);
        });
    });
    setChecked(true);
  }, [router]);

  function set<K extends keyof typeof form>(
    k: K,
    value: (typeof form)[K]
  ) {
    setForm((f) => ({ ...f, [k]: value }));
  }

  function addFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    setError("");
    setFiles((prev) => {
      const merged = [...prev, ...list].slice(0, MAX_IMAGES);
      setPreviews(merged.map((f) => URL.createObjectURL(f)));
      return merged;
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeFile(i: number) {
    setFiles((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      setPreviews(next.map((f) => URL.createObjectURL(f)));
      return next;
    });
  }

  function validate(): string {
    if (form.title.trim().length < 5)
      return "El título debe tener al menos 5 caracteres.";
    if (!form.categoryId) return "Elige una categoría.";
    const price = Number(form.price);
    if (!form.price || Number.isNaN(price) || price < 0)
      return "Escribe un precio válido en USD.";
    if (!form.province) return "Elige una provincia.";
    if (form.description.length > 5000)
      return "La descripción es demasiado larga (máximo 5000 caracteres).";
    return "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login?next=/publicar");
      return;
    }

    const { data: created, error: insertErr } = await supabase
      .from("listings")
      .insert({
        seller_id: user.id,
        category_id: Number(form.categoryId),
        title: form.title.trim(),
        description: form.description.trim(),
        price_usd: Number(form.price),
        negotiable: form.negotiable,
        condition: form.condition,
        province: form.province,
        city: form.city.trim() || null,
        phone: form.phone.trim() || null,
        images: [],
      })
      .select("id")
      .single();

    if (insertErr || !created) {
      setError(
        `No pudimos publicar tu anuncio: ${insertErr?.message ?? "error desconocido"}`
      );
      setBusy(false);
      return;
    }

    // Subir imágenes al bucket y guardar las URLs públicas
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/${created.id}/${i}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("listing-images")
        .upload(path, f, { contentType: f.type, upsert: true });
      if (!upErr) {
        const { data: pub } = supabase.storage
          .from("listing-images")
          .getPublicUrl(path);
        urls.push(pub.publicUrl);
      }
    }
    if (urls.length > 0) {
      await supabase.from("listings").update({ images: urls }).eq("id", created.id);
    }
    if (form.phone.trim()) {
      await supabase
        .from("profiles")
        .update({ phone: form.phone.trim() })
        .eq("id", user.id);
    }

    router.push(`/listing/${created.id}`);
  }

  if (!checked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500 text-sm">
        Cargando…
      </div>
    );
  }

  const inputCls =
    "border border-gray-300 rounded px-3 py-2.5 outline-none focus:border-brand-blue w-full";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-md shadow-sm p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-gray-800">
          Publicar un anuncio
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Es gratis. Entre más claro y detallado, más rápido vendes 🌴
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">
              Título <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              required
              maxLength={120}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="ej: iPhone 12 128GB con caja y cargador"
              className={inputCls}
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600">
                Categoría <span className="text-red-500">*</span>
              </span>
              <select
                required
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className={inputCls}
              >
                <option value="">Elegir…</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600">
                Precio (USD) <span className="text-red-500">*</span>
              </span>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="ej: 250"
                className={inputCls}
              />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600">Condición</span>
              <select
                value={form.condition}
                onChange={(e) => set("condition", e.target.value)}
                className={inputCls}
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-600">
                Provincia <span className="text-red-500">*</span>
              </span>
              <select
                required
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
                className={inputCls}
              >
                <option value="">Elegir…</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Ciudad o municipio</span>
            <input
              type="text"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="ej: Centro Habana"
              className={inputCls}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">Descripción</span>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe el estado, lo que incluye, detalles de uso, formas de entrega…"
              className={inputCls}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-gray-600">
              Teléfono / WhatsApp de contacto
            </span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="ej: 5 123 4567"
              className={inputCls}
            />
            <span className="text-xs text-gray-400">
              Se guarda en tu perfil y aparece en este anuncio.
            </span>
          </label>

          {/* Imágenes */}
          <div className="flex flex-col gap-2 text-sm">
            <span className="text-gray-600">
              Fotos ({files.length}/{MAX_IMAGES})
            </span>
            {files.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Foto ${i + 1}`}
                      className="w-full aspect-square object-cover rounded border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label={`Quitar foto ${i + 1}`}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-gray-300 rounded-full text-gray-600 text-xs leading-none shadow hover:bg-red-50"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={addFiles}
              disabled={files.length >= MAX_IMAGES}
              className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-yellow file:text-gray-800 file:font-semibold file:cursor-pointer"
            />
            <span className="text-xs text-gray-400">
              Hasta {MAX_IMAGES} fotos. La primera será la foto principal.
            </span>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.negotiable}
              onChange={(e) => set("negotiable", e.target.checked)}
              className="w-4 h-4 accent-[#3483fa]"
            />
            El precio es negociable
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="bg-brand-blue hover:bg-brand-blue-dark disabled:opacity-60 text-white font-semibold rounded py-3 transition-colors"
          >
            {busy ? "Publicando…" : "Publicar anuncio"}
          </button>
        </form>
      </div>
    </div>
  );
}
