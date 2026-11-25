import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = { title: "Sin conexión" };

export default function OfflinePage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="card p-10">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <p className="text-4xl mb-3" aria-hidden>
          📴
        </p>
        <h1 className="font-display text-2xl font-extrabold text-ink mb-2">
          Estás sin conexión
        </h1>
        <p className="text-sm text-ink-soft mb-6 leading-relaxed">
          Parece que se fue el internet. Revisa tus datos móviles o el wifi —
          cuando vuelvas, la isla te espera con todo su mercado 🌴
        </p>
        <Link href="/" className="btn btn-mar">
          Intentar de nuevo
        </Link>
      </div>
    </div>
  );
}
