import i18next, { createInstance, type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import type { TestLang } from "@/@types";
import kk from "./locales/kk.json";
import ru from "./locales/ru.json";
import uzb from "./locales/uzb.json";
import uzc from "./locales/uzc.json";

import { DEFAULT_LANGUAGE, LANGUAGES } from "@/lib/constants";

// Ilova tili = backend'dagi test tili (uzb | uzc | ru): interfeys va API'dagi ?lang= bir xil. Til URL'dan olinadi
export { DEFAULT_LANGUAGE, LANGUAGES };

// i18next va <html lang> uchun BCP 47 kodlari ("uzc" haqiqiy til kodi emas — Intl uni tanimaydi)
export const LOCALE_CODES: Record<TestLang, string> = {
  uzb: "uz-Latn",
  uzc: "uz-Cyrl",
  ru: "ru",
  kk: "kk",
};

export const toLanguage = (value: string | undefined | null): TestLang => {
  if (LANGUAGES.includes(value as TestLang)) return value as TestLang;
  const found = LANGUAGES.find((l) => LOCALE_CODES[l] === value);
  return found ?? DEFAULT_LANGUAGE;
};

const resources = {
  [LOCALE_CODES.uzb]: { translation: uzb },
  [LOCALE_CODES.uzc]: { translation: uzc },
  [LOCALE_CODES.ru]: { translation: ru },
  [LOCALE_CODES.kk]: { translation: kk },
};

const options = (lang: TestLang): InitOptions => ({
  resources,
  lng: LOCALE_CODES[lang],
  // Qozoqcha matn topilmasa ruschasi (qozoq foydalanuvchiga tushunarliroq), qolganlarga o'zbekchasi
  fallbackLng: { [LOCALE_CODES.kk]: [LOCALE_CODES.ru], default: [LOCALE_CODES[DEFAULT_LANGUAGE]] },
  supportedLngs: Object.values(LOCALE_CODES),
  load: "currentOnly",
  interpolation: { escapeValue: false },
  // Tarjimalar bundle ichida — init sinxron
  initAsync: false,
});

// Brauzerdagi yagona instance: notify, getErrorMessage va request funksiyalari ham shuni ishlatadi
i18next.use(initReactI18next).init(options(DEFAULT_LANGUAGE));

// Serverda har bir so'rovga alohida instance — foydalanuvchilar tillari aralashmaydi
export const createServerI18n = (lang: TestLang) => {
  const instance = createInstance();
  instance.use(initReactI18next).init(options(lang));
  return instance;
};

// Hook'dan tashqarida joriy til (API so'rovlari uchun)
export const currentLang = () => toLanguage(i18next.language);

export default i18next;
