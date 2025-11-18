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
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/datasets", label: "Datasets" },
  { href: "/app/predictions", label: "Predictions" },
  { href: "/app/account", label: "Account" },
];

function getDisplayName(user: User | null): string {
  if (!user) return "User";

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName =
    (meta.full_name as string | undefined) ||
    (meta.name as string | undefined) ||
    "";

  if (fullName.trim()) {
    return fullName.trim();
  }

  const email = user.email ?? "";
  if (!email) return "User";

  const localPart = email.split("@")[0];
  if (!localPart) return "User";

  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

function getInitials(user: User | null): string {
  if (!user) return "U";

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName =
    (meta.full_name as string | undefined) ||
    (meta.name as string | undefined) ||
    "";

  const source = fullName.trim() || user.email || "U";

  const parts = source.split(/[.\s@_]+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  const first = parts[0].charAt(0).toUpperCase();
  const last = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first}${last}`;
}

type Workspace = {
  id: string;
  name: string;
};

async function ensureWorkspace(user: User): Promise<Workspace | null> {
  // 1) Intentar cargar el profile existente
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, business_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    // Si falla la query, continuamos e intentamos crear lo que falte
    // pero no bloqueamos toda la app.
  }

  // Si el profile ya tiene business_id, intentamos recuperar ese business
  if (profile?.business_id) {
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, name")
      .eq("id", profile.business_id)
      .maybeSingle();

    if (!businessError && business) {
      return { id: business.id, name: business.name };
    }
    // Si falla o no existe, seguimos y creamos uno nuevo.
  }

  // 2) Crear un business por defecto
  const displayName = getDisplayName(user);
  const defaultName = displayName
    ? `${displayName}'s workspace`
    : "My workspace";

  const { data: newBusiness, error: businessInsertError } = await supabase
    .from("businesses")
    .insert({
      name: defaultName,
    })
    .select("id, name")
    .single();

  if (businessInsertError || !newBusiness) {
    // No podemos hacer mucho más aquí; devolvemos null y dejaremos un nombre genérico
    return null;
  }

  const businessId = newBusiness.id;

  // 3) Asegurar que existe un profile enlazado a ese business
  if (profile) {
    if (profile.business_id !== businessId) {
      // Intentamos actualizar el profile existente para apuntar al nuevo business
      await supabase
        .from("profiles")
        .update({ business_id: businessId })
        .eq("id", user.id);
    }
  } else {
    // Crear profile nuevo
    await supabase.from("profiles").insert({
      id: user.id,
      full_name: displayName || null,
      business_id: businessId,
    });
  }

  return { id: businessId, name: newBusiness.name };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [workspaceName, setWorkspaceName] = useState("My workspace");

  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndWorkspace() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (error || !data?.user) {
          router.replace("/auth/sign-in");
          return;
        }

        const currentUser = data.user;
        setUser(currentUser);

        // Asegurar que el usuario tiene workspace (business + profile)
        const workspace = await ensureWorkspace(currentUser);

        if (workspace && isMounted) {
          setWorkspaceName(workspace.name || "My workspace");
        }

        if (isMounted) {
          setCheckingAuth(false);
        }
      } catch {
        if (!isMounted) return;
        router.replace("/auth/sign-in");
      }
    }

    checkAuthAndWorkspace();

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

  const displayName = getDisplayName(user);
  const email = user?.email ?? "";
  const initials = getInitials(user);

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
          <p>{workspaceName}</p>
          <p className="text-[11px]">Sales forecasting</p>
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
                {workspaceName}
              </div>
            </div>

            {/* Derecha: usuario */}
            <div className="flex items-center gap-3">
              <div className="hidden text-xs text-slate-500 sm:block">
                <div className="font-medium text-slate-700">{displayName}</div>
                <div>{email}</div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>{initials}</AvatarFallback>
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
