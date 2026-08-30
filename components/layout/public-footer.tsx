import { getSettings } from "@/lib/settings";

export async function PublicFooter() {
  const settings = await getSettings().catch(() => null);
  return (
    <footer className="mt-auto border-t bg-muted/60">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">
          {settings?.barangayName ?? "eBarangay"} ·{" "}
          {settings?.cityMunicipality ?? "Local Government"}
        </p>
        <p className="mt-1">
          Official digital services for residents. Personal data is processed under
          the Data Privacy Act of 2012 (RA 10173).
        </p>
        <p className="mt-3 text-xs">
          Software does not replace a barangay resolution, official seal, or
          backups. Hosting and records retention remain the LGU&apos;s
          responsibility.
        </p>
      </div>
    </footer>
  );
}
