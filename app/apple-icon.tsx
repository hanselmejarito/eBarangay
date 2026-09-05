import { getSiteIcon, siteIconResponse } from "@/lib/site-icon";

export const dynamic = "force-dynamic";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return siteIconResponse(await getSiteIcon());
}
