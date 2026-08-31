import { notFound } from "next/navigation";
import { AnnouncementForm } from "@/features/announcements/announcement-form";
import { prisma } from "@/lib/prisma";
import { fileUrl } from "@/lib/files";
import { isLiveEmailConfigured } from "@/lib/notify";
import { toManilaDateTimeLocal } from "@/lib/datetime";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.announcement.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Edit announcement</h1>
      <AnnouncementForm
        id={item.id}
        liveEmail={isLiveEmailConfigured()}
        defaults={{
          title: item.title,
          content: item.content,
          priority: item.priority,
          publishedAt: toManilaDateTimeLocal(item.publishedAt),
          expiresAt: toManilaDateTimeLocal(item.expiresAt),
          coverUrl: fileUrl(item.coverPath),
        }}
      />
    </div>
  );
}
