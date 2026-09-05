import { cn } from "@/lib/utils";

/**
 * Shows the logo the hall uploaded in settings, or `placeholder` when none is
 * set. There is deliberately no built-in default image: a barangay seal names a
 * specific barangay, so an unset logo has to stay generic.
 *
 * Takes a resolved URL rather than the stored path so this also works inside
 * client components, which cannot import the server-only file helpers.
 */
export function BarangayLogo({
  src,
  barangayName,
  className,
  placeholder,
}: {
  src: string | null;
  barangayName: string;
  className?: string;
  placeholder: React.ReactNode;
}) {
  if (!src) return placeholder;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Seal of ${barangayName}`}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
