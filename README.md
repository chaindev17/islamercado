# IslaMercado 🌴

**El marketplace de Cuba inspirado en Mercado Libre.** Compra y vende en toda la isla: publica anuncios gratis con fotos, precio en USD y contacto directo por teléfono o WhatsApp.

![Stack](https://img.shields.io/badge/Next.js-15-black) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth%20%2B%20Storage-3ecf8e)

## Funcionalidades

- 🏠 **Home** con buscador destacado, categorías y publicaciones recientes
- 🔍 **Búsqueda y filtros**: texto libre, categoría, provincia, rango de precio, condición y ordenamiento
- 📄 **Página de publicación**: galería de fotos, precio, vendedor y botones de WhatsApp / llamada
- 📢 **Publicar anuncio** (gratis): título, descripción, precio USD, condición, provincia/ciudad y hasta 6 fotos con subida a Supabase Storage
- 👤 **Cuentas**: registro y login con email + contraseña (autoconfirmados), perfiles con teléfono de contacto
- 🧰 **Mi cuenta**: administra tus anuncios — marcar vendido, pausar, reactivar o eliminar (borra también sus fotos)
- 🔒 **Seguridad**: Row Level Security en todas las tablas — cada usuario solo edita lo suyo; lecturas públicas solo de anuncios activos
- 🌎 **Diseño responsive** estilo Mercado Libre (amarillo + azul), pensado para móviles

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router) + React 19 + Tailwind CSS 4 |
| Backend | Supabase (Postgres 17 + Auth + Storage + RLS) |
| Llamadas a Supabase | 100% desde el navegador con `@supabase/ssr` |

> **Nota de arquitectura:** todas las consultas a Supabase se hacen desde el cliente (componentes `"use client"`), lo que permite que el sitio funcione incluso en entornos de sandbox sin salida directa a `supabase.co`. La seguridad no depende del frontend: todo está protegido por políticas RLS en la base de datos.

## Estructura

```
app/
  page.tsx                  → Home (hero + categorías + recientes)
  buscar/                   → Búsqueda con filtros y orden
  listing/[id]/             → Detalle de publicación + contacto
  publicar/                 → Formulario para publicar (subida de fotos)
  mi-cuenta/                → Administración de mis anuncios y teléfono
  login/ · registro/        → Autenticación
components/                 → Header, SearchBar, ListingCard, Gallery, Footer
lib/
  supabase/client.ts        → Cliente de navegador (@supabase/ssr)
  constants.ts              → Provincias, condiciones, categorías
  format.ts                 → Precios USD, fechas relativas, WhatsApp
supabase/migrations/        → SQL del esquema y seeds (referencia)
public/seed/                → Fotos de las publicaciones de ejemplo
```

## Puesta en marcha

1. **Base de datos**: ejecuta `supabase/migrations/0001_islamercado_init.sql` (y los siguientes) en tu proyecto de Supabase. Crea las tablas `categories`, `profiles`, `listings`, el bucket público `listing-images`, el trigger de perfiles y las políticas RLS.
2. **Variables de entorno**: copia `.env.example` a `.env.local` con la URL y la clave publicable de tu proyecto.
3. **Corre en local**:

```bash
npm install
npm run dev        # http://localhost:3000
```

## Cuentas de demostración

| Usuario | Email | Contraseña | Teléfono |
|---|---|---|---|
| maria_habana | `maria@islamercado.cu` | `IslaDemo2026` | 5351234567 |
| dayana_santiago | `dayana@islamercado.cu` | `IslaDemo2026` | 5359876543 |
| pedro_camaguey | `pedro@islamercado.cu` | `IslaDemo2026` | — |

Con cualquiera puedes entrar y administrar los anuncios de ejemplo.

## Roadmap

- Chat interno entre comprador y vendedor
- Favoritos y notificaciones
- Pagos y envíos (transferencia móvil, Zelle, etc.)
- Reseñas de vendedores
- Versión PWA ligera para conexiones de baja señal

---

© 2026 IslaMercado — Hecho para Cuba 🇨🇺
