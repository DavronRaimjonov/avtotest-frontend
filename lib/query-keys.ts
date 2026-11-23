import type { PageParams, TestLang, VariantSize } from "@/@types";

export const QUERY_KEYS = {
  meta: ["meta"] as const,
  demoQuestion: (lang: TestLang) => ["demo-question", lang] as const,
  // hasSession kalitda: kirgach har bir variantdagi natija qayta so'raladi
  variants: ["variants"] as const,
  variantList: (size: VariantSize, hasSession: boolean) =>
    ["variants", size, hasSession] as const,
  topics: (lang: TestLang) => ["topics", lang] as const,

  attempt: (id: string) => ["attempts", id] as const,
  attemptResult: (id: string) => ["attempts", id, "result"] as const,
  attempts: (params: PageParams) => ["attempts", "list", params] as const,

  groupTests: ["group-tests", "list"] as const,
  groupTest: (id: string) => ["group-tests", id] as const,

  signGroups: (lang: TestLang) => ["signs", "groups", lang] as const,
  signGroup: (slug: string, lang: TestLang) =>
    ["signs", "groups", slug, lang] as const,
  sign: (slug: string, lang: TestLang) => ["signs", slug, lang] as const,
  signSearch: (search: string, lang: TestLang) =>
    ["signs", "search", search, lang] as const,

  me: ["me"] as const,
  stats: ["me", "stats"] as const,
  bookmarkIds: ["me", "bookmarks", "ids"] as const,
  // Ro'yxatlar til bo'yicha alohida keshlanadi; olib tashlash/yangilashda prefiks bilan hammasi
  bookmarkLists: ["me", "bookmarks", "list"] as const,
  bookmarkList: (lang: TestLang) => ["me", "bookmarks", "list", lang] as const,
  mistakeLists: ["me", "mistakes"] as const,
  mistakeList: (lang: TestLang) => ["me", "mistakes", lang] as const,
  explanations: (ids: number[], lang: TestLang) =>
    ["me", "explanations", lang, ids.join(",")] as const,

  cheatSheets: (lang: TestLang) => ["cheat-sheets", lang] as const,
  cheatSheet: (slug: string, lang: TestLang) => ["cheat-sheets", slug, lang] as const,

  // Tariflar va to'lov
  plans: (lang: TestLang) => ["plans", lang] as const,
  // Tarif nomi so'ralgan tilda keladi; yangilashda prefiks bilan (accessAll) hammasi
  accessAll: ["me", "access"] as const,
  access: (lang: TestLang) => ["me", "access", lang] as const,
  order: (id: number) => ["orders", id] as const,
  orders: (page: number) => ["orders", "list", page] as const,
};
