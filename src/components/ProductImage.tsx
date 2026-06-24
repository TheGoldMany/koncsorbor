import { cn } from "@/lib/utils";

// Renders a product image, or a tasteful leather-toned placeholder when none exists.
export function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} />;
  }
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-leather-200 to-leather-400",
        className
      )}
      aria-label={alt}
    >
      <svg width="64" height="64" viewBox="0 0 100 100" className="opacity-50">
        <path d="M20 35 Q50 18 80 35" fill="none" stroke="#5c3b29" strokeWidth="4" strokeLinecap="round" />
        <text x="50" y="70" textAnchor="middle" fontFamily="Georgia, serif" fontSize="40" fontWeight="700" fill="#5c3b29">
          K
        </text>
      </svg>
    </div>
  );
}
