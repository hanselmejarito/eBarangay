export function FlagStripe() {
  return (
    <div
      className="flex h-1.5 w-full shrink-0"
      aria-hidden
      title="Colors of the Philippine flag"
    >
      <div className="flex-1 bg-ph-blue" />
      <div className="w-10 bg-ph-gold sm:w-16" />
      <div className="flex-1 bg-ph-red" />
    </div>
  );
}
