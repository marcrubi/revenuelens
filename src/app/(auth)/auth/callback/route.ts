// src/app/(auth)/auth/callback/route.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/app/dashboard";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Ignorar en Server Components
            }
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // --- FIX CRÍTICO PARA VERCEL ---
      // 1. Detectamos si estamos en localhost o producción
      const forwardedHost = request.headers.get("x-forwarded-host"); // Host real en Vercel
      const isLocal = requestUrl.origin.includes("localhost");

      // 2. Construimos la URL base correcta
      // Si es local, usamos el origin tal cual (http://localhost:3000)
      // Si es prod, forzamos HTTPS y usamos el host real
      const protocol = isLocal ? "http" : "https";
      const host = forwardedHost || requestUrl.host;

      // 3. Limpiamos barras duplicadas por si acaso
      const redirectUrl = `${protocol}://${host}${next}`;

      console.log(`🟢 Callback éxito. Redirigiendo a: ${redirectUrl}`);
      return NextResponse.redirect(redirectUrl);
    } else {
      console.error("🔴 Error en exchangeCodeForSession:", error);
    }
  }

  // Si falla, vuelta al login
  // Usamos requestUrl.origin aquí porque si falla da igual, pero intentamos mantener consistencia
  return NextResponse.redirect(
    `${requestUrl.origin}/auth/sign-in?error=AuthCodeError`,
  );
}
