import { notFound } from "next/navigation";
import { AchievementForm } from "@/features/achievements/achievement-form";
import { getAchievementById } from "@/lib/achievement-sql";
import { fileUrl } from "@/lib/files";

function localInput(d: Date | null) {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditAchievementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getAchievementById(id);
  if (!item) notFound();

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Edit achievement</h1>
      <AchievementForm
        id={item.id}
        defaults={{
          title: item.title,
          description: item.description,
          category: item.category,
          awardedBy: item.awardedBy,
          awardedAt: item.awardedAt.toISOString().slice(0, 10),
          publishedAt: localInput(item.publishedAt),
          imageUrl: fileUrl(item.imagePath),
        }}
      />
    </div>
  );
}
