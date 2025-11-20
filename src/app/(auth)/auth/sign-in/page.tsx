// src/app/(auth)/auth/sign-in/page.tsx
"use client";

import { useState } from "react"; // Quitamos FormEvent y useRouter
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/icons";
import { supabase } from "@/lib/supabaseClient"; // Solo para Google OAuth
import { login } from "./actions"; // <--- IMPORTAMOS LA ACCIÓN

type Mode = "methods" | "email";

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>("methods");

  // Estados para feedback visual
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google sigue siendo Client-side porque requiere redirección a URL externa
  async function handleGoogleSignIn() {
    setError(null);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/app/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setError("Could not connect with Google.");
      setIsLoading(false);
    }
  }

  // Manejador para el login por Email usando Server Action
  async function handleEmailLogin(formData: FormData) {
    setIsLoading(true);
    setError(null);

    // Llamamos a la Server Action
    const result = await login(formData);

    // Si la acción devuelve algo, es que hubo un error (porque si hay éxito, hace redirect)
    if (result?.error) {
      let msg = result.error.toLowerCase();
      if (
        msg.includes("invalid login credentials") ||
        msg.includes("invalid email")
      ) {
        setError("Invalid email or password.");
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    }
    // Si no hay error, la redirección ocurre automáticamente en el servidor
  }

  // --- VISTAS ---

  if (mode === "methods") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* ... (Cabecera igual que antes) ... */}
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

        {/* ... (Footer igual) ... */}
        <div className="text-center text-xs text-slate-600">
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

  // VISTA: Email (AQUÍ ESTÁ EL CAMBIO CLAVE EN EL FORM)
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col items-center gap-3 text-center">
        {/* ... Cabecera igual ... */}
        <h1 className="text-lg font-semibold">Log in with email</h1>
        <p className="text-sm text-slate-600">Welcome back.</p>
      </div>

      {/* CAMBIO IMPORTANTE: 
          Usamos 'action={handleEmailLogin}' en lugar de 'onSubmit'.
          Esto pasa el FormData automáticamente.
      */}
      <form action={handleEmailLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            name="email" // NECESARIO para el FormData
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
            name="password" // NECESARIO para el FormData
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
