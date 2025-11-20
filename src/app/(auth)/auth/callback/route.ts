import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Si hay parámetro 'next', úsalo, si no, ve al dashboard
  const next = searchParams.get("next") ?? "/app/dashboard";

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
              // Ignorar errores de server component
            }
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // IMPORTANTE: Redirigimos a la URL absoluta.
      // Al haberse ejecutado 'exchangeCodeForSession', las cookies ya se han
      // intentado setear en el 'cookieStore'.
      // Next.js se encargará de enviar el header Set-Cookie en esta redirección.
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = origin.includes("localhost");

      let finalBaseUrl = isLocal ? origin : `https://${forwardedHost}`;
      if (!isLocal && !forwardedHost) {
        finalBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
      }

      // Limpiamos doble barra si existe
      const cleanNext = next.startsWith("/") ? next : `/${next}`;
      return NextResponse.redirect(`${finalBaseUrl}${cleanNext}`);
    }
  }

  // Si falla, vuelta al login
  return NextResponse.redirect(`${origin}/auth/sign-in?error=AuthCodeError`);
}
