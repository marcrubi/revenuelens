// src/app/(auth)/auth/sign-in/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/icons";
import { supabase } from "@/lib/supabaseClient";

type Mode = "methods" | "email";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("methods");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lógica Google
  async function handleGoogleSignIn() {
    setError(null);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Importante: Redirigir al callback para que intercambie el código por sesión
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setError("Could not connect with Google.");
      setIsLoading(false);
    }
  }

  // Lógica Email (Todo en cliente)
  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Prevenimos el submit nativo
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 1. Login directo contra Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // 2. Manejo de errores (Manteniendo tus mensajes exactos)
    if (error) {
      let msg = error.message.toLowerCase();
      if (
        msg.includes("invalid login credentials") ||
        msg.includes("invalid email")
      ) {
        setError("Invalid email or password.");
      } else {
        setError(error.message);
      }
      setIsLoading(false);
      return;
    }

    // 3. ÉXITO - Solución al Race Condition
    // Refrescamos el router para que el Middleware vea la nueva cookie
    router.refresh();
    // Reemplazamos URL para ir al dashboard
    router.replace("/app/dashboard");
  }

  // --- VISTAS (Interfaz Intacta) ---

  if (mode === "methods") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
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

        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full gap-2"
          >
            <GoogleIcon />
            {isLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          <Button
            onClick={() => setMode("email")}
            disabled={isLoading}
            className="w-full bg-slate-900 text-white hover:bg-slate-800"
          >
            Continue with email
          </Button>
        </div>

        <div className="text-center text-xs text-slate-600">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign up
            </Link>{" "}
            or{" "}
            <Link
              href="/"
              className="font-medium text-blue-600 hover:underline"
            >
              learn more
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-lg font-semibold">Log in with email</h1>
        <p className="text-sm text-slate-600">Welcome back.</p>
      </div>

      {/* CAMBIO: onSubmit en lugar de action */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
          </div>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <Link
            href="/auth/reset-password"
            className="text-xs text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 text-white hover:bg-slate-800"
        >
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <div className="flex justify-between text-xs text-slate-600 mt-4">
        <button
          type="button"
          onClick={() => setMode("methods")}
          className="hover:underline"
        >
          ← Back
        </button>
        <p>
          Need an account?{" "}
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
