import type {
  AnswerBody,
  GroupAnswerResponse,
  GroupTestListItem,
  GroupTestState,
  JoinGroupTestResponse,
  TestLang,
} from "@/@types";
import { request } from ".";

// Taymer server soatiga emas, javob kelgan paytga bog'lanadi (request/attempt.ts dagi kabi)
const withDeadline = (s: GroupTestState): GroupTestState => ({
  ...s,
  deadline: s.remainingSec == null ? null : Date.now() + s.remainingSec * 1000,
});

// 6 xonali kod bilan lobbyga qo'shilish (daqiqasiga 5 ta urinish — keyin 429)
export const joinGroupTest = (code: string) =>
  request.post<JoinGroupTestResponse>("/landing/group-tests/join", { code }).then((r) => r.data);

// Mening jamoaviy testlarim: avval lobby / davom etayotganlari
export const getGroupTests = () =>
  request.get<GroupTestListItem[]>("/landing/group-tests").then((r) => r.data);

// Holat: lobby / savollar (to'g'ri javobsiz) / ballim / yakunlangach to'liq tahlil
export const getGroupTest = (id: string, lang?: TestLang) =>
  request
    .get<GroupTestState>(`/landing/group-tests/${id}`, { params: { lang } })
    .then((r) => withDeadline(r.data));

// Javob qotadi (qayta yuborilsa 409 ALREADY_ANSWERED). To'g'ri/xatoligi test yakunlanguncha aytilmaydi
export const answerGroupTest = (id: string, body: AnswerBody) =>
  request.post<GroupAnswerResponse>(`/landing/group-tests/${id}/answers`, body).then((r) => r.data);

// Mening testimni yakunlash: javob GET /:id bilan bir xil (ball darhol, tahlil test tugagach)
export const finishGroupTest = (id: string, lang?: TestLang) =>
  request
    .post<GroupTestState>(`/landing/group-tests/${id}/finish`, {}, { params: { lang } })
    .then((r) => withDeadline(r.data));

// Lobbydan chiqish (test boshlanmaguncha)
export const leaveGroupTest = (id: string) =>
  request.post<{ left: true }>(`/landing/group-tests/${id}/leave`).then((r) => r.data);
