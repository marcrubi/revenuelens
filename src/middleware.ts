// src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Crear respuesta inicial
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Configurar Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Actualizar cookies en la request (para que el middleware las lea)
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          // Actualizar cookies en la response inicial (para enviarlas al navegador)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 3. IMPORTANTE: Validar usuario. Esto refresca el token si es necesario.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Lógica de Rutas
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Helper para redirigir MANTENIENDO las cookies
  const safeRedirect = (path: string) => {
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = path;
    const redirectResponse = NextResponse.redirect(newUrl);

    // CRÍTICO: Copiamos las cookies de la respuesta de Supabase a la redirección
    const allCookies = response.cookies.getAll();
    allCookies.forEach((c) => redirectResponse.cookies.set(c));

    return redirectResponse;
  };

  // Caso A: No logueado intentando entrar a /app
  if (!user) {
    if (pathname.startsWith("/app")) {
      return safeRedirect("/auth/sign-in");
    }
  }

  // Caso B: Logueado intentando entrar a auth o home
  if (user) {
    if (
      pathname.startsWith("/auth/sign-in") ||
      pathname.startsWith("/auth/sign-up") ||
      pathname === "/"
    ) {
      return safeRedirect("/app/dashboard");
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
