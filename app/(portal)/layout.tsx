export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { AppMobileNav, AppSidebar, portalNav } from "@/components/layout/app-sidebar";
import { requireUser } from "@/lib/rbac";
import { getSettings } from "@/lib/settings";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (user.role !== "RESIDENT") {
    redirect(user.role === "ADMIN" || user.role === "STAFF" ? "/staff/dashboard" : "/login");
  }
  const settings = await getSettings();

  const subtitle = user.name ?? user.email ?? "Resident";

  return (
    <div className="flex min-h-screen">
      <AppSidebar title={settings.barangayName} subtitle={subtitle} items={portalNav} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="fixed left-3 top-4 z-40 md:hidden">
          <AppMobileNav
            title={settings.barangayName}
            subtitle={subtitle}
            items={portalNav}
            triggerClassName="border bg-background shadow-sm"
          />
        </div>
        <div className="flex-1 bg-muted/30 p-4 pt-16 md:p-8 md:pt-8">{children}</div>
      </div>
    </div>
  );
}
