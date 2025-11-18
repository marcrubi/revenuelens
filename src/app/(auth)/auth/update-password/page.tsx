// src/app/(auth)/auth/update-password/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Comprobar si hay sesión válida (token de reset)
  useEffect(() => {
    let isMounted = true;

    async function check() {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (data?.user) {
        setHasSession(true);
      } else {
        setHasSession(false);
      }
      setChecking(false);
    }

    check();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!password || !passwordConfirm) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      setIsUpdating(false);

      if (error) {
        setError("We couldn't update your password. Please try again.");
        return;
      }

      setInfo("Your password has been updated. You can now log in.");
    } catch {
      setIsUpdating(false);
      setError("Unexpected error while updating your password.");
    }
  }

  if (checking) {
    return (
      <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
        <p className="text-center text-sm text-slate-500">
          Checking your reset link…
        </p>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
            <span className="text-sm font-semibold tracking-tight">
              RevenueLens
            </span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Invalid or expired link</h1>
            <p className="mt-1 text-sm text-slate-600">
              This password reset link is no longer valid. Request a new one to
              reset your password.
            </p>
          </div>
        </div>

        <div className="flex justify-center text-xs text-slate-600">
          <Link
            href="/auth/reset-password"
            className="font-medium text-blue-600 hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
          <span className="text-sm font-semibold tracking-tight">
            RevenueLens
          </span>
        </div>
        <div>
          <h1 className="text-lg font-semibold">Set a new password</h1>
          <p className="mt-1 text-sm text-slate-600">
            Choose a new password for your RevenueLens account.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            New password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
              setInfo(null);
            }}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Confirm new password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              setError(null);
              setInfo(null);
            }}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {info && <p className="text-sm text-emerald-600">{info}</p>}

        <button
          type="submit"
          disabled={isUpdating}
          className="flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUpdating ? "Updating password…" : "Update password"}
        </button>
      </form>

      <div className="flex justify-center text-xs text-slate-600">
        <button
          type="button"
          onClick={() => router.push("/auth/sign-in")}
          className="hover:underline"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}
