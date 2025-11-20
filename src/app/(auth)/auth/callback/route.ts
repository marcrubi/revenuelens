// src/app/(auth)/auth/callback/route.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // si viene un parametro "next" úsalo, si no, al dashboard
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
              // Ignorar
            }
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // IMPORTANTE: Usamos el origin de la request para asegurar que no nos vamos a otro dominio
      // y forzamos la redirección limpia.
      const forwardedHost = request.headers.get("x-forwarded-host"); // Para Vercel
      const isLocal = origin.includes("localhost");

      // En Vercel, a veces 'origin' es interno, mejor usar el host real si existe
      const domain = isLocal
        ? origin
        : `https://${forwardedHost || new URL(origin).host}`;

      return NextResponse.redirect(`${domain}${next}`);
    }
  }

  // Si falla, devolvemos al usuario al login con un error
  return NextResponse.redirect(`${origin}/auth/sign-in?error=AuthCodeError`);
}
