function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatWhen(value: Date | null | undefined) {
  if (!value) return null;
  return value.toLocaleString("en-PH", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  });
}

function bodyHtml(content: string) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (blocks.length === 0) return "";
  return blocks
    .map(
      (block) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#1c2430;">${escapeHtml(block).replaceAll("\n", "<br/>")}</p>`,
    )
    .join("");
}

function priorityStyle(priority: string) {
  if (priority === "URGENT") {
    return { label: "Urgent", bg: "#CE1126", fg: "#ffffff" };
  }
  if (priority === "HIGH") {
    return { label: "High priority", bg: "#FCD116", fg: "#1c2430" };
  }
  return { label: "Official notice", bg: "#0038A8", fg: "#ffffff" };
}

export function announcementEmailSubject(barangayName: string, title: string) {
  return `${barangayName}: ${title}`;
}

export type AnnouncementEmailInput = {
  barangayName: string;
  cityMunicipality: string;
  province: string;
  address: string;
  contactNumber: string | null;
  captainName: string;
  title: string;
  content: string;
  priority: string;
  publishedAt: Date | null;
  expiresAt: Date | null;
  hasCover: boolean;
  viewUrl: string;
};

export function announcementEmailText(input: AnnouncementEmailInput) {
  const posted = formatWhen(input.publishedAt);
  const until = formatWhen(input.expiresAt);
  const contact = input.contactNumber
    ? `Contact the hall: ${input.contactNumber}`
    : "Please visit the barangay hall for questions.";
  return [
    "Republic of the Philippines",
    "Office of the Punong Barangay",
    input.barangayName,
    `${input.cityMunicipality}, ${input.province}`,
    "",
    "OFFICIAL ANNOUNCEMENT",
    input.title,
    `Priority: ${priorityStyle(input.priority).label}`,
    posted ? `Posted: ${posted}` : "",
    until ? `Until: ${until}` : "",
    "",
    input.content,
    input.hasCover ? "A cover photo is included. Open the announcement page to view it." : "",
    "",
    `Read the announcement: ${input.viewUrl}`,
    "",
    `This message was sent by ${input.barangayName}. Please do not reply to this email.`,
    contact,
    `Punong Barangay ${input.captainName}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function announcementEmailHtml(input: AnnouncementEmailInput) {
  const badge = priorityStyle(input.priority);
  const posted = formatWhen(input.publishedAt);
  const until = formatWhen(input.expiresAt);
  const contact = input.contactNumber
    ? escapeHtml(input.contactNumber)
    : "Visit the barangay hall";
  const preview = escapeHtml(input.content.replace(/\s+/g, " ").slice(0, 140));
  const metaRows = [
    posted
      ? `<tr><td style="padding:0 0 6px;font-size:13px;color:#5c6570;"><strong style="color:#0b1f4d;">Posted</strong> · ${escapeHtml(posted)}</td></tr>`
      : "",
    until
      ? `<tr><td style="padding:0 0 6px;font-size:13px;color:#5c6570;"><strong style="color:#0b1f4d;">Until</strong> · ${escapeHtml(until)}</td></tr>`
      : "",
  ].join("");

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#eef1f6;font-family:Georgia,'Times New Roman',serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${preview}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #d5dbe6;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="height:6px;background:#0038A8;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="height:4px;background:#FCD116;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="height:6px;background:#CE1126;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:28px 32px 16px;text-align:center;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#5c6570;font-family:Arial,Helvetica,sans-serif;">
                  Republic of the Philippines
                </p>
                <p style="margin:0 0 8px;font-size:13px;color:#0038A8;font-weight:bold;">
                  Office of the Punong Barangay
                </p>
                <p style="margin:0;font-size:22px;line-height:1.3;color:#0b1f4d;">
                  ${escapeHtml(input.barangayName)}
                </p>
                <p style="margin:8px 0 0;font-size:13px;color:#5c6570;font-family:Arial,Helvetica,sans-serif;">
                  ${escapeHtml(input.cityMunicipality)}, ${escapeHtml(input.province)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 16px;" align="center">
                <span style="display:inline-block;padding:5px 12px;border-radius:999px;background:${badge.bg};color:${badge.fg};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;">
                  ${badge.label}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 8px;">
                <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5c6570;">
                  Title
                </p>
                <h1 style="margin:0;font-size:22px;line-height:1.35;color:#0b1f4d;">
                  ${escapeHtml(input.title)}
                </h1>
              </td>
            </tr>
            ${
              metaRows
                ? `<tr><td style="padding:12px 32px 0;font-family:Arial,Helvetica,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${metaRows}</table></td></tr>`
                : ""
            }
            <tr>
              <td style="padding:20px 32px 8px;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5c6570;">
                  Message
                </p>
                ${bodyHtml(input.content)}
                ${
                  input.hasCover
                    ? `<p style="margin:8px 0 0;font-size:13px;color:#5c6570;">A cover photo was added. Open the announcement page to view it.</p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:8px 32px 28px;">
                <a href="${escapeHtml(input.viewUrl)}" style="display:inline-block;background:#0038A8;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;padding:12px 22px;border-radius:6px;">
                  Open announcement
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 24px;border-top:1px solid #e4e8f0;background:#f7f8fb;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#5c6570;">
                  This official notice was sent by ${escapeHtml(input.barangayName)}.
                  Please do not reply to this email.
                </p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:#5c6570;">
                  ${escapeHtml(input.address)} · ${contact}<br/>
                  Punong Barangay ${escapeHtml(input.captainName)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
