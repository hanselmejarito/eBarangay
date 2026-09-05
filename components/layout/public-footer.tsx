import { getSettings } from "@/lib/settings";
import Link from "next/link";
import { BagongPilipinasLogo } from "@/components/bagong-pilipinas-logo";

export async function PublicFooter() {
  const settings = await getSettings().catch(() => null);
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-muted-foreground md:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em]">
            Republic of the Philippines
          </p>
          <p className="mt-1 font-semibold tracking-tight text-foreground">
            {settings?.barangayName ?? "eBarangay"}
          </p>
          <p className="mt-1">
            {settings?.cityMunicipality ?? "Local Government"}
            {settings?.province ? ` · ${settings.province}` : ""}
          </p>
          <BagongPilipinasLogo height={96} tone="auto" className="-ml-2 mt-4" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">Legal</p>
          <p>
            Personal data is processed under the Data Privacy Act of 2012 (RA
            10173).
          </p>
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy notice
          </Link>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">About this site</p>
          <p className="text-xs leading-relaxed">
            Software does not replace a barangay resolution, official seal, or
            backups. Hosting and records retention remain the LGU&apos;s
            responsibility.
          </p>
          <p className="pt-2 text-xs">
            eBarangay by{" "}
            <span className="font-medium text-foreground">Hansel Mejarito Jr.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
