export const dynamic = "force-dynamic";

import { adminNav, AppMobileNav, AppSidebar, staffNav } from "@/components/layout/app-sidebar";
import { requireStaff } from "@/lib/rbac";
import { getSettings } from "@/lib/settings";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaff();
  const settings = await getSettings();

  const extra = user.role === "ADMIN" ? adminNav : undefined;
  const subtitle = `${user.role === "ADMIN" ? "Administrator" : "Staff"} · ${user.email}`;

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        title={settings.barangayName}
        subtitle={subtitle}
        items={staffNav}
        extra={extra}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur md:hidden">
          <AppMobileNav
            title={settings.barangayName}
            subtitle={subtitle}
            items={staffNav}
            extra={extra}
          />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold md:hidden">
            {settings.barangayName}
          </p>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
