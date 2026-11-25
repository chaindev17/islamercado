import Link from "next/link";

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
    text: "Los interesados te contactan por teléfono o WhatsApp.",
  },
];

export default function Footer() {
  return (
    <footer className="mt-10 bg-white border-t border-gray-200">
      <div className="max-w-[1200px] mx-auto px-4 py-10 grid gap-8 sm:grid-cols-3 text-center sm:text-left">
        {STEPS.map((s) => (
          <div key={s.title} className="flex flex-col items-center sm:items-start gap-2">
            <span className="text-3xl" aria-hidden>
              {s.icon}
            </span>
            <h3 className="font-semibold text-gray-800">{s.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>
            Comprar y vender en{" "}
            <span className="font-semibold text-gray-700">IslaMercado</span> es
            fácil, rápido y gratis 🌴
          </p>
          <nav className="flex gap-4">
            <Link href="/buscar" className="hover:text-brand-blue-dark">
              Explorar
            </Link>
            <Link href="/publicar" className="hover:text-brand-blue-dark">
              Publicar
            </Link>
            <Link href="/login" className="hover:text-brand-blue-dark">
              Entrar
            </Link>
          </nav>
          <p className="text-xs">© 2026 IslaMercado — Hecho para Cuba 🇨🇺</p>
        </div>
      </div>
    </footer>
  );
}
