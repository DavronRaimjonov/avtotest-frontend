import type { AttemptSource, ExamMode, PlanFeature, TestLang, VariantSize } from "@/@types";

// Backend manzili /api prefiksi bilan, masalan: http://localhost:4002/api
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002/api";

// Jamoaviy test socket.io manzili — API manzilining origin qismi (http://localhost:4002), namespace /group-tests
export const SOCKET_URL = (() => {
  try {
    return new URL(API_URL).origin;
  } catch {
    // Nisbiy API manzili (/api) — sayt bilan bir domenda
    return "";
  }
})();

// Google Identity Services — backend .env dagi GOOGLE_CLIENT_ID bilan bir xil bo'lishi shart
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

// Cookie muddati (kun): backend bilan bir xil — access 1 soat, refresh 30 kun
export const ACCESS_TOKEN_DAYS = 1 / 24;
export const REFRESH_TOKEN_DAYS = 30;

// Ilova tillari = backend test tillari. Standart til URL'da prefikssiz (/variants),
// qolganlari prefiks bilan (/uzc/variants, /ru/variants)
export const LANGUAGES: TestLang[] = ["uzb", "uzc", "ru", "kk"];
export const DEFAULT_LANGUAGE: TestLang = "uzb";

// Tugallanmagan testni davom ettirish uchun (localStorage)
export const LAST_ATTEMPT_KEY = "last_attempt_id";

// Backend /meta kelguncha ko'rsatiladigan rasmiy imtihon shartlari
export const EXAM_QUESTION_COUNT = 20;
export const EXAM_DURATION_MIN = 25;
export const PASS_PERCENT = 90;

// Javobdan keyin keyingi savolga o'tishgacha / imtihon xatolar bilan tugaganda natijaga o'tishgacha (ms)
export const AUTO_NEXT_MS = 1200;
export const FINISH_DELAY_MS = 1800;

// Katta testlar (aralash savollar, imtihon rejimi)
export const BIG_TEST_COUNTS = [50, 100, 200] as const;

// Backend bitta testga ko'pi bilan shuncha savol beradi
export const MAX_TEST_COUNT = 200;

// "Saqlangan savollar" / "Xatolarim" panelidagi test hajmlari (oxirida "Hammasi")
export const MY_TEST_SIZES = [20, 50] as const;

// "Saqlangan savollar" va "Xatolarim" — bir so'rovda shuncha karta ("Yana yuklash")
export const SAVED_PAGE_SIZE = 20;

// Taymer shundan kam qolganda qizarib ketadi (soniya)
export const TIMER_WARN_SEC = 5 * 60;

// Til nomlari o'z yozuvida — tarjima qilinmaydi
export const TEST_LANGS: { value: TestLang; label: string; short: string }[] = [
  { value: "uzb", label: "O‘zbekcha", short: "UZ" },
  { value: "uzc", label: "Ўзбекча", short: "ЎЗ" },
  { value: "ru", label: "Русский", short: "RU" },
  { value: "kk", label: "Қазақша", short: "KZ" },
];

export const EXAM_MODES: ExamMode[] = ["practice", "exam"];

export const VARIANT_SIZES: VariantSize[] = [20, 10];

// Mehmonga yopiq manbalar: bosilganda kirish oynasi ochiladi, kirgach test o'zi boshlanadi.
// exam — kirgach tarif ham tekshiriladi (request/mutation/attempt.ts)
export const LOGIN_ONLY_SOURCES: AttemptSource[] = ["mistakes", "bookmarks", "topic", "hard", "exam"];

// Backend /meta (guestLimits) kelguncha: mehmon birinchi 3 variant va 20 savolgacha tasodifiy test ishlaydi
export const GUEST_FREE_VARIANTS = 3;
export const GUEST_MAX_TEST_SIZE = 20;

// Mehmon testi va natijasi uchun yo'l: /test/guest, /result/guest (holat sessionStorage'da)
export const GUEST_ID = "guest";
export const GUEST_STORAGE_KEY = "guest_test";
// Mehmon oldingi testlarda ko'rgan savollar: qayta topshirishda takrorlanmasligi uchun backendga yuboriladi
export const GUEST_SEEN_KEY = "guest_seen_questions";
export const GUEST_SEEN_LIMIT = 1500;

// Emailga keladigan tasdiqlash kodi uzunligi
export const OTP_LENGTH = 6;

// Jamoaviy testga qo'shilish kodi uzunligi
export const GROUP_CODE_LENGTH = 6;

// Lobbyda qatnashchilar soni shu oraliqda yangilanadi (socket faqat holat o'zgarishini yuboradi), ms
export const GROUP_LOBBY_POLL_MS = 15_000;

// Vaqt tugagach server testni shuncha kechikish bilan yakunlaydi (GRACE + tekshiruv oralig'i), ms
export const GROUP_TIME_UP_REFETCH_MS = 6_000;

// Jamoaviy testda javobdan keyin keyingi savolga o'tish (natija ko'rsatilmaydi — kutish qisqa), ms
export const GROUP_AUTO_NEXT_MS = 400;

export const REPORT_MIN = 3;
export const REPORT_MAX = 1000;

export const TELEGRAM_URL = "#";

// Jamoaviy test backendda hozircha o'chiq (FEATURE_GROUP_TESTS): havolalar yashiriladi, sahifalar 404.
// Avtomaktablar uchun qaytarilganda .env'da NEXT_PUBLIC_FEATURE_GROUP_TESTS=true
export const GROUP_TESTS_ENABLED = process.env.NEXT_PUBLIC_FEATURE_GROUP_TESTS === "true";

// ---------- Tariflar va to'lov ----------
// Narxlar kartasidagi imkoniyatlar tartibi: har biri plan.features bo'yicha ✓ yoki ✗.
// optional — tarifda bo'lmasa umuman ko'rsatilmaydi (✗ emas)
export const PLAN_FEATURES: { key: PlanFeature; optional?: boolean }[] = [
  { key: "all_tests" },
  { key: "final_exam" },
  { key: "explanations" },
  { key: "videos" },
  { key: "mnemonics", optional: true },
];

// To'lovdan qaytgach buyurtma holati shu oraliqda so'raladi, ko'pi bilan shuncha vaqt (ms)
export const PAYMENT_POLL_MS = 2500;
export const PAYMENT_POLL_MAX_MS = 60_000;

// Tarif tugashiga shuncha kun qolganda "uzaytirish" eslatmasi
export const PLAN_EXPIRY_WARN_DAYS = 3;

// Login oynasidan keyin narxlar sahifasida tanlangan tarif (?plan=2)
export const PLAN_QUERY_PARAM = "plan";
