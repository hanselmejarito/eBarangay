"use server";

import { redirect } from "next/navigation";
import { getResidentContext, requireUser } from "@/lib/rbac";
import { markNoticeRead } from "@/lib/announcement-notice-sql";

export async function openNoticeAction(formData: FormData) {
  const user = await requireUser();
  const me = await getResidentContext(user.id);
  if (!me) redirect("/portal");
  const id = String(formData.get("id") ?? "");
  const announcementId = String(formData.get("announcementId") ?? "");
  await markNoticeRead(id, me.id);
  redirect(`/announcements/${announcementId}`);
}
