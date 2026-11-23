"use client";

import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/helpers";
import { ROUTES, splitLocale } from "@/lib/routes";
import { EllipsisFill, GridFill, HouseFill, TriangleFill } from "./icons";
import { MoreSheet } from "./more-sheet";

const TABS = [
  { key: "home", href: ROUTES.home, Icon: HouseFill },
  { key: "variants", href: ROUTES.variants, Icon: GridFill },
  { key: "signs", href: ROUTES.signs, Icon: TriangleFill },
] as const;

// Faol tab — yumaloq "shisha" ajratma ichida, brend rangida; qolganlari iOS kulrangida
const tabClass =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-px rounded-full text-[10px] leading-tight font-semibold no-underline transition-[background-color,color,transform] duration-200 active:scale-95";
const activeClass = "bg-black/[0.07] text-navy-2";
const idleClass = "text-[#7C7C82]";

const isActive = (pathname: string | undefined, href: string) =>
  !!pathname && !href.includes("#") && (href === "/" ? pathname === "/" : pathname.startsWith(href));

// iOS (Liquid Glass) uslubidagi pastki tab bar, faqat mobil: pastda suzib turgan shaffof kapsula,
// to'ldirilgan SF Symbols ikonkalari, tizim shrifti (iPhone'da SF Pro). iPhone safe area hisobga olinadi
export const MobileTabBar = () => (
  <Suspense fallback={<TabBarView />}>
    <TabBarWithPath />
  </Suspense>
);

const TabBarWithPath = () => <TabBarView pathname={splitLocale(usePathname()).path} />;

// pathname yo'q — prerender paytidagi holat (hech qaysi tab faol emas)
const TabBarView = ({ pathname }: { pathname?: string }) => {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t("nav.menu")}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(10px,env(safe-area-inset-bottom))] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',system-ui,sans-serif] min-[861px]:hidden"
    >
      <div className="pointer-events-auto mx-auto flex h-15.5 max-w-110 items-stretch gap-0.5 rounded-full border border-white/70 bg-white/75 p-1 shadow-[0_10px_30px_-8px_rgba(14,26,58,0.25),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl backdrop-saturate-[1.8]">
        {TABS.map(({ key, href, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={key}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(tabClass, active ? activeClass : idleClass)}
            >
              <Icon size={25} />
              <span className="max-w-full truncate">{t(`nav.${key}`)}</span>
            </Link>
          );
        })}
        <MoreTab />
      </div>
    </nav>
  );
};

// "Ko'proq": tab bar'ga sig'maydigan hamma narsa (kirish/profil, til, bo'limlar) — pastdan chiqadigan oynada
const MoreTab = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(tabClass, open ? activeClass : idleClass)}
      >
        <EllipsisFill size={25} />
        <span className="max-w-full truncate">{t("more.tab")}</span>
      </button>
      {/* Portal: tab bar'dagi backdrop-blur fixed elementni o'ziga bog'lab qo'yadi — oyna ekran kengligida bo'lishi uchun body'ga */}
      {open && createPortal(<MoreSheet onClose={() => setOpen(false)} />, document.body)}
    </>
  );
};
