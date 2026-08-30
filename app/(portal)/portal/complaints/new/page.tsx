import { ComplaintForm } from "@/features/complaints/complaint-form";

export default function NewComplaintPage() {
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Submit a complaint</h1>
      <p className="text-sm text-muted-foreground">
        This is a service desk, not a blotter or Katarungang Pambarangay case.
      </p>
      <ComplaintForm />
    </div>
  );
}
