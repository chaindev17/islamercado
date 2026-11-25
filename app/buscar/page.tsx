import { Suspense } from "react";
import BuscarClient from "./BuscarClient";

export default function BuscarPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1200px] mx-auto px-4 py-16 text-center text-gray-500 text-sm">
          Cargando…
        </div>
      }
    >
      <BuscarClient />
    </Suspense>
  );
}
