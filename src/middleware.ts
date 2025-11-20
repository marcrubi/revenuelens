import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Configuración de respuesta inicial
  // Es necesario crear una respuesta vacía para poder manipular las cookies después
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Crear cliente de Supabase para el Middleware
  // Esto permite leer la sesión del usuario desde las cookies de forma segura
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Esto actualiza las cookies tanto en la request como en la response
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
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

  // 3. Obtener el usuario de manera segura
  // getUser() es más seguro que getSession() en middleware
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. DEFINIR RUTAS PROTEGIDAS Y PÚBLICAS
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Caso A: El usuario NO está logueado
  if (!user) {
    // Si intenta entrar a cualquier ruta que empiece por /app (dashboard, datasets, etc.)
    if (pathname.startsWith("/app")) {
      url.pathname = "/auth/sign-in";
      // Opcional: Guardar a dónde quería ir para redirigirle después del login
      // url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Caso B: El usuario SÍ está logueado
  if (user) {
    // Si intenta entrar a páginas de auth (login, signup) lo mandamos al dashboard
    if (
      pathname.startsWith("/auth/sign-in") ||
      pathname.startsWith("/auth/sign-up")
    ) {
      url.pathname = "/app/dashboard";
      return NextResponse.redirect(url);
    }
    if (pathname === "/") {
      url.pathname = "/app/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Si no se cumple ninguna redirección, dejamos pasar la petición
  return response;
}

// Configuración del Matcher:
// Define en qué rutas se ejecuta este middleware.
// Excluimos archivos estáticos, imágenes, favicon, etc. para no sobrecargar el servidor.
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas request EXCEPTO las que empiezan por:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono)
     * - Y cualquier extensión de archivo común (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
