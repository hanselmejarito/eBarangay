import { notFound } from "next/navigation";
import { AchievementForm } from "@/features/achievements/achievement-form";
import { getAchievementById } from "@/lib/achievement-sql";
import { fileUrl } from "@/lib/files";
import { toManilaDateInput, toManilaDateTimeLocal } from "@/lib/datetime";

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
          awardedAt: toManilaDateInput(item.awardedAt),
          publishedAt: toManilaDateTimeLocal(item.publishedAt),
          imageUrl: fileUrl(item.imagePath),
        }}
      />
    </div>
  );
}
