// src/app/(auth)/auth/sign-up/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Mode = "methods" | "email" | "password" | "success";

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

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
          message.includes("exists")
        ) {
          setError("An account with this email already exists.");
        } else {
          setError("We couldn't create your account. Please try again.");
        }
        return;
      }

      // No redirigimos directamente. Pedimos verificación por email.
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
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="h-4 w-4 rounded-sm border border-slate-300 bg-slate-100" />
            <span>Sign up with Google (soon)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("email")}
            className="flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-slate-50 hover:bg-slate-800"
          >
            Sign up with email
          </button>
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
            onClick={() => setMode("methods")}
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

          {error && <p className="text-sm text-red-500">{error}</p>}

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
            onClick={() => setMode("email")}
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
