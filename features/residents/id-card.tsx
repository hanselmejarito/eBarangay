"use client";

import { BagongPilipinasLogo } from "@/components/bagong-pilipinas-logo";

export function ResidentIdCard({
  name,
  barangay,
  purok,
  householdNumber,
  qr,
  photoUrl,
}: {
  name: string;
  barangay: string;
  purok: string;
  householdNumber: string;
  qr: string;
  photoUrl?: string | null;
}) {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold no-print">QR Resident ID</h1>
      <div className="mx-auto w-full max-w-[340px] rounded-xl border-2 border-ph-blue bg-white p-5 text-slate-900 shadow-sm print:shadow-none">
        <div className="mb-3 flex h-1.5 overflow-hidden rounded-full">
          <div className="flex-1 bg-ph-blue" />
          <div className="w-8 bg-ph-gold" />
          <div className="flex-1 bg-ph-red" />
        </div>
        <div className="flex justify-center">
          <BagongPilipinasLogo height={88} />
        </div>
        <p className="text-center text-xs uppercase tracking-widest text-ph-blue">
          {barangay}
        </p>
        <p className="text-center text-sm font-semibold">Resident Identification</p>
        <div className="my-3 flex items-center justify-center gap-3">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-20 w-20 rounded-md object-cover" />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Resident QR" className="h-36 w-36" />
        </div>
        <p className="text-center text-lg font-semibold">{name}</p>
        <p className="text-center text-sm text-slate-600">
          {purok} · {householdNumber}
        </p>
        <p className="mt-3 text-center text-[10px] text-slate-500">
          Signed QR. Staff scan to verify. Not valid if the account is revoked.
        </p>
      </div>
      <button
        type="button"
        className="no-print rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        onClick={() => window.print()}
      >
        Print / save
      </button>
    </div>
  );
}
