"use client";

import { Link } from "@/components/ui/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/helpers";
import { NAV_LINKS, splitLocale } from "@/lib/routes";

// pathname — tilsiz yo'l. Yo'q bo'lsa (prerender paytidagi Suspense fallback) hech qaysi havola faol emas
export const NavList = ({ pathname }: { pathname?: string }) => {
  const { t } = useTranslation();
  return (
  <nav className="hidden gap-7 text-[15px] font-semibold min-[861px]:flex">
    {NAV_LINKS.map(({ href, key }) => (
      <Link
        key={key}
        href={href}
        className={cn(
          "relative text-pale no-underline transition-colors hover:text-white",
          "after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:scale-x-0 after:rounded-sm after:bg-accent after:transition-transform hover:after:scale-x-100",
          href !== "#" && pathname && (href === "/" ? pathname === "/" : pathname.startsWith(href)) && "text-white",
        )}
      >
        {t(`nav.${key}`)}
      </Link>
    ))}
  </nav>
  );
};

export const NavLinks = () => <NavList pathname={splitLocale(usePathname()).path} />;
