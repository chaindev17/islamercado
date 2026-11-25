import { NextResponse, type NextRequest } from "next/server";

// Nota: la autenticación se maneja 100% en el cliente con @supabase/ssr
// (las sesiones viven en cookies del navegador). El middleware no necesita
// refrescar tokens: Supabase aplica RLS con el JWT del propio usuario.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|seed/.*).*)"],
};
