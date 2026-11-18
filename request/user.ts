import type {
  AuthTokens,
  BookmarkItem,
  ChangePasswordBody,
  MistakeItem,
  PageParams,
  Paginated,
  ReportBody,
  ReportResponse,
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
  request.post<AuthTokens>("/landing/auth/change-password", body).then((r) => r.data);

export const getMe = () => request.get<User>("/landing/me").then((r) => r.data);

// lang — keyingi testlar uchun default til
export const updateMe = (body: UpdateMeBody) =>
  request.patch<User>("/landing/me", body).then((r) => r.data);

export const getStats = (lang?: TestLang) =>
  request.get<UserStats>("/landing/me/stats", { params: { lang } }).then((r) => r.data);

// Xatolarim: savol to'g'ri yechilsa ro'yxatdan o'zi chiqadi
export const getMistakes = (params: PageParams & { lang?: TestLang }) =>
  request.get<Paginated<MistakeItem>>("/landing/me/mistakes", { params }).then((r) => r.data);

export const deleteMistake = (questionId: number) =>
  request.delete<void>(`/landing/me/mistakes/${questionId}`);

// Saqlangan savollar
export const getBookmarkIds = () =>
  request.get<number[]>("/landing/me/bookmarks/ids").then((r) => r.data);

export const getBookmarks = (params: PageParams & { lang?: TestLang }) =>
  request.get<Paginated<BookmarkItem>>("/landing/me/bookmarks", { params }).then((r) => r.data);

export const addBookmark = (questionId: number) =>
  request.put<void>(`/landing/me/bookmarks/${questionId}`);

export const removeBookmark = (questionId: number) =>
  request.delete<void>(`/landing/me/bookmarks/${questionId}`);

// "Xato haqida xabar" — daqiqasiga 10 tagacha
export const reportQuestion = (questionId: number, body: ReportBody) =>
  request.post<ReportResponse>(`/landing/questions/${questionId}/report`, body).then((r) => r.data);
