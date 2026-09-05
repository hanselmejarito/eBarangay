import { cn } from "@/lib/utils";

/**
 * Bagong Pilipinas logo (Memorandum Circular No. 24, s. 2023).
 *
 * PCO logo usage guidelines constrain how this may be rendered:
 * - never recoloured or re-proportioned, and at least 1 inch tall;
 * - clear space on all sides equal to the height of the wordmark "B";
 * - on backgrounds that are too dark, the guidelines call for the
 *   "BAGONG PILIPINAS" wordmark to turn white rather than for the logo to sit
 *   on a plate, which is what `tone` selects.
 */
const INTRINSIC_WIDTH = 617.7105255;
const INTRINSIC_HEIGHT = 576;
const WORDMARK_B_RATIO = 0.1;

export function BagongPilipinasLogo({
  height = 96,
  tone = "light",
  className,
}: {
  height?: number;
  tone?: "light" | "dark" | "auto";
  className?: string;
}) {
  const width = Math.round((height * INTRINSIC_WIDTH) / INTRINSIC_HEIGHT);
  const clearSpace = Math.max(2, Math.round(height * WORDMARK_B_RATIO));

  function mark(src: string, visibility?: string) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="Bagong Pilipinas"
        width={width}
        height={height}
        className={visibility}
        style={{ width, height }}
      />
    );
  }

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      style={{ padding: clearSpace }}
    >
      {tone !== "dark"
        ? mark("/bagong-pilipinas.svg", tone === "auto" ? "dark:hidden" : undefined)
        : null}
      {tone !== "light"
        ? mark(
            "/bagong-pilipinas-on-dark.svg",
            tone === "auto" ? "hidden dark:block" : undefined,
          )
        : null}
    </span>
  );
}
