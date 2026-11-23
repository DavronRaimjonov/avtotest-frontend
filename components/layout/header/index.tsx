import { Suspense } from "react";
import { Logo } from "../logo";
import { AccountLink } from "./account-link";
import { GroupTestLink } from "./group-test-link";
import { LangSwitcher } from "./lang-switcher";
import { PlanBadge } from "./plan-badge";
import { NavLinks, NavList } from "./nav-links";

// Yuqorida qotib turadi (sticky). Mobilda navigatsiya va akkaunt pastki tab bar'da (MobileTabBar)
export const Header = () => (
  <header className="sticky top-0 z-40 border-b border-white/8 bg-navy/90 text-white backdrop-blur-xl backdrop-saturate-150">
    <div className="mx-auto flex h-15 max-w-300 items-center gap-8 px-4 sm:px-6 min-[861px]:h-18">
      <Logo />
      <Suspense fallback={<NavList />}>
        <NavLinks />
      </Suspense>
      <div className="ml-auto flex items-center gap-2.5">
        <LangSwitcher />
        <PlanBadge />
        <GroupTestLink />
        <div className="max-[860px]:hidden">
          <AccountLink />
        </div>
      </div>
    </div>
  </header>
);
