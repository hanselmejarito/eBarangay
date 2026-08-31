import Link from "next/link";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/rbac";
import { ROLE_HOME } from "@/lib/constants";
import { getSettings } from "@/lib/settings";
import { PublicMobileNav } from "@/components/layout/public-mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { href: "/announcements", label: "Announcements" },
  { href: "/achievements", label: "Awards" },
  { href: "/officials", label: "Officials" },
  { href: "/budget", label: "Budget" },
  { href: "/privacy", label: "Privacy" },
];

export async function PublicHeader() {
  const [user, settings] = await Promise.all([
    getSessionUser(),
    getSettings().catch(() => null),
  ]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <PublicMobileNav
          homeHref="/"
          homeLabel={settings?.barangayName ?? "eBarangay"}
        />
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-2.5 font-semibold tracking-tight text-primary md:flex-none"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Landmark className="size-4" />
          </span>
          <span className="truncate">{settings?.barangayName ?? "eBarangay"}</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm" className="rounded-full">
              <Link href={ROLE_HOME[user.role]}>
                {user.role === "RESIDENT" ? "Portal" : "Dashboard"}
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" className="rounded-full" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
