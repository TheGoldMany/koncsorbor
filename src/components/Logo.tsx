import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  const stroke = light ? "#f7f1e6" : "#5c3b29";
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg width="44" height="44" viewBox="0 0 100 100" aria-hidden className="shrink-0">
        <circle cx="50" cy="50" r="47" fill="none" stroke={stroke} strokeWidth="2" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={stroke} strokeWidth="1" />
        {/* stylized bull horns + K */}
        <path
          d="M28 40 Q50 26 72 40"
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M28 40 q-6 6 -2 12" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <path d="M72 40 q6 6 2 12" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <text
          x="50"
          y="68"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="34"
          fontWeight="700"
          fill={stroke}
        >
          K
        </text>
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif text-lg font-bold tracking-wide",
            light ? "text-cream" : "text-leather-900"
          )}
        >
          KONCSOR
        </span>
        <span
          className={cn(
            "text-[0.62rem] font-semibold uppercase tracking-[0.28em]",
            light ? "text-leather-200" : "text-leather-600"
          )}
        >
          Bőrkereskedés
        </span>
      </span>
    </span>
  );
}
