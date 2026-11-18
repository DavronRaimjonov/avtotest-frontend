import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_KEY, DEFAULT_LANGUAGE, REFRESH_TOKEN_KEY } from "@/lib/constants";
import { isProtectedPath, localePath, ROUTES, splitLocale } from "@/lib/routes";

// 1) Til: /uzc/..., /ru/... — o'z holicha; prefikssiz yo'l — ichkarida /uzb/... ga rewrite (URL o'zgarmaydi);
//    /uzb/... — prefikssiz manzilga redirect (bitta sahifaning ikki manzili bo'lmasin).
// 2) Token: faqat optimistik tekshiruv (haqiqiyligini backend hal qiladi — 401 → refresh)
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const [, first = ""] = pathname.split("/");
  const { lang, path } = splitLocale(pathname);

  if (first === DEFAULT_LANGUAGE) {
    return NextResponse.redirect(new URL(path + search, request.url));
  }

  const hasSession =
    request.cookies.has(ACCESS_TOKEN_KEY) || request.cookies.has(REFRESH_TOKEN_KEY);
  if (!hasSession && isProtectedPath(pathname)) {
    return NextResponse.redirect(new URL(localePath(lang, ROUTES.variants), request.url));
  }

  if (lang === DEFAULT_LANGUAGE) {
    return NextResponse.rewrite(new URL(`/${DEFAULT_LANGUAGE}${pathname === "/" ? "" : pathname}${search}`, request.url));
  }
}

// Statik fayllar va metadata ikonkalari (apple-icon — kengaytmasiz) proxy'dan o'tmaydi
export const config = {
  matcher: ["/((?!_next|api|.*/apple-icon|.*\\..*).*)"],
};
