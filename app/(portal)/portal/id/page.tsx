import { ResidentIdCard } from "@/features/residents/id-card";
import { getResidentContext, requireUser } from "@/lib/rbac";
import { getSettings } from "@/lib/settings";
import { absUrl, qrDataUrl, residentToken } from "@/lib/qr";
import { fileUrl } from "@/lib/files";

export default async function ResidentIdPage() {
  const user = await requireUser();
  const me = await getResidentContext(user.id);
  const settings = await getSettings();

  if (!me) return <p>No resident profile is linked to this account.</p>;
  if (me.verificationStatus !== "VERIFIED") {
    return (
      <p>
        Your QR Resident ID will be available after staff verify your registration.
      </p>
    );
  }

  const token = residentToken(me.qrPublicId);
  const url = absUrl(`/verify/resident/${encodeURIComponent(token)}`);
  const qr = await qrDataUrl(url);

  return (
    <ResidentIdCard
      name={`${me.firstName} ${me.lastName}`}
      barangay={settings.barangayName}
      purok={me.household.purok}
      householdNumber={me.household.householdNumber}
      qr={qr}
      photoUrl={fileUrl(me.photoPath)}
    />
  );
}
