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
              // Ignorar error en Server Components
            }
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // --- LÓGICA SEGURA Y ROBUSTA DE REDIRECCIÓN ---

      const forwardedHost = request.headers.get("x-forwarded-host"); // Dominio real en Vercel
      const isLocal = requestUrl.origin.includes("localhost");

      let finalBaseUrl: string;

      if (isLocal) {
        // En local, confiamos en el origin (http://localhost:3000)
        finalBaseUrl = requestUrl.origin;
      } else if (forwardedHost) {
        // EN PRODUCCIÓN (Vercel):
        // 1. Usamos el host real reportado por Vercel
        // 2. Forzamos HTTPS (Crítico para que la cookie se guarde)
        // 3. Validamos que sea un dominio nuestro para seguridad extra

        const isVercel = forwardedHost.endsWith(".vercel.app");
        // Añade tu dominio propio aquí cuando lo tengas: || forwardedHost === "tudominio.com"

        if (isVercel) {
          finalBaseUrl = `https://${forwardedHost}`;
        } else {
          // Si el host es raro/desconocido, usamos la variable de entorno segura o el origin como fallback
          finalBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
        }
      } else {
        // Fallback final
        finalBaseUrl = requestUrl.origin;
      }

      // Limpieza de seguridad: Evitar dobles barras //
      // Ejemplo: https://web.com/ + /app/dashboard -> https://web.com/app/dashboard
      const cleanBase = finalBaseUrl.replace(/\/$/, "");
      const cleanNext = next.startsWith("/") ? next : `/${next}`;

      const finalUrl = `${cleanBase}${cleanNext}`;

      console.log(`✅ Auth Callback OK. Redirigiendo a: ${finalUrl}`);
      return NextResponse.redirect(finalUrl);
    }
  }

  // Si falla el código o hay error
  return NextResponse.redirect(
    `${requestUrl.origin}/auth/sign-in?error=AuthCodeError`,
  );
}
