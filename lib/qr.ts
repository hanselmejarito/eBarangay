import { createHmac, timingSafeEqual } from "crypto";
import QRCode from "qrcode";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

export function signPayload(payload: string) {
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyPayload(token: string) {
  const i = token.lastIndexOf(".");
  if (i <= 0) return null;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return payload;
}

export function residentToken(qrPublicId: string) {
  return signPayload(`r:${qrPublicId}`);
}

export function certificateToken(id: string) {
  return signPayload(`c:${id}`);
}

export function parseSignedToken(token: string) {
  const payload = verifyPayload(token);
  if (!payload) return null;
  if (payload.startsWith("r:")) return { kind: "resident" as const, id: payload.slice(2) };
  if (payload.startsWith("c:")) return { kind: "certificate" as const, id: payload.slice(2) };
  return null;
}

export async function qrDataUrl(text: string) {
  return QRCode.toDataURL(text, { margin: 1, width: 240 });
}

export function absUrl(path: string) {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}
