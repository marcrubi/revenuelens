import { createSupabaseServerClient } from "@/lib/supabaseServer";
import AccountClient from "./account-client";
import type { Business, Profile } from "@/types";
import { getCachedUser } from "@/lib/auth-cache"; // Importamos la utilidad

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();

  // 1. Usamos la versión con caché (No golpea auth api dos veces si layout ya la llamó)
  const user = await getCachedUser();

  if (!user) return null;

  // 2. Tipado Seguro (Sin 'as unknown')
  const { data } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      business_id,
      created_at,
      businesses ( id, name, created_at )
    `,
    )
    .eq("id", user.id)
    .single();

  if (!data) return null; // Manejo de error limpio

  // Mapeo explícito (Data Mapper Pattern) para seguridad de tipos
  // Si la DB cambia, TypeScript se quejará aquí, protegiendo el frontend.
  const profile: Profile = {
    id: data.id,
    full_name: data.full_name,
    business_id: data.business_id,
    created_at: data.created_at,
    businesses: Array.isArray(data.businesses)
      ? data.businesses[0]
      : data.businesses,
  };

  // Extraemos negocio de forma segura
  const businessData = Array.isArray(data.businesses)
    ? data.businesses[0]
    : data.businesses;
  const business: Business | null = businessData
    ? {
        id: businessData.id,
        name: businessData.name,
        created_at: businessData.created_at,
      }
    : null;

  return (
    <AccountClient
      initialProfile={profile}
      initialBusiness={business}
      email={user.email || ""}
    />
  );
}
