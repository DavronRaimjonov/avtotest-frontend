import type {
  AuthTokens,
  BookmarkItem,
  ChangePasswordBody,
  MistakeItem,
  MnemonicFields,
  PageParams,
  Paginated,
  Readiness,
  ReportBody,
  ReportResponse,
  ReviewSummary,
  TelegramStart,
  TopicMnemonics,
  TestLang,
  UpdateMeBody,
  User,
  UserStats,
} from "@/@types";
import { request } from ".";

// Barcha qurilmalardan chiqaradi. request orqali — access eskirgan bo'lsa avval yangilanadi
export const logout = () => request.post<void>("/landing/auth/logout");

// Yangi tokenlar qaytadi (eski tokenlar va boshqa qurilmalar bekor bo'ladi)
export const changePassword = (body: ChangePasswordBody) =>
  request
    .post<AuthTokens>("/landing/auth/change-password", body)
    .then((r) => r.data);

// Parolsiz foydalanuvchi (Telegram yoki Google) parol yaratadi. Bor bo'lsa 409 PASSWORD_ALREADY_SET
export const setPassword = (password: string) =>
  request
    .post<{ ok: true; user: User }>("/landing/auth/set-password", { password })
    .then((r) => r.data);

// Profilga Telegram ulash: javob start bilan bir xil, keyin status polling → linked
export const linkTelegram = () =>
  request.post<TelegramStart>("/landing/me/telegram/link").then((r) => r.data);

// 403 LAST_LOGIN_METHOD — Telegram yagona kirish usuli
export const unlinkTelegram = () => request.delete<void>("/landing/me/telegram");

export const getMe = () => request.get<User>("/landing/me").then((r) => r.data);

// lang — keyingi testlar uchun default til
export const updateMe = (body: UpdateMeBody) =>
  request.patch<User>("/landing/me", body).then((r) => r.data);

export const getStats = (lang?: TestLang) =>
  request
    .get<UserStats>("/landing/me/stats", { params: { lang } })
    .then((r) => r.data);

// Aqlli takrorlash: vaqti kelgan xatolar soni, bosqichlar (locked — tarifda smart_review yo'q)
export const getReview = () =>
  request.get<ReviewSummary>("/landing/me/review").then((r) => r.data);

// Imtihonga tayyorlik foizi (tarifsiz ham ochiq). Har chaqirilganda bugungi qiymat tarixga yoziladi
export const getReadiness = (lang?: TestLang) =>
  request
    .get<Readiness>("/landing/me/readiness", { params: { lang } })
    .then((r) => r.data);

// Xatolarim: savol 1, 3, 7 kundan keyin vaqtida 3 marta to'g'ri topilsa ro'yxatdan chiqadi
export const getMistakes = (params: PageParams & { lang?: TestLang }) =>
  request
    .get<Paginated<MistakeItem>>("/landing/me/mistakes", { params })
    .then((r) => r.data);

export const deleteMistake = (questionId: number) =>
  request.delete<void>(`/landing/me/mistakes/${questionId}`);

// Saqlangan savollar
export const getBookmarkIds = () =>
  request.get<number[]>("/landing/me/bookmarks/ids").then((r) => r.data);

export const getBookmarks = (params: PageParams & { lang?: TestLang }) =>
  request
    .get<Paginated<BookmarkItem>>("/landing/me/bookmarks", { params })
    .then((r) => r.data);

export const addBookmark = (questionId: number) =>
  request.put<void>(`/landing/me/bookmarks/${questionId}`);

export const removeBookmark = (questionId: number) =>
  request.delete<void>(`/landing/me/bookmarks/${questionId}`);

// "Xato haqida xabar" — daqiqasiga 10 tagacha
export const reportQuestion = (questionId: number, body: ReportBody) =>
  request
    .post<ReportResponse>(`/landing/questions/${questionId}/report`, body)
    .then((r) => r.data);

// Mehmon sifatida ishlangan test natijasidagi izohlar (kirgandan keyin).
// Davom etayotgan testdagi savollarga izoh kelmaydi
export const getExplanations = (questionIds: number[], lang?: TestLang) =>
  request
    .post<({ id: number; explanation: string | null } & MnemonicFields)[]>(
      "/landing/me/explanations",
      { questionIds, lang },
    )
    .then((r) => r.data);

// Mavzu sahifasidagi "Eslab qolish uchun" kartochkalari (token kerak). locked — Max yo'q: items bo'sh, count keladi
export const getTopicMnemonics = (topicId: number, lang?: TestLang) =>
  request
    .get<TopicMnemonics>(`/landing/me/topics/${topicId}/mnemonics`, { params: { lang } })
    .then((r) => r.data);
