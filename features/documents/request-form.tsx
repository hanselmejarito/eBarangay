"use client";

import { useActionState, useState } from "react";
import {
  createDocumentRequestAction,
  createWalkInDocumentRequestAction,
} from "@/features/documents/actions";
import { DOCUMENT_LABELS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { NativeSelect } from "@/components/ui/native-select";

const TYPES = Object.entries(DOCUMENT_LABELS) as [
  keyof typeof DOCUMENT_LABELS,
  string,
][];

export function DocumentRequestForm({
  members,
  defaultSubjectId,
  walkIn = false,
  submitLabel = "Submit request",
}: {
  members: { id: string; name: string }[];
  defaultSubjectId: string;
  walkIn?: boolean;
  submitLabel?: string;
}) {
  const submit = walkIn
    ? createWalkInDocumentRequestAction
    : createDocumentRequestAction;
  const [state, action] = useActionState(submit as typeof createDocumentRequestAction, {});
  const [type, setType] = useState<string>("BARANGAY_CLEARANCE");

  return (
    <form action={action} className="space-y-4">
      <FormMessage error={state.error} success={state.success} />
      <div className="space-y-2">
        <Label htmlFor="type">Document</Label>
        <NativeSelect
          id="type"
          name="type"
          className="w-full"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TYPES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subjectResidentId">Request for</Label>
        <NativeSelect
          id="subjectResidentId"
          name="subjectResidentId"
          defaultValue={defaultSubjectId}
          className="w-full"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose</Label>
        <Textarea id="purpose" name="purpose" required rows={3} />
      </div>
      {type === "BUSINESS_CLEARANCE" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input id="businessName" name="businessName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business address</Label>
            <Input id="businessAddress" name="businessAddress" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessNature">Nature of business</Label>
            <Input id="businessNature" name="businessNature" required />
          </div>
        </>
      ) : null}
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
