"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  DatabaseZapIcon,
  LightbulbIcon,
  ListChecksIcon,
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
  { href: "/execution", label: "Execution", icon: ListChecksIcon },
  { href: "/research-runs", label: "Research", icon: DatabaseZapIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-sidebar-border/70 bg-sidebar/80 px-4 py-4 backdrop-blur lg:flex lg:flex-col">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl border border-white/60 bg-white/55 px-3 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(13,148,136,0.28)]">
            <RadarIcon data-icon="inline-start" />
          </span>
          <span>
            <span className="font-heading block text-lg font-semibold">SignalIdeas</span>
            <span className="block text-xs text-muted-foreground">Idea intelligence for builders</span>
          </span>
        </Link>

        <nav className="mt-6 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-sidebar-foreground/80 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-0.5",
                  active && "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                )}
              >
                <Icon data-icon="inline-start" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/60 bg-white/60 p-4 text-xs text-muted-foreground shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div className="font-heading text-sm font-semibold text-foreground">KI-Ideenmodus</div>
          <p className="mt-2 leading-5">
            Mit OpenAI API Key erzeugt die App neue Ideen. Ohne Key nutzt sie sichere Demo-Daten.
          </p>
          <div className="mt-3 rounded-xl bg-muted/80 px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Search, score, execute
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/90 px-4 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2 font-heading font-semibold">
          <RadarIcon data-icon="inline-start" />
          SignalIdeas
        </Link>
        <Link
          href="/generate"
          className="ml-auto flex h-9 items-center gap-1 rounded-xl bg-primary px-3 text-sm text-primary-foreground shadow-[0_10px_24px_rgba(13,148,136,0.24)]"
        >
          <SearchIcon data-icon="inline-start" />
          Generate
        </Link>
      </header>

      <main className="min-h-screen lg:pl-72">
        <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
