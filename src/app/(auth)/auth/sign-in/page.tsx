// src/app/(auth)/auth/sign-in/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

type Mode = "methods" | "email";

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>("methods");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya está logueado, mandarlo al portal
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (data?.user) {
        router.replace("/app/dashboard");
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleGoogleSignIn() {
    setError(null);
    setIsLoading(true);

    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: origin
          ? {
              redirectTo: `${origin}/app/dashboard`,
            }
          : {},
      });

      if (error) {
        setError("We couldn't start Google sign-in. Please try again.");
        setIsLoading(false);
      }
      // Sin error → Supabase redirige
    } catch {
      setError("Unexpected error while starting Google sign-in.");
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    setIsLoading(false);

    if (error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("invalid login credentials") ||
        message.includes("invalid email or password")
      ) {
        setError("Invalid email or password.");
      } else {
        setError("We couldn't sign you in. Please try again.");
      }
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

        {/* Botones de método (mismo look & feel que Sign Up) */}
        <div className="space-y-3 text-sm font-medium">
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            variant="outline"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>{isLoading ? "Connecting…" : "Continue with Google"}</span>
          </Button>

          <Button
            type="button"
            onClick={() => {
              setMode("email");
              setError(null);
            }}
            disabled={isLoading}
            className="w-full rounded-full bg-slate-900 px-4 py-2.5 text-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue with email
          </Button>
        </div>

        {/* Link a Sign up + Learn more */}
        <p className="text-center text-xs text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign up
          </Link>{" "}
          or{" "}
          <Link href="/" className="font-medium text-blue-600 hover:underline">
            Learn more
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
              if (error) setError(null);
            }}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <div className="mt-1 text-right text-xs">
            <Link
              href="/auth/reset-password"
              className="text-slate-500 hover:text-slate-700 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
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
          onClick={() => {
            setMode("methods");
            setError(null);
          }}
          className="hover:underline"
        >
          ← Back
        </button>
        <p>
          Don't have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign up
          </Link>{" "}
          or{" "}
          <Link href="/" className="font-medium text-blue-600 hover:underline">
            Learn more
          </Link>
        </p>
      </div>
    </div>
  );
}
