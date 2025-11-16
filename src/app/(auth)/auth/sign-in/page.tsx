// src/app/(auth)/auth/sign-in/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Mode = 'methods' | 'email';

export default function SignInPage() {
    const [mode, setMode] = useState<Mode>('methods');
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
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

        router.push('/app/dashboard');
    }

    // Modo "elijo método"
    if (mode === 'methods') {
        return (
            <div className="w-full max-w-sm text-center space-y-6">
                {/* Logo */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500" />
                    </div>
                    <h1 className="text-lg font-semibold">Log in to RevenueLens</h1>
                </div>

                <p className="text-sm text-slate-500">
                    Choose how you want to continue.
                </p>

                <div className="space-y-3 text-sm font-medium">
                    <button
                        type="button"
                        disabled
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-500 px-4 py-2.5 text-slate-50 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <span className="h-4 w-4 rounded-sm bg-slate-100" />
                        <span>Continue with Google (soon)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('email')}
                        className="flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-slate-100 hover:bg-slate-800"
                    >
                        Continue with email
                    </button>
                </div>

                <p className="pt-2 text-xs text-slate-500">
                    Don&apos;t have an account?{' '}
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

    // Modo "email" (formulario)
    return (
        <div className="w-full max-w-sm space-y-6">
            {/* Logo + título */}
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold">Log in with email</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Use the email and password you created for RevenueLens.
                    </p>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                    <label className="block text-sm font-medium text-slate-700">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        required
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                <div className="space-y-1.5 text-left">
                    <label className="block text-sm font-medium text-slate-700">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        required
                        minLength={6}
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-50 hover:bg-slate-800 disabled:opacity-60"
                >
                    {isLoading ? 'Logging in…' : 'Log in'}
                </button>
            </form>

            <div className="flex justify-between text-xs text-slate-500">
                <button
                    type="button"
                    onClick={() => setMode('methods')}
                    className="hover:underline"
                >
                    ← Back to methods
                </button>
                <p>
                    Don&apos;t have an account?{' '}
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
