import { notFound } from "next/navigation";
import { OfficialForm } from "@/features/officials/official-form";
import { getOfficial } from "@/lib/official-sql";
import { fileUrl } from "@/lib/files";

export default async function EditOfficialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getOfficial(id);
  if (!item) notFound();

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Update official</h1>
      <OfficialForm
        id={item.id}
        defaults={{
          name: item.name,
          role: item.role,
          committee: item.committee,
          contactNumber: item.contactNumber,
          sortOrder: item.sortOrder,
          published: item.published,
          photoUrl: fileUrl(item.photoPath),
        }}
      />
    </div>
  );
}
