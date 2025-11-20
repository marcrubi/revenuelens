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
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // AÑADIDO SheetTitle
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
import { cn, getInitials } from "@/lib/utils";

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
          return;
        }

        setUser(authData.user);

        const { data: profileData } = await supabase
          .from("profiles")
          .select(`*, businesses ( name )`)
          .eq("id", authData.user.id)
          .single();

        if (isMounted && profileData) {
          setProfile(profileData as unknown as Profile);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="h-8 w-8 rounded-md bg-slate-200" />
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  const email = user?.email ?? "";
  const displayName = profile?.full_name || email.split("@")[0];
  const initials = getInitials(profile?.full_name, email);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden w-56 border-r border-slate-200 bg-white px-3 py-4 md:flex md:flex-col fixed inset-y-0 left-0 z-10">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="h-5 w-5 rounded bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
            RL
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            RevenueLens
          </span>
        </div>

        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-all",
                  active
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    active ? "text-slate-900" : "text-slate-400",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="mt-auto border-t border-slate-100 pt-3 px-1">
          <div className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Workspace
          </div>
          <div
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors truncate"
            title={workspaceName}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="truncate">{workspaceName}</span>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex flex-1 flex-col md:pl-56 transition-all duration-300">
        {/* TOPBAR */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur md:px-6">
          {/* MÓVIL: Botón Hamburguesa y Sheet */}
          <div className="flex items-center gap-3 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-2 h-8 w-8 cursor-pointer hover:bg-slate-100"
                >
                  <Menu className="h-4 w-4 text-slate-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-56 p-0 bg-white">
                {/* Título oculto para accesibilidad */}
                <div className="hidden">
                  <SheetTitle>Menu</SheetTitle>
                </div>

                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
                    RL
                  </div>
                  <span className="font-semibold text-sm">RevenueLens</span>
                </div>
                <nav className="p-2 space-y-0.5">
                  {navItems.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                          active
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            active ? "text-slate-900" : "text-slate-400",
                          )}
                        />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            <span className="font-semibold text-sm text-slate-900 md:hidden">
              RevenueLens
            </span>
          </div>
          <div className="hidden md:block" />

          {/* USER MENU */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* AÑADIDO: cursor-pointer y hover para que parezca clicable */}
                <button className="flex items-center gap-2 outline-none group cursor-pointer rounded-full py-1 pl-2 pr-1 hover:bg-slate-100 transition-colors">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-slate-700 leading-none group-hover:text-slate-900">
                      {displayName}
                    </p>
                  </div>
                  <Avatar className="h-7 w-7 border border-slate-200 rounded-md">
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
                  <Link href="/app/account" className="cursor-pointer text-xs">
                    <Settings className="mr-2 h-3.5 w-3.5" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 text-xs cursor-pointer focus:bg-red-50"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.refresh();
                  }}
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
