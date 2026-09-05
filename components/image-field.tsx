"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImageField({
  name,
  label,
  accept = "image/*",
  required,
  multiple,
  existingUrl,
  existingUrls,
  previewClassName = "h-28 w-28 rounded-lg border object-cover",
}: {
  name: string;
  label: string;
  accept?: string;
  required?: boolean;
  multiple?: boolean;
  existingUrl?: string | null;
  existingUrls?: string[];
  previewClassName?: string;
}) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const saved = existingUrls?.length
    ? existingUrls
    : existingUrl
      ? [existingUrl]
      : [];

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {saved.length && !previews.length ? (
        <div className="flex flex-wrap gap-2">
          {saved.map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className={previewClassName}
              />
            </a>
          ))}
        </div>
      ) : null}
      {previews.length ? (
        <div className="flex flex-wrap gap-2">
          {previews.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt="Selected preview"
              className={previewClassName}
            />
          ))}
        </div>
      ) : null}
      <Input
        id={name}
        name={name}
        type="file"
        accept={accept}
        required={required}
        multiple={multiple}
        onChange={(e) => {
          previews.forEach((url) => URL.revokeObjectURL(url));
          const files = Array.from(e.target.files ?? []);
          setPreviews(files.filter((f) => f.type.startsWith("image/")).map((f) => URL.createObjectURL(f)));
        }}
      />
    </div>
  );
}
