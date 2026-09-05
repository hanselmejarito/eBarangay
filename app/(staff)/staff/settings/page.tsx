import { requireStaff } from "@/lib/rbac";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/features/settings/settings-form";

export default async function SettingsPage() {
  await requireStaff();
  const settings = await getSettings();
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">System settings</h1>
      <SettingsForm
        defaults={{
          barangayName: settings.barangayName,
          cityMunicipality: settings.cityMunicipality,
          province: settings.province,
          address: settings.address,
          contactNumber: settings.contactNumber ?? "",
          captainName: settings.captainName,
          secretaryName: settings.secretaryName,
          clearanceFee: Number(settings.clearanceFee),
          residencyFee: Number(settings.residencyFee),
          indigencyFee: Number(settings.indigencyFee),
          businessClearanceFee: Number(settings.businessClearanceFee),
          certificateValidityDays: settings.certificateValidityDays,
        }}
      />
    </div>
  );
}
