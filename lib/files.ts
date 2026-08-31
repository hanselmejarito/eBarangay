import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const UPLOAD_ROOT = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./uploads");
const MAX_BYTES = 5 * 1024 * 1024;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "ebarangay";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

function useSupabaseStorage() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let supabase: SupabaseClient | null = null;
let bucketReady: Promise<void> | null = null;

function storageClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase Storage is not configured.");
  }
  if (!supabase) {
    supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabase;
}

async function ensureBucket() {
  if (!bucketReady) {
    bucketReady = (async () => {
      const client = storageClient();
      const { data: buckets, error: listError } = await client.storage.listBuckets();
      if (listError) throw new Error(`Storage list failed: ${listError.message}`);
      if (buckets?.some((b) => b.name === BUCKET)) return;
      const { error } = await client.storage.createBucket(BUCKET, {
        public: false,
        fileSizeLimit: MAX_BYTES,
        allowedMimeTypes: Object.keys(MIME_EXT),
      });
      if (error && !error.message.toLowerCase().includes("already exists")) {
        throw new Error(`Could not create storage bucket: ${error.message}`);
      }
    })();
  }
  await bucketReady;
}

function sanitizeRel(relPath: string) {
  const safe = path.posix.normalize(relPath.replaceAll("\\", "/")).replace(/^(\.\.(\/|$))+/, "");
  if (!safe || safe.startsWith("..") || path.isAbsolute(safe)) {
    throw new Error("Invalid path");
  }
  return safe;
}

export function resolveUpload(relPath: string) {
  const safe = sanitizeRel(relPath);
  const abs = path.resolve(UPLOAD_ROOT, safe);
  if (!abs.startsWith(UPLOAD_ROOT)) {
    throw new Error("Invalid path");
  }
  return abs;
}

function nextRel(folder: string, ext: string) {
  return sanitizeRel(`${folder}/${randomUUID()}.${ext}`);
}

async function writeBytes(rel: string, bytes: Uint8Array, contentType: string) {
  if (useSupabaseStorage()) {
    await ensureBucket();
    const { error } = await storageClient().storage.from(BUCKET).upload(rel, bytes, {
      contentType,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    return rel;
  }

  const abs = resolveUpload(rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, bytes);
  return rel;
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

  const rel = nextRel(folder, ext);
  return writeBytes(rel, new Uint8Array(await file.arrayBuffer()), file.type);
}

export async function saveBuffer(buf: Uint8Array, folder: string, ext: string) {
  const contentType = EXT_MIME[ext];
  if (!contentType) {
    throw new Error("Only JPEG, PNG, WebP, or PDF files are allowed");
  }
  const rel = nextRel(folder, ext);
  return writeBytes(rel, buf, contentType);
}

export async function readUpload(relPath: string) {
  const rel = sanitizeRel(relPath);
  if (useSupabaseStorage()) {
    const { data, error } = await storageClient().storage.from(BUCKET).download(rel);
    if (error || !data) {
      throw new Error(error?.message ?? "Not found");
    }
    return Buffer.from(await data.arrayBuffer());
  }
  return readFile(/* turbopackIgnore: true */ resolveUpload(rel));
}

export function fileUrl(relPath: string | null | undefined) {
  if (!relPath) return null;
  return `/api/files/${relPath.split("/").map(encodeURIComponent).join("/")}`;
}
