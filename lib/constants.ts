export const PROVINCES = [
  "La Habana",
  "Pinar del Río",
  "Artemisa",
  "Mayabeque",
  "Matanzas",
  "Villa Clara",
  "Cienfuegos",
  "Sancti Spíritus",
  "Ciego de Ávila",
  "Camagüey",
  "Las Tunas",
  "Holguín",
  "Granma",
  "Santiago de Cuba",
  "Guantánamo",
  "Isla de la Juventud",
] as const;

export const CONDITIONS = [
  { value: "nuevo", label: "Nuevo" },
  { value: "como_nuevo", label: "Como nuevo" },
  { value: "usado", label: "Usado" },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  paused: "Pausado",
  sold: "Vendido",
};

export const FALLBACK_CATEGORIES = [
  { slug: "vehiculos", name: "Vehículos", icon: "🚗" },
  { slug: "inmuebles", name: "Inmuebles", icon: "🏠" },
  { slug: "telefonia", name: "Teléfonos", icon: "📱" },
  { slug: "electronica", name: "Electrónica y Audio", icon: "🎧" },
  { slug: "computacion", name: "Computación", icon: "💻" },
  { slug: "electrodomesticos", name: "Electrodomésticos", icon: "🔌" },
  { slug: "energia", name: "Energía Solar", icon: "☀️" },
  { slug: "hogar", name: "Hogar y Muebles", icon: "🛋️" },
  { slug: "moda", name: "Moda y Accesorios", icon: "👕" },
  { slug: "deportes", name: "Deportes y Bicicletas", icon: "⚽" },
  { slug: "musica", name: "Música e Instrumentos", icon: "🎸" },
  { slug: "mascotas", name: "Mascotas", icon: "🐾" },
  { slug: "ninos", name: "Artículos Infantiles", icon: "🧸" },
  { slug: "herramientas", name: "Construcción y Herramientas", icon: "🔧" },
  { slug: "agro", name: "Agro y Jardín", icon: "🌱" },
  { slug: "servicios", name: "Servicios", icon: "🛠️" },
  { slug: "empleos", name: "Empleos", icon: "💼" },
  { slug: "otros", name: "Otros", icon: "📦" },
] as const;

export type Category = { slug: string; name: string; icon: string };
