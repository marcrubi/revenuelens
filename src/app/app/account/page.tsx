// src/app/app/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

type Profile = {
  full_name: string | null;
  business_id: string | null;
};

type Business = {
  name: string;
  created_at: string | null;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAccount() {
      try {
        // 1) Usuario actual
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData?.user) {
          if (!isMounted) return;
          setError("You need to be signed in to view your account.");
          setLoading(false);
          return;
        }

        const currentUser = authData.user;
        if (!isMounted) return;
        setUser(currentUser);

        // 2) Perfil
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, business_id")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (!isMounted) return;

        if (profileError) {
          setError("We couldn't load your profile.");
          setLoading(false);
          return;
        }

        setProfile(profileData ?? { full_name: null, business_id: null });

        // 3) Business si hay business_id
        if (profileData?.business_id) {
          const { data: businessData, error: businessError } = await supabase
            .from("businesses")
            .select("name, created_at")
            .eq("id", profileData.business_id)
            .maybeSingle();

          if (!isMounted) return;

          if (businessError) {
            setError("We couldn't load your workspace details.");
            setLoading(false);
            return;
          }

          setBusiness(businessData ?? null);
        }

        setLoading(false);
      } catch {
        if (!isMounted) return;
        setError("Unexpected error while loading your account.");
        setLoading(false);
      }
    }

    loadAccount();

    return () => {
      isMounted = false;
    };
  }, []);

  const email = user?.email ?? "—";
  const fullName = profile?.full_name || null;
  const businessName = business?.name ?? "My workspace";
  const businessCreatedAt = business?.created_at
    ? new Date(business.created_at).toISOString().slice(0, 10)
    : "—";

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading your account…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your profile and workspace information.
          </p>
        </div>
        <Card className="p-4">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your profile and workspace information.
        </p>
      </div>

      {/* PROFILE + BUSINESS */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Profile */}
        <Card className="p-4">
          <p className="text-sm font-semibold">Profile</p>
          <p className="mt-1 text-xs text-slate-500">
            Basic information about your RevenueLens account.
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Full name</span>
              <span className="font-medium text-slate-800">
                {fullName ?? "Not set"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-800">{email}</span>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-slate-500">
            In a future iteration you&apos;ll be able to edit your profile
            details here.
          </p>
        </Card>

        {/* Business */}
        <Card className="p-4">
          <p className="text-sm font-semibold">Business</p>
          <p className="mt-1 text-xs text-slate-500">
            The workspace that owns your datasets and predictions.
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Business name</span>
              <span className="font-medium text-slate-800">{businessName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Created at</span>
              <span className="font-medium text-slate-800">
                {businessCreatedAt}
              </span>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-slate-500">
            This workspace is automatically linked to your datasets and sales
            data.
          </p>
        </Card>
      </div>

      {/* BILLING */}
      <Card className="p-4">
        <p className="text-sm font-semibold">Billing</p>
        <p className="mt-1 text-sm text-slate-500">
          Subscriptions and invoices.
        </p>

        <p className="mt-4 text-xs text-slate-500">
          Subscriptions will be available soon. For now, RevenueLens runs in
          demo mode with no active billing.
        </p>
      </Card>
    </div>
  );
}
