import { getSiteIcon, siteIconResponse } from "@/lib/site-icon";

export const dynamic = "force-dynamic";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return siteIconResponse(await getSiteIcon());
}
