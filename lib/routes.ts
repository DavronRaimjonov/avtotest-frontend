import type { TestLang } from "@/@types";
import { DEFAULT_LANGUAGE, GUEST_ID, LANGUAGES } from "./constants";

// Yo'llar tilsiz yoziladi; Link / useRouter (components/ui/link, hooks/useRouter) til prefiksini o'zi qo'shadi
export const ROUTES = {
  home: "/",
  variants: "/variants",
  test: (attemptId: string) => `/test/${attemptId}`,
  result: (attemptId: string) => `/result/${attemptId}`,
  signs: "/signs",
  signGroup: (group: string) => `/signs/${group}`,
  sign: (group: string, sign: string) => `/signs/${group}/${sign}`,
} as const;

// "/variants" → "/variants" (uzb), "/ru/variants" (ru). "/#topics" → "/ru#topics". "#", "https://..." — o'zgarmaydi
export const localePath = (lang: TestLang, path: string) => {
  if (!path.startsWith("/") || lang === DEFAULT_LANGUAGE) return path;
  return path === "/" || path.startsWith("/#") || path.startsWith("/?") ? `/${lang}${path.slice(1)}` : `/${lang}${path}`;
};

// Brauzerdagi yo'l → til va tilsiz yo'l. "/ru/test/x" → { lang: "ru", path: "/test/x" }, "/test/x" → { lang: "uzb", ... }
export const splitLocale = (pathname: string): { lang: TestLang; path: string } => {
  const [, first = ""] = pathname.split("/");
  const lang = LANGUAGES.find((l) => l === first);
  if (!lang) return { lang: DEFAULT_LANGUAGE, path: pathname || "/" };
  return { lang, path: pathname.slice(lang.length + 1) || "/" };
};

// Token talab qiladigan sahifalar (yo'lning birinchi segmenti): tokensiz kirilsa variantlarga qaytariladi.
// Mehmon testi (/test/guest, /result/guest) bundan mustasno — holati brauzerda
export const PROTECTED_SEGMENTS = ["test", "result"];

// pathname til prefiksi bilan ham bo'lishi mumkin
export const isProtectedPath = (pathname: string) => {
  const [, first = "", second = ""] = splitLocale(pathname).path.split("/");
  return PROTECTED_SEGMENTS.includes(first) && second !== GUEST_ID;
};

// Header navigatsiyasi (matn — nav.<key> tarjimasi). Hali sahifasi yo'q bo'limlar "#" ga olib boradi
export const NAV_LINKS = [
  { href: ROUTES.home, key: "home" },
  { href: ROUTES.variants, key: "variants" },
  { href: "/#topics", key: "topics" },
  { href: ROUTES.signs, key: "signs" },
  { href: "#", key: "manual" },
] as const;
