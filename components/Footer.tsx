import Link from "next/link";
import Logo from "./Logo";

const STEPS = [
  {
    icon: "👤",
    title: "Crea tu cuenta",
    text: "Regístrate gratis con tu correo en menos de un minuto.",
  },
  {
    icon: "📢",
    title: "Publica tu anuncio",
    text: "Sube fotos, pon tu precio en USD y elige tu provincia.",
  },
  {
    icon: "🤝",
    title: "Coordina el trato",
    text: "Chatea, llama o escribe por WhatsApp y cierra tu negocio.",
  },
];

export default function Footer() {
  return (
    <footer className="mt-12">
      {/* Cómo funciona */}
      <div className="max-w-[1200px] mx-auto px-4 pb-10">
        <h2 className="font-display text-xl font-extrabold text-ink mb-4">
          Vender en IslaMercado es así de fácil
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="card p-5 flex flex-col gap-2">
              <span
                className="w-11 h-11 rounded-full bg-sun border-2 border-ink flex items-center justify-center text-xl"
                aria-hidden
              >
                {s.icon}
              </span>
              <h3 className="font-semibold text-ink">{s.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Frisa de azulejos */}
      <div className="h-4 tile-strip-dark" aria-hidden />

      <div className="bg-mar-dark text-paper">
        <div className="max-w-[1200px] mx-auto px-4 py-10 grid gap-8 sm:grid-cols-3">
          <div>
            <Logo light />
            <p className="text-sm text-paper/70 mt-3 leading-relaxed max-w-xs">
              El mercado de toda la isla: publica gratis, chatea sin vueltas y
              coordina tu trato en cualquier provincia.
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm text-paper/80">
            <p className="font-semibold text-paper mb-1">Explora</p>
            <Link href="/buscar" className="hover:text-sun">
              Publicaciones
            </Link>
            <Link href="/favoritos" className="hover:text-sun">
              Tus favoritos
            </Link>
            <Link href="/mensajes" className="hover:text-sun">
              Mensajes
            </Link>
          </nav>
          <nav className="flex flex-col gap-2 text-sm text-paper/80">
            <p className="font-semibold text-paper mb-1">Vende</p>
            <Link href="/publicar" className="hover:text-sun">
              Publicar gratis
            </Link>
            <Link href="/mi-cuenta" className="hover:text-sun">
              Mis publicaciones
            </Link>
            <Link href="/registro" className="hover:text-sun">
              Crear cuenta
            </Link>
          </nav>
        </div>
        <div className="border-t border-paper/15">
          <div className="max-w-[1200px] mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-paper/60">
            <p>© 2026 IslaMercado — Hecho para Cuba 🇨🇺</p>
            <p>Hecho con ☕, son cubano y sal de malecón 🌊</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
