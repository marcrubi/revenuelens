"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react"; // Icono hamburguesa
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Componente menú móvil

export function MarketingHeader() {
  const pathname = usePathname();

  // Función auxiliar para estilos de links
  const getLinkClass = (path: string) =>
    cn(
      "text-sm transition-colors hover:text-slate-900",
      pathname === path ? "text-slate-900 font-medium" : "text-slate-600",
    );

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* 1. LOGO + MENÚ MÓVIL (IZQUIERDA) */}
        <div className="flex items-center gap-3">
          {/* MENÚ MÓVIL (Solo visible en pantallas pequeñas 'md:hidden') */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-2 h-9 w-9 text-slate-600"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-white">
                <div className="hidden">
                  <SheetTitle>Menu</SheetTitle>
                </div>
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
                    RL
                  </div>
                  <span className="font-semibold text-slate-900">
                    RevenueLens
                  </span>
                </div>
                <nav className="flex flex-col p-2 space-y-1">
                  <Link
                    href="/product"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md"
                  >
                    Product
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/auth/sign-in"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md"
                  >
                    Log in
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
            <span className="text-sm font-semibold tracking-tight text-slate-900 hidden sm:inline-block">
              RevenueLens
            </span>
            {/* Logo solo texto para móvil muy pequeño si quieres, o dejarlo oculto */}
            <span className="text-sm font-semibold tracking-tight text-slate-900 sm:hidden">
              RL
            </span>
          </Link>
        </div>

        {/* 2. NAV CENTRO (Solo Desktop) */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/product" className={getLinkClass("/product")}>
            Product
          </Link>
          <Link href="/pricing" className={getLinkClass("/pricing")}>
            Pricing
          </Link>
        </nav>

        {/* 3. AUTH (Derecha) */}
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/auth/sign-in"
            className="hidden text-slate-600 hover:text-slate-900 font-medium transition-colors md:block"
          >
            Log in
          </Link>
          <Link href="/auth/sign-up">
            <Button
              size="sm"
              className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm h-9 px-4"
            >
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
