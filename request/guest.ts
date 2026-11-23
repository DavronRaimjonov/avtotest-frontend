import type {
  GuestCheckBody,
  GuestCheckResponse,
  GuestResult,
  GuestResultBody,
  GuestTest,
  StartAttemptBody,
} from "@/@types";
import { GUEST_SEEN_KEY, GUEST_SEEN_LIMIT } from "@/lib/constants";
import { request } from ".";

// Mehmon ko'rgan savollar localStorage'da (vkladka yopilsa ham qoladi). Backend ularni oxiriga suradi,
// shuning uchun qayta topshirganda yoki chiqib qayta kirganda savollar takrorlanmaydi
const seen = {
  get: (): number[] => {
    try {
      const v = JSON.parse(localStorage.getItem(GUEST_SEEN_KEY) ?? "[]");
      return Array.isArray(v) ? v.filter(Number.isInteger) : [];
    } catch {
      return [];
    }
  },
  add: (ids: number[]) => {
    try {
      const fresh = new Set(ids);
      const list = [...seen.get().filter((id) => !fresh.has(id)), ...ids].slice(-GUEST_SEEN_LIMIT);
      localStorage.setItem(GUEST_SEEN_KEY, JSON.stringify(list));
    } catch {}
  },
};

// Mehmon testi: server hech narsa saqlamaydi, holat frontendda (store/guest.store.ts)
export const startGuestTest = async (body: StartAttemptBody) => {
  // Variantda savollar tartibi belgilangan — ko'rilganlar faqat tasodifiy tanlovga kerak
  const seenIds = body.source === "variant" ? undefined : seen.get();
  const test = await request.post<GuestTest>("/landing/guest/tests", { ...body, seenIds }).then((r) => r.data);
  seen.add(test.questions.map((q) => q.id));
  return test;
};

// Mashq rejimida bitta javobni tekshirish
export const checkGuestAnswer = (body: GuestCheckBody) =>
  request.post<GuestCheckResponse>("/landing/guest/check", body).then((r) => r.data);

// Yakunlash: natija va tahlil hisoblanadi (shakli /attempts/:id/result bilan bir xil)
export const getGuestResult = (body: GuestResultBody) =>
  request.post<GuestResult>("/landing/guest/result", body).then((r) => r.data);
