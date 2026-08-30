"use client";

import {
  isRegularVoterAge,
  isSkAge,
  parseBirthdate,
  REGULAR_VOTER_MIN,
  SK_VOTER_MAX,
  SK_VOTER_MIN,
  yearsOld,
} from "@/lib/age";

export function VoterFields({
  birthdate,
  defaultRegistered,
  defaultSk,
}: {
  birthdate: string;
  defaultRegistered?: boolean;
  defaultSk?: boolean;
}) {
  const age = birthdate ? yearsOld(parseBirthdate(birthdate)) : null;
  const canRegular = age != null && isRegularVoterAge(age);
  const canSk = age != null && isSkAge(age);

  return (
    <div className="md:col-span-2 grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <p className="text-sm font-medium">Voters</p>
        <p className="text-xs text-muted-foreground">
          Tag once. Age updates the count automatically: SK from {SK_VOTER_MIN}–
          {SK_VOTER_MAX}, and also a regular voter from {REGULAR_VOTER_MIN}. At 31
          they leave the SK list and stay on the regular list. No manual transfer.
          {age != null ? ` This person is ${age}.` : ""}
        </p>
      </div>
      <label
        className={`flex items-center gap-2 text-sm ${canRegular ? "" : "text-muted-foreground"}`}
      >
        <input
          type="checkbox"
          name="isRegisteredVoter"
          defaultChecked={Boolean(defaultRegistered) && canRegular}
          disabled={!canRegular}
          className="size-4"
        />
        Registered voter ({REGULAR_VOTER_MIN}+, COMELEC)
        {!canRegular && age != null ? (
          <span className="text-xs">— not eligible</span>
        ) : null}
      </label>
      <label
        className={`flex items-center gap-2 text-sm ${canSk ? "" : "text-muted-foreground"}`}
      >
        <input
          type="checkbox"
          name="isSkVoter"
          defaultChecked={Boolean(defaultSk) && canSk}
          disabled={!canSk}
          className="size-4"
        />
        SK voter ({SK_VOTER_MIN}–{SK_VOTER_MAX})
        {!canSk && age != null ? (
          <span className="text-xs">— not eligible</span>
        ) : null}
      </label>
    </div>
  );
}
