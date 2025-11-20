"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button"; // Usamos Shadcn
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function MarketingHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            RevenueLens
          </span>
        </Link>

        {/* NAV CENTRO (Desktop) */}
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          {/* Usamos rutas reales, no anclas (#) */}
          <Link
            href="/product"
            className={cn(
              "hover:text-slate-900 transition-colors",
              pathname === "/product" && "text-slate-900 font-medium",
            )}
          >
            Product
          </Link>
          <Link
            href="/pricing"
            className={cn(
              "hover:text-slate-900 transition-colors",
              pathname === "/pricing" && "text-slate-900 font-medium",
            )}
          >
            Pricing
          </Link>
        </nav>

        {/* AUTH (Derecha) */}
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/auth/sign-in"
            className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            Log in
          </Link>
          <Link href="/auth/sign-up">
            {/* BOTÓN NEGRO Y CUADRADO (Shadcn) */}
            <Button
              size="sm"
              className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
            >
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
