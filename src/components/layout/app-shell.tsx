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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { Profile } from "@/types";
import { cn, getInitials } from "@/lib/utils"; // Añadimos iconos al menú

// Añadimos iconos al menú
const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/datasets", label: "Datasets", icon: Database },
  { href: "/app/predictions", label: "Predictions", icon: TrendingUp },
  { href: "/app/account", label: "Account", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [workspaceName, setWorkspaceName] = useState("My workspace");
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initApp() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (!authData.user) {
          // Middleware debería manejar esto, pero por si acaso
          return;
        }

        setUser(authData.user);

        const { data: profileData } = await supabase
          .from("profiles")
          .select(`*, businesses ( name )`)
          .eq("id", authData.user.id)
          .single();

        if (isMounted && profileData) {
          setProfile(profileData as any);
          const businessName = profileData.businesses?.name;
          if (businessName) setWorkspaceName(businessName);
        }
      } catch (err) {
        console.error("Error init app", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initApp();

    return () => {
      isMounted = false;
    };
  }, []);

  // Loading State para toda la app (Shell)
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="h-10 w-10 rounded-md bg-slate-200" />
          <p className="text-xs font-medium text-slate-400">
            Loading RevenueLens...
          </p>
        </div>
      </div>
    );
  }

  const email = user?.email ?? "";
  const displayName = profile?.full_name || email.split("@")[0];
  const initials = getInitials(profile?.full_name, email);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden w-64 border-r border-slate-200 bg-white px-4 py-6 md:flex md:flex-col fixed inset-y-0 left-0 z-10">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-sm" />
          <span className="font-semibold tracking-tight text-slate-900">
            RevenueLens
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-slate-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "text-blue-600" : "text-slate-400",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-4 px-2">
          <div className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          <div
            className="font-medium text-sm text-slate-900 truncate flex items-center gap-2"
            title={workspaceName}
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            {workspaceName}
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex flex-1 flex-col md:pl-64 transition-all duration-300">
        {/* TOPBAR */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="h-5 w-5 text-slate-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500" />
                    <span className="font-semibold">RevenueLens</span>
                  </div>
                  <nav className="space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-semibold text-slate-900 md:hidden">
              RevenueLens
            </span>
          </div>
          <div className="hidden md:block" />

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 outline-none group">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-700 leading-none group-hover:text-slate-900">
                      {displayName}
                    </p>
                  </div>
                  <Avatar className="h-8 w-8 border border-slate-200 transition-transform group-hover:scale-105">
                    <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/app/account"
                    className="cursor-pointer w-full flex items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.refresh();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
