"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FileText,
  Home,
  IdCard,
  Landmark,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareWarning,
  Settings,
  Shield,
  Trophy,
  Users,
  Warehouse,
  ClipboardList,
  Contact,
  Package,
  Wallet,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BarangayLogo } from "@/components/barangay-logo";
import { logoutAction } from "@/features/auth/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isActiveNav(pathname: string, href: string, allHrefs: string[]) {
  if (!pathMatches(pathname, href)) return false;
  const best = allHrefs
    .filter((itemHref) => pathMatches(pathname, itemHref))
    .sort((a, b) => b.length - a.length)[0];
  return best === href;
}

function SidebarBrand({
  title,
  subtitle,
  logoUrl,
}: {
  title: string;
  subtitle?: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-5">
      <BarangayLogo
        src={logoUrl ?? null}
        barangayName={title}
        className="size-11"
        placeholder={
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-ph-gold text-sidebar">
            <Landmark className="size-5" />
          </div>
        }
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight tracking-tight">{title}</p>
        {subtitle ? (
          <p className="truncate text-xs text-sidebar-foreground/60">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: Item;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex min-h-10 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
        active
          ? "bg-white/10 font-medium text-ph-gold shadow-sm"
          : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground",
      )}
    >
      <item.icon className={cn("size-4 shrink-0", active ? "text-ph-gold" : "opacity-80")} />
      {item.label}
    </Link>
  );
}

function SidebarLinks({
  items,
  extra,
  onNavigate,
}: {
  items: Item[];
  extra?: Item[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const allHrefs = [...items, ...(extra ?? [])].map((item) => item.href);

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
      {items.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          active={isActiveNav(pathname, item.href, allHrefs)}
          onNavigate={onNavigate}
        />
      ))}
      {extra?.length ? (
        <>
          <Separator className="my-3 bg-sidebar-border" />
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/40">
            Admin
          </p>
          {extra.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActiveNav(pathname, item.href, allHrefs)}
              onNavigate={onNavigate}
            />
          ))}
        </>
      ) : null}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="space-y-1 border-t border-sidebar-border p-3">
      <ThemeToggle
        labeled
        className="rounded-xl text-sidebar-foreground hover:bg-white/5 hover:text-ph-gold"
      />
      <form action={logoutAction}>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 rounded-xl text-sidebar-foreground hover:bg-white/5 hover:text-ph-gold"
          type="submit"
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </form>
      <p className="px-3 pt-2 text-[11px] leading-snug text-sidebar-foreground/45">
        Developed by Hansel Mejarito Jr.
      </p>
    </div>
  );
}

export function AppSidebar({
  title,
  subtitle,
  items,
  extra,
  logoUrl,
}: {
  title: string;
  subtitle?: string;
  items: Item[];
  extra?: Item[];
  logoUrl?: string | null;
}) {
  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <SidebarBrand title={title} subtitle={subtitle} logoUrl={logoUrl} />
      <SidebarLinks items={items} extra={extra} />
      <SidebarFooter />
    </aside>
  );
}

export function AppMobileNav({
  title,
  subtitle,
  items,
  extra,
  triggerClassName,
  logoUrl,
}: {
  title: string;
  subtitle?: string;
  items: Item[];
  extra?: Item[];
  triggerClassName?: string;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden", triggerClassName)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(20rem,88vw)] bg-sidebar p-0 text-sidebar-foreground">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <SidebarBrand title={title} subtitle={subtitle} logoUrl={logoUrl} />
          <SidebarLinks items={items} extra={extra} onNavigate={() => setOpen(false)} />
          <SidebarFooter />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const staffNav: Item[] = [
  { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/staff/residents", label: "Residents", icon: Users },
  { href: "/staff/households", label: "Households", icon: Warehouse },
  { href: "/staff/requests", label: "Documents", icon: FileText },
  { href: "/staff/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/staff/announcements", label: "Announcements", icon: Megaphone },
  { href: "/staff/achievements", label: "Awards", icon: Trophy },
  { href: "/staff/officials", label: "Officials", icon: Contact },
  { href: "/staff/inventory", label: "Inventory", icon: Package },
  { href: "/staff/budget", label: "Budget", icon: Wallet },
  { href: "/staff/scan", label: "Scan ID", icon: IdCard },
  { href: "/staff/reports", label: "Reports", icon: ClipboardList },
  { href: "/staff/password", label: "Password", icon: KeyRound },
];

export const adminNav: Item[] = [
  { href: "/staff/users", label: "Users", icon: Shield },
  { href: "/staff/audit", label: "Audit log", icon: Bell },
  { href: "/staff/settings", label: "Settings", icon: Settings },
];

export const portalNav: Item[] = [
  { href: "/portal", label: "Home", icon: Home },
  { href: "/portal/profile", label: "Profile", icon: Users },
  { href: "/portal/requests", label: "Documents", icon: FileText },
  { href: "/portal/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/portal/id", label: "Resident ID", icon: IdCard },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/achievements", label: "Awards", icon: Trophy },
  { href: "/officials", label: "Officials", icon: Contact },
  { href: "/portal/password", label: "Password", icon: KeyRound },
];
