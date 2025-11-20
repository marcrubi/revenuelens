"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseAndValidateCsvContent } from "@/lib/csvParser";

export type UploadState = {
  error?: string | null;
  success?: boolean;
};

export async function uploadDataset(
  prevState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const name = formData.get("name") as string;
  const file = formData.get("file") as File;

  if (!name || !file) {
    return { error: "Please provide both a name and a CSV file." };
  }

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
          } catch {}
        },
      },
    },
  );

  try {
    // 1. Verificar Usuario y Workspace
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .eq("id", user.id)
      .single();

    if (!profile?.business_id) {
      return { error: "No workspace found for this user." };
    }

    // 2. Crear Dataset en estado 'processing' (INVISIBLE)
    const { data: dataset, error: dsError } = await supabase
      .from("datasets")
      .insert({
        name: name.trim(),
        business_id: profile.business_id,
        status: "processing",
      })
      .select()
      .single();

    if (dsError || !dataset)
      throw new Error("Failed to create dataset record.");

    try {
      // 3. Parsear CSV
      const text = await file.text();
      const salesToInsert = await parseAndValidateCsvContent(text, dataset.id);

      // 4. Insertar por lotes (Usando la función SQL import_sales_batch)
      const BATCH_SIZE = 1000;
      for (let i = 0; i < salesToInsert.length; i += BATCH_SIZE) {
        const batch = salesToInsert.slice(i, i + BATCH_SIZE);

        const { error: rpcError } = await supabase.rpc("import_sales_batch", {
          p_dataset_id: dataset.id,
          p_sales: batch,
        });

        if (rpcError) throw rpcError;
      }

      // 5. ÉXITO: Activar dataset (status -> 'ready')
      // Solo ahora aparecerá en el dashboard
      const { error: updateError } = await supabase
        .from("datasets")
        .update({ status: "ready" })
        .eq("id", dataset.id);

      if (updateError) throw updateError;
    } catch (processError) {
      console.error("Transaction failed:", processError);
      // Si falla, borramos para limpiar
      await supabase.from("datasets").delete().eq("id", dataset.id);
      throw new Error("Failed to process CSV. Please try again.");
    }
  } catch (err) {
    console.error("Upload error:", err);
    let errorMessage = "Failed to upload dataset.";
    if (err instanceof Error) errorMessage = err.message;

    return { error: errorMessage };
  }

  revalidatePath("/app/datasets");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/predictions");

  redirect("/app/datasets");
}
