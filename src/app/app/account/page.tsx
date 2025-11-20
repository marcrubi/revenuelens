"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  Building,
  Loader2,
  LogOut,
  Save,
  User as UserIcon,
} from "lucide-react";
import type { Business, Profile } from "@/types";
import {
  HoverCard,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion-wrappers";
import { Skeleton } from "@/components/ui/skeletons";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAccount() {
      try {
        setLoading(true);

        // 1. Obtener usuario (necesario para seguridad y email)
        const { data: authData } = await supabase.auth.getUser();

        if (!isMounted) return;
        if (!authData?.user) {
          router.replace("/auth/sign-in");
          return;
        }
        setUserEmail(authData.user.email ?? "");

        // 2. OPTIMIZACIÓN: Traer perfil Y negocio en una sola petición
        // Usamos el operador de relación foreign key
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select(
            `
            *,
            businesses (*)
          `,
          )
          .eq("id", authData.user.id)
          .single();

        if (error) throw error;

        if (isMounted && profileData) {
          // Asignamos el perfil
          setProfile(profileData as unknown as Profile);
          setFullName(profileData.full_name || "");

          // Extraemos el negocio anidado y lo guardamos en su estado independiente
          // para no romper la UI que espera 'business' por separado.
          if (profileData.businesses) {
            // Forzamos el tipo para que coincida con lo que espera tu estado
            // Postgres devuelve un objeto si la relación es 1:1 o M:1 bien definida
            const businessData = Array.isArray(profileData.businesses)
              ? profileData.businesses[0]
              : profileData.businesses;

            setBusiness(businessData as unknown as Business);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load account");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAccount();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleUpdateProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", profile.id);
      if (error) throw error;
      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/auth/sign-in");
  };

  if (loading) {
    // Skeleton personalizado para perfil
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <StaggerContainer className="space-y-6 max-w-2xl">
      <StaggerItem>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500">
          Manage your profile and workspace.
        </p>
      </StaggerItem>

      <StaggerItem>
        <HoverCard className="p-6 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-blue-50 flex items-center justify-center text-blue-600">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Personal Profile</h2>
              <p className="text-xs text-slate-500">Your personal details.</p>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                disabled
                value={userEmail}
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleUpdateProfile}
                disabled={saving || fullName === profile?.full_name}
                className="bg-slate-900"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </HoverCard>
      </StaggerItem>

      <StaggerItem>
        <HoverCard className="p-6 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-purple-50 flex items-center justify-center text-purple-600">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Workspace</h2>
              <p className="text-xs text-slate-500">
                Your business environment.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Name
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {business?.name || "Loading..."}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Created
              </p>
              <p className="mt-1 font-mono text-sm text-slate-700">
                {business?.created_at
                  ? new Date(business.created_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </HoverCard>
      </StaggerItem>

      <StaggerItem className="pt-6 border-t border-slate-200">
        <Button
          variant="outline"
          className="text-red-600 hover:bg-red-50 border-red-200"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </StaggerItem>
    </StaggerContainer>
  );
}
