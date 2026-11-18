import type {
  AnswerBody,
  AnswerResponse,
  Attempt,
  AttemptBase,
  AttemptResult,
  PageParams,
  Paginated,
  StartAttemptBody,
  TestLang,
} from "@/@types";
import { request } from ".";

// Taymer server vaqtiga emas, javob kelgan paytga bog'lanadi — kompyuter soati noto'g'ri bo'lsa ham to'g'ri ishlaydi
const withDeadline = (a: Attempt): Attempt => ({
  ...a,
  deadline: a.remainingSec == null ? null : Date.now() + a.remainingSec * 1000,
});

// Yangi test: savollar to'g'ri javobsiz keladi (javob GET /attempts/:id bilan bir xil)
export const startAttempt = (body: StartAttemptBody) =>
  request.post<Attempt>("/landing/attempts", body).then((r) => withDeadline(r.data));

// Davom ettirish / sahifa yangilanganda. Vaqti tugagan imtihonni server o'zi yakunlaydi (status: finished)
export const getAttempt = (id: string, lang?: TestLang) =>
  request.get<Attempt>(`/landing/attempts/${id}`, { params: { lang } }).then((r) => withDeadline(r.data));

// Mashqda darhol isCorrect + correctAnswerId + explanation, imtihonda faqat { saved: true }
export const answerAttempt = (id: string, body: AnswerBody) =>
  request.post<AnswerResponse>(`/landing/attempts/${id}/answers`, body).then((r) => r.data);

// Qayta chaqirilsa ham xavfsiz — o'sha natija qaytadi
export const finishAttempt = (id: string) =>
  request.post<AttemptResult>(`/landing/attempts/${id}/finish`).then((r) => r.data);

export const getAttemptResult = (id: string, lang?: TestLang) =>
  request.get<AttemptResult>(`/landing/attempts/${id}/result`, { params: { lang } }).then((r) => r.data);

export const getAttempts = (params: PageParams) =>
  request.get<Paginated<AttemptBase>>("/landing/attempts", { params }).then((r) => r.data);
