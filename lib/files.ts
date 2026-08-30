import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const MAX_BYTES = 5 * 1024 * 1024;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export function resolveUpload(relPath: string) {
  const safe = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const abs = path.resolve(UPLOAD_ROOT, safe);
  if (!abs.startsWith(UPLOAD_ROOT)) {
    throw new Error("Invalid path");
  }
  return abs;
}

export async function saveUpload(file: File, folder: string) {
  if (!file || file.size === 0) {
    throw new Error("No file uploaded");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File too large (max 5MB)");
  }
  const ext = MIME_EXT[file.type];
  if (!ext) {
    throw new Error("Only JPEG, PNG, WebP, or PDF files are allowed");
  }

  const name = `${randomUUID()}.${ext}`;
  const rel = `${folder}/${name}`.replaceAll("\\", "/");
  const abs = resolveUpload(rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, Buffer.from(await file.arrayBuffer()));
  return rel;
}

export async function saveBuffer(buf: Uint8Array, folder: string, ext: string) {
  const name = `${randomUUID()}.${ext}`;
  const rel = `${folder}/${name}`.replaceAll("\\", "/");
  const abs = resolveUpload(rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, buf);
  return rel;
}

export async function readUpload(relPath: string) {
  return readFile(/* turbopackIgnore: true */ resolveUpload(relPath));
}

export function fileUrl(relPath: string | null | undefined) {
  if (!relPath) return null;
  return `/api/files/${relPath.split("/").map(encodeURIComponent).join("/")}`;
}
