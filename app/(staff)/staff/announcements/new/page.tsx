import { AnnouncementForm } from "@/features/announcements/announcement-form";

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">New announcement</h1>
      <AnnouncementForm />
    </div>
  );
}
