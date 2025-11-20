"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/icons";
// Reutilizamos el icono limpio

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

  // ELIMINADO: useEffect de checkSession (responsabilidad del Middleware)

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
      console.error(err); // Log para ti
      setError("Could not connect with Google. Please try again.");
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

    if (error) {
      setIsLoading(false);
      // Mantenemos el mensaje genérico por seguridad, o el específico si prefieres UX sobre seguridad estricta
      const msg = error.message.toLowerCase();
      if (
        msg.includes("invalid login credentials") ||
        msg.includes("invalid email")
      ) {
        setError("Invalid email or password.");
      } else {
        setError(error.message);
      }
      return;
    }

    // Supabase Auth guarda la sesión automáticamente,
    // pero forzamos la redirección visual para que sea instantánea
    router.push("/app/dashboard");
    router.refresh(); // Asegura que los Server Components (layout) se enteren del cambio
  }

  // --- VISTAS ---

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
            onClick={() => {
              setMode("email");
              setError(null);
            }}
            disabled={isLoading}
            className="w-full bg-slate-900 text-white hover:bg-slate-800" // SIN rounded-full
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
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Mode: Email
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
        </div>
        <h1 className="text-lg font-semibold">Log in with email</h1>
        <p className="text-sm text-slate-600">Welcome back.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Link
              href="/auth/reset-password"
              className="text-xs text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            autoComplete="current-password"
            // Eliminado minLength para evitar bloqueos innecesarios en login
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 text-white hover:bg-slate-800" // SIN rounded-full
        >
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <div className="flex justify-between text-xs text-slate-600 mt-4">
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
