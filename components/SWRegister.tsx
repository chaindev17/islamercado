"use client";

import { useEffect } from "react";

/**
 * Registra el service worker de IslaMercado (PWA).
 * El registro es silencioso: si falla, la app sigue funcionando normal.
 */
export default function SWRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sin soporte o bloqueado: no pasa nada
      });
    };
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);
  return null;
}
