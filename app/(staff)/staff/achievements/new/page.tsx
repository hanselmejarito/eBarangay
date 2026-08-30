import { AchievementForm } from "@/features/achievements/achievement-form";

export default function NewAchievementPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Add achievement</h1>
      <AchievementForm />
    </div>
  );
}
