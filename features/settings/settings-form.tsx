"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/features/settings/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

type Defaults = {
  barangayName: string;
  cityMunicipality: string;
  province: string;
  address: string;
  contactNumber: string;
  captainName: string;
  secretaryName: string;
  clearanceFee: number;
  residencyFee: number;
  indigencyFee: number;
  businessClearanceFee: number;
  certificateValidityDays: number;
};

export function SettingsForm({ defaults }: { defaults: Defaults }) {
  const [state, action] = useActionState(updateSettingsAction, {});
  return (
    <form action={action} className="grid max-w-2xl gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <FormMessage error={state.error} success={state.success} />
      </div>
      {(
        [
          ["barangayName", "Barangay name"],
          ["cityMunicipality", "City / municipality"],
          ["province", "Province"],
          ["address", "Hall address"],
          ["contactNumber", "Contact number"],
          ["captainName", "Punong Barangay"],
          ["secretaryName", "Secretary"],
        ] as const
      ).map(([name, label]) => (
        <div key={name} className="space-y-2">
          <Label htmlFor={name}>{label}</Label>
          <Input id={name} name={name} defaultValue={defaults[name]} required={name !== "contactNumber"} />
        </div>
      ))}
      <Field name="clearanceFee" label="Clearance fee" defaultValue={defaults.clearanceFee} />
      <Field name="residencyFee" label="Residency fee" defaultValue={defaults.residencyFee} />
      <Field name="indigencyFee" label="Indigency fee" defaultValue={defaults.indigencyFee} />
      <Field
        name="businessClearanceFee"
        label="Business clearance fee"
        defaultValue={defaults.businessClearanceFee}
      />
      <Field
        name="certificateValidityDays"
        label="Validity (days)"
        defaultValue={defaults.certificateValidityDays}
      />
      <FileField name="logo" label="Logo" />
      <FileField name="seal" label="Official seal" />
      <FileField name="captainSignature" label="Captain signature" />
      <FileField name="secretarySignature" label="Secretary signature" />
      <div className="md:col-span-2">
        <SubmitButton>Save settings</SubmitButton>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: number;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type="number" step="0.01" defaultValue={defaultValue} />
    </div>
  );
}

function FileField({ name, label }: { name: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type="file" accept="image/*" />
    </div>
  );
}
