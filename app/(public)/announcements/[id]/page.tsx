import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { PRIORITY_LABELS } from "@/lib/constants";
import { fileUrl } from "@/lib/files";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.announcement.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Badge variant="outline">{PRIORITY_LABELS[item.priority]}</Badge>
      <h1 className="mt-3 font-serif text-3xl font-semibold">{item.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {item.publishedAt
          ? item.publishedAt.toLocaleDateString("en-PH", {
              dateStyle: "long",
            })
          : null}
      </p>
      {item.coverPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fileUrl(item.coverPath) ?? ""}
          alt=""
          className="mt-6 w-full rounded-xl object-cover"
        />
      ) : null}
      <div className="mt-6 whitespace-pre-wrap text-base leading-7">{item.content}</div>
    </article>
  );
}
