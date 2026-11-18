import type { Sign, SignDetail, SignGroup, SignGroupDetail, TestLang } from "@/@types";
import { request } from ".";

// Yo'l belgilari (tokensiz). Ruscha matnlar hali yo'q — lang=ru da o'zbekchasi qaytadi
export const getSignGroups = (lang: TestLang) =>
  request.get<SignGroup[]>("/landing/signs/groups", { params: { lang } }).then((r) => r.data);

export const getSignGroup = (slug: string, lang: TestLang) =>
  request.get<SignGroupDetail>(`/landing/signs/groups/${slug}`, { params: { lang } }).then((r) => r.data);

// prev / next — shu kategoriyadagi qo'shni belgilar
export const getSign = (slug: string, lang: TestLang) =>
  request.get<SignDetail>(`/landing/signs/${slug}`, { params: { lang } }).then((r) => r.data);

// Raqam boshi (5.2 → 5.2, 5.20.1) yoki nomi bo'yicha, 50 tagacha
export const searchSigns = (search: string, lang: TestLang) =>
  request.get<Sign[]>("/landing/signs/search", { params: { search, lang } }).then((r) => r.data);
