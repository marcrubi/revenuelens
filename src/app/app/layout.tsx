// src/app/app/layout.tsx
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Profile } from "@/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Iniciamos cliente de servidor
  const supabase = await createSupabaseServerClient();

  // 2. Verificamos sesión (Server-side)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Doble seguridad: Si no hay usuario, fuera.
  if (!user) {
    redirect("/auth/sign-in");
  }

  // 3. Buscamos el perfil y el negocio en PARALELO al renderizado (sin waterfall en cliente)
  // Nota: Usamos .maybeSingle() para no lanzar error si el perfil no se creó bien todavía
  const { data: profileData } = await supabase
    .from("profiles")
    .select(`*, businesses ( name )`)
    .eq("id", user.id)
    .single();

  // Transformamos el dato para que coincida con tu tipo Profile
  const profile = profileData as unknown as Profile;

  // 4. Pasamos los datos YA CARGADOS al componente cliente
  return (
    <AppShell user={user} profile={profile}>
      {children}
    </AppShell>
  );
}
