// src/app/(auth)/auth/reset-password/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const trimmed = email.trim();

    if (!trimmed) {
      setError("Please enter your email.");
      return;
    }

    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSending(true);

    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: origin
          ? `${origin}/auth/callback?next=/auth/update-password`
          : undefined,
      });

      setIsSending(false);

      if (error) {
        setError("We couldn't send the reset link. Please try again.");
        return;
      }

      setInfo(
        "If an account exists for this email, we've sent a password reset link.",
      );
    } catch {
      setIsSending(false);
      setError("Unexpected error while sending the reset link.");
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
      {/* CABECERA ESTÁNDAR UNIFICADA */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            RevenueLens
          </span>
        </div>
        <h1 className="text-lg font-semibold text-slate-900">
          Reset your password
        </h1>
        <p className="text-sm text-slate-600">
          Enter your email and we&apos;ll send you a link.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
              setInfo(null);
            }}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
            {error}
          </div>
        )}
        {info && (
          <div className="text-sm text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100">
            {info}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSending}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white"
        >
          {isSending ? "Sending reset link…" : "Send reset link"}
        </Button>
      </form>

      <div className="flex justify-between text-xs text-slate-600">
        <Link href="/auth/sign-in" className="hover:underline">
          ← Back to login
        </Link>
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
