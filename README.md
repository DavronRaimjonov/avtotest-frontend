# AvtoTest — frontend

Haydovchilik imtihoniga onlayn tayyorgarlik platformasi. Next.js 16 (App Router, Cache Components), Tailwind v4, TanStack Query, Zustand, Axios.

```bash
cp .env.example .env.local
npm i
npm run dev
```

`.env.local`:

- `NEXT_PUBLIC_API_URL` — backend manzili `/api` bilan (lokal: `http://localhost:4002/api`). Backend `CORS_ORIGINS` da frontend porti bo'lishi kerak (3000 yoki 3001).
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — backend `.env` dagi `GOOGLE_CLIENT_ID` bilan bir xil. Bo'sh bo'lsa Google tugmasi ko'rsatilmaydi (email + parol bilan kirish ishlaydi).

API shartnomasi — `FRONTEND-API.md` (backenddan). Faqat landing qismi ulangan (`/api/landing/*`).

## Struktura

```
@types/            — API tiplari (FRONTEND-API.md bo'yicha)
app/
  [lang]/          — root layout (til URL'dan), barcha sahifalar shu ichida
    (main)/        — header + footer bilan: /, /variants, /result/[attemptId]
    test/[attemptId] — test ishlash (o'z paneli bilan)
components/
  auth/            — Google tugmasi, login oynasi
  layout/          — header (til tanlash, akkaunt), footer, logo
  sections/home/   — bosh sahifa bo'limlari
  variants/        — variant tanlash (panel + grid)
  test/            — test ishlash (header, savol, javob varianti, xato haqida xabar, footer)
  result/          — natija (summary, stats, review)
  ui/              — icons, section-heading, link (til prefiksini o'zi qo'shadi)
generics/          — notification (sonner)
hooks/             — useQuery (barcha query hook'lar), useCountdown, useLang, useRouter (til prefiksi bilan)
i18n/              — i18next: uzb (lotin), uzc (kirill), ru
lib/               — constants, routes, query-keys, query-client, helpers
provider/          — I18n + QueryClient + Toaster + login oynasi
request/           — axios (refresh bilan), landing, attempt, guest, user, mutation/
schema/            — zod sxemalar
store/             — zustand: auth (login oynasi), exam (tanlov), guest (mehmon testi, sessionStorage)
proxy.ts           — til (prefikssiz → /uzb rewrite) va /test/<uuid>, /result/<uuid> uchun token tekshiruvi
```

## Til

Ilova tili = test tili: `uzb` | `uzc` | `ru` (backend kodlari bilan bir xil). Til URL'da:

| Til | Manzil |
|---|---|
| O'zbekcha (lotin) — standart | `/`, `/variants`, `/test/...` (prefikssiz) |
| Ўзбекча (кирилл) | `/uzc`, `/uzc/variants`, ... |
| Русский | `/ru`, `/ru/variants`, ... |

`proxy.ts` prefikssiz yo'lni ichkarida `/uzb/...` ga rewrite qiladi, `/uzb/...` ni esa prefikssiz manzilga redirect qiladi.
Ichki havolalar tilsiz yoziladi (`ROUTES.variants`) — `@/components/ui/link` va `@/hooks/useRouter` prefiksni o'zi qo'shadi
(`next/link` va `next/navigation` ning `useRouter` ini to'g'ridan-to'g'ri ishlatmang). Til API'ga `?lang=` / body `lang` sifatida ketadi;
kirgan foydalanuvchida `PATCH /me { lang }` bilan profilga ham yoziladi. Tarjimalar: `i18n/locales/*.json`.

## Kirish

Alohida sahifa yo'q — kirish oynasi (`components/auth/login-modal`): email + parol, ro'yxatdan o'tish (emailga 6 xonali kod → `verify-email`),
parolni tiklash (`forgot-password` → `reset-password`), kirganda parolni o'zgartirish, qo'shimcha ravishda Google.

## Test oqimi

| | Mehmon | Kirgan (Google) |
|---|---|---|
| Boshlash | `POST /guest/tests` → `/test/guest` | `POST /attempts` → `/test/<id>` |
| Javob (natija darhol, javob qotadi) | `POST /guest/check` | `POST /attempts/:id/answers` |
| Imtihonda 3-xato | frontend aniqlaydi → `POST /guest/result` | server `finished: true` qaytaradi |
| Yakunlash | `POST /guest/result` → `/result/guest` | `POST /attempts/:id/finish` → `/result/<id>` |
| Holat | `sessionStorage` (vkladka yopilsa yo'qoladi) | serverda (sahifa yangilansa `GET /attempts/:id`) |

"Xatolar ustida ishlash", "Saqlash", "Xato haqida xabar" — faqat kirganlarga: mehmonga kirish oynasi ochiladi, kirgach amal o'zi bajariladi.

Javobdan keyin ~1 s natija ko'rsatilib, keyingi javobsiz savolga avtomatik o'tiladi. Klaviatura: F1–F9 yoki 1–9 — javob, ← → — savollar.

## Yo'l belgilari

`/signs` (kategoriyalar + qidiruv), `/signs/[group]`, `/signs/[group]/[sign]` — `GET /landing/signs/*`.
