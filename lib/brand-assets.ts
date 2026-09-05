import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PDFDocument, PDFImage, PDFPage } from "pdf-lib";
import { readUpload } from "@/lib/files";

let cached: Buffer | null = null;

async function bagongPilipinasPng() {
  cached ??= await readFile(
    path.join(process.cwd(), "public", "bagong-pilipinas.png"),
  );
  return cached;
}

/**
 * Returns null instead of throwing so a missing asset can never block issuing an
 * official document.
 */
export async function embedBagongPilipinas(
  doc: PDFDocument,
): Promise<PDFImage | null> {
  try {
    return await doc.embedPng(await bagongPilipinasPng());
  } catch {
    return null;
  }
}

/**
 * Embeds the logo the hall uploaded in settings. Uploads also accept WebP, which
 * pdf-lib cannot embed, so the format is sniffed and unsupported files are
 * skipped rather than failing the certificate.
 */
export async function embedBarangayLogo(
  doc: PDFDocument,
  logoPath: string | null | undefined,
): Promise<PDFImage | null> {
  if (!logoPath) return null;
  try {
    const bytes = await readUpload(logoPath);
    if (bytes[0] === 0x89 && bytes[1] === 0x50) {
      return await doc.embedPng(bytes);
    }
    if (bytes[0] === 0xff && bytes[1] === 0xd8) {
      return await doc.embedJpg(bytes);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Anchors a logo by its top edge and keeps its aspect ratio. PCO guidelines put
 * the issuing office's own identity before the Bagong Pilipinas logo, so a
 * letterhead carries the barangay seal on the left and Bagong Pilipinas on the
 * right of the masthead.
 */
export function drawLogo(
  page: PDFPage,
  image: PDFImage,
  opts: { top: number; height: number } & ({ left: number } | { right: number }),
) {
  const width = (image.width / image.height) * opts.height;
  const x = "left" in opts ? opts.left : opts.right - width;
  page.drawImage(image, {
    x,
    y: opts.top - opts.height,
    width,
    height: opts.height,
  });
}
