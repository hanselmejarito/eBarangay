import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readUpload } from "@/lib/files";
import { prisma } from "@/lib/prisma";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const rel = path.join("/");
  const folder = path[0];

  const session = await auth();
  const role = session?.user?.id ? session.user.role : null;
  const isStaff = role === "STAFF" || role === "ADMIN";

  const publicFolders = new Set([
    "announcements",
    "achievements",
    "officials",
    "settings",
    "certificates",
  ]);
  if (folder === "receipts" && !isStaff) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!publicFolders.has(folder)) {
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (folder === "ids" && !isStaff) {
      const mine = await prisma.resident.findFirst({
        where: { userId: session.user.id, idDocumentPath: rel },
      });
      if (!mine) return new NextResponse("Forbidden", { status: 403 });
    }
    if (folder === "photos" && !isStaff) {
      const mine = await prisma.resident.findFirst({
        where: { userId: session.user.id, photoPath: rel },
      });
      if (!mine) return new NextResponse("Forbidden", { status: 403 });
    }
    if (folder === "complaints" && !isStaff) {
      const mine = await prisma.complaint.findFirst({
        where: { reportedById: session.user.id, photoPaths: { has: rel } },
      });
      if (!mine) return new NextResponse("Forbidden", { status: 403 });
    }
  }

  try {
    const buf = await readUpload(rel);
    const ext = rel.split(".").pop()?.toLowerCase() ?? "";
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
