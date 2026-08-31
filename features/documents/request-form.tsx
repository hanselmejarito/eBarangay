"use client";

import { useActionState, useState } from "react";
import {
  createDocumentRequestAction,
  createWalkInDocumentRequestAction,
  saveDocumentRequestAction,
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
  requestId,
  defaults,
  submitLabel,
}: {
  members: { id: string; name: string }[];
  defaultSubjectId: string;
  walkIn?: boolean;
  requestId?: string;
  defaults?: {
    type?: string;
    purpose?: string;
    businessName?: string | null;
    businessAddress?: string | null;
    businessNature?: string | null;
  };
  submitLabel?: string;
}) {
  const submit = requestId
    ? saveDocumentRequestAction.bind(null, requestId)
    : walkIn
      ? createWalkInDocumentRequestAction
      : createDocumentRequestAction;
  const [state, action] = useActionState(submit as typeof createDocumentRequestAction, {});
  const [type, setType] = useState<string>(defaults?.type ?? "BARANGAY_CLEARANCE");
  const label =
    submitLabel ?? (requestId ? "Save changes" : "Submit request");

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
          {TYPES.map(([value, lbl]) => (
            <option key={value} value={value}>
              {lbl}
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
        <Textarea
          id="purpose"
          name="purpose"
          required
          rows={3}
          defaultValue={defaults?.purpose}
        />
      </div>
      {type === "BUSINESS_CLEARANCE" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              name="businessName"
              required
              defaultValue={defaults?.businessName ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business address</Label>
            <Input
              id="businessAddress"
              name="businessAddress"
              required
              defaultValue={defaults?.businessAddress ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessNature">Nature of business</Label>
            <Input
              id="businessNature"
              name="businessNature"
              required
              defaultValue={defaults?.businessNature ?? ""}
            />
          </div>
        </>
      ) : null}
      <SubmitButton>{label}</SubmitButton>
    </form>
  );
}
