"use client";

import { useActionState, useState } from "react";
import { registerAction } from "@/features/auth/actions";
import { VoterFields } from "@/features/residents/voter-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { ImageField } from "@/components/image-field";
import { NativeSelect } from "@/components/ui/native-select";
import Link from "next/link";

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, {});
  const [birthdate, setBirthdate] = useState("");

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <FormMessage error={state.error} />
      </div>
      <Field label="Email" name="email" type="email" required />
      <Field label="Password" name="password" type="password" required />
      <Field label="First name" name="firstName" required />
      <Field label="Middle name" name="middleName" />
      <Field label="Last name" name="lastName" required />
      <Field label="Suffix" name="suffix" />
      <div className="space-y-2">
        <Label htmlFor="birthdate">Birthdate</Label>
        <Input
          id="birthdate"
          name="birthdate"
          type="date"
          required
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <NativeSelect id="gender" name="gender" required className="w-full">
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="civilStatus">Civil status</Label>
        <NativeSelect id="civilStatus" name="civilStatus" required className="w-full">
          <option value="SINGLE">Single</option>
          <option value="MARRIED">Married</option>
          <option value="WIDOWED">Widowed</option>
          <option value="SEPARATED">Separated</option>
        </NativeSelect>
      </div>
      <Field label="Contact number" name="contactNumber" required />
      <Field
        label="Existing household no. (optional)"
        name="householdNumber"
        placeholder="HH-0001"
      />
      <Field label="Purok / sitio" name="purok" required />
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="streetAddress">Street address</Label>
        <Textarea id="streetAddress" name="streetAddress" required rows={2} />
      </div>
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="relation">Relation to household</Label>
        <NativeSelect
          id="relation"
          name="relation"
          className="w-full"
          defaultValue="MEMBER"
        >
          <option value="MEMBER">Registered member of the household</option>
          <option value="BOARDER">Nakikitira / boarder only</option>
        </NativeSelect>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isSenior" className="size-4" /> Senior citizen
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPwd" className="size-4" /> PWD
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isSoloParent" className="size-4" /> Solo parent
      </label>
      <VoterFields key={birthdate} birthdate={birthdate} />
      <div className="space-y-2">
        <ImageField name="photo" label="2x2 photo (optional)" />
      </div>
      <div className="md:col-span-2">
        <ImageField
          name="idDocument"
          label="Valid ID (required)"
          accept="image/*,.pdf"
          required
        />
      </div>
      <label className="md:col-span-2 flex items-start gap-2 text-sm">
        <input type="checkbox" name="privacyConsent" required className="mt-1 size-4" />
        <span>
          I have read the{" "}
          <Link href="/privacy" className="text-primary underline">
            privacy notice
          </Link>{" "}
          and consent to the processing of my personal information for barangay
          services under RA 10173.
        </span>
      </label>
      <div className="md:col-span-2">
        <SubmitButton>Submit registration</SubmitButton>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}
