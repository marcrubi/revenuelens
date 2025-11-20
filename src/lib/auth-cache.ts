import { cache } from "react";
import { createSupabaseServerClient } from "./supabaseServer";

// Esta función se puede llamar N veces en una renderización,
// pero solo hará 1 petición a Supabase.
export const getCachedUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
