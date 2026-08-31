import {
  insertAnnouncementNotice,
  listAnnouncementRecipients,
  type NoticeRecipient,
} from "@/lib/announcement-notice-sql";
import {
  announcementEmailHtml,
  announcementEmailSubject,
  announcementEmailText,
} from "@/lib/announcement-email";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

type ChannelStatus = "SENT" | "RECORDED" | "SKIPPED";

const TEST_FROM = "Barangay Hall <onboarding@resend.dev>";

function portalBaseUrl() {
  return (process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<ChannelStatus> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn(
      "Announcement email recorded only: set RESEND_API_KEY in .env and restart npm run dev.",
    );
    return "RECORDED";
  }
  const from = process.env.ANNOUNCE_FROM_EMAIL?.trim() || TEST_FROM;

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
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`Resend failed for ${to}: ${res.status} ${detail}`);
      return "RECORDED";
    }
    return "SENT";
  } catch (err) {
    console.error(`Resend failed for ${to}:`, err);
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
}) {
  const [recipients, settings, item] = await Promise.all([
    listAnnouncementRecipients(),
    getSettings(),
    prisma.announcement.findUnique({ where: { id: input.announcementId } }),
  ]);
  if (!item) return { total: 0, email: 0, sms: 0, recipients: [] as NoticeRecipient[] };

  const portalUrl = `${portalBaseUrl()}/portal/notices`;
  const emailInput = {
    barangayName: settings.barangayName,
    cityMunicipality: settings.cityMunicipality,
    province: settings.province,
    address: settings.address,
    contactNumber: settings.contactNumber,
    captainName: settings.captainName,
    title: item.title,
    content: item.content,
    priority: item.priority,
    publishedAt: item.publishedAt,
    expiresAt: item.expiresAt,
    hasCover: Boolean(item.coverPath),
    portalUrl,
  };
  const subject = announcementEmailSubject(settings.barangayName, item.title);
  const text = announcementEmailText(emailInput);
  const html = announcementEmailHtml(emailInput);
  let email = 0;
  let sms = 0;

  for (const r of recipients) {
    const emailStatus = r.email
      ? await sendEmail(r.email, subject, text, html)
      : "SKIPPED";
    const smsStatus = r.mobile
      ? await sendSms(r.mobile, item.title, item.content)
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

export function isLiveEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
