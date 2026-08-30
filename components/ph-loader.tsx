import { cn } from "@/lib/utils";

export function PhLoader({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-4",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="ph-sun" aria-hidden>
        <svg viewBox="0 0 64 64" className="size-14">
          <g className="ph-sun-rays origin-center">
            {Array.from({ length: 8 }, (_, i) => (
              <polygon
                key={i}
                points="32,4 35.2,18 32,16.4 28.8,18"
                transform={`rotate(${i * 45} 32 32)`}
                fill="#FCD116"
              />
            ))}
          </g>
          <circle cx="32" cy="32" r="9" fill="#FCD116" />
          <circle cx="32" cy="32" r="5.5" fill="#E5B800" />
        </svg>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
