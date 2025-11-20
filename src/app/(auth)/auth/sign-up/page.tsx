// src/app/(auth)/auth/sign-up/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/icons";

type Mode = "methods" | "email" | "password" | "success";

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

const EMAIL_EXISTS_MESSAGE = "An account with this email already exists.";

export default function SignUpPage() {
  const [mode, setMode] = useState<Mode>("methods");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignUp() {
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
      setError("Could not connect with Google. Please try again.");
      setIsLoading(false);
    }
  }

  function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();

    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setEmail(trimmed);
    setMode("password");
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!password || !passwordConfirm) {
      setError("Please fill in both password fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/sign-in`,
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("registered") || msg.includes("exists")) {
          setError(EMAIL_EXISTS_MESSAGE);
        } else {
          setError(error.message);
        }
        setIsLoading(false);
        return;
      }
      setMode("success");
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      setError("Unexpected error. Please try again.");
    }
  }

  // --- VISTA 1: MÉTODOS ---
  if (mode === "methods") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              RevenueLens
            </span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900">
            Create your account
          </h1>
          <p className="text-sm text-slate-600">
            Start predicting your revenue today.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full gap-2"
          >
            <GoogleIcon />
            {isLoading ? "Connecting..." : "Sign up with Google"}
          </Button>

          <Button
            onClick={() => setMode("email")}
            disabled={isLoading}
            className="w-full bg-slate-900 text-white hover:bg-slate-800"
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

  // --- VISTA 2: EMAIL ---
  if (mode === "email") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              RevenueLens
            </span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900">
            Sign up with email
          </h1>
          <p className="text-sm text-slate-600">
            Enter your work email address.
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-slate-900 text-white hover:bg-slate-800"
          >
            Continue
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setMode("methods")}
            className="text-xs text-slate-500 hover:underline hover:text-slate-800"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA 3: PASSWORD ---
  if (mode === "password") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              RevenueLens
            </span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900">
            Set your password
          </h1>
          <p className="text-sm text-slate-600">
            Must be at least 8 characters.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                setError(null);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-red-50 text-sm text-red-600 border border-red-100">
              {error}
              {error === EMAIL_EXISTS_MESSAGE && (
                <Link
                  href="/auth/sign-in"
                  className="block mt-1 font-medium underline"
                >
                  Go to login instead
                </Link>
              )}
            </div>
          )}

          <Button
            disabled={isLoading}
            type="submit"
            className="w-full bg-slate-900 text-white hover:bg-slate-800"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setMode("email")}
            className="text-xs text-slate-500 hover:underline hover:text-slate-800"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA 4: SUCCESS ---
  return (
    <div className="space-y-6 text-center animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            RevenueLens
          </span>
        </div>
        <h1 className="text-lg font-semibold text-slate-900">
          Check your email
        </h1>
      </div>

      <div className="mx-auto h-12 w-12 bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl rounded-full">
        ✉️
      </div>

      <p className="text-sm text-slate-600">
        We sent a link to <strong>{email}</strong>.<br />
        Click it to activate your account.
      </p>

      <Link href="/auth/sign-in">
        <Button variant="outline" className="w-full">
          Back to Login
        </Button>
      </Link>
    </div>
  );
}
