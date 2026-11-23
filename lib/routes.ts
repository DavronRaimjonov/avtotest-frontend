import type { AttemptSource, AttemptStatus, TestLang } from "@/@types";
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
  saved: "/saved",
  mistakes: "/mistakes",
  // Jamoaviy test: kod bilan qo'shilish + mening testlarim, /group-test/<id> — lobby / test / natija
  groupTests: "/group-test",
  groupTest: (id: string) => `/group-test/${id}`,
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
// Mehmon testi (/test/guest, /result/guest) bundan mustasno — holati brauzerda.
// saved, mistakes — saqlangan savollar va xatolarim (faqat kirganlarga)
export const PROTECTED_SEGMENTS = ["test", "result", "saved", "mistakes"];

// Faqat ichki sahifasi himoyalangan: /group-test (kod kiritish) mehmonga kirish taklifini o'zi ko'rsatadi,
// /group-test/<id> — tokensiz kirilsa variantlarga qaytariladi
export const PROTECTED_DETAIL_SEGMENTS = ["group-test"];

// pathname til prefiksi bilan ham bo'lishi mumkin
export const isProtectedPath = (pathname: string) => {
  const [, first = "", second = ""] = splitLocale(pathname).path.split("/");
  if (PROTECTED_DETAIL_SEGMENTS.includes(first)) return second !== "";
  return PROTECTED_SEGMENTS.includes(first) && second !== GUEST_ID;
};

// Tarixdagi urinish havolasi: jamoaviy test o'z sahifasida, qolganlari — natija yoki davom ettirish
export const attemptHref = (a: { id: string; source: AttemptSource; status: AttemptStatus; groupTestId?: string | null }) => {
  if (a.source === "group") return a.groupTestId ? ROUTES.groupTest(a.groupTestId) : ROUTES.groupTests;
  return a.status === "finished" ? ROUTES.result(a.id) : ROUTES.test(a.id);
};

// Header navigatsiyasi (matn — nav.<key> tarjimasi). Hali sahifasi yo'q bo'limlar "#" ga olib boradi
export const NAV_LINKS = [
  { href: ROUTES.home, key: "home" },
  { href: ROUTES.variants, key: "variants" },
  { href: "/#topics", key: "topics" },
  { href: ROUTES.signs, key: "signs" },
  { href: "#", key: "manual" },
] as const;
