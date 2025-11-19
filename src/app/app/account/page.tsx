// src/app/app/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  full_name: string | null;
  business_id: string | null;
};

type Business = {
  id: string;
  name: string;
  created_at: string | null;
};

export default function AccountPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAccount() {
      setLoading(true);
      setError(null);

      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (!isMounted) return;

        if (authError || !authData?.user) {
          router.replace("/auth/sign-in");
          return;
        }

        const user = authData.user;
        setUserEmail(user.email ?? "");
        setUserCreatedAt(user.created_at ?? null);

        const { data: profileRow, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, business_id")
          .eq("id", user.id)
          .maybeSingle();

        if (!isMounted) return;

        if (profileError) {
          setError("We couldn't load your profile.");
          setLoading(false);
          setWorkspaceLoading(false);
          return;
        }

        if (!profileRow) {
          setProfile(null);
          setWorkspaceLoading(false);
          setLoading(false);
          return;
        }

        setProfile(profileRow as Profile);

        if (!profileRow.business_id) {
          setWorkspaceLoading(true);
          setLoading(false);
          return;
        }

        setWorkspaceLoading(false);

        const { data: businessRow, error: businessError } = await supabase
          .from("businesses")
          .select("id, name, created_at")
          .eq("id", profileRow.business_id)
          .maybeSingle();

        if (!isMounted) return;

        if (businessError) {
          setError("We couldn't load your business information.");
          setLoading(false);
          return;
        }

        if (businessRow) {
          setBusiness(businessRow as Business);
        }

        setLoading(false);
      } catch {
        if (!isMounted) return;
        setError("Unexpected error while loading account information.");
        setLoading(false);
        setWorkspaceLoading(false);
      }
    }

    loadAccount();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your profile and workspace information.
        </p>
      </div>

      {loading && !error && (
        <Card className="p-4">
          <p className="text-sm text-slate-500">Loading your account…</p>
        </Card>
      )}

      {error && (
        <Card className="p-4">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* User info */}
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              Your profile
            </h2>
            <div className="mt-3 grid gap-4 text-sm md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Name</p>
                <p className="text-slate-800">
                  {profile?.full_name ?? "Not set"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-slate-800">{userEmail || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Account created</p>
                <p className="text-slate-800">{formatDate(userCreatedAt)}</p>
              </div>
            </div>
          </Card>

          {/* Business / workspace */}
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-800">Workspace</h2>

            {workspaceLoading && !business && (
              <p className="mt-3 text-xs text-slate-500">
                We&apos;re setting up your workspace. If this doesn&apos;t
                update after a refresh, something might be off in your profile
                configuration.
              </p>
            )}

            {!workspaceLoading && business && (
              <div className="mt-3 grid gap-4 text-sm md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Business name</p>
                  <p className="text-slate-800">{business.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Workspace created</p>
                  <p className="text-slate-800">
                    {formatDate(business.created_at)}
                  </p>
                </div>
              </div>
            )}

            {!workspaceLoading && !business && (
              <p className="mt-3 text-xs text-slate-500">
                We couldn&apos;t find a business linked to your profile. This
                shouldn&apos;t happen in normal use. If you see this in
                production, you may need to contact support.
              </p>
            )}
          </Card>

          {/* Billing (placeholder) */}
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              Billing (coming soon)
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Subscriptions and billing will live here once plans are available.
              For now, RevenueLens is in early access.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
