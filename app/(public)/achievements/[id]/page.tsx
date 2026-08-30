import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getAchievementById } from "@/lib/achievement-sql";
import { ACHIEVEMENT_LABELS } from "@/lib/constants";
import { fileUrl } from "@/lib/files";

export default async function AchievementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getAchievementById(id);
  if (!item) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Badge variant="outline">{ACHIEVEMENT_LABELS[item.category]}</Badge>
      <h1 className="mt-3 font-serif text-3xl font-semibold">{item.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {item.awardedAt.toLocaleDateString("en-PH", { dateStyle: "long" })}
        {item.awardedBy ? ` · Awarded by ${item.awardedBy}` : ""}
      </p>
      {item.imagePath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fileUrl(item.imagePath) ?? ""}
          alt={item.title}
          className="mt-6 w-full rounded-xl object-contain"
        />
      ) : null}
      <div className="mt-6 whitespace-pre-wrap text-base leading-7">{item.description}</div>
    </article>
  );
}
