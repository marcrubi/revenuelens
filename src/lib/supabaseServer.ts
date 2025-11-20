// src/lib/supabaseServer.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
    // En Next 15 cookies() es async → hay que hacer await
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // Devuelve todas las cookies actuales
                getAll() {
                    return cookieStore.getAll();
                },
                // Supabase usa esto para establecer/actualizar cookies de sesión
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            // Next 15: cookieStore.set(name, value, options)
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // Si esto se ejecuta en un Server Component puro,
                        // puede fallar y está ok porque la sesión se refresca vía middleware
                    }
                },
            },
        }
    );
}
