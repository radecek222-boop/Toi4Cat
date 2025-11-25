"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Wrench, Home, History, Database, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Analyzovat", href: "/dashboard", icon: Wrench },
  { name: "Historie", href: "/dashboard/history", icon: History },
  { name: "Databáze", href: "/dashboard/repairs", icon: Database },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
      <nav className="container flex h-16 items-center justify-between" aria-label="Global">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-xl shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              F
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">FIXO</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Otevřít menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-600 hover:text-indigo-600"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive && "text-indigo-500")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop right side */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50" asChild>
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4 mr-2" />
              Nastavení
            </Link>
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25" asChild>
            <Link href="/dashboard">
              <Wrench className="h-4 w-4 mr-2" />
              Analyzovat
            </Link>
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-slate-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/25">
                  F
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">FIXO</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Zavřít menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-8 flow-root">
              <div className="-my-6 divide-y divide-slate-100">
                <div className="space-y-1 py-6">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "-mx-3 flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all",
                          isActive
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          isActive ? "bg-indigo-100" : "bg-slate-100"
                        )}>
                          <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-slate-500")} />
                        </div>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
                <div className="py-6 space-y-1">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <Settings className="h-5 w-5 text-slate-500" />
                    </div>
                    Nastavení
                  </Link>
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    Přihlásit se
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
