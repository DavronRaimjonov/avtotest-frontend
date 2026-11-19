import type { AttemptSource, ExamMode, TestLang, VariantSize } from "@/@types";

// Backend manzili /api prefiksi bilan, masalan: http://localhost:4002/api
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4002/api";

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

// Mehmonga yopiq manbalar: bosilganda Google oynasi ochiladi
export const LOGIN_ONLY_SOURCES: AttemptSource[] = ["mistakes", "bookmarks"];

// Mehmon testi va natijasi uchun yo'l: /test/guest, /result/guest (holat sessionStorage'da)
export const GUEST_ID = "guest";
export const GUEST_STORAGE_KEY = "guest_test";

// Emailga keladigan tasdiqlash kodi uzunligi
export const OTP_LENGTH = 6;

export const REPORT_MIN = 3;
export const REPORT_MAX = 1000;

export const TELEGRAM_URL = "#";
