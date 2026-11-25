export function formatPrice(v: number | string | null | undefined): string {
  if (v == null) return "US$ —";
  const n = Number(v);
  if (Number.isNaN(n)) return "US$ —";
  const hasDecimals = Math.round(n * 100) % 100 !== 0;
  return (
    "US$ " +
    n.toLocaleString("es-ES", {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  return months <= 1 ? "hace un mes" : `hace ${months} meses`;
}

/** Normaliza un teléfono cubano para WhatsApp (wa.me) */
export function waDigits(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("53") ? d : "53" + d;
}
