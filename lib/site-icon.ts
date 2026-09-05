import { readFile } from "node:fs/promises";
import path from "node:path";
import { readUpload } from "@/lib/files";
import { getSettings } from "@/lib/settings";

const FALLBACK = path.join(
  process.cwd(),
  "public",
  "demo",
  "barangay-san-roque-seal.png",
);

function mimeFor(relPath: string, bytes: Buffer) {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (bytes[0] === 0x52 && bytes[1] === 0x49) return "image/webp";
  const ext = relPath.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "image/png";
}

/**
 * Favicon / Apple touch icon. Uses the hall-uploaded logo when present so a
 * real barangay is not stuck with the San Roque sample; falls back to that
 * sample (or a 1×1 PNG) so a missing database can never 500 the tab icon.
 */
export async function getSiteIcon(): Promise<{
  bytes: Buffer;
  type: string;
}> {
  try {
    const settings = await getSettings();
    if (settings.logoPath) {
      const bytes = await readUpload(settings.logoPath);
      return { bytes, type: mimeFor(settings.logoPath, bytes) };
    }
  } catch {
    // Settings or upload missing — use the sample seal.
  }

  try {
    const bytes = await readFile(FALLBACK);
    return { bytes, type: "image/png" };
  } catch {
    return {
      bytes: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
      ),
      type: "image/png",
    };
  }
}

export function siteIconResponse(icon: { bytes: Buffer; type: string }) {
  return new Response(new Uint8Array(icon.bytes), {
    headers: {
      "Content-Type": icon.type,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
