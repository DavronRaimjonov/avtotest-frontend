import type { CheatSheet, CheatSheetCard, TestLang } from "@/@types";
import { request } from ".";

// Shpargalka — tokensiz, hamma matn (birliklar ham) so'ralgan tilda
export const getCheatSheets = (lang: TestLang) =>
  request.get<CheatSheetCard[]>("/landing/cheat-sheets", { params: { lang } }).then((r) => r.data);

// slug yoki id. Topilmasa yoki yashirilgan bo'lsa 404 NOT_FOUND
export const getCheatSheet = (slug: string, lang: TestLang) =>
  request.get<CheatSheet>(`/landing/cheat-sheets/${slug}`, { params: { lang } }).then((r) => r.data);
