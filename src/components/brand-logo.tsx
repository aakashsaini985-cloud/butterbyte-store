import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";

type Props = {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  asLink?: boolean;
  className?: string;
};

/**
 * Unified brand wordmark used in header & footer.
 * "BUTTER" in display serif, "BYTE" in gold italic, "STORE" in small spaced caps.
 */
export function BrandLogo({
  variant = "dark",
  size = "md",
  withTagline = false,
  asLink = true,
  className = "",
}: Props) {
  const sizes = {
    sm: { main: "text-lg md:text-xl", store: "text-[8px] md:text-[9px]", gap: "mt-0.5" },
    md: { main: "text-xl md:text-2xl", store: "text-[9px] md:text-[10px]", gap: "mt-0.5" },
    lg: { main: "text-3xl md:text-4xl", store: "text-[10px] md:text-xs", gap: "mt-1" },
  }[size];

  const mainColor = variant === "light" ? "text-white" : "text-foreground";
  const storeColor = variant === "light" ? "text-white/70" : "text-muted-foreground";
  const taglineColor = variant === "light" ? "text-white/50" : "text-muted-foreground";

  const inner = (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span className={`font-display font-semibold tracking-tight ${sizes.main} ${mainColor}`}>
        Butter<span className="italic text-[oklch(0.78_0.13_85)]">byte</span>
        <span className={`align-baseline ml-1.5 md:ml-2 tracking-[0.3em] uppercase font-sans font-medium ${sizes.store} ${storeColor}`}>
          Store
        </span>
      </span>
      {withTagline && (
        <span className={`uppercase tracking-[0.28em] text-[9px] md:text-[10px] ${sizes.gap} ${taglineColor}`}>
          {SITE.tagline}
        </span>
      )}
    </span>
  );

  if (!asLink) return inner;
  return (
    <Link to="/" aria-label={SITE.brand} className="inline-block">
      {inner}
    </Link>
  );
}
