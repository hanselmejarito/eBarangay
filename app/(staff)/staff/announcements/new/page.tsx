import { AnnouncementForm } from "@/features/announcements/announcement-form";
import { isLiveEmailConfigured } from "@/lib/notify";
import { toManilaDateTimeLocal } from "@/lib/datetime";

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">New announcement</h1>
      <AnnouncementForm
        liveEmail={isLiveEmailConfigured()}
        defaults={{ publishedAt: toManilaDateTimeLocal(new Date()) }}
      />
    </div>
  );
}
