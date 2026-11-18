import type {
  GuestCheckBody,
  GuestCheckResponse,
  GuestResult,
  GuestResultBody,
  GuestTest,
  StartAttemptBody,
} from "@/@types";
import { request } from ".";

// Mehmon testi: server hech narsa saqlamaydi, holat frontendda (store/guest.store.ts)
export const startGuestTest = (body: StartAttemptBody) =>
  request.post<GuestTest>("/landing/guest/tests", body).then((r) => r.data);

// Mashq rejimida bitta javobni tekshirish
export const checkGuestAnswer = (body: GuestCheckBody) =>
  request.post<GuestCheckResponse>("/landing/guest/check", body).then((r) => r.data);

// Yakunlash: natija va tahlil hisoblanadi (shakli /attempts/:id/result bilan bir xil)
export const getGuestResult = (body: GuestResultBody) =>
  request.post<GuestResult>("/landing/guest/result", body).then((r) => r.data);
