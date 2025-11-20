// src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Creamos la respuesta base inicial.
  // Es crucial usar esta misma instancia para transportar las cookies.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // IMPORTANTE: Actualizamos las cookies en la REQUEST para que
          // el propio middleware vea los cambios si consultamos de nuevo.
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );

          // IMPORTANTE: Actualizamos la RESPONSE inicial.
          // Esto prepara las cookies para ser enviadas al navegador.
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

  // 2. Refrescamos la sesión.
  // OJO: Esto dispara el método setAll de arriba si el token necesitaba refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Lógica de Rutas y Redirecciones "Seguras"
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Función auxiliar para redirigir SIN PERDER COOKIES
  // Si usas NextResponse.redirect() a secas, pierdes la sesión.
  const safeRedirect = (path: string) => {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = path;

    // Creamos la respuesta de redirección
    const redirectResponse = NextResponse.redirect(targetUrl);

    // CLAVE DEL ÉXITO: Copiamos las cookies que Supabase haya podido poner
    // en nuestra respuesta 'response' temporal hacia la 'redirectResponse'.
    const currentCookies = response.cookies.getAll();
    currentCookies.forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return redirectResponse;
  };

  // --- REGLAS DE PROTECCIÓN ---

  // Caso A: Usuario NO logueado intentando entrar a zona privada (/app)
  if (!user && pathname.startsWith("/app")) {
    // Guardamos a dónde quería ir para redirigirle tras login (opcional)
    // url.searchParams.set("next", pathname);
    return safeRedirect("/auth/sign-in");
  }

  // Caso B: Usuario SÍ logueado intentando entrar a auth (login/signup) o home
  if (user) {
    if (
      pathname.startsWith("/auth/sign-in") ||
      pathname.startsWith("/auth/sign-up") ||
      pathname === "/"
    ) {
      return safeRedirect("/app/dashboard");
    }
  }

  // Si no hay redirección, devolvemos la respuesta original que ya tiene
  // las cookies actualizadas (si hubo refresh).
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
