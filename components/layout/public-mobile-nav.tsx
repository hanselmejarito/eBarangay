"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const LINKS = [
  { href: "/announcements", label: "Announcements" },
  { href: "/achievements", label: "Awards" },
  { href: "/officials", label: "Officials" },
  { href: "/budget", label: "Budget" },
  { href: "/privacy", label: "Privacy" },
];

export function PublicMobileNav({
  homeHref,
  homeLabel,
}: {
  homeHref: string;
  homeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(20rem,88vw)]">
        <SheetHeader>
          <SheetTitle>{homeLabel}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          <Link
            href={homeHref}
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2.5 text-sm hover:bg-accent"
          >
            Home
          </Link>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 border-t pt-3">
            <ThemeToggle labeled className="w-full justify-start" />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
