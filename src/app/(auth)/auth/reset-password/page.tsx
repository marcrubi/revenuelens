// src/app/(auth)/auth/reset-password/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

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
        redirectTo: origin ? `${origin}/auth/update-password` : undefined,
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
      {/* Logo + título */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
          <span className="text-sm font-semibold tracking-tight">
            RevenueLens
          </span>
        </div>
        <div>
          <h1 className="text-lg font-semibold">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter the email you used for RevenueLens and we&apos;ll send you a
            reset link.
          </p>
        </div>
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
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {info && <p className="text-sm text-emerald-600">{info}</p>}

        <button
          type="submit"
          disabled={isSending}
          className="flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? "Sending reset link…" : "Send reset link"}
        </button>
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
