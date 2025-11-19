// src/app/(auth)/auth/sign-up/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

type Mode = "methods" | "email" | "password" | "success";

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

const EMAIL_EXISTS_MESSAGE = "An account with this email already exists.";

export default function SignUpPage() {
  const [mode, setMode] = useState<Mode>("methods");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
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

  async function handleGoogleSignUp() {
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
        setError("We couldn't start Google sign-up. Please try again.");
        setIsLoading(false);
      }
      // Sin error → redirección de Supabase
    } catch {
      setError("Unexpected error while starting Google sign-up.");
      setIsLoading(false);
    }
  }

  // Paso 2: enviar email (sin llamar a Supabase aún)
  function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();

    if (!trimmed) {
      setError("Please enter your email.");
      return;
    }

    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setEmail(trimmed);
    setMode("password");
  }

  // Paso 3: enviar password + confirm → aquí sí llamamos a Supabase
  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

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

    setIsLoading(true);

    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: origin
          ? {
              emailRedirectTo: `${origin}/auth/sign-in`,
            }
          : undefined,
      });

      setIsLoading(false);

      if (error) {
        const message = error.message.toLowerCase();
        if (
          message.includes("already registered") ||
          message.includes("exists") ||
          message.includes("duplicate")
        ) {
          // Email ya registrado → mensaje claro
          setError(EMAIL_EXISTS_MESSAGE);
        } else {
          setError("We couldn't create your account. Please try again.");
        }
        return;
      }

      setMode("success");
    } catch {
      setIsLoading(false);
      setError("Unexpected error while creating your account.");
    }
  }

  // Pantalla 1: elegir método
  if (mode === "methods") {
    return (
      <div className="space-y-6">
        {/* Logo + título */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
            <span className="text-sm font-semibold tracking-tight">
              RevenueLens
            </span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">
              Create your RevenueLens account
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Pick a method to start predicting your revenue.
            </p>
          </div>
        </div>

        {/* Métodos */}
        <div className="space-y-3 text-sm font-medium">
          <Button
            type="button"
            onClick={handleGoogleSignUp}
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
            <span>{isLoading ? "Connecting…" : "Sign up with Google"}</span>
          </Button>
          <Button
            type="button"
            onClick={() => {
              setMode("email");
              setError(null);
            }}
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign up with email
          </Button>
        </div>

        <p className="text-center text-xs text-slate-600">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="font-medium text-blue-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    );
  }

  // Pantalla 2: solo email
  if (mode === "email") {
    return (
      <div className="space-y-6">
        {/* Logo + título */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
            <span className="text-sm font-semibold tracking-tight">
              RevenueLens
            </span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Sign up with email</h1>
            <p className="mt-1 text-sm text-slate-600">
              Use your work email to create your first workspace.
            </p>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} noValidate className="space-y-4">
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

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-50 hover:bg-slate-800"
          >
            Continue
          </button>
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
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Pantalla 3: password + confirm
  if (mode === "password") {
    const emailExists = error === EMAIL_EXISTS_MESSAGE;

    return (
      <div className="space-y-6">
        {/* Logo + título */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
            <span className="text-sm font-semibold tracking-tight">
              RevenueLens
            </span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Set your password</h1>
            <p className="mt-1 text-sm text-slate-600">
              Choose a secure password for your RevenueLens account.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                if (error) setError(null);
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {error && (
            <div className="space-y-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-600">{error}</p>
              {emailExists && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-red-700">
                  <span>Use your existing account instead:</span>
                  <Link
                    href="/auth/sign-in"
                    className="font-medium underline underline-offset-2"
                  >
                    Log in
                  </Link>
                  <span className="text-red-400">·</span>
                  <Link
                    href="/auth/reset-password"
                    className="font-medium underline underline-offset-2"
                  >
                    Reset your password
                  </Link>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="flex justify-between text-xs text-slate-600">
          <button
            type="button"
            onClick={() => {
              setMode("email");
              setError(null);
            }}
            className="hover:underline"
          >
            ← Back
          </button>
          <p>
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Pantalla 4: success / verificación por email
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
          <span className="text-sm font-semibold tracking-tight">
            RevenueLens
          </span>
        </div>
        <div>
          <h1 className="text-lg font-semibold">Check your email</h1>
          <p className="mt-1 text-sm text-slate-600">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium">{email}</span>. Click the link to
            confirm your account and then sign in.
          </p>
        </div>
      </div>

      <div className="space-y-3 text-center text-xs text-slate-600">
        <p>
          Didn&apos;t receive anything? Check your spam folder or try signing up
          again with the same email.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/auth/sign-in"
            className="font-medium text-blue-600 hover:underline"
          >
            Go to login
          </Link>
          <button
            type="button"
            onClick={() => {
              setMode("email");
              setPassword("");
              setPasswordConfirm("");
              setError(null);
            }}
            className="hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
}
