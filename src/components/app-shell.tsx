"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  DatabaseZapIcon,
  LightbulbIcon,
  RadarIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3Icon },
  { href: "/generate", label: "Generate", icon: SparklesIcon },
  { href: "/ideas", label: "Ideas", icon: LightbulbIcon },
  { href: "/research-runs", label: "Research", icon: DatabaseZapIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-sidebar px-4 py-4 lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-2 px-2 py-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <RadarIcon data-icon="inline-start" />
          </span>
          <span className="font-heading text-lg font-semibold">SignalIdeas</span>
        </Link>
        <nav className="mt-6 flex flex-col gap-1">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  active && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Icon data-icon="inline-start" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-lg border bg-background/70 p-3 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">Mock mode active</div>
          <p className="mt-1 leading-5">
            Local research uses realistic sample signals until Last30Days is enabled.
          </p>
        </div>
      </aside>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <RadarIcon data-icon="inline-start" />
          SignalIdeas
        </Link>
        <Link
          href="/generate"
          className="ml-auto flex h-8 items-center gap-1 rounded-lg bg-primary px-2 text-sm text-primary-foreground"
        >
          <SearchIcon data-icon="inline-start" />
          Generate
        </Link>
      </header>
      <main className="min-h-screen lg:pl-64">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
