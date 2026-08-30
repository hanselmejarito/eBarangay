import { OfficialForm } from "@/features/officials/official-form";

export default function NewOfficialPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Add official</h1>
      <OfficialForm />
    </div>
  );
}
