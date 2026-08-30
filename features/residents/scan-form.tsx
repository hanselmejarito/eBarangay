"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ScanForm() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function open() {
    const raw = value.trim();
    if (!raw) return;
    try {
      const url = new URL(raw);
      router.push(`${url.pathname}${url.search}`);
      return;
    } catch {
      router.push(`/verify/resident/${encodeURIComponent(raw)}`);
    }
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        open();
      }}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste QR URL or token"
      />
      <Button type="submit">Open</Button>
    </form>
  );
}
