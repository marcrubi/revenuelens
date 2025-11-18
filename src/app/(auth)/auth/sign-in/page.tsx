// src/app/(auth)/auth/sign-in/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

type Mode = "methods" | "email";

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>("methods");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/app/dashboard");
  }

  // Pantalla 1: elegir método
  if (mode === "methods") {
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
            <h1 className="text-lg font-semibold">Log in to RevenueLens</h1>
            <p className="mt-1 text-sm text-slate-600">
              Choose how you want to continue.
            </p>
          </div>
        </div>

        {/* Botones de método */}
        <div className="space-y-3 text-sm font-medium">
          <Button
            type="button"
            disabled
            variant="outline"
            className="flex w-full items-center justify-center gap-2 rounded-full border-slate-200 bg-white text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="h-4 w-4 rounded-sm border border-slate-300 bg-slate-100" />
            <span>Continue with Google (soon)</span>
          </Button>

          <Button
            type="button"
            onClick={() => setMode("email")}
            className="w-full rounded-full bg-slate-900 text-slate-50 hover:bg-slate-800"
          >
            Continue with email
          </Button>
        </div>

        {/* Link a Sign up */}
        <p className="text-center text-xs text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    );
  }

  // Pantalla 2: formulario email
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
          <h1 className="text-lg font-semibold">Log in with email</h1>
          <p className="mt-1 text-sm text-slate-600">
            Use the email and password you created for RevenueLens.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-full bg-slate-900 text-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <div className="flex justify-between text-xs text-slate-600">
        <button
          type="button"
          onClick={() => setMode("methods")}
          className="hover:underline"
        >
          ← Back
        </button>
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
