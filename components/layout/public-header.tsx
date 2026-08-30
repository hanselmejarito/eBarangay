import Link from "next/link";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/rbac";
import { ROLE_HOME } from "@/lib/constants";
import { getSettings } from "@/lib/settings";
import { PublicMobileNav } from "@/components/layout/public-mobile-nav";

export async function PublicHeader() {
  const [user, settings] = await Promise.all([
    getSessionUser(),
    getSettings().catch(() => null),
  ]);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4">
        <PublicMobileNav
          homeHref="/"
          homeLabel={settings?.barangayName ?? "eBarangay"}
        />
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-2 font-semibold text-primary md:flex-none"
        >
          <Landmark className="size-6 shrink-0" />
          <span className="truncate">{settings?.barangayName ?? "eBarangay"}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/announcements" className="hover:text-primary">
            Announcements
          </Link>
          <Link href="/achievements" className="hover:text-primary">
            Awards
          </Link>
          <Link href="/officials" className="hover:text-primary">
            Officials
          </Link>
          <Link href="/budget" className="hover:text-primary">
            Budget
          </Link>
          <Link href="/privacy" className="hover:text-primary">
            Privacy
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {user ? (
            <Button asChild size="sm">
              <Link href={ROLE_HOME[user.role]}>Portal</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
