// src/components/layout/app-shell.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/datasets", label: "Datasets" },
  { href: "/app/predictions", label: "Predictions" },
  { href: "/app/account", label: "Account" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (error || !data?.user) {
          router.replace("/auth/sign-in");
          return;
        }

        setCheckingAuth(false);
      } catch {
        if (!isMounted) return;
        router.replace("/auth/sign-in");
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-slate-500">Loading your workspace…</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden w-60 border-r border-slate-200 bg-white/80 px-4 py-4 md:flex md:flex-col">
        {/* Logo + nombre */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
          <span className="text-sm font-semibold tracking-tight">
            RevenueLens
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 space-y-1 text-sm">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center rounded-md px-2 py-1.5 transition-colors",
                  active
                    ? "bg-slate-900 text-slate-50"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer pequeño (nombre empresa, etc.) */}
        <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
          <p>Demo business</p>
          <p className="text-[11px]">Forecasting sandbox</p>
        </div>
      </aside>

      {/* CONTENIDO */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* TOPBAR */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
            {/* Izquierda: botón menú móvil + nombre negocio/página */}
            <div className="flex items-center gap-2">
              {/* Menú móvil */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
                      <span className="text-sm font-semibold tracking-tight">
                        RevenueLens
                      </span>
                    </div>
                    <nav className="space-y-1 text-sm">
                      {navItems.map((item) => {
                        const active = pathname.startsWith(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={[
                              "block rounded-md px-2 py-1.5",
                              active
                                ? "bg-slate-900 text-slate-50"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                            ].join(" ")}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="hidden text-sm font-medium text-slate-700 md:block">
                Demo business
              </div>
            </div>

            {/* Derecha: usuario */}
            <div className="flex items-center gap-3">
              <div className="hidden text-xs text-slate-500 sm:block">
                <div className="font-medium text-slate-700">Marc (demo)</div>
                <div>marc@example.com</div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>MR</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/app/account">Profile & account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>Billing (soon)</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push("/");
                    }}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* SEPARADOR VISUAL */}
        <Separator className="border-slate-200" />

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
