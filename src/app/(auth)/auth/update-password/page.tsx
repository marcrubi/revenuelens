"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // Asumo que esto exporta un createBrowserClient

export default function UpdatePasswordPage() {
  const router = useRouter();

  // Estados
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Estados de carga y flujo
  const [checkingToken, setCheckingToken] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Mensajes
  const [error, setError] = useState<string | null>(null);

  // 1. Verificar si el usuario llega con un token válido (hash en URL)
  useEffect(() => {
    const checkSession = async () => {
      // Supabase detecta el token en la URL automáticamente y establece la sesión
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setHasValidSession(false);
      } else {
        setHasValidSession(true);
      }
      setCheckingToken(false);
    };

    checkSession();
  }, []);

  // Redirección automática tras éxito (opcional, mejora UX)
  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        router.push("/auth/sign-in");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Validaciones Client-side
    if (!password || !passwordConfirm) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 8) {
      // Mínimo 8 caracteres
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsUpdating(true);

    try {
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: password,
      });

      if (supabaseError) {
        // AQUÍ: Mostramos el error real. Supabase te dirá si es igual a la anterior,
        // si es muy débil (según config), etc.
        setError(supabaseError.message);
        setIsUpdating(false);
        return;
      }

      setUpdateSuccess(true);
      setIsUpdating(false);
      // Limpiamos campos por seguridad visual
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      setIsUpdating(false);
      setError("Unexpected error. Please try again.");
    }
  }

  // Render 1: Comprobando token
  if (checkingToken) {
    return (
      <div className="space-y-6 text-center animate-in fade-in duration-300">
        <p className="text-sm text-slate-500">Verifying security token...</p>
      </div>
    );
  }

  // Render 2: Token inválido o expirado
  if (!hasValidSession) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            ⚠️
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Link Expired
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-xs mx-auto">
              This password reset link is invalid or has expired.
            </p>
          </div>
        </div>
        <Link
          href="/auth/reset-password" // Asumo que esta es la página para pedir el correo
          className="inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          Request a new link &rarr;
        </Link>
      </div>
    );
  }

  // Render 3: Éxito
  if (updateSuccess) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            ✓
          </div>
          <h1 className="text-lg font-semibold text-slate-900">
            Password Updated
          </h1>
          <p className="text-sm text-slate-600">
            Your password has been changed successfully. <br />
            Redirecting to login...
          </p>
        </div>
        <Link
          href="/auth/sign-in"
          className="inline-block w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Go to Login now
        </Link>
      </div>
    );
  }

  // Render 4: Formulario normal
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            RevenueLens
          </span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Set new password
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Must be at least 8 characters long.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            New password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Confirm password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              if (error) setError(null);
            }}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="••••••••"
          />
        </div>

        {/* Mensaje de error dinámico */}
        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isUpdating}
          className="flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
        >
          {isUpdating ? "Updating..." : "Update password"}
        </button>
      </form>

      <div className="flex justify-center text-xs">
        <Link
          href="/auth/sign-in"
          className="text-slate-500 hover:text-slate-900 hover:underline"
        >
          Cancel and back to login
        </Link>
      </div>
    </div>
  );
}
