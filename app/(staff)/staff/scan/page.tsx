import { ScanForm } from "@/features/residents/scan-form";

export default function ScanPage() {
  return (
    <div className="max-w-lg space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Scan resident ID</h1>
      <p className="text-sm text-muted-foreground">
        Paste the verification URL or token from a scanned QR. You will see the
        full resident record.
      </p>
      <ScanForm />
    </div>
  );
}
