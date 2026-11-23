import { Link } from "@/components/ui/link";
import { cn } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";

// Brend: PravaKey. Fayllar — public/brand (pravakey-logo.svg, pravakey-logo-dark.svg, pravakey-icon.svg).
// Saytda belgi inline SVG, nomi HTML matn: <img> ichidagi SVG sayt shriftini (Manrope) yuklay olmaydi
export const BRAND_NAME = "PravaKey";

// tone: dark — to'q fonda (header, footer): kalit tishlari oq; light — oq fonda: to'q ko'k
export const BrandMark = ({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) => {
  const teeth = tone === "dark" ? "#FFFFFF" : "#0E1A3A";
  return (
    <svg viewBox="0 0 98 66" className={className} aria-hidden="true">
      <rect x="46" y="27" width="50" height="12" rx="3" fill={teeth} />
      <rect x="72" y="39" width="8" height="10" rx="1.5" fill={teeth} />
      <rect x="85" y="39" width="8" height="15" rx="1.5" fill={teeth} />
      <circle cx="32" cy="33" r="31" fill="#FFC21A" />
      <circle cx="32" cy="33" r="25" fill="none" stroke={teeth} strokeWidth="2" opacity=".15" />
      <text
        x="32"
        y="45"
        textAnchor="middle"
        fontFamily="var(--font-manrope), Arial, sans-serif"
        fontWeight="800"
        fontSize="34"
        fill="#0E1A3A"
      >
        P
      </text>
    </svg>
  );
};

// "Prava" + sariq "Key" (to'q fonda accent, oq fonda to'qroq sariq — dizayndagi pravakey-logo.svg kabi)
export const BrandName = ({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) => (
  <span className={cn("font-extrabold tracking-tight", tone === "dark" ? "text-white" : "text-navy", className)}>
    Prava<span className={tone === "dark" ? "text-accent" : "text-[#C78A00]"}>Key</span>
  </span>
);

export const Logo = () => (
  <Link href={ROUTES.home} aria-label={BRAND_NAME} className="flex items-center gap-2 no-underline">
    <BrandMark className="h-8 w-auto" />
    <BrandName className="text-xl" />
  </Link>
);
