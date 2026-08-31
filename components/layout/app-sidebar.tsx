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
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

function SidebarBrand({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-5">
      <Landmark className="size-6 text-ph-gold" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight">{title}</p>
        {subtitle ? (
          <p className="truncate text-xs text-sidebar-foreground/70">{subtitle}</p>
        ) : null}
      </div>
    </div>
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
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent",
            isActiveNav(pathname, item.href, allHrefs)
              ? "bg-sidebar-accent font-medium text-ph-gold"
              : "",
          )}
        >
          <item.icon className="size-4 shrink-0" />
          {item.label}
        </Link>
      ))}
      {extra?.length ? (
        <>
          <Separator className="my-2 bg-sidebar-border" />
          {extra.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent",
                isActiveNav(pathname, item.href, allHrefs)
                  ? "bg-sidebar-accent font-medium text-ph-gold"
                  : "",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </>
      ) : null}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="space-y-1 p-3">
      <ThemeToggle
        labeled
        className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-ph-gold"
      />
      <form action={logoutAction}>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-ph-gold"
          type="submit"
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </form>
      <p className="px-3 pt-2 text-[11px] leading-snug text-sidebar-foreground/55">
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
}: {
  title: string;
  subtitle?: string;
  items: Item[];
  extra?: Item[];
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <SidebarBrand title={title} subtitle={subtitle} />
      <Separator className="bg-sidebar-border" />
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
}: {
  title: string;
  subtitle?: string;
  items: Item[];
  extra?: Item[];
  triggerClassName?: string;
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
        <SidebarBrand title={title} subtitle={subtitle} />
        <Separator className="bg-sidebar-border" />
        <SidebarLinks items={items} extra={extra} onNavigate={() => setOpen(false)} />
        <SidebarFooter />
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
  { href: "/portal/notices", label: "Notices", icon: Inbox },
  { href: "/portal/profile", label: "Profile", icon: Users },
  { href: "/portal/requests", label: "Documents", icon: FileText },
  { href: "/portal/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/portal/id", label: "Resident ID", icon: IdCard },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/achievements", label: "Awards", icon: Trophy },
  { href: "/officials", label: "Officials", icon: Contact },
  { href: "/portal/password", label: "Password", icon: KeyRound },
];
