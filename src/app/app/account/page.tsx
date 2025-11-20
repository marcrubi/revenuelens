"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Building, Loader2, LogOut, Save, User as UserIcon } from "lucide-react";
import type { Business, Profile } from "@/types";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion-wrappers";
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
        const { data: authData } = await supabase.auth.getUser();

        if (!isMounted) return;
        if (!authData?.user) {
          router.replace("/auth/sign-in");
          return;
        }
        setUserEmail(authData.user.email ?? "");

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select(`*, businesses (*)`)
          .eq("id", authData.user.id)
          .single();

        if (error) throw error;

        if (isMounted && profileData) {
          setProfile(profileData as unknown as Profile);
          setFullName(profileData.full_name || "");

          if (profileData.businesses) {
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
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <StaggerContainer className="space-y-4 max-w-2xl">
      <StaggerItem className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your profile and workspace preferences.
        </p>
      </StaggerItem>

      {/* Profile Section */}
      <StaggerItem>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="h-8 w-8 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-600 shadow-sm">
              <UserIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Personal Profile
              </h2>
              <p className="text-[11px] text-slate-500">
                Your personal identification details.
              </p>
            </div>
          </div>

          <div className="p-5 grid gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={userEmail}
                className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 cursor-not-allowed font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleUpdateProfile}
                disabled={saving || fullName === profile?.full_name}
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 h-8 text-xs font-medium"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Save className="mr-2 h-3 w-3" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* Workspace Section */}
      <StaggerItem>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="h-8 w-8 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-600 shadow-sm">
              <Building className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Workspace
              </h2>
              <p className="text-[11px] text-slate-500">
                Current business environment.
              </p>
            </div>
          </div>
          <div className="p-5 grid gap-4 sm:grid-cols-2">
            <div className="p-3 rounded border border-slate-200 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Business Name
              </p>
              <p className="font-medium text-sm text-slate-900">
                {business?.name || "Loading..."}
              </p>
            </div>
            <div className="p-3 rounded border border-slate-200 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Created At
              </p>
              <p className="font-mono text-sm text-slate-700">
                {business?.created_at
                  ? new Date(business.created_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </StaggerItem>

      <StaggerItem className="pt-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:bg-red-50 hover:text-red-700 border-slate-200 hover:border-red-200 h-8 text-xs"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
        </Button>
      </StaggerItem>
    </StaggerContainer>
  );
}
