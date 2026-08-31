"use client";

import { useActionState, useState } from "react";
import { createResidentAction, updateResidentAction } from "@/features/residents/actions";
import { VoterFields } from "@/features/residents/voter-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { ImageField } from "@/components/image-field";
import { NativeSelect } from "@/components/ui/native-select";

type Household = { id: string; householdNumber: string };
type Values = {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  suffix?: string | null;
  birthdate?: string;
  gender?: string;
  civilStatus?: string;
  contactNumber?: string | null;
  householdId?: string;
  isSenior?: boolean;
  isPwd?: boolean;
  isSoloParent?: boolean;
  isRegisteredVoter?: boolean;
  isSkVoter?: boolean;
  remarks?: string | null;
  photoUrl?: string | null;
  relation?: string;
  loginEmail?: string | null;
};

export function ResidentForm({
  households,
  residentId,
  defaults,
}: {
  households: Household[];
  residentId?: string;
  defaults?: Values;
}) {
  const action = residentId
    ? updateResidentAction.bind(null, residentId)
    : createResidentAction;
  const [state, formAction] = useActionState(action, {});
  const [birthdate, setBirthdate] = useState(defaults?.birthdate ?? "");

  return (
    <form action={formAction} className="grid max-w-2xl gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <FormMessage error={state.error} success={state.success} />
      </div>
      <Field label="First name" name="firstName" defaultValue={defaults?.firstName} required />
      <Field label="Middle name" name="middleName" defaultValue={defaults?.middleName ?? ""} />
      <Field label="Last name" name="lastName" defaultValue={defaults?.lastName} required />
      <Field label="Suffix" name="suffix" defaultValue={defaults?.suffix ?? ""} />
      <Field
        label="Birthdate"
        name="birthdate"
        type="date"
        value={birthdate}
        onChange={(e) => setBirthdate(e.target.value)}
        required
      />
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <NativeSelect
          id="gender"
          name="gender"
          defaultValue={defaults?.gender ?? "MALE"}
          className="w-full"
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="civilStatus">Civil status</Label>
        <NativeSelect
          id="civilStatus"
          name="civilStatus"
          defaultValue={defaults?.civilStatus ?? "SINGLE"}
          className="w-full"
        >
          <option value="SINGLE">Single</option>
          <option value="MARRIED">Married</option>
          <option value="WIDOWED">Widowed</option>
          <option value="SEPARATED">Separated</option>
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactNumber">Contact number</Label>
        <Input
          id="contactNumber"
          name="contactNumber"
          defaultValue={defaults?.contactNumber ?? ""}
          placeholder="09XXXXXXXXX"
        />
        <p className="text-xs text-muted-foreground">
          Mobile number for announcement SMS. Leave blank only if they have no
          phone (children).
        </p>
      </div>
      {defaults?.loginEmail ? (
        <div className="space-y-1">
          <p className="text-sm font-medium">Portal login</p>
          <p className="text-sm text-muted-foreground">
            {defaults.loginEmail} — change email or password in Users.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Portal email</Label>
            <Input id="email" name="email" type="email" autoComplete="off" />
            <p className="text-xs text-muted-foreground">
              Optional. If set, they can sign in and request documents. Leave
              blank for children or residents without email (use walk-in).
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Temporary password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">
              Required with email. 8+ characters, one uppercase letter, one
              number. They must change it on first login.
            </p>
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor="householdId">Household</Label>
        <NativeSelect
          id="householdId"
          name="householdId"
          defaultValue={defaults?.householdId}
          required
          className="w-full"
        >
          {households.map((h) => (
            <option key={h.id} value={h.id}>
              {h.householdNumber}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="relation">Relation to household</Label>
        <NativeSelect
          id="relation"
          name="relation"
          defaultValue={defaults?.relation ?? "MEMBER"}
          className="w-full"
        >
          <option value="MEMBER">Registered member (kasama sa pamilya / census)</option>
          <option value="BOARDER">Boarder / nakikitira (hindi rehistradong miyembro)</option>
        </NativeSelect>
        <p className="text-xs text-muted-foreground">
          Use boarder if the person only stays here and is not part of the official household.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isSenior" defaultChecked={defaults?.isSenior} className="size-4" />
        Senior
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPwd" defaultChecked={defaults?.isPwd} className="size-4" />
        PWD
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isSoloParent"
          defaultChecked={defaults?.isSoloParent}
          className="size-4"
        />
        Solo parent
      </label>
      <VoterFields
        key={birthdate}
        birthdate={birthdate}
        defaultRegistered={defaults?.isRegisteredVoter}
        defaultSk={defaults?.isSkVoter}
      />
      <div className="md:col-span-2">
        <ImageField name="photo" label="Photo" existingUrl={defaults?.photoUrl} />
      </div>
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea id="remarks" name="remarks" defaultValue={defaults?.remarks ?? ""} />
      </div>
      <div className="md:col-span-2">
        <SubmitButton>{residentId ? "Save changes" : "Add resident"}</SubmitButton>
      </div>
    </form>
  );
}

function Field(props: React.ComponentProps<typeof Input> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div className="space-y-2">
      <Label htmlFor={rest.name}>{label}</Label>
      <Input id={rest.name} {...rest} />
    </div>
  );
}
