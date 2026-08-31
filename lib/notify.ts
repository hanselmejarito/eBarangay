import {
  insertAnnouncementNotice,
  listAnnouncementRecipients,
  type NoticeRecipient,
} from "@/lib/announcement-notice-sql";

type ChannelStatus = "SENT" | "RECORDED" | "SKIPPED";

async function sendEmail(to: string, title: string, content: string): Promise<ChannelStatus> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ANNOUNCE_FROM_EMAIL;
  if (!key || !from) return "RECORDED";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: title,
        text: content,
      }),
    });
    return res.ok ? "SENT" : "RECORDED";
  } catch {
    return "RECORDED";
  }
}

async function sendSms(to: string, title: string, content: string): Promise<ChannelStatus> {
  const key = process.env.SEMAPHORE_API_KEY;
  if (!key) return "RECORDED";

  const message = `${title}\n${content}`.slice(0, 160);
  try {
    const body = new URLSearchParams({
      apikey: key,
      number: to,
      message,
    });
    const res = await fetch("https://api.semaphore.co/api/v4/messages", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    return res.ok ? "SENT" : "RECORDED";
  } catch {
    return "RECORDED";
  }
}

export async function notifyResidentsOfAnnouncement(input: {
  announcementId: string;
  title: string;
  content: string;
}) {
  const recipients = await listAnnouncementRecipients();
  let email = 0;
  let sms = 0;

  for (const r of recipients) {
    const emailStatus = r.email
      ? await sendEmail(r.email, input.title, input.content)
      : "SKIPPED";
    const smsStatus = r.mobile
      ? await sendSms(r.mobile, input.title, input.content)
      : "SKIPPED";

    if (emailStatus !== "SKIPPED") email += 1;
    if (smsStatus !== "SKIPPED") sms += 1;

    await insertAnnouncementNotice({
      announcementId: input.announcementId,
      residentId: r.id,
      email: r.email,
      mobile: r.mobile,
      emailStatus,
      smsStatus,
    });
  }

  return { total: recipients.length, email, sms, recipients: recipients as NoticeRecipient[] };
}
