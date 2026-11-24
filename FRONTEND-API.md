

# AvtoTest API — frontend uchun qo'llanma

Backend: NestJS + PostgreSQL. Ikki alohida qism:

| Qism | Prefiks | Kim ishlatadi | Kirish |
|---|---|---|---|
| **Landing** | `/api/landing/*` | Sayt (foydalanuvchilar) | Telegram bot orqali (keyin telefon + parol bilan ham). Mehmon cheklangan testlarni ishlay oladi (2.3), qolgani login va tarif bilan (2.8) |
| **Admin** | `/api/admin/*` | Admin panel | Telefon + parol |

- **Base URL (lokal):** `http://localhost:4002`
- **Swagger:** `http://localhost:4002/api/docs` (yuqoridagi ro'yxatdan Landing yoki Admin tanlanadi). Har bir maydonning to'liq tavsifi shu yerda. Mehmon endpoint'lari `guest` tegi ostida.
- Landing tokeni admin API'da ishlamaydi, admin tokeni landing'da ishlamaydi (401).
- **Mehmon (login qilmagan)** `/api/landing/guest/*` orqali faqat birinchi 3 ta variant va 20 savollik tasodifiy testni ishlaydi, hech narsasi saqlanmaydi (2.3, 2.4).
- **Tariflar va to'lov** (Click, Payme), paywall, ekranlar, tiplar va tarjimalar: 2.8. Admin tomoni: 3.10. Tekshirish ro'yxati: 5.
- **Shpargalka** (imtihonda ko'p uchraydigan raqamlar: tezlik, masofa, gabarit...): 2.9. Admin tomoni: 3.11.
- **Aqlli takrorlash** (xatolar 1, 3, 7 kundan keyin qayta so'raladi, Pro) va **imtihonga tayyorlik foizi**: 2.6.1, 2.6.2.

---

## 1. Umumiy qoidalar

### Til
Testlar 4 tilda: `uzb` (o'zbek lotin), `uzc` (o'zbek kirill), `ru` (rus), `kk` (qozoq, kirill).

- Landing endpoint'lari `?lang=uzb|uzc|ru|kk` qabul qiladi (default `uzb`) va matnni **tayyor satr** sifatida qaytaradi.
- Tanlangan tilda matn bo'lmasa: `kk` uchun ruschasi, qolganlarga o'zbekchasi qaytadi. Qozoqcha tarjima sun'iy intellekt bilan qilingan va hali odam tomonidan tekshirilmagan.
- Test boshlanganda til qotiriladi. `lang` berilmasa kirgan foydalanuvchiga profilidagi til, mehmonga `uzb` olinadi.
- Mehmonning tanlagan tilini frontend o'zi saqlaydi (masalan, `localStorage`) va har so'rovga `lang` qilib yuboradi.
- Admin API'da matnlar doim uchala tilda obyekt bo'lib keladi: `{ "uzb": "...", "uzc": "...", "ru": "..." }`.

### Token
```
Authorization: Bearer <access_token>
```
- `access_token` — 1 soat yashaydi.
- `refresh_token` — landing'da 30 kun, admin'da 7 kun.
- 401 kelsa → `POST .../auth/refresh` bilan yangi juftlik oling. Refresh ham 401 qaytarsa → qayta login.
- "Chiqish" barcha qurilmalardagi tokenlarni bekor qiladi.
- Tokensiz ishlaydigan endpoint'lar: `meta`, `variants`, `topics`, `demo-question`, `signs/*` (yo'l belgilari), `auth/*` (`change-password` va `logout` dan tashqari) va butun `guest/*`.

### Sahifalash
Ro'yxatlar: `?page=1&limit=20` (`limit` 100 gacha). Javob:
```json
{ "items": [], "total": 135, "page": 1, "limit": 20 }
```

### Xatolar
Hamma xato bir xil shaklda keladi:
```json
{
  "statusCode": 409,
  "code": "ATTEMPT_FINISHED",
  "message": "Test yakunlangan",
  "error": "Conflict",
  "params": { "count": 2 },
  "errors": [{ "field": "variantId", "message": "..." }]
}
```
- `code` — o'zgarmas nom, **tarjimani shu bo'yicha qiling** (`message` faqat o'zbekcha va o'zgarishi mumkin).
- `params` — ba'zi xatolarda matnga qo'yiladigan qiymatlar.
- `errors` — faqat `VALIDATION_ERROR` da: qaysi maydon xato.

| `code` | Qachon |
|---|---|
| `VALIDATION_ERROR` | Body yoki query noto'g'ri |
| `UNAUTHORIZED` | Token yo'q, eskirgan yoki noto'g'ri |
| `ACCOUNT_BLOCKED` | Foydalanuvchi yoki admin bloklangan (403) |
| `PHONE_TAKEN` | Bu telefon boshqa admin yoki foydalanuvchida (409) |
| `INVALID_OTP` | Parolni tiklash kodi noto'g'ri yoki muddati o'tgan |
| `OTP_ATTEMPTS_EXHAUSTED` | 5 marta xato kod kiritildi — yangi kod so'rash kerak |
| `OTP_TOO_SOON` | Yangi kod 60 soniyadan keyin (`params.seconds`, 429) |
| `CODE_SEND_FAILED` | Kodni Telegram botga yuborib bo'lmadi (503) — birozdan keyin qayta urinish |
| `TELEGRAM_AUTH_DISABLED` | Serverda bot sozlanmagan (503) |
| `PHONE_NOT_REGISTERED` | Login: raqam ro'yxatdan o'tmagan (401) — Telegram orqali ro'yxatdan o'tish |
| `PASSWORD_NOT_SET` | Login: akkaunt bor, parol yaratilmagan (401) — Telegram orqali kirish |
| `PASSWORD_ALREADY_SET` | `set-password`: parol allaqachon bor (409) — `change-password` ishlating |
| `LAST_LOGIN_METHOD` | Telegram'ni uzib bo'lmaydi: parol yoki telefon yo'q (403) |
| `INVALID_REFRESH_TOKEN` | Refresh token yaroqsiz → qayta login |
| `INVALID_CREDENTIALS` | Parol noto'g'ri (landing), telefon yoki parol noto'g'ri (admin) |
| `INVALID_CURRENT_PASSWORD` | Parol almashtirishda joriy parol xato |
| `NOT_FOUND` | Topilmadi |
| `NO_QUESTIONS` | Tanlangan bo'limda savol yo'q (masalan, xatolar ro'yxati bo'sh) |
| `LOGIN_REQUIRED` | Bu bo'lim faqat kirgan foydalanuvchi uchun. Amalda mehmon login talab qiladigan endpoint'ga tokensiz kirsa `401 UNAUTHORIZED` oladi: ikkalasida ham Google login oynasini oching |
| `ATTEMPT_FINISHED` | Test yakunlangan yoki vaqt tugagan |
| `ATTEMPT_NOT_FINISHED` | Natija so'raldi, lekin test hali yakunlanmagan |
| `ALREADY_ANSWERED` | Mashq rejimida savolga qayta javob berildi |
| `QUESTION_NOT_IN_ATTEMPT` | Savol shu testda yo'q (mehmonda: `answers` da `questionIds` da yo'q savol) |
| `ANSWER_NOT_IN_QUESTION` | Javob shu savolga tegishli emas |
| `INVALID_ANSWERS` | Admin: to'g'ri javob bittadan ko'p yoki kam |
| `INVALID_IMAGE` | Admin: rasm turi yoki hajmi noto'g'ri |
| `VARIANT_INCOMPLETE` | Admin: savollar soni formatga teng emas (`params.count`, `params.size`) |
| `VARIANT_NUMBER_TAKEN` | Admin: bu raqamli variant bor |
| `UNKNOWN_QUESTIONS` | Ba'zi savol id'lari topilmadi (admin: variant savollari; mehmon: `guest/result`) |
| `SLUG_TAKEN` | Admin: slug band |
| `SUPERADMIN_PROTECTED` | Admin: o'zini bloklash yoki rolini tushirish mumkin emas |
| `TOO_MANY_REQUESTS` | Juda ko'p so'rov (429) |

### Rasmlar
`imageUrl` — to'liq manzil (`http://.../uploads/questions/xxx.jpg`), to'g'ridan-to'g'ri `<img src>` ga qo'yiladi. Rasm bo'lmasa `null` keladi: dizayndagi "Bu savolda rasm yo'q" holatini ko'rsating.

---

## 2. Landing API

### 2.1. Ro'yxatdan o'tish va kirish

Faqat **Telegram bot** orqali. Google va email bilan kirish olib tashlangan (2026-11-24): `register`, `verify-email`, `resend-code`, `google` endpointlari endi `404`.
- **Ro'yxatdan o'tish:** "Telegram orqali kirish" → botda raqam yuboriladi → **parol yaratish majburiy** → kirdi. Parol yaratilmaguncha token berilmaydi.
- **Keyingi safar:** yana Telegram orqali, yoki **telefon + parol** bilan.
- **Ro'yxatdan o'tmagan raqam bilan login** → `401 PHONE_NOT_REGISTERED`: "Bu raqam ro'yxatdan o'tmagan" + "Telegram orqali ro'yxatdan o'tish" tugmasi.

Login oynasi: tepada katta "Telegram orqali kirish" tugmasi, pastda "Telefon va parol bilan kirish" (telefon, parol, "Parolni unutdim?").

#### Telegram orqali kirish va ro'yxatdan o'tish

To'liq oqim va xavfsizlik: `docs/TZ-telegram-auth.md`. Alohida ro'yxatdan o'tish formasi yo'q: birinchi kirishda akkaunt o'zi yaratiladi.

```
1. Tugma bosildi → POST /api/landing/auth/telegram/start { lang }
   ← { token, code: 47, botUrl, expiresAt }
2. Ekranda: katta "47" va matn "Telegram'da shu raqamni tanlang"
   - mobil: botUrl ni darhol oching (window.location = botUrl)
   - kompyuter: botUrl ni QR kod qilib ko'rsating + "Telegram'ni ochish" havolasi
3. Har 2 soniyada GET /api/landing/auth/telegram/status/:token
4. status:
   pending   → kutishda davom (expiresAt gacha teskari sanoq, 5 daqiqa)
   password_required → { isNew, firstName, phone } — pollingni to'xtating, "Parol yarating" oynasi (6-qadam)
   confirmed → { access_token, refresh_token, user, isNew } — kirdi (paroli bor foydalanuvchi)
   rejected  → "Noto'g'ri raqam tanlandi yoki so'rov rad etildi" + "Qaytadan" tugmasi
   expired   → "Vaqt tugadi" + "Qaytadan" tugmasi
   used      → tokenlar allaqachon olingan (boshqa tabda) — pollingni to'xtating
6. "Parol yarating" (majburiy, "Keyinroq" yo'q): parol + takrorlash maydoni →
   POST /api/landing/auth/telegram/complete { token, password }
   ← { status: "confirmed", access_token, refresh_token, user, isNew } — ro'yxatdan o'tish tugadi
   Xatolar: 400 (parol talabga javob bermaydi), 404 (so'rov eskirgan — Telegram orqali qaytadan), 409 PASSWORD_ALREADY_SET
```

- Tokenlar **faqat bir marta** qaytadi: `confirmed` dan keyingi so'rov `used` beradi. Pollingni `confirmed` / `password_required` / `rejected` / `expired` / `used` da to'xtating.
- `password_required` holati tasdiqlangandan keyin yana **5 daqiqa** amal qiladi: shu vaqtda parol yaratilmasa, Telegram orqali qaytadan kirish kerak (akkaunt saqlanadi, yana parol so'raladi).
- Parol: kamida 8 belgi, harf va raqam (`Parol1234`).
- `token` 43 belgi; noto'g'ri formatda `400`, topilmasa `404`.
- `503 TELEGRAM_AUTH_DISABLED` — serverda bot sozlanmagan: "Hozircha kirish ishlamayapti" xabarini ko'rsating.
- `start` — IP bo'yicha daqiqasiga 10 ta (`429 TOO_MANY_REQUESTS`).
- Bot raqamni faqat birinchi marta so'raydi va faqat foydalanuvchining **o'z** kontaktini qabul qiladi.

#### `POST /api/landing/auth/set-password` — token kerak
Zaxira: kirgan, lekin paroli yo'q foydalanuvchi uchun (`user.hasPassword === false`, masalan eski akkaunt). `{ "password": "Parol1234" }` → `{ ok: true, user }`. Parol bor bo'lsa `409 PASSWORD_ALREADY_SET`. Yangi ro'yxatdan o'tishda bu emas, `telegram/complete` ishlatiladi.

#### `POST /api/landing/auth/login` — telefon + parol

```json
{ "phone": "+998 90 123-45-67", "password": "Parol1234" }
```
Raqam istalgan ko'rinishda yuborilishi mumkin (bo'shliq, tire) — server `+998901234567` ga keltiradi. Xatolar (hammasi `401`):

| `code` | Ekranda |
|---|---|
| `PHONE_NOT_REGISTERED` | "Bu raqam ro'yxatdan o'tmagan" + **"Telegram orqali ro'yxatdan o'tish"** tugmasi |
| `PASSWORD_NOT_SET` | "Parol hali yaratilmagan" + "Telegram orqali kirish" tugmasi (u yerda parol so'raladi) |
| `INVALID_CREDENTIALS` | "Parol noto'g'ri" + "Parolni unutdim?" havolasi |

Login IP bo'yicha daqiqasiga 10 ta (`429`).

#### Parolni tiklash (kod Telegram botga keladi)
```
1. POST /auth/forgot-password  { phone, lang? }  ─► 200 { codeSent: true, codeTtlMin: 10, channel: "telegram" }
2. POST /auth/reset-password   { phone, code, newPassword }  ─► 200 { access_token, refresh_token, user }
```
- `forgot-password` har doim bir xil javob beradi (raqam borligini oshkor qilmaslik uchun): "Agar bu raqam ro'yxatdan o'tgan bo'lsa, kod Telegram'ga yuborildi".
- `503 CODE_SEND_FAILED` — botga yuborib bo'lmadi, birozdan keyin qayta urinish.
- `reset-password` dan keyin foydalanuvchi tizimga kiradi, boshqa qurilmalardan chiqariladi.

#### Profil: Telegram'ni ulash / uzish
- `POST /api/landing/me/telegram/link` (token kerak) → `start` bilan bir xil javob; keyin xuddi shu `status` polling, natija `status: "linked"` (tokenlar qaytmaydi, `user` yangilangan).
- Bu Telegram boshqa akkauntga ulangan bo'lsa yoki raqami boshqa akkauntda bo'lsa — `rejected` (bot sababini aytadi).
- `DELETE /api/landing/me/telegram` → `204`. Parol yoki telefon bo'lmasa `403 LAST_LOGIN_METHOD` ("Avval parol o'rnating").

#### `user` obyekti
| Maydon | Tavsif |
|---|---|
| `email` | odatda `null` (faqat eski akkauntlarda bor). Profil va headerda telefon va ismni ko'rsating |
| `phone` | `"+998901234567"` yoki `null` |
| `telegramUsername` | `@` siz, yoki `null` |
| `hasTelegram` | Telegram ulangan |
| `hasPassword` | parol bormi: `false` bo'lsa profilda "Parol yaratish" (`set-password`), `true` bo'lsa "Parolni almashtirish" |

```ts
export interface TelegramStart { token: string; code: number; botUrl: string; expiresAt: string }
export type TelegramStatus =
  | { status: 'pending'; expiresAt: string }
  | { status: 'expired' | 'rejected' | 'used' }
  | { status: 'password_required'; isNew: boolean; firstName: string; phone: string | null }
  | { status: 'confirmed'; access_token: string; refresh_token: string; user: User; isNew: boolean }
  | { status: 'linked'; user: User };
```

Tarjima kalitlari: `auth.telegram.button` (Telegram orqali kirish), `auth.telegram.pickCode` (Telegram'da shu raqamni tanlang), `auth.telegram.openApp` (Telegram'ni ochish), `auth.telegram.scanQr` (Telefoningiz kamerasi bilan skanerlang), `auth.telegram.waiting` (Tasdiqlash kutilmoqda…), `auth.telegram.rejected`, `auth.telegram.expired`, `auth.telegram.retry`, `auth.setPassword.title` (Parol yarating), `auth.setPassword.hint` (Keyin telefon raqam va parol bilan ham kira olasiz), `auth.setPassword.repeat` (Parolni takrorlang), `auth.phoneNotRegistered` (Bu raqam ro'yxatdan o'tmagan), `auth.registerWithTelegram` (Telegram orqali ro'yxatdan o'tish), `auth.phone` (Telefon raqami), `auth.password` (Parol), `auth.forgot` (Parolni unutdim?), `profile.telegram.link` / `unlink`.

#### `POST /api/landing/auth/change-password` — token kerak
```json
{ "currentPassword": "parol1234", "newPassword": "yangi12345" }
```
Javob: yangi `{ access_token, refresh_token }` — ularni saqlang (eski tokenlar va boshqa qurilmalar bekor bo'ladi).
`user.hasPassword === false` bo'lsa bu formani emas, "Parol yaratish" (`set-password`) ni ko'rsating.

#### `POST /api/landing/auth/refresh` — tokensiz
Body: `{ "refreshToken": "..." }` → javob: `{ "access_token", "refresh_token" }`

#### `POST /api/landing/auth/logout` — token kerak
Javob `204`. Barcha qurilmalardan chiqaradi.

---

### 2.2. Bosh sahifa va katalog

#### `GET /api/landing/meta` — tokensiz
Hero bloki va "Imtihon qanday o'tadi" bo'limi uchun.
```json
{
  "questionCount": 1353,
  "questionsWithImage": 801,
  "topicCount": 16,
  "variantsBySize": { "10": 133, "20": 67 },
  "exam": {
    "questionCount": 20,
    "timeLimitMin": 25,
    "passPercent": 90,
    "maxMistakes": 2,
    "secondsPerQuestion": 75
  },
  "testSizes": [
    { "count": 20, "timeLimitMin": 25, "maxMistakes": 2 },
    { "count": 50, "timeLimitMin": 60, "maxMistakes": 5 },
    { "count": 100, "timeLimitMin": 120, "maxMistakes": 10 },
    { "count": 200, "timeLimitMin": 240, "maxMistakes": 20 }
  ],
  "langs": ["uzb", "uzc", "ru"]
}
```
`testSizes` — tasodifiy test hajmini tanlash tugmalari (20 / 50 / 100 / 200 savol). Tanlangan `count` test boshlashda yuboriladi (2.3 bo'limdagi jadval).

#### `GET /api/landing/demo-question?lang=uzb` — tokensiz
"SINAB KO'RING" bloki: rasmli tasodifiy savol, **to'g'ri javobi bilan**. Tekshiruv frontendda: `answerId === correctAnswerId`.
```json
{
  "id": 1009,
  "text": "Ko'rsatilgan qaysi yo'l belgisi ...?",
  "imageUrl": "http://localhost:4002/uploads/questions/src-4089....jpg",
  "topic": null,
  "answers": [
    { "id": 3241, "position": 1, "text": "Faqat b" },
    { "id": 3242, "position": 2, "text": "Faqat b, c, d" }
  ],
  "correctAnswerId": 3242,
  "explanation": null
}
```
- `position` — tugmadagi `F1`, `F2`, ... raqami.
- **Izoh qoidasi:** `explanation` faqat **tarifi bor (Standart/Pro/Max) foydalanuvchiga** va **test yakunlangandan keyin** keladi (2.8): `/attempts/:id/result`, yakunlangan attempt holati, `/me/mistakes`, `/me/bookmarks`. Mehmon rejimida, demo savolda (shu endpoint) va davom etayotgan testda doim `null`. `null` bo'lsa izoh blokini yashiring.

#### `GET /api/landing/variants?size=20` — token ixtiyoriy
"Variantni tanlang" setkasi. Token yuborilsa, har bir variant bo'yicha foydalanuvchining natijasi qo'shiladi. Mehmonda (tokensiz) hamma `result: null`, `solved: 0`: barcha kartochkalar oq ("yangi"), "Umumiy progress" blokini yashiring yoki o'rniga "Natijalarni saqlash uchun kiring" deb yozing.

| Query | Default | Tavsif |
|---|---|---|
| `size` | `20` | `20` yoki `10` savollik variantlar |

```json
{
  "items": [
    {
      "id": 4,
      "number": 4,
      "size": 20,
      "questionCount": 20,
      "timeLimitSec": 1500,
      "result": {
        "bestPercent": 90,
        "lastPercent": 85,
        "passed": true,
        "attempts": 3,
        "lastAt": "2026-11-18T09:00:38.340Z"
      }
    },
    { "id": 5, "number": 5, "size": 20, "questionCount": 20, "timeLimitSec": 1500, "result": null }
  ],
  "total": 67,
  "solved": 9,
  "passed": 6,
  "passPercent": 90
}
```

Kartochka ranglari (dizayn bo'yicha):

| Holat | Shart | Kartochka ostidagi yozuv |
|---|---|---|
| Yashil | `result.passed === true` (`bestPercent >= passPercent`) | `lastPercent` + "%" |
| To'q sariq | `result` bor, lekin `passed === false` | `lastPercent` + "%" |
| Oq | `result === null` | "yangi" |

"Umumiy progress: 9 / 67" → `solved / total`.

Variantni tanlanganda yon panelda "Oxirgi natija: 90%" uchun `result.lastPercent` dan foydalaning.

> Variant `id` va `number` har xil narsa: ekranda `number` ("Variant 4") ko'rsatiladi, API'ga `id` yuboriladi.

#### `GET /api/landing/topics?lang=uzb` — tokensiz
```json
[{ "id": 3, "slug": "yol-belgilari", "name": "Yo'l belgilari", "questionCount": 281, "mnemonicCount": 4 }]
```
`questionCount === 0` bo'lgan mavzuni nofaol ko'rsating. `mnemonicCount` — mavzu sahifasidagi "Eslab qolish uchun" kartochkalari soni (2.6.3); `0` bo'lsa blokni chiqarmang.

---

### 2.3. Mehmon va kirgan foydalanuvchi

Test ishlash uchun login **shart emas**. Lekin kirmagan foydalanuvchining hech narsasi saqlanmaydi.

| Imkoniyat | Mehmon (tokensiz) | Kirgan |
|---|---|---|
| Variantlar | ✅ faqat **birinchi 3 tasi** (har bir formatda: 20 va 10 savollik) | ✅ hammasi |
| Tasodifiy (aralash) test | ✅ faqat **20 savollik** | ✅ |
| Mavzu bo'yicha, qiyin savollar | ❌ login | ✅ |
| **Real imtihon** | ❌ login | ✅ (tarif bilan, 2.8) |
| **50 / 100 / 200 savollik test** | ❌ login | ✅ |
| Mashq va imtihon rejimi, natija va tahlil | ✅ | ✅ |
| Natija saqlanishi, variant kartochkasida % | ❌ | ✅ |
| Testlar tarixi, sahifa yangilansa davom ettirish | ❌ (faqat frontend xotirasida) | ✅ |
| Xatolar ustida ishlash | ❌ | ✅ |
| Saqlangan savollar ("Saqlash") | ❌ | ✅ |
| Statistika, kabinet | ❌ | ✅ |
| "Xato haqida xabar" | ❌ | ✅ |

Frontendda qaysi API'ni ishlatish token borligiga qarab tanlanadi:
```js
const startTest = (body) =>
  token
    ? api.post('/api/landing/attempts', body)    // 2.5 bo'lim — saqlanadi
    : api.post('/api/landing/guest/tests', body); // 2.4 bo'lim — saqlanmaydi
```

Bosh sahifadagi tugmalar (body ikkala API uchun bir xil):

| Tugma | Body | Mehmon | Kirgan |
|---|---|---|---|
| Variantlar → "Testni boshlash" | `{ source: "variant", variantId, mode }` | 1–3-variant: `POST /guest/tests`; 4-dan boshlab ❌ login (`requiresLogin: true`) | `POST /attempts` |
| **"Real imtihon topshirish"** (bosh sahifadagi katta tugma, "Real imtihon" kartasi) | `{ source: "exam", mode: "exam" }` — har safar 20 ta yangi tasodifiy savol | ❌ login oynasi | `POST /attempts` (tarif kerak) |
| 50 / 100 / 200 savollik test | `{ source: "random", mode: "exam" \| "practice", count: 50 \| 100 \| 200 }` | ❌ login oynasi (20 talik — ✅) | `POST /attempts` |
| "Mavzular bo'yicha" | `{ source: "topic", topicId, mode: "practice" }` | ❌ login oynasi | `POST /attempts` |
| "Qiyin savollar" | `{ source: "hard", mode: "practice" }` | ❌ login oynasi | `POST /attempts` |
| "Xatolar ustida ishlash" | `{ source: "mistakes", mode: "practice" }` | ❌ login oynasi | `POST /attempts` |
| Saqlangan savollar | `{ source: "bookmarks", mode: "practice" }` | ❌ login oynasi | `POST /attempts` |

Mehmonga ❌ bo'lgan tugmalarni ("Saqlash", "Xatolar ustida ishlash", "Xato haqida xabar", kabinet) ko'rsatish mumkin, lekin bosilganda login oynasini (Telegram) oching. Natija sahifasida "Natijangizni saqlash uchun tizimga kiring" bannerini ko'rsatish tavsiya etiladi.

Mehmon kirish talab qilinadigan endpoint'ga tokensiz murojaat qilsa `401` oladi.

#### Mehmon cheklovlari (login qilmagan)

Mehmon faqat **birinchi 3 ta variantni** (har formatda) va **20 savollik tasodifiy testni** ishlay oladi. Qolgani — 4-variantdan keyingilar, 50/100/200 talik testlar, real imtihon, mavzu bo'yicha va qiyin savollar testi — login bilan.

`POST /api/landing/guest/tests` (va 20 tadan ko'p savolli `POST /guest/result`) cheklovdan oshsa:
```json
{ "statusCode": 401, "code": "LOGIN_REQUIRED", "message": "Davom etish uchun tizimga kiring", "params": { "reason": "variant" } }
```
| `reason` | Qachon | UI matni (tavsiya) |
|---|---|---|
| `variant` | 4-variantdan keyingisi | "Qolgan variantlarni ishlash uchun ro'yxatdan o'ting — bepul" |
| `test_size` | 50 / 100 / 200 savol | "Katta testlar uchun tizimga kiring" |
| `exam` | Real imtihon | "Real imtihon uchun tizimga kiring" |
| `source` | Mavzu bo'yicha yoki qiyin savollar testi | "Bu bo'lim uchun tizimga kiring — bepul" |

Bu 401 — **token refresh qilmang** (mehmonda token yo'q), to'g'ridan-to'g'ri login/registratsiya oynasini oching. Login'dan keyin foydalanuvchi bosgan amalni davom ettiring (variant → `POST /attempts`; real imtihon → tarif bo'lmasa paywall).

Oldindan qulf ko'rsatish (so'rov yubormasdan):
- `GET /api/landing/variants?size=20` → har bir elementda `requiresLogin: boolean` (mehmonda 4-dan boshlab `true`, kirganda doim `false`). Kartada 🔒 + "Kirish kerak".
- `GET /api/landing/meta` → `guestLimits: { "freeVariants": 3, "maxTestSize": 20 }`. Mehmonga 50/100/200, "Real imtihon", "Mavzular bo'yicha" va "Qiyin savollar" tugmalari 🔒 bilan.

```ts
export interface GuestLimits { freeVariants: number; maxTestSize: number; }
// VariantItem ga qo'shilgan maydon
requiresLogin: boolean;
```

---

### 2.4. Mehmon rejimi — login qilmasdan test (tokensiz)

Server hech narsani yozmaydi: test holati (javoblar, taymer, joriy savol) **frontendda** turadi. Server faqat savollarni beradi, javobni tekshiradi va natijani hisoblaydi.

```
POST /guest/tests   ─►  savollar (to'g'ri javobsiz)
      │
      ├─ har bir javob (mashq ham, imtihon ham):  POST /guest/check  ─►  isCorrect + correctAnswerId (explanation doim null)
      │
      ├─ imtihonda xatolar soni maxMistakes dan oshdi (3-xato)  ─►  darhol POST /guest/result
      │
      └─ "Yakunlash" yoki vaqt tugadi:  POST /guest/result  ─►  natija + tahlil
```

#### `POST /api/landing/guest/tests`
Body (`/attempts` bilan bir xil). Mehmonga amalda ochiq: `variant` (1–3-variant) va `random` (`count` ≤ 20). `topic`, `hard`, `exam` va 20 dan katta `count` → 401 `LOGIN_REQUIRED` (2.3):
```json
{ "source": "variant", "variantId": 4, "mode": "exam", "lang": "ru", "count": 20 }
```
`mistakes` va `bookmarks` mehmonga yopiq: `400 VALIDATION_ERROR` keladi.

Javob:
```json
{
  "guest": true,
  "source": "variant",
  "mode": "exam",
  "variant": { "id": 4, "number": 4, "size": 20 },
  "topicId": null,
  "lang": "ru",
  "questionCount": 20,
  "timeLimitSec": 1500,
  "passPercent": 90,
  "maxMistakes": 2,
  "questions": [
    {
      "number": 1,
      "id": 106,
      "text": "В каком ответе ...?",
      "imageUrl": null,
      "topic": null,
      "answers": [{ "id": 301, "position": 1, "text": "..." }]
    }
  ]
}
```
- To'g'ri javob kelmaydi.
- Taymerni `timeLimitSec` dan frontendda boshlang (mashqda `null`).
- `maxMistakes` — imtihonda ruxsat etilgan xatolar (20 savolda 2 ta), mashqda `null`. Frontend xatolarni sanaydi: `wrong > maxMistakes` bo'lishi bilan (3-xato) testni to'xtatib, `/guest/result` ni chaqiradi.

#### `POST /api/landing/guest/check` — har bir javobdan keyin (mashq va imtihon)
```json
{ "questionId": 106, "answerId": 301, "lang": "ru" }
```
Javob:
```json
{ "isCorrect": false, "correctAnswerId": 302, "explanation": null }
```
Javob qotadi: bir savolga qayta javob bermaslikni frontend o'zi nazorat qiladi (ikkala rejimda).

#### `POST /api/landing/guest/result` — yakunlash
```json
{
  "questionIds": [106, 107, 108],
  "answers": [
    { "questionId": 106, "answerId": 301 },
    { "questionId": 107, "answerId": 305 }
  ],
  "mode": "exam",
  "variantId": 4,
  "durationSec": 876,
  "timeUp": false,
  "lang": "ru"
}
```

| Maydon | Tavsif |
|---|---|
| `questionIds` | `tests` javobidagi `questions[].id`, **o'sha tartibda** (1–200 ta) |
| `answers` | Faqat javob berilganlari. Javobsiz savol xato hisoblanadi |
| `mode` | Default `practice` |
| `variantId` | Ixtiyoriy: natijada "Variant 4" ko'rsatish uchun |
| `durationSec` | Frontend taymeri bo'yicha sarflangan vaqt (imtihonda limitdan oshmaydi) |
| `timeUp` | `true` — vaqt tugagani uchun yakunlanmoqda (`finishReason: "time_up"`) |

Xatolar limiti server tomonda ham tekshiriladi: imtihonda javob berib qilingan xatolar `maxMistakes` dan ko'p bo'lsa, `finishReason: "mistakes_limit"` va `passed: false` qaytadi.

Javob kirgan foydalanuvchidagi `/attempts/:id/result` bilan **bir xil shaklda**, faqat `id`, `startedAt` va `finishedAt` yo'q, `guest: true` qo'shilgan. Natija sahifasi komponentini ikkala holat uchun bitta qiling.
```json
{
  "guest": true,
  "mode": "exam",
  "status": "finished",
  "variant": { "id": 4, "number": 4, "size": 20 },
  "lang": "ru",
  "questionCount": 20,
  "timeLimitSec": 1500,
  "correctCount": 17,
  "wrongCount": 3,
  "unansweredCount": 3,
  "percent": 85,
  "passed": false,
  "passPercent": 90,
  "maxMistakes": 2,
  "finishReason": "completed",
  "durationSec": 1500,
  "avgSecPerQuestion": 75,
  "review": [
    { "number": 1, "id": 106, "text": "...", "imageUrl": null, "topic": null, "answers": [],
      "correctAnswerId": 302, "explanation": null, "myAnswerId": 301, "isCorrect": false }
  ]
}
```

Mehmon rejimidagi xatolar:
- `ANSWER_NOT_IN_QUESTION` — javob shu savolga tegishli emas.
- `QUESTION_NOT_IN_ATTEMPT` — `answers` da `questionIds` da yo'q savol bor.
- `UNKNOWN_QUESTIONS` — savol topilmadi yoki o'chirilgan.

> Mehmon test o'rtasida kirsa, joriy test davom etadi, lekin saqlanmaydi. Keyingi test `/attempts` orqali boshlanadi va saqlanadi.

> Mehmon test o'rtasida tilni almashtirsa, savollar matni o'zgarmaydi (ular `tests` javobida kelgan). Yangi til `check` va `result` ga `lang` bilan yuboriladi, ya'ni izoh va tahlil yangi tilda chiqadi. Hammasini yangi tilda ko'rsatish kerak bo'lsa, testni qaytadan boshlang.

---

### 2.5. Test ishlash — kirgan foydalanuvchi (token kerak, natijalar saqlanadi)

#### Oqim
```
POST /attempts  ─►  savollar (to'g'ri javobsiz)
      │
      ├─ har bir javob:  POST /attempts/:id/answers
      │      → darhol isCorrect + correctAnswerId (mashq ham, imtihon ham); explanation: null — izoh natijada
      │      → imtihonda 3-xato bo'lsa: finished: true → natija sahifasiga
      │
      ├─ "Yakunlash":    POST /attempts/:id/finish  ─►  natija + tahlil
      │
      └─ sahifa yangilansa: GET /attempts/:id  (davom ettirish)
```

#### Rejimlar

| | Mashq (`practice`) | Imtihon (`exam`) — "Real imtihon" |
|---|---|---|
| Javobdan keyin | To'g'ri / noto'g'ri, to'g'ri javob va izoh darhol | Xuddi shunday — darhol |
| Javobni o'zgartirish | Yo'q (`ALREADY_ANSWERED`) | Yo'q (`ALREADY_ANSWERED`) |
| Vaqt | Cheklanmagan (`timeLimitSec: null`) | `savollar × 75s` (20 → 25 daqiqa), serverda tekshiriladi |
| Xatolar limiti | Yo'q | `maxMistakes` (20 savolda **2 ta**). **3-xatoda imtihon darhol tugaydi**, `passed: false` |
| "To'g'ri: N, Xato: M" | Test davomida bor | Test davomida bor + "Yana N ta xato mumkin" (`mistakesLeft`) |

`maxMistakes` savollar soniga bog'liq: `savollar − ceil(savollar × 90%)`. 20 savol → 2, 10 savol → 1, 50 → 5, 100 → 10, 200 → 20.

**Vaqt** (imtihon rejimida, `timeLimitSec`):

| Savollar | Vaqt |
|---|---|
| 20 | 25 daqiqa |
| 50 | 60 daqiqa |
| 100 | 120 daqiqa |
| 200 | 240 daqiqa |
| Boshqa son (masalan, 10 savollik variant) | savollar × 75 soniya |

**Tasodifiy savollar** (`random`, `topic`, `hard`, `exam`):
- Bitta testda savol takrorlanmaydi. Bazada matni, rasmi va javoblari bir xil bo'lgan dublikat savollar ham bitta deb olinadi.
- **Qayta topshirishda takrorlanmaydi** (random 20/50/100/200, real imtihon, mavzu, hard): avval hali ko'rilmagan savollar tushadi. "Ko'rilgan" — oldingi testlarga tushgan har qanday savol (javob berilmagan yoki testdan chiqib ketilgan bo'lsa ham). Butun baza tugagach aylana qaytadan boshlanadi.
  - Kirgan foydalanuvchi: tarix serverda (`attempts`), frontend hech narsa yubormaydi.
  - Mehmon: frontend ko'rgan savollar ID larini `localStorage` (`guest_seen_questions`, oxirgi 1500 ta) da saqlaydi va `POST /guest/tests` ga `seenIds: number[]` (max 3000) qilib yuboradi.
- Savollar tartibi har safar aralash.

#### `POST /api/landing/attempts` — testni boshlash
Body:
```json
{ "source": "variant", "variantId": 4, "mode": "practice", "lang": "uzb" }
```

| Maydon | Majburiy | Tavsif |
|---|---|---|
| `source` | ha | `variant` · `topic` · `mistakes` (xatolarim) · `bookmarks` (saqlanganlar) · `random` (aralash) · `hard` (qiyin savollar) · `exam` (real imtihon: backend har doim 20 ta tasodifiy savol va `mode: "exam"` qo'yadi — 25 daqiqa, 2 xatogacha; `count`/`mode` e'tiborga olinmaydi; tarif `final_exam`) · `review` (aqlli takrorlash: vaqti kelgan xatolar, eng eskisi birinchi; tarif `smart_review`, aks holda `403 PREMIUM_REQUIRED`; 2.6.1) |
| `mode` | ha | `practice` yoki `exam` |
| `variantId` | `source=variant` bo'lsa | Variant **id** si |
| `topicId` | `source=topic` bo'lsa | Mavzu id si |
| `count` | yo'q | Variantdan boshqa manbalar uchun savollar soni, 1–200 (default 20). Tayyor hajmlar: 20, 50, 100, 200 |
| `lang` | yo'q | Berilmasa profildagi til |

Bosh sahifa tugmalari qaysi body yuborishi — 2.3 bo'limdagi jadvalda.

Ro'yxat bo'sh bo'lsa (masalan, xato yo'q) `400 NO_QUESTIONS` keladi: "Hozircha xato qilgan savollaringiz yo'q" deb ko'rsating. `review` da: "Bugun takrorlash yo'q" (tugmani `GET /me/review` dagi `dueNow > 0` bo'lganda faol qiling).

Javob — test holati (pastdagi `GET /attempts/:id` bilan bir xil).

#### `GET /api/landing/attempts/:id?lang=` — test holati
Sahifa yangilanganda yoki boshqa qurilmadan kirilganda testni davom ettirish uchun. `lang` berilsa matnlar shu tilda qaytadi (yuqoridagi "Sozlamalar"dan tilni almashtirish).

```json
{
  "id": "3c0503f0-79d8-44ea-84a6-0e3cfce70782",
  "source": "variant",
  "mode": "practice",
  "status": "in_progress",
  "variant": { "id": 4, "number": 4, "size": 20 },
  "topicId": null,
  "questionCount": 20,
  "timeLimitSec": null,
  "correctCount": 1,
  "wrongCount": 1,
  "percent": null,
  "passed": null,
  "passPercent": 90,
  "maxMistakes": null,
  "finishReason": null,
  "durationSec": null,
  "startedAt": "2026-11-18T09:00:38.147Z",
  "finishedAt": null,
  "lang": "uzb",
  "remainingSec": null,
  "answeredCount": 2,
  "mistakesLeft": null,
  "questions": [
    {
      "number": 1,
      "id": 106,
      "text": "Qaysi javobda ...?",
      "imageUrl": null,
      "topic": { "id": 10, "name": "To'xtash va to'xtab turish" },
      "answers": [
        { "id": 301, "position": 1, "text": "Trotuar tomonidan" },
        { "id": 302, "position": 2, "text": "Yo'l yoqasida yoki qatnov qismi tomonidan" }
      ],
      "myAnswerId": 301,
      "isCorrect": false,
      "correctAnswerId": 302,
      "explanation": null
    },
    {
      "number": 2,
      "id": 107,
      "text": "...",
      "imageUrl": "http://.../uploads/questions/src-....jpg",
      "topic": null,
      "answers": [],
      "myAnswerId": null,
      "isCorrect": null
    }
  ]
}
```

Muhim:
- `correctAnswerId` faqat javob berilgan savollarda keladi (ikkala rejimda). Javob berilmagan savolda bu maydonlar umuman bo'lmaydi. `explanation` test davomida `null`, attempt `finished` bo'lgach to'ldiriladi.
- `isCorrect`: `true` / `false` / `null` (hali javob berilmagan).
- `correctCount` va `wrongCount` test davomida ham keladi (ikkala rejimda).
- `mistakesLeft` — imtihonda yana nechta xato qilish mumkin (2 → 1 → 0), mashqda `null`.
- `remainingSec` — imtihonda qolgan soniya (mashqda `null`). Taymerni shundan boshlang va har soniyada frontendda kamaytiring. Server baribir o'zi tekshiradi.
- Vaqt tugagan imtihonni ochsangiz, server uni avtomatik yakunlaydi va `status: "finished"` qaytaradi → natija sahifasiga o'ting.

Savollar navigatsiyasi (1–20 tugmalar) ranglari:

| Holat | Shart |
|---|---|
| Joriy savol | frontend holati |
| Yashil | `isCorrect === true` |
| Qizil | `isCorrect === false` |
| Oq | `myAnswerId === null` |

Progress bar: `answeredCount / questionCount`.

#### `POST /api/landing/attempts/:id/answers` — javob berish
Body:
```json
{ "questionId": 106, "answerId": 301 }
```
Javob `200` (ikkala rejimda bir xil shakl):
```json
{
  "saved": true,
  "isCorrect": false,
  "correctAnswerId": 302,
  "explanation": null,
  "mnemonic": null,
  "mnemonicLocked": false,
  "correctCount": 15,
  "wrongCount": 3,
  "mistakesLeft": 0,
  "finished": true,
  "finishReason": "mistakes_limit"
}
```

| Maydon | Tavsif |
|---|---|
| `isCorrect`, `correctAnswerId` | Javob to'g'ri yoki noto'g'riligi — darhol ko'rsating (yashil / qizil). `explanation`, `mnemonic` bu yerda doim `null` — izoh va mnemonika natija sahifasida |
| `correctCount`, `wrongCount` | Pastki paneldagi "To'g'ri: N, Xato: M" |
| `mistakesLeft` | Imtihonda yana nechta xato mumkin (mashqda `null`) |
| `finished` | `true` — imtihon 3-xato bilan tugadi. Javob natijasini 1–2 soniya ko'rsatib, `GET /attempts/:id/result` ga o'ting |
| `finishReason` | `finished: true` bo'lsa `"mistakes_limit"`, aks holda `null` |

Xatolar:
- `409 ALREADY_ANSWERED` — savolga qayta javob berildi (ikkala rejimda javob qotadi).
- `409 ATTEMPT_FINISHED` — test yakunlangan yoki vaqt tugagan → natijaga o'ting.

`F1`–`F4` klaviatura tugmalari: `answers[position - 1]` ni yuboring.

#### `POST /api/landing/attempts/:id/finish` — yakunlash
Body yo'q. Javob — natija (pastdagi `/result` bilan bir xil). Qayta chaqirilsa ham xavfsiz: o'sha natija qaytadi.

Imtihonda vaqt tugaganda frontend o'zi `finish` ni chaqirsin.

#### `GET /api/landing/attempts/:id/result?lang=` — natija sahifasi
```json
{
  "id": "b82cdafa-...",
  "source": "variant",
  "mode": "exam",
  "status": "finished",
  "variant": { "id": 5, "number": 5, "size": 20 },
  "topicId": null,
  "questionCount": 20,
  "timeLimitSec": 1500,
  "correctCount": 18,
  "wrongCount": 2,
  "percent": 90,
  "passed": true,
  "passPercent": 90,
  "maxMistakes": 2,
  "finishReason": "completed",
  "durationSec": 876,
  "startedAt": "...",
  "finishedAt": "...",
  "lang": "ru",
  "unansweredCount": 0,
  "avgSecPerQuestion": 44,
  "review": [
    {
      "number": 7,
      "id": 353,
      "text": "...",
      "imageUrl": null,
      "topic": { "id": 10, "name": "..." },
      "answers": [],
      "correctAnswerId": 1138,
      "explanation": null,
      "myAnswerId": 1140,
      "isCorrect": false
    }
  ]
}
```

Dizayndagi elementlar:

| Element | Maydon |
|---|---|
| Doira: "18/20", "90%" | `correctCount`/`questionCount`, `percent` |
| "IMTIHONDAN O'TDINGIZ" yoki "O'TA OLMADINGIZ" | `passed` |
| Nega tugadi | `finishReason`: `completed` — oxirigacha ishlandi; `time_up` — vaqt tugadi; `mistakes_limit` — 3-xato qilindi ("Ruxsat etilgan 2 ta xatodan oshdingiz") |
| To'g'ri javoblar / Xatolar | `correctCount` / `wrongCount` |
| Sarflangan vaqt | `durationSec` → `mm:ss` |
| O'rtacha vaqt / savol | `avgSecPerQuestion` |
| 1–20 kataklar | `review[].isCorrect` |
| "Faqat xatolar" filtri | `review.filter(r => !r.isCorrect)` |
| "Sizning javobingiz: X" | `answers.find(a => a.id === myAnswerId)?.text` |
| "To'g'ri javob: Y" | `answers.find(a => a.id === correctAnswerId).text` |
| "Xatolar ustida ishlash" tugmasi | `POST /attempts { source: "mistakes", mode: "practice" }` |

- Javobsiz qolgan savol **xato hisoblanadi** (`wrongCount` ga kiradi, `myAnswerId: null`). Shuning uchun 3-xatoda to'xtagan imtihonda `wrongCount` katta bo'ladi (masalan, 1 to'g'ri + 3 xato + 16 javobsiz → `wrongCount: 19`). "Xatolar" plitkasida haqiqiy xatolar uchun `review.filter(r => r.myAnswerId !== null && !r.isCorrect).length` dan foydalanish mumkin.
- Yakunlanmagan testda `409 ATTEMPT_NOT_FINISHED` keladi.

#### `GET /api/landing/attempts?page=1&limit=20` — testlar tarixi
`items` — natija bilan bir xil umumiy maydonlar (`review` va `questions` siz). Tugallanmagan testlar ham bor (`status: "in_progress"`): ular uchun "Davom ettirish" ko'rsating.

---

### 2.6. Kabinet (token kerak)

#### `GET /api/landing/me`
Foydalanuvchi obyekti (2.1 dagi `user` bilan bir xil).

#### `PATCH /api/landing/me`
```json
{ "firstName": "Ali", "lastName": "Valiyev", "lang": "ru" }
```
Hamma maydon ixtiyoriy. `lang` — keyingi testlar uchun default til.

#### `GET /api/landing/me/stats?lang=uzb`
```json
{
  "finishedTests": 12,
  "exams": 5,
  "examsPassed": 3,
  "avgPercent": 82,
  "variantsSolved": 9,
  "totalTimeSec": 10450,
  "answered": 240,
  "correctRate": 84,
  "uniqueQuestionsSeen": 210,
  "totalQuestions": 1353,
  "mistakesCount": 17,
  "bookmarksCount": 4,
  "topics": [
    { "id": 8, "name": "Chorrahalar", "answered": 30, "correctRate": 60 }
  ]
}
```
`topics` eng zaifidan boshlab tartiblangan ("qaysi mavzu sust"). `mistakesCount` — hali o'rganilmagan xatolar (2.6.1).

#### Xatolarim
- `POST /api/landing/me/explanations` — `{ "questionIds": [12, 45], "lang": "uzb" }` (1–200 ta) → `[{ "id": 12, "explanation": "...", "mnemonic": "..." | null, "mnemonicLocked": false }]` (mnemonika 2.6.3). Mehmon sifatida ishlangan test natijasida izohlar yopiq ("Izohni ko'rish uchun kiring yoki ro'yxatdan o'ting"); foydalanuvchi kirgach frontend shu endpoint bilan natijadagi savollar izohlarini oladi. Davom etayotgan testidagi savollar (oxirgi 6 soat) qaytmaydi.
- `GET /api/landing/me/mistakes?page=1&limit=20&lang=uzb` — sahifalangan ro'yxat. Har bir element: savol + `correctAnswerId` + `explanation` + `mnemonic` + `mnemonicLocked` (2.6.3) + `wrongCount` + `lastWrongAt` + `myAnswerId` + `reviewStep` + `reviewSteps` + `dueAt`.
  - `reviewStep` / `reviewSteps` — aqlli takrorlash bosqichi: `0/3`, `1/3`, `2/3` (3 da o'rganiladi va ro'yxatdan chiqadi). Kartada 3 ta nuqta yoki "1/3" ko'rinishida. `dueAt` — keyingi takrorlash vaqti ("Ertaga", "3 kundan keyin").
  - `myAnswerId` — foydalanuvchi oxirgi xatoda tanlagan javob. Kartada qizil rangda "Sizning javobingiz" deb ko'rsating, to'g'ri javob esa yashil. Javob keyinroq o'chirilgan bo'lsa `null` keladi — belgi ko'rsatilmaydi.
  - Admin nofaol qilgan savollar ro'yxatga ham, `total` ga ham kirmaydi (saqlanganlarda ham shunday).
- `DELETE /api/landing/me/mistakes/:questionId` → `204`

Savol ro'yxatga xato qilinganda tushadi. **O'zgardi:** endi bitta to'g'ri javob bilan chiqib ketmaydi — aqlli takrorlash qoidasi bo'yicha 3 marta, vaqtida to'g'ri javob berilsa chiqadi (2.6.1). Qo'lda olib tashlash (`DELETE`) avvalgidek ishlaydi.

#### 2.6.1. Aqlli takrorlash (spaced repetition)

Xato qilingan savol bir martada emas, vaqt o'tib qayta so'raladi — shunda u haqiqatan yodda qoladi.

```
xato ──1 kun──► takrorlash ✓ ──3 kun──► takrorlash ✓ ──7 kun──► takrorlash ✓ ──► O'RGANILDI
          ✗ (istalgan bosqichda, istalgan testda) ──► bosqich 0, yana 1 kundan keyin
```

Qoidalar (server o'zi yuritadi, frontend faqat ko'rsatadi):
- Xato javob (istalgan test: variant, random, imtihon, jamoaviy...) → savol ro'yxatga tushadi yoki bosqichi 0 ga qaytadi, **1 kundan keyin** takrorlanadi. O'rganilgan savolda xato qilinsa ham qaytadi.
- **Vaqti kelgan** (`dueAt` o'tgan) savolga to'g'ri javob → keyingi bosqich: 3 kundan, keyin 7 kundan keyin. 3-to'g'ri javobda — **o'rganildi**, ro'yxat, `mistakesCount` va "Xatolarim" testidan chiqadi.
- Vaqti kelmasdan berilgan to'g'ri javob **hisobga olinmaydi** (bugun xato qilib, bugun to'g'ri topish — hali o'rganganlik emas).
- Ro'yxat va bosqichlar **hammaga** yuritiladi. **Takrorlash testi** (`source: "review"`) — faqat `smart_review` imkoniyatli tarifda (hozir **Pro** va **Max**). Oddiy "Xatolarim" testi (`source: "mistakes"`) bepul foydalanuvchiga ham ochiq qoladi.

##### `GET /api/landing/me/review`
```json
{
  "locked": false,
  "dueNow": 14,
  "dueNext24h": 5,
  "learning": 37,
  "learned": 12,
  "nextDueAt": "2026-11-24T10:06:19.303Z",
  "byStep": [20, 11, 6],
  "intervalsDays": [1, 3, 7],
  "stepsToLearn": 3
}
```
| Maydon | Tavsif |
|---|---|
| `locked` | `true` — tarifda `smart_review` yo'q: takrorlash testini boshlash `403 PREMIUM_REQUIRED` (`feature: "smart_review"`). Raqamlar baribir keladi — ularni ko'rsatib, tugmani qulf bilan bering |
| `dueNow` | Hozir takrorlash kerak bo'lgan savollar soni |
| `dueNext24h` | Keyingi 24 soatda vaqti keladiganlar ("Ertaga: 5 ta") |
| `learning` | O'rganilayotgan (ro'yxatdagi) xatolar |
| `learned` | O'rganib bo'lingan savollar (motivatsiya: "12 ta savolni o'zlashtirdingiz") |
| `nextDueAt` | `dueNow = 0` bo'lsa — keyingi takrorlash qachon. Xato bo'lmasa `null` |
| `byStep` | Bosqichlar bo'yicha: `[0-bosqich, 1-bosqich, 2-bosqich]` (progress-bar uchun) |

**Ekran — bosh sahifa / kabinetdagi "Takrorlash" kartasi:**
```
🔁 Bugun takrorlash: 14 ta savol            ← dueNow
   O'rganilmoqda 37 · O'rganildi 12          ← learning · learned
   [██████░░░░] 0-bosqich 20 · 1-bosqich 11 · 2-bosqich 6
   [ Takrorlashni boshlash ]                 ← POST /attempts { source: "review", mode: "practice" }
```
- `dueNow = 0` → "Bugun takrorlash yo'q. Keyingisi: ertaga 10:06" (`nextDueAt`), tugma disabled.
- `learning = 0 && learned = 0` → kartani ko'rsatmang (yoki "Xato qilgan savollaringiz shu yerda takrorlanadi").
- `locked: true` → tugma o'rniga `🔒 Takrorlashni boshlash` → paywall (`smart_review`).
- Takrorlash testi tugagach (`POST /attempts/:id/finish`) kartani yangilash uchun `GET /me/review` ni qayta chaqiring.
- Testga `count` berilmasa 20 ta savol olinadi; ko'proq bo'lsa `count: dueNow` (200 gacha) yuboring.

#### 2.6.2. Imtihonga tayyorlik foizi

##### `GET /api/landing/me/readiness?lang=uzb`
Kirgan har bir foydalanuvchiga (tarifsiz ham) ochiq. Har chaqirilganda bugungi qiymat tarixga yoziladi.
```json
{
  "score": 64,
  "level": "medium",
  "enoughData": true,
  "change7d": 9,
  "components": {
    "exam":     { "score": 80, "weight": 0.4,  "count": 3, "passed": 1, "lastAt": "2026-11-22T14:10:00.000Z" },
    "accuracy": { "score": 83, "weight": 0.35, "answered": 300 },
    "coverage": { "score": 22, "weight": 0.25, "seen": 297, "total": 1353 }
  },
  "weakTopics": [
    { "id": 1, "name": "Umumiy qoidalar", "answered": 27, "correctRate": 57 }
  ],
  "review": { "dueNow": 14, "learning": 37, "learned": 12 },
  "tips": [
    { "code": "review_due", "params": { "count": 14 } },
    { "code": "weak_topic", "params": { "topicId": 1, "name": "Umumiy qoidalar", "correctRate": 57 } }
  ],
  "history": [ { "day": "2026-11-20", "score": 55 }, { "day": "2026-11-23", "score": 64 } ]
}
```

**Hisoblash** (0–100): `score = exam × 0.4 + accuracy × 0.35 + coverage × 0.25`
| Qism | Nima |
|---|---|
| `exam` | Oxirgi 5 ta imtihon rejimidagi testning (`mode: "exam"`, yakuniy test ham) o'rtacha foizi. Imtihon ishlanmagan bo'lsa 0 — shuning uchun imtihonsiz foiz 60 dan oshmaydi |
| `accuracy` | Oxirgi 300 ta javobdagi to'g'ri javoblar foizi |
| `coverage` | Kamida bir marta to'g'ri javob berilgan savollar / bazadagi barcha faol savollar |

| Maydon | Tavsif |
|---|---|
| `level` | `low` (<50) · `medium` (50–69) · `good` (70–84) · `ready` (85+). Rang: qizil · sariq · ko'k · yashil |
| `enoughData` | `false` — 50 tadan kam javob: foiz yonida "Taxminiy — ko'proq test ishlang" deb yozing |
| `change7d` | 7 kun oldingi qiymatga nisbatan o'zgarish (`+9` yashil, `-4` qizil). Tarix yo'q bo'lsa `null` |
| `weakTopics` | Eng zaif 3 ta mavzu (kamida 5 ta javob, aniqlik 80% dan past). Har biriga "Mashq qilish" → `POST /attempts { source: "topic", topicId }` |
| `tips` | Maslahatlar, muhimlik tartibida. Matn frontendda `code` bo'yicha (pastdagi kalitlar). Odatda 1–2 tasini ko'rsatish yetarli |
| `history` | Oxirgi 30 kun, faqat foydalanuvchi sahifani ochgan kunlar (har kuni nuqta bo'lmasligi mumkin). Chiziqli grafik |

`tips[].code`:
| code | params | Matn (uzb) | Tugma |
|---|---|---|---|
| `take_exam` | — | So'nggi 7 kunda yakuniy test ishlamadingiz | "Yakuniy test" → `source: "exam"` (tarifsiz — paywall) |
| `review_due` | `count` | Bugun {count} ta savolni takrorlash kerak | "Takrorlash" → `source: "review"` (tarifsiz — paywall) |
| `weak_topic` | `topicId`, `name`, `correctRate` | «{name}» mavzusida natija {correctRate}% | "Mashq qilish" → `source: "topic"` |
| `low_coverage` | `seen`, `total` | Bazaning {seen}/{total} savolini o'zlashtirgansiz | "Tasodifiy test" → `source: "random"` |
| `keep_going` | — | Zo'r! Shu tempda davom eting | — |

**Ekran — kabinet tepasida (va bosh sahifada kirgan foydalanuvchiga):**
```
Imtihonga tayyorlik
   ◔ 64%   ▲ +9 (7 kun)            ← score (aylana progress), change7d
   O'rtacha — yana biroz mashq      ← level
   Imtihonlar 80% · Aniqlik 83% · Qamrov 22%   ← components.*.score
   💡 Bugun 14 ta savolni takrorlash kerak  [Takrorlash]   ← tips[0]
   Zaif mavzular: Umumiy qoidalar 57% [Mashq]  ...
   [grafik: history]
```
"Imtihondan o'tish ehtimoli" deb **yozmang** — bu kafolat emas, tayyorlik ko'rsatkichi.

##### TypeScript
```ts
export interface ReviewSummary {
  locked: boolean;
  dueNow: number;
  dueNext24h: number;
  learning: number;
  learned: number;
  nextDueAt: string | null;
  byStep: [number, number, number];
  intervalsDays: number[];
  stepsToLearn: number;
}

export type ReadinessLevel = 'low' | 'medium' | 'good' | 'ready';
export type ReadinessTip =
  | { code: 'take_exam' }
  | { code: 'review_due'; params: { count: number } }
  | { code: 'weak_topic'; params: { topicId: number; name: string; correctRate: number } }
  | { code: 'low_coverage'; params: { seen: number; total: number } }
  | { code: 'keep_going' };

export interface Readiness {
  score: number;
  level: ReadinessLevel;
  enoughData: boolean;
  change7d: number | null;
  components: {
    exam: { score: number; weight: number; count: number; passed: number; lastAt: string | null };
    accuracy: { score: number; weight: number; answered: number };
    coverage: { score: number; weight: number; seen: number; total: number };
  };
  weakTopics: { id: number; name: string; answered: number; correctRate: number }[];
  review: { dueNow: number; learning: number; learned: number };
  tips: ReadinessTip[];
  history: { day: string; score: number }[];
}

// MistakeItem'ga qo'shilgan maydonlar
// reviewStep: number; reviewSteps: number; dueAt: string;
```
`AttemptSource` turiga `'review'`, `PlanFeature` ga `'smart_review'` qo'shing; `lib/constants.ts` dagi `PLAN_FEATURES` ro'yxatiga `{ key: "smart_review" }` (`explanations` dan keyin).

##### Tarjima kalitlari

| Kalit | uzb | uzc | ru | kk |
|---|---|---|---|---|
| `review.title` | Takrorlash | Такрорлаш | Повторение | Қайталау |
| `review.dueNow` | Bugun takrorlash: {count} ta savol | Бугун такрорлаш: {count} та савол | Повторить сегодня: {count} вопр. | Бүгін қайталау: {count} сұрақ |
| `review.nothingToday` | Bugun takrorlash yo'q. Keyingisi: {date} | Бугун такрорлаш йўқ. Кейингиси: {date} | Сегодня повторять нечего. Следующее: {date} | Бүгін қайталау жоқ. Келесісі: {date} |
| `review.learning` | O'rganilmoqda | Ўрганилмоқда | Изучается | Үйренілуде |
| `review.learned` | O'rganildi | Ўрганилди | Выучено | Үйренілді |
| `review.start` | Takrorlashni boshlash | Такрорлашни бошлаш | Начать повторение | Қайталауды бастау |
| `review.step` | {step}/{total} bosqich | {step}/{total} босқич | Этап {step}/{total} | {step}/{total} кезең |
| `review.hint` | Xatolaringiz 1, 3 va 7 kundan keyin qayta so'raladi. 3 marta to'g'ri topsangiz — o'rganildi | Хатоларингиз 1, 3 ва 7 кундан кейин қайта сўралади. 3 марта тўғри топсангиз — ўрганилди | Ошибки повторяются через 1, 3 и 7 дней. Ответили верно 3 раза — выучено | Қателеріңіз 1, 3 және 7 күннен кейін қайта сұралады. 3 рет дұрыс тапсаңыз — үйренілді |
| `readiness.title` | Imtihonga tayyorlik | Имтиҳонга тайёрлик | Готовность к экзамену | Емтиханға дайындық |
| `readiness.level.low` | Hali erta — ko'proq mashq qiling | Ҳали эрта — кўпроқ машқ қилинг | Пока рано — больше практики | Әлі ерте — көбірек жаттығыңыз |
| `readiness.level.medium` | O'rtacha — yana biroz mashq | Ўртача — яна бироз машқ | Средне — ещё немного практики | Орташа — тағы аздап жаттығу |
| `readiness.level.good` | Yaxshi — imtihonga yaqinsiz | Яхши — имтиҳонга яқинсиз | Хорошо — вы близки к цели | Жақсы — емтиханға жақынсыз |
| `readiness.level.ready` | Tayyorsiz! | Тайёрсиз! | Вы готовы! | Дайынсыз! |
| `readiness.estimate` | Taxminiy — ko'proq test ishlang | Тахминий — кўпроқ тест ишланг | Приблизительно — решите больше тестов | Шамамен — көбірек тест шешіңіз |
| `readiness.exam` | Imtihonlar | Имтиҳонлар | Экзамены | Емтихандар |
| `readiness.accuracy` | Aniqlik | Аниқлик | Точность | Дәлдік |
| `readiness.coverage` | Qamrov | Қамров | Охват | Қамту |
| `readiness.weakTopics` | Zaif mavzular | Заиф мавзулар | Слабые темы | Әлсіз тақырыптар |
| `readiness.tip.take_exam` | So'nggi 7 kunda yakuniy test ishlamadingiz | Сўнгги 7 кунда якуний тест ишламадингиз | Вы не сдавали итоговый тест 7 дней | Соңғы 7 күнде қорытынды тест тапсырмадыңыз |
| `readiness.tip.review_due` | Bugun {count} ta savolni takrorlash kerak | Бугун {count} та саволни такрорлаш керак | Сегодня нужно повторить {count} вопр. | Бүгін {count} сұрақты қайталау керек |
| `readiness.tip.weak_topic` | «{name}» mavzusida natija {correctRate}% | «{name}» мавзусида натижа {correctRate}% | Тема «{name}»: {correctRate}% | «{name}» тақырыбы: {correctRate}% |
| `readiness.tip.low_coverage` | Bazaning {seen}/{total} savolini o'zlashtirgansiz | Базанинг {seen}/{total} саволини ўзлаштиргансиз | Освоено {seen} из {total} вопросов | Базаның {seen}/{total} сұрағын меңгердіңіз |
| `readiness.tip.keep_going` | Zo'r! Shu tempda davom eting | Зўр! Шу темпда давом этинг | Отлично! Продолжайте в том же темпе | Тамаша! Осы қарқынмен жалғастырыңыз |
| `pricing.feature.smart_review` | Aqlli takrorlash | Ақлли такрорлаш | Умное повторение | Ақылды қайталау |
| `paywall.smart_review` | Aqlli takrorlash — xatolaringiz vaqt o'tib qayta so'raladi va yodda qoladi | Ақлли такрорлаш — хатоларингиз вақт ўтиб қайта сўралади ва ёдда қолади | Умное повторение — ошибки возвращаются через время и запоминаются | Ақылды қайталау — қателер уақыт өте қайта сұралады және есте қалады |

#### 2.6.3. Mnemonika — "Eslab qolish uchun" (Max tarifi)

Savolga 1–2 qatorlik eslab qolish usuli: qofiya, assotsiatsiya, raqam qoidasi. Masalan: *"Uchburchak ogohlantiradi, qizil doira taqiqlaydi, ko'k doira buyuradi: shakl = vazifa."* Hamma savolda bo'lmaydi, faqat qiyin yoki chalkash savollarda. Mavzular uchun ham umumiy kartochkalar bor.

**Savoldagi maydonlar** (izoh bor joyning hammasida: `GET /attempts/:id` yakunlangan test, `GET /attempts/:id/result`, `GET /me/mistakes`, `GET /me/bookmarks`, `POST /me/explanations`, jamoaviy test tahlili):

| Maydon | Qiymat |
|---|---|
| `mnemonic` | Matn (tanlangan tilda) — faqat **Max** (`mnemonics` imkoniyati) bo'lsa; aks holda `null` |
| `mnemonicLocked` | `true` — savolda mnemonika **bor**, lekin tarif yo'q. `false` — mnemonika yo'q yoki ochiq |

Davom etayotgan testda va javob berish paytida ikkalasi ham `null` / `false` (izoh kabi, test tugagach chiqadi). Mehmonda ham `null` / `false`.

Uchta holat:
```
mnemonic: "..."        → ochiq blok
mnemonic: null, mnemonicLocked: true   → xira blok + "Max bilan ochish"
mnemonic: null, mnemonicLocked: false  → blok umuman chiqmaydi
```

Ko'rinishi (izoh blokining tagida):
```
┌──────────────────────────────────────────────┐
│ 📖 Izoh                                      │
│ ...                                          │
├──────────────────────────────────────────────┤
│ 💡 Eslab qolish uchun                        │
│ "Uchburchak — ogohlantiradi, doira — taqiq"  │
└──────────────────────────────────────────────┘

Qulf (mnemonicLocked: true):
├──────────────────────────────────────────────┤
│ 💡 Eslab qolish uchun              🔒 Max    │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░ (xira, blur)      │
│        [ Max bilan ochish → ]                │
└──────────────────────────────────────────────┘
```
Xira blokda haqiqiy matn yo'q (kelmaydi) — tasodifiy "skelet" chiziqlar chizing. Tugma paywall modalini `feature: "mnemonics"` bilan ochadi. Max hozir **"Tez kunda"** (`comingSoon`) bo'lsa ham qulf ko'rsatilaveradi: paywall Max kartasini "Tez kunda" holatida ko'rsatadi.

##### `GET /api/landing/me/topics/:topicId/mnemonics?lang=uzb` — token kerak

Mavzu sahifasidagi kartochkalar:
```json
{
  "topic": { "id": 6, "name": "Harakatlanish tezligi" },
  "locked": false,
  "count": 4,
  "items": ["...", "...", "...", "..."]
}
```
- `locked: true` (Max yo'q) → `items: []`, lekin `count` keladi: "💡 4 ta eslab qolish usuli — 🔒 Max" kartasi, ichida `count` ta xira kartochka.
- Mehmonda (tokensiz) chaqirmang: `GET /topics` dagi `mnemonicCount` bilan bir xil qulf kartani ko'rsating, tugma login oynasini ochadi.
- `404 NOT_FOUND` — mavzu yo'q yoki nofaol.

##### TypeScript
```ts
export interface MnemonicFields {
  mnemonic: string | null;
  mnemonicLocked: boolean;
}
// RevealedQuestion (natija, xatolarim, saqlanganlar) = ... & MnemonicFields

export interface TopicMnemonics {
  topic: { id: number; name: string | null };
  locked: boolean;
  count: number;
  items: string[];
}
```

##### Tarjima kalitlari

| Kalit | uzb | uzc | ru | kk |
|---|---|---|---|---|
| `mnemonic.title` | Eslab qolish uchun | Эслаб қолиш учун | Как запомнить | Есте сақтау үшін |
| `mnemonic.unlock` | Max bilan ochish | Max билан очиш | Открыть с Max | Max арқылы ашу |
| `mnemonic.topicCount` | {n} ta eslab qolish usuli | {n} та эслаб қолиш усули | {n} способов запомнить | {n} есте сақтау тәсілі |

#### Saqlangan savollar ("Saqlash" tugmasi)
- `GET /api/landing/me/bookmarks/ids` → `[46, 120, ...]`. Test sahifasida belgini ko'rsatish uchun bir marta oling.
- `PUT /api/landing/me/bookmarks/:questionId` → `204` (saqlash)
- `DELETE /api/landing/me/bookmarks/:questionId` → `204` (olib tashlash)
- `GET /api/landing/me/bookmarks?page&limit&lang` — ro'yxat (savol + to'g'ri javob + `savedAt`)

#### "Xato haqida xabar"
`POST /api/landing/questions/:questionId/report`
```json
{ "message": "Rasmdagi belgi noaniq" }
```
`message` — 3–1000 belgi. Javob: `{ "id": 1, "status": "open" }`. Daqiqasiga 10 ta xabar cheklovi bor.

---

### 2.7. Yo'l belgilari (tokensiz)

Sahifa ikki bosqichli: avval kategoriyalar ro'yxati, kategoriyaga kirilganda uning ichidagi belgilar. 7 ta kategoriya, 279 ta belgi.

```
GET /signs/groups              ─►  kategoriyalar (kartochkalar)
GET /signs/groups/:slug        ─►  kategoriya + uning barcha belgilari
GET /signs/:slug               ─►  bitta belgi (oldingi / keyingi bilan)
GET /signs/search?search=...   ─►  qidiruv
```

Hammasi `?lang=uzb|uzc|ru|kk` qabul qiladi.
- Matnlar asl faylda faqat o'zbek lotinida edi. Kirillchasi avtomatik o'girilgan.
- Ruschasi hali yo'q: `lang=ru` da o'zbekchasi qaytadi, admin to'ldirganda ruscha chiqadi.

#### `GET /api/landing/signs/groups?lang=uzb`
```json
[
  {
    "id": 1,
    "slug": "ogohlantiruvchi",
    "name": "Ogohlantiruvchi belgilar",
    "description": "Yo'lning xavfli qismiga yaqinlashayotganingiz haqida ogohlantiradi",
    "shape": "triangle",
    "appearance": "qizil hoshiyali oq uchburchak",
    "signCount": 48,
    "previewImageUrl": "http://localhost:4002/uploads/signs/1-1.svg"
  }
]
```
- `shape` — `triangle` · `circle` · `rectangle` · `mixed` (kartochka ikonkasi yoki rangi uchun).
- `previewImageUrl` — kategoriyaning birinchi belgisi, kartochkadagi namuna rasm.

#### `GET /api/landing/signs/groups/:slug?lang=uzb`
`:slug` o'rniga `id` ham bo'ladi (`/groups/3`).
```json
{
  "id": 2,
  "slug": "imtiyoz",
  "name": "Imtiyoz belgilari",
  "description": "...",
  "shape": "mixed",
  "appearance": "har xil",
  "signCount": 13,
  "signs": [
    {
      "id": 49,
      "groupId": 2,
      "code": "2.1",
      "slug": "2-1",
      "name": "Asosiy yo'l",
      "description": "Tartibga solinmagan chorrahalardan birinchi o'tish huquqi beriladi",
      "imageUrl": "http://localhost:4002/uploads/signs/2-1.svg"
    }
  ]
}
```
Topilmasa `404 NOT_FOUND`.

#### `GET /api/landing/signs/:slug?lang=uzb`
Belgi sahifasi yoki modal oyna. `:slug` o'rniga `id` ham bo'ladi.
```json
{
  "id": 174,
  "groupId": 5,
  "code": "5.26",
  "slug": "5-26-2",
  "name": "Manzil nomi (ko'cha nomi)",
  "description": "Ko'cha yoki obyekt nomi",
  "imageUrl": "http://localhost:4002/uploads/signs/5-26-2.svg",
  "group": { "id": 5, "slug": "axborot-ishora", "name": "Axborot-ishora belgilari" },
  "prev": { "id": 173, "slug": "5-26", "code": "5.26" },
  "next": { "id": 175, "slug": "5-27", "code": "5.27" }
}
```
- `prev` / `next` — shu kategoriyadagi oldingi va keyingi belgi ("←  →" tugmalari). Chetda bo'lsa `null`.
- **Manzilda `slug` ishlating, `code` emas.** `code` takrorlanishi mumkin: `5.26` ikkita belgi (daryo nomi va ko'cha nomi).

#### `GET /api/landing/signs/search?search=5.2&lang=uzb`
Raqamning boshi (`5.2` → 5.2, 5.20.1, ...) yoki nomi bo'yicha, 4 tilda va inglizcha nomida. 50 tagacha natija, shakli `signs[]` elementi bilan bir xil.

#### Rasmlar
- Belgilar SVG formatida. `<img src={imageUrl}>` bilan ko'rsating: o'lchami istalgancha kattalashadi, sifati buzilmaydi.
- SVG ichida skript bo'lmaydi: import va admin yuklashda tekshiriladi, server ham taqiqlaydi.

### 2.8. Tariflar, paywall va to'lov (Click, Payme)

Loyiha umumiy sayt: foydalanuvchi tarif sotib oladi. Swagger'da `billing` tegi.

#### 2.8.1. Kim nimaga kira oladi

| | Mehmon | Bepul (kirgan, tarifsiz) | Standart / Pro | Max |
|---|---|---|---|---|
| Variantlar | faqat **1–3-variant** (20 va 10 savollik formatlarning har birida) | ✅ hammasi | ✅ | ✅ |
| Tasodifiy test | faqat **20 savollik** | ✅ | ✅ | ✅ |
| Mavzu bo'yicha, qiyin savollar | ❌ (login) | ✅ | ✅ | ✅ |
| 50 / 100 / 200 savollik test | ❌ (login) | ✅ | ✅ | ✅ |
| Xatolarim, saqlanganlar, tarix, statistika | ❌ (login kerak) | ✅ | ✅ | ✅ |
| **Yakuniy test** (real imtihon, `source: "exam"`) | ❌ (login) | ❌ (tarif) | ✅ | ✅ |
| **Izohlar** (`explanation`) | ❌ | ❌ | ✅ | ✅ |
| **Aqlli takrorlash testi** (`source: "review"`, 2.6.1) | ❌ | ❌ (ro'yxat va raqamlar ko'rinadi) | ❌ Standart / ✅ **Pro** | ✅ |
| Tayyorlik foizi (2.6.2) | ❌ | ✅ | ✅ | ✅ |
| **Mnemonika** ("Eslab qolish uchun", 2.6.3) | ❌ | ❌ (🔒 xira blok ko'rinadi) | ❌ | ✅ |
| Videodarslar | ❌ | ❌ | ❌ | ✅ (hozircha "Tez kunda", API yo'q) |

Tariflar (narxi va muddatini admin o'zgartira oladi, shuning uchun **frontendga qattiq yozmang** — `GET /plans` dan oling):

| code | Nomi | Narx | Muddat | Holat |
|---|---|---|---|---|
| `standard` | Standart | 45 000 so'm | 14 kun | sotuvda |
| `pro` | Pro | 65 000 so'm | 30 kun | sotuvda, POPULAR |
| `max` | Max | 399 000 so'm | 30 kun | **Tez kunda** (sotib bo'lmaydi) |

To'lov: **Click**, **Payme** (onlayn), naqd yoki karta orqali (admin qo'lda beradi, 3.10).

#### 2.8.2. Endpointlar

##### `GET /api/landing/plans?lang=uzb` — tokensiz

```json
{
  "items": [
    {
      "id": 1,
      "code": "standard",
      "title": "Standart",
      "description": "Faqat testlar (videosiz)",
      "priceUzs": 45000,
      "durationDays": 14,
      "features": ["all_tests", "final_exam", "explanations"],
      "isPopular": false,
      "comingSoon": false
    },
    {
      "id": 2,
      "code": "pro",
      "title": "Pro",
      "description": "Faqat testlar (videosiz)",
      "priceUzs": 65000,
      "durationDays": 30,
      "features": ["all_tests", "final_exam", "explanations", "smart_review"],
      "isPopular": true,
      "comingSoon": false
    },
    {
      "id": 3,
      "code": "max",
      "title": "Max",
      "description": "Testlar + videodarslar",
      "priceUzs": 399000,
      "durationDays": 30,
      "features": ["all_tests", "final_exam", "explanations", "smart_review", "videos", "mnemonics"],
      "isPopular": false,
      "comingSoon": true
    }
  ],
  "providers": ["click", "payme"]
}
```

- `title`, `description` — so'ralgan tilda tayyor matn.
- `providers` — serverda ulangan to'lov tizimlari. Bo'sh massiv bo'lsa to'lov tugmalarini yashiring ("To'lov vaqtincha ishlamayapti").

##### `GET /api/landing/me/access?lang=uzb` — token kerak

```json
{
  "isPremium": true,
  "features": ["all_tests", "final_exam", "explanations"],
  "current": {
    "planCode": "pro",
    "planTitle": "Pro",
    "expiresAt": "2026-12-23T06:59:08.146Z"
  },
  "accessUntil": "2027-01-06T06:59:08.146Z",
  "active": [
    { "id": 1, "planCode": "pro", "planTitle": "Pro", "features": ["all_tests", "final_exam", "explanations", "smart_review"],
      "startsAt": "2026-11-23T06:59:08.146Z", "expiresAt": "2026-12-23T06:59:08.146Z" }
  ],
  "upcoming": [
    { "id": 2, "planCode": "standard", "planTitle": "Standart", "features": ["all_tests", "final_exam", "explanations"],
      "startsAt": "2026-12-23T06:59:08.146Z", "expiresAt": "2027-01-06T06:59:08.146Z" }
  ]
}
```

Tarifsiz foydalanuvchida:
```json
{ "isPremium": false, "features": [], "current": null, "accessUntil": null, "active": [], "upcoming": [] }
```

| Maydon | Ma'nosi |
|---|---|
| `isPremium` | Hozir faol tarif bormi |
| `features` | Hozir ochiq imkoniyatlar. **Paywall shu ro'yxat bo'yicha** (`features.includes('final_exam')`) |
| `current` | Hozirgi tarif (header/kabinetda "Pro · 23-dekabrgacha") |
| `accessUntil` | Navbatdagi davrlar bilan birga oxirgi kirish kuni |
| `upcoming` | Oldingisi tugagach boshlanadigan davrlar (tarif tugamasdan yana sotib olinganda) |

**Qachon chaqirish:** login/registratsiyadan keyin, ilova ochilganda (token bo'lsa), to'lov `paid` bo'lgandan keyin, `PREMIUM_REQUIRED` xatosi kelganda (keshni yangilash uchun).

##### `POST /api/landing/orders` — token kerak

So'rov:
```json
{ "planId": 2, "provider": "payme", "lang": "uzb" }
```
- `provider`: `"click"` | `"payme"`
- `lang` — to'lov sahifasi tili (ixtiyoriy; `ru`/`kk` → ruscha, qolgani o'zbekcha).

Javob (201):
```json
{
  "id": 123,
  "planCode": "pro",
  "planTitle": "Pro",
  "durationDays": 30,
  "amount": 65000,
  "provider": "payme",
  "status": "pending",
  "paidAt": null,
  "createdAt": "2026-11-23T06:58:55.593Z",
  "paymentUrl": "https://checkout.paycom.uz/bT10ZXN0..."
}
```
→ `window.location.href = paymentUrl` (yangi tabda emas, shu tabda).

Xatolar:
| HTTP | code | Qachon | Nima ko'rsatish |
|---|---|---|---|
| 404 | `PLAN_NOT_AVAILABLE` | Tarif "Tez kunda" yoki yashirilgan | "Bu tarif hozircha sotuvda emas", `GET /plans` ni yangilang |
| 503 | `PAYMENT_PROVIDER_DISABLED` | Shu to'lov tizimi ulanmagan (`params.provider`) | "Click hozircha ishlamayapti, Payme orqali to'lang" |
| 429 | `TOO_MANY_REQUESTS` | Daqiqasiga 10 tadan ko'p buyurtma | "Biroz kuting" |
| 401 | — | Token yo'q | Login oynasi |

##### `GET /api/landing/orders/:id?lang=uzb` — token kerak

Shakli `POST /orders` javobi bilan bir xil (`paymentUrl` siz). Faqat o'z buyurtmasini ko'radi, boshqasiga 404.

`status`:
| status | Ma'nosi | UI |
|---|---|---|
| `pending` | To'lov kutilmoqda | Spinner "To'lov tekshirilmoqda…" |
| `paid` | To'landi, kirish ochildi | ✅ "To'lov qabul qilindi! Pro tarifi 23-dekabrgacha faol" |
| `cancelled` | To'lanmasdan bekor | ❌ "To'lov amalga oshmadi" + "Qayta urinish" |
| `refunded` | Pul qaytarildi, kirish yopildi | "To'lov qaytarilgan" |

##### `GET /api/landing/orders?page=1&limit=20&lang=uzb` — token kerak

Mening to'lovlarim (faqat `paid` va `refunded`). Standart sahifalash: `{ items, total, page, limit }`.

#### 2.8.3. Mavjud endpointlardagi o'zgarishlar (paywall)

Mehmon cheklovlari (4-variantdan keyingilar, 50/100/200, real imtihon, mavzu, qiyin savollar) — 2.3 bo'limda.

##### Yakuniy test yopiq

Mehmon `source: "exam"` → **401 `LOGIN_REQUIRED`** (`reason: "exam"`, 2.3). Kirgan, lekin tarifsiz foydalanuvchi `POST /api/landing/attempts` da `source: "exam"` →

```json
{
  "statusCode": 403,
  "code": "PREMIUM_REQUIRED",
  "message": "Bu bo'lim tarif bilan ochiladi",
  "params": { "feature": "final_exam" }
}
```

Tavsiya: "Real imtihon topshirish" tugmasini bosishdan **oldin** tekshiring:
- mehmon → login oynasi, login'dan keyin tarif bo'lmasa narxlar sahifasi;
- kirgan, `!access.features.includes('final_exam')` → paywall modal (2.8.4);
- tarifi bor → testni boshlash.

Tugmaning yonida 🔒 belgisi bo'lsin (bosiladigan, lekin paywall ochadi).

##### Izohlar yopiq

Tarifsiz foydalanuvchida `explanation` **doim `null`** keladi:
- `GET /attempts/:id` (yakunlangan test),
- `GET /attempts/:id/result`,
- `GET /me/mistakes`, `GET /me/bookmarks`.

Yangi maydon: **`explanationsLocked`**:
- `GET /attempts/:id/result` → `explanationsLocked: true | false`
- `GET /attempts/:id` → `explanationsLocked: true` faqat test `finished` bo'lsa va tarif bo'lmasa (davom etayotgan testda doim `false`)

```json
{
  "id": "58292c0d-...",
  "status": "finished",
  "explanationsLocked": true,
  "review": [
    { "number": 1, "id": 12, "text": "...", "correctAnswerId": 302, "explanation": null, "myAnswerId": 301, "isCorrect": false }
  ]
}
```

UI: `explanationsLocked: true` bo'lsa har bir savol ostida izoh o'rniga bitta xira blok:
> 🔒 Izohni ko'rish uchun tarif oling — **Tariflarni ko'rish**

`/me/mistakes` va `/me/bookmarks` da `explanationsLocked` maydoni yo'q — u yerda `access.features.includes('explanations')` bo'yicha bir xil blokni ko'rsating.

`POST /api/landing/me/explanations` (mehmon natijasidan keyin login qilganda izohlarni olish) tarifsizga **403 `PREMIUM_REQUIRED`** (`feature: "explanations"`) qaytaradi. Bunda so'rovni yubormang yoki xatoni jim o'tkazib, qulf blokini ko'rsating.

Mehmon natija sahifasidagi CTA endi: "Izohlarni ko'rish uchun **kiring va tarif oling**".

##### Jamoaviy test o'chirildi

`/api/landing/group-tests/*` va socket `/group-tests` hozircha **404 / ulanmaydi**. "Kod bilan qo'shilish" sahifasi va menyudagi havolani yashiring (keyin avtomaktablar uchun qaytariladi).

##### Xato kodi `PREMIUM_REQUIRED` — global ishlov

API klientda (axios interceptor yoki fetch wrapper) bitta joyda:

```ts
if (error.code === 'PREMIUM_REQUIRED') {
  openPaywall({ feature: error.params?.feature }); // modal
  refetchAccess();                                 // /me/access keshini yangilash
}
```

`feature` qiymatlari: `final_exam`, `explanations`, `smart_review`, `videos`, `mnemonics`.

#### 2.8.4. Ekranlar

##### Narxlar sahifasi — `/[lang]/pricing`

Dizayn — mijoz bergan skrinshot (3 ta karta yonma-yon, mobil'da ustma-ust).

Karta tarkibi:
```
[POPULAR]                  ← isPopular
Pro                        ← title
Faqat testlar (videosiz)   ← description
65 000 so'm                ← priceUzs (bo'shliq bilan formatlang)
✓ 30 kunlik dostup         ← durationDays
✓ Barcha testlar (1300+ savol)   ← features: all_tests
✓ Yakuniy test                   ← final_exam
✓ Izohlar                        ← explanations
✓ Aqlli takrorlash               ← smart_review (Standartda ✗ — Pro'ning farqi shu)
✗ Videodarslar                   ← videos (yo'q bo'lsa kulrang ✗)
✗ Mnemonika usuli                ← mnemonics (Max'da ✓; boshqalarda kulrang ✗ — Max'ning farqi)
[ Tanlash ]
```

- Ro'yxatni `features` dan chizing: frontendda imkoniyatlarning to'liq tartibli ro'yxati bo'ladi, har biri `features.includes(x)` bo'yicha ✓ yoki ✗.
- `comingSoon: true` → tugma o'rniga **"Tez kunda"** (disabled), karta biroz xira.
- Pastda: "🛡 To'lov: Click, Payme, naqd yoki karta orqali. Dostup to'lovdan so'ng darhol ochiladi."
- Foydalanuvchida faol tarif bo'lsa, tepada banner: "Sizda **Pro** tarifi 23-dekabrgacha faol. Yangi tarif shu muddatdan keyin boshlanadi." (bir xil yoki torroq tarif tanlanganda). Kengroq tarif (masalan, Max) darhol boshlanadi.

**"Tanlash" bosilganda:**
1. Token yo'q → login/registratsiya oynasi, keyin shu sahifaga qaytish (`?plan=2` saqlab).
2. To'lov usuli tanlash oynasi (bottom sheet / modal):
   ```
   Pro — 65 000 so'm, 30 kun
   [ Click ]  [ Payme ]           ← faqat providers dagilar
   Naqd yoki karta orqali to'lash uchun: Telegram @... / +998 ...
   ```
3. `POST /orders` → `location.href = paymentUrl`. Tugmani so'rov davomida bloklang (ikki marta bosilmasin).

##### To'lov natijasi — `/[lang]/payment/result?orderId=123`

Click/Payme to'lovdan keyin shu manzilga qaytaradi (backenddagi `PAYMENT_RETURN_URL`; lokal: `http://localhost:3000/payment/result`, backend `?orderId=` ni o'zi qo'shadi).

Mantiq:
```ts
// har 2.5 soniyada, ko'pi bilan ~60 soniya
const order = await api.get(`/landing/orders/${orderId}`);
switch (order.status) {
  case 'paid':      stop(); refetchAccess(); showSuccess(order); break;
  case 'cancelled': stop(); showFailed(); break;
  case 'pending':   continue polling;
}
// 60 soniyadan keyin ham pending:
// "To'lov hali tasdiqlanmadi. Bir necha daqiqada avtomatik ochiladi. Muammo bo'lsa: @support"
```

**Muhim:** foydalanuvchi shu sahifaga qaytgani to'lov bo'lganini bildirmaydi (to'lov sahifasida "Orqaga" ham shu yerga olib keladi). "To'landi" faqat `status === 'paid'` bo'lganda.

Muvaffaqiyat ekrani: ✅ "To'lov qabul qilindi", "Pro tarifi 23-dekabrgacha faol", tugmalar: **"Yakuniy testni boshlash"**, "Bosh sahifa".

##### Paywall modal

`PREMIUM_REQUIRED` kelganda yoki qulflangan elementni bosganda:
```
🔒 Bu bo'lim tarif bilan ochiladi
[feature ga qarab matn]
  final_exam   → "Yakuniy test — haqiqiy imtihon sharoitida 20 savol, 25 daqiqa"
  explanations → "Har bir savolning batafsil izohi"
  smart_review → "Aqlli takrorlash — xatolaringiz 1, 3, 7 kundan keyin qayta so'raladi va yodda qoladi"
  videos       → "Videodarslar tez kunda"
[ Tariflarni ko'rish ]  [ Yopish ]
```
Ixtiyoriy: modal ichida eng arzon sotuvdagi tarif narxini ko'rsating ("45 000 so'mdan").

##### Header va kabinet

- Header (kirgan): tarif bo'lsa kichik belgi `PRO`, yo'q bo'lsa **"Tarif olish"** tugmasi.
- Kabinet → "Mening tarifim":
  - faol: "**Pro** — 23.12.2026 gacha (30 kun qoldi)" + `upcoming` bo'lsa "Keyin: Standart, 06.01.2027 gacha";
  - yo'q: "Sizda tarif yo'q" + "Tariflarni ko'rish";
  - "To'lovlar tarixi" → `GET /orders` (sana, tarif, summa, Click/Payme/Naqd, holat).
- Muddat tugashiga 3 kun qolganda banner: "Tarifingiz 3 kundan keyin tugaydi — uzaytirish".

`provider` ko'rinishi: `click` → "Click", `payme` → "Payme", `manual` → "Naqd / karta".

#### 2.8.5. TypeScript tiplari

```ts
export type PlanFeature = 'all_tests' | 'final_exam' | 'explanations' | 'smart_review' | 'videos' | 'mnemonics';
export type PaymentProvider = 'click' | 'payme';
export type OrderProvider = PaymentProvider | 'manual';
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface Plan {
  id: number;
  code: string;            // 'standard' | 'pro' | 'max' (yangilari qo'shilishi mumkin)
  title: string;
  description: string | null;
  priceUzs: number;
  durationDays: number;
  features: PlanFeature[];
  isPopular: boolean;
  comingSoon: boolean;
}

export interface PlansResponse {
  items: Plan[];
  providers: PaymentProvider[];
}

export interface AccessPeriod {
  id: number;
  planCode: string;
  planTitle: string | null;
  features: PlanFeature[];
  startsAt: string;
  expiresAt: string;
}

export interface MyAccess {
  isPremium: boolean;
  features: PlanFeature[];
  current: { planCode: string; planTitle: string | null; expiresAt: string } | null;
  accessUntil: string | null;
  active: AccessPeriod[];
  upcoming: AccessPeriod[];
}

export interface Order {
  id: number;
  planCode: string;
  planTitle: string;
  durationDays: number;
  amount: number;
  provider: OrderProvider;
  status: OrderStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface CreatedOrder extends Order {
  paymentUrl: string;
}

// Attempt state / result ga qo'shilgan maydon
export interface AttemptResultExtra {
  explanationsLocked: boolean;
}
// Har bir ochilgan savolda: mnemonic, mnemonicLocked (2.6.3, MnemonicFields)
```

Yordamchi hook (React Query misoli):
```ts
export function useAccess() {
  const { isLoggedIn } = useAuth();
  const q = useQuery({
    queryKey: ['me', 'access'],
    queryFn: () => api.get<MyAccess>('/landing/me/access'),
    enabled: isLoggedIn,
    staleTime: 60_000,
  });
  const has = (f: PlanFeature) => !!q.data?.features.includes(f);
  return { ...q, has, isPremium: !!q.data?.isPremium };
}
```

Narx formati: `new Intl.NumberFormat('ru-RU').format(65000) + " so'm"` → `65 000 so'm` (uzc/kk: `сўм` / `сум`).

#### 2.8.6. Tarjimalar (4 til uchun kalitlar)

| Kalit | uzb |
|---|---|
| `pricing.title` | Tariflar |
| `pricing.popular` | POPULAR |
| `pricing.days` | {n} kunlik dostup |
| `pricing.choose` | Tanlash |
| `pricing.comingSoon` | Tez kunda |
| `pricing.feature.all_tests` | Barcha testlar (1300+ savol) |
| `pricing.feature.final_exam` | Yakuniy test |
| `pricing.feature.explanations` | Savollar izohi |
| `pricing.feature.smart_review` | Aqlli takrorlash |
| `pricing.feature.videos` | Videodarslar |
| `pricing.feature.mnemonics` | Mnemonika usuli |
| `pricing.footer` | To'lov: Click, Payme, naqd yoki karta orqali. Dostup to'lovdan so'ng darhol ochiladi. |
| `pricing.activeBanner` | Sizda {plan} tarifi {date} gacha faol |
| `payment.chooseMethod` | To'lov usulini tanlang |
| `payment.checking` | To'lov tekshirilmoqda… |
| `payment.success` | To'lov qabul qilindi! |
| `payment.failed` | To'lov amalga oshmadi |
| `payment.stillPending` | To'lov hali tasdiqlanmadi. Bir necha daqiqada avtomatik ochiladi. |
| `payment.retry` | Qayta urinish |
| `paywall.title` | Bu bo'lim tarif bilan ochiladi |
| `paywall.final_exam` | Yakuniy test — haqiqiy imtihon sharoitida 20 savol, 25 daqiqa |
| `paywall.explanations` | Har bir savolning batafsil izohi |
| `paywall.smart_review` | Aqlli takrorlash — xatolaringiz 1, 3, 7 kundan keyin qayta so'raladi va yodda qoladi |
| `paywall.cta` | Tariflarni ko'rish |
| `paywall.lockedExplanation` | Izohni ko'rish uchun tarif oling |
| `account.myPlan` | Mening tarifim |
| `account.noPlan` | Sizda tarif yo'q |
| `account.until` | {date} gacha |
| `account.next` | Keyin: {plan}, {date} gacha |
| `account.payments` | To'lovlar tarixi |
| `errors.PREMIUM_REQUIRED` | Bu bo'lim tarif bilan ochiladi |
| `errors.PLAN_NOT_AVAILABLE` | Bu tarif hozircha sotuvda emas |
| `errors.PAYMENT_PROVIDER_DISABLED` | Bu to'lov tizimi vaqtincha ishlamayapti |
| `errors.ORDER_INVALID_STATE` | Buyurtma holati o'zgargan, sahifani yangilang |

`uzc`, `ru`, `kk` tarjimalari mavjud locale fayllardagi uslubda.

#### 2.8.7. Lokal sinash

Backend `.env` da test kalitlari (haqiqiy merchant bo'lmasa ham `paymentUrl` yasaladi):
```
PAYMENT_RETURN_URL=http://localhost:3000/payment/result
PAYME_MERCHANT_ID=test
PAYME_KEY=test
PAYME_TEST=true
CLICK_SERVICE_ID=1
CLICK_MERCHANT_ID=1
CLICK_SECRET_KEY=test
```
To'lovni haqiqatan o'tkazmasdan "to'langan" holatni ko'rish uchun: admin panelda (yoki `POST /api/admin/users/:id/access`) foydalanuvchiga tarifni qo'lda bering — `/me/access` darhol yangilanadi.

---

### 2.9. Shpargalka (tokensiz)

"Imtihonda ko'p uchraydigan, yodlash qiyin ma'lumotlar" sahifasi. Ikki bosqichli: kartochkalar ro'yxati, kartochkaga kirilganda uning raqamlari. Hozir 9 ta kartochka (admin qo'shishi yoki tahrirlashi mumkin). Swagger'da `cheat-sheets` tegi.

```
GET /api/landing/cheat-sheets?lang=uzb          ─►  kartochkalar ro'yxati
GET /api/landing/cheat-sheets/:slug?lang=uzb    ─►  bitta kartochka (bo'limlar va raqamlar)
```

Hammasi `?lang=uzb|uzc|ru|kk` qabul qiladi. Hamma matn (birliklar ham: `km/soat` / `км/ч` / `км/сағ`) tanlangan tilda keladi. Login va tarif shart emas.

#### `GET /api/landing/cheat-sheets?lang=uzb`
```json
[
  {
    "id": 1,
    "slug": "ruxsat-etilgan-tezlik",
    "icon": "gauge",
    "color": "red",
    "title": "Ruxsat etilgan tezlik",
    "subtitle": "Aholi punktidan tashqarida va maxsus joylarda",
    "itemCount": 14
  }
]
```
- `icon` — [lucide](https://lucide.dev/icons) ikonka nomi (`lucide-react` da PascalCase: `gauge` → `<Gauge />`, `triangle-alert` → `<TriangleAlert />`). Hozirgilari: `gauge`, `timer`, `ban`, `triangle-alert`, `ruler`, `package`, `link`, `disc`, `wrench`. Noma'lum nom kelsa — umumiy ikonka (masalan `FileText`).
- `color` — ikonka foni (och rang) va ikonka rangi: `red`, `blue`, `violet`, `amber`, `green`, `orange`. Noma'lum bo'lsa — kulrang.
- Ro'yxat tepasidagi "Imtihonda ko'p uchraydigan, yodlash qiyin ma'lumotlar" matni — frontend tarjimasi (backenddan kelmaydi).

#### `GET /api/landing/cheat-sheets/:slug?lang=uzb`
`:slug` o'rniga `id` ham bo'ladi. Topilmasa yoki yashirilgan bo'lsa `404 NOT_FOUND`.
```json
{
  "id": 1,
  "slug": "ruxsat-etilgan-tezlik",
  "icon": "gauge",
  "color": "red",
  "title": "Ruxsat etilgan tezlik",
  "subtitle": "Aholi punktidan tashqarida va maxsus joylarda",
  "sections": [
    {
      "title": "Aholi punktlaridan tashqarida",
      "items": [
        { "value": "100", "unit": "km/soat", "label": "Yengil avto" },
        { "value": "90", "unit": "km/soat", "label": "Shaharlararo avtobus va mikroavtobus" }
      ]
    },
    {
      "title": "Alohida holatlar",
      "items": [
        { "value": "8", "unit": "km/soat dan kam", "label": "Temir yo'l kesishmasi: temir yo'l boshlig'idan ruxsat so'raladi" },
        { "value": "DYHXX", "unit": null, "label": "Og'ir vaznli va katta o'lchamli yuk avto — kelishilgan tezlikda" }
      ]
    }
  ],
  "prev": null,
  "next": { "slug": "tezlik-va-reaksiya", "title": "Tezlik va reaktsiya" }
}
```
- Har bir `section` — sarlavhali oq kartochka (kulrang sarlavha qatori), `items` — qatorlar.
- Qator: chapda katta yashil `value`, yonida kichik `unit` (`null` bo'lsa ko'rsatilmaydi), vertikal chiziq, o'ngda `label`.
- `value` — matn, raqam emas: `"2.55"`, `"50–100"`, `"0.3–0.5"`, `"DYHXX"` bo'lishi mumkin. Formatlamang, kelganicha chiqaring. Uzun bo'lsa (`150–300`) ikki qatorga tushishi mumkin — `value` ustunini o'ngga tekislang, kengligi taxminan 90–110px.
- `prev` / `next` — oldingi va keyingi kartochka ("←  →" tugmalari, ixtiyoriy). Chetda bo'lsa `null`.
- **Manzil:** `/{lang}/shpargalka` (ro'yxat) va `/{lang}/shpargalka/{slug}` (kartochka) tavsiya etiladi. Kartochka sahifasida sarlavha `title`, uning tagida kulrang `subtitle`.

TypeScript:
```ts
export interface CheatSheetCard {
  id: number;
  slug: string;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  itemCount: number;
}
export interface CheatSheet extends Omit<CheatSheetCard, 'itemCount'> {
  sections: { title: string; items: { value: string; unit: string | null; label: string }[] }[];
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}
```

Tarjima kalitlari (frontend `i18n/locales/*.json`):

| Kalit | uzb | uzc | ru | kk |
|---|---|---|---|---|
| `cheatSheets.title` | Shpargalka | Шпаргалка | Шпаргалка | Шпаргалка |
| `cheatSheets.subtitle` | Imtihonda ko'p uchraydigan, yodlash qiyin ma'lumotlar | Имтиҳонда кўп учрайдиган, ёдлаш қийин маълумотлар | Часто встречающиеся на экзамене данные, которые трудно запомнить | Емтиханда жиі кездесетін, есте сақтау қиын мәліметтер |

## 3. Admin API

Hamma endpoint `/api/admin/*`, admin tokeni bilan.

### 3.1. Kirish
| Metod | Yo'l | Body | Javob |
|---|---|---|---|
| POST | `/admin/auth/login` | `{ phone, password }` | `{ access_token, refresh_token, admin }` |
| POST | `/admin/auth/refresh` | `{ refreshToken }` | `{ access_token, refresh_token }` |
| GET | `/admin/auth/me` | — | `admin` |
| POST | `/admin/auth/logout` | — | `204` |
| POST | `/admin/auth/change-password` | `{ currentPassword, newPassword }` | yangi tokenlar (boshqa qurilmalar chiqariladi) |

`admin` obyekti:
```json
{
  "id": "uuid",
  "phone": "+998901234567",
  "fullName": "Super Admin",
  "role": "superadmin",
  "isActive": true,
  "lastLoginAt": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```
`role`: `superadmin` yoki `admin`. "Adminlar" bo'limini faqat `superadmin` ga ko'rsating.

**O'zgardi (2026-11-24):** email bilan kirish olib tashlandi. Login formasida email o'rniga **telefon** maydoni (`+998 __ ___ __ __` maskasi). Raqam istalgan ko'rinishda yuborilishi mumkin — server `+998901234567` ga keltiradi. Xato: `401 INVALID_CREDENTIALS` ("Telefon yoki parol noto'g'ri").

### 3.2. Dashboard — `GET /admin/dashboard`
```json
{
  "users": 120,
  "newUsers7d": 14,
  "questions": 1353,
  "questionsWithoutTopic": 1353,
  "questionsWithoutExplanation": 1353,
  "questionsWithMnemonic": 218,
  "activeVariants": 200,
  "finishedAttempts": 540,
  "attempts24h": 37,
  "examPassRate": 61,
  "openReports": 3,
  "premiumUsers": 18,
  "revenueToday": 140000,
  "revenueMonth": 2350000,
  "daily": [{ "date": "2026-11-18", "attempts": 37, "newUsers": 4, "revenue": 140000 }],
  "hardest": [{ "id": 353, "text": "...", "answered": 40, "wrongRate": 72 }]
}
```
`daily` — oxirgi 30 kun (grafik uchun; `revenue` — shu kuni to'langan summa, so'm). `premiumUsers` — hozir tarifi faol foydalanuvchilar. Batafsil daromad: `GET /admin/orders/stats` (3.10). `hardest` — kamida 5 marta javob berilgan, eng ko'p xato qilinadigan 10 ta savol.

### 3.3. Savollar
| Metod | Yo'l | Tavsif |
|---|---|---|
| GET | `/admin/questions` | Ro'yxat + filtrlar |
| GET | `/admin/questions/:id` | Bitta savol + qaysi variantlarda + statistika |
| POST | `/admin/questions` | Yaratish |
| PATCH | `/admin/questions/:id` | Tahrirlash |
| DELETE | `/admin/questions/:id` | O'chirish (variantlarda bo'lsa `409`) |
| POST | `/admin/questions/:id/image` | Rasm yuklash (`multipart/form-data`, maydon nomi `file`) |
| DELETE | `/admin/questions/:id/image` | Rasmni olib tashlash |
| POST | `/admin/questions/bulk/topic` | Ko'p savolni mavzuga biriktirish |

Ro'yxat filtrlari: `?page&limit&search&topicId&variantId&hasImage&hasExplanation&hasMnemonic&isActive`

| Filtr | Tavsif |
|---|---|
| `search` | 4 tildagi matn bo'yicha yoki aniq savol id si |
| `topicId=0` | Mavzusiz savollar |
| `hasImage`, `hasExplanation`, `hasMnemonic`, `isActive` | `true` / `false` |

Savol obyekti:
```json
{
  "id": 46,
  "text": { "uzb": "...", "uzc": "...", "ru": "..." },
  "explanation": null,
  "mnemonic": null,
  "imageUrl": "http://.../uploads/questions/src-....jpg",
  "sourceImageUrl": "https://e-avtomaktab.uz/storage/tests/e-avtomaktab1.jpg",
  "topic": { "id": 3, "name": { "uzb": "...", "uzc": "...", "ru": "..." } },
  "isActive": true,
  "answers": [
    { "id": 101, "position": 1, "text": { "uzb": "...", "uzc": "...", "ru": "..." }, "isCorrect": false }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```
`GET /:id` qo'shimcha qaytaradi:
```json
{
  "variants": [{ "id": 1, "size": 20, "number": 1, "position": 1 }],
  "stats": { "answered": 40, "correctRate": 28 }
}
```

Yaratish yoki tahrirlash body'si:
```json
{
  "text": { "uzb": "...", "uzc": "...", "ru": "..." },
  "explanation": { "uzb": "...", "uzc": "...", "ru": "..." },
  "mnemonic": { "uzb": "...", "uzc": "...", "ru": "..." },
  "topicId": 3,
  "isActive": true,
  "answers": [
    { "id": 101, "text": { "uzb": "A", "uzc": "А", "ru": "А" }, "isCorrect": false },
    { "text": { "uzb": "B", "uzc": "Б", "ru": "Б" }, "isCorrect": true }
  ]
}
```
- Har bir matnda `uzb`, `uzc`, `ru` majburiy, `kk` (qozoqcha) ixtiyoriy. Ro'yxat filtrida `missingKk=true` — qozoqchasi yo'q savollar.
- Mavzu: savollar mavzuga avtomatik biriktirilgan. Ishonch past bo'lganlarida `topicReview: true` — filtr `topicReview=true` bilan chiqadi. PATCH da `topicId` yuborilsa (yoki bulk mavzu qo'yilsa) `topicReview` avtomatik `false` bo'ladi.
- `answers`: 2–6 ta, **faqat bittasi** `isCorrect: true`. Massiv tartibi = `F1`, `F2`, ...
- PATCH da `answers` berilsa ro'yxat to'liq almashtiriladi. Mavjud javoblarga `id` ni qo'shib yuboring (o'tgan test tarixi saqlanadi). `id` siz javob yangi deb qo'shiladi, ro'yxatda yo'qlari o'chiriladi.
- `explanation: null` — izohni olib tashlash. `mnemonic: null` — mnemonikani olib tashlash ("Eslab qolish uchun", faqat Max'da ko'rinadi, 2.6.3). `topicId: null` — mavzudan chiqarish.

Rasm yuklash: JPG, PNG, WEBP yoki GIF, 5 MB gacha. Javob — yangilangan savol.
```js
const fd = new FormData();
fd.append('file', file);
await fetch(`${API}/api/admin/questions/${id}/image`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: fd,
});
```

Ko'p savolni mavzuga biriktirish:
```json
{ "questionIds": [46, 47, 48], "topicId": 3 }
```
Javob: `{ "updated": 3 }`. `topicId: null` — mavzudan chiqarish.

### 3.4. Variantlar
| Metod | Yo'l | Body | Tavsif |
|---|---|---|---|
| GET | `/admin/variants?size=20` | — | `[{ id, code, size, number, isActive, questionCount, attempts }]` |
| GET | `/admin/variants/:id` | — | Variant + `questions: [{ position, id, text, imageUrl, isActive, answerCount }]` |
| POST | `/admin/variants` | `{ size, number?, questionIds? }` | `number` berilmasa oxirgisi + 1 |
| PATCH | `/admin/variants/:id` | `{ number?, isActive? }` | |
| PUT | `/admin/variants/:id/questions` | `{ questionIds: [...] }` | Savollar tartibi bilan almashtiriladi |
| DELETE | `/admin/variants/:id` | — | `204` |

- Variant faqat savollar soni `size` ga teng bo'lsa faol bo'ladi, aks holda `400 VARIANT_INCOMPLETE`.
- Savollar soni o'zgarib, `size` dan farq qilsa, variant avtomatik nofaol bo'ladi.
- Drag-and-drop tartiblashdan keyin `PUT .../questions` ga yangi tartibni yuboring.

### 3.5. Mavzular
| Metod | Yo'l | Body |
|---|---|---|
| GET | `/admin/topics` | — → `[{ id, slug, name, position, isActive, mnemonics, questionCount }]` |
| POST | `/admin/topics` | `{ slug, name: {uzb,uzc,ru}, mnemonics?, position?, isActive? }` |
| PATCH | `/admin/topics/:id` | qisman |
| DELETE | `/admin/topics/:id` | `204`, savollari mavzusiz qoladi |

`slug` — kichik lotin harflar, raqam va `-` (`yol-belgilari`).

`mnemonics` — mavzu kartochkalari: `[{ uzb, uzc, ru, kk? }]`, 20 tagacha. PATCH da berilsa ro'yxat butunlay almashtiriladi (tartib = saytdagi tartib).

### 3.6. Foydalanuvchilar
| Metod | Yo'l | Tavsif |
|---|---|---|
| GET | `/admin/users?search&isBlocked&premium&page&limit` | `search` — email, ism, **telefon** yoki Telegram username. Har birida `phone`, `telegramUsername`, `hasTelegram`, `finishedTests`, `avgPercent`, **`planCode`** (`standard` / `pro` / `max` yoki `null`), **`planExpiresAt`**. `premium=true` — faqat tarifi faollar, `premium=false` — bepullar |
| GET | `/admin/users/:id` | Foydalanuvchi + **`access`** (shakli `/landing/me/access` bilan bir xil: `isPremium`, `current`, `accessUntil`, `active`, `upcoming`), `mistakesCount`, `bookmarksCount`, `recentAttempts` (oxirgi 30 ta) |
| GET | `/admin/users/:id/access` | Tarif davrlari tarixi (3.10) |
| POST | `/admin/users/:id/access` | **Premium berish** `{ planId, amount?, note? }` (3.10) |
| PATCH | `/admin/users/:id` | `{ isBlocked?, phone? }` — bloklansa barcha sessiyalari yopiladi. `phone` — telefon biriktirish (`null` — olib tashlash, band bo'lsa `409 PHONE_TAKEN`): shu raqamli Telegram bilan kirganda foydalanuvchi **shu akkauntga** kiradi |

### 3.7. Xabarlar ("savolda xato")
| Metod | Yo'l | Body |
|---|---|---|
| GET | `/admin/reports?status=open&page&limit` | — |
| PATCH | `/admin/reports/:id` | `{ status: "resolved" \| "rejected" \| "open", adminNote? }` |

Element: `{ id, message, status, adminNote, createdAt, resolvedAt, question: { id, text }, user: { id, email, firstName } | null }`. Savolni ochish uchun `question.id` → `GET /admin/questions/:id`.

### 3.8. Adminlar (faqat superadmin)
| Metod | Yo'l | Body |
|---|---|---|
| GET | `/admin/admins` | — |
| POST | `/admin/admins` | `{ phone, fullName, password, role? }` — band telefon: `409 PHONE_TAKEN` |
| PATCH | `/admin/admins/:id` | `{ phone?, fullName?, role?, isActive?, password? }` |

Oddiy `admin` bu endpoint'larga kirsa `403` oladi.

---

### 3.9. Yo'l belgilari

**Kategoriyalar:**

| Metod | Yo'l | Body |
|---|---|---|
| GET | `/admin/signs/groups` | — → `[{ id, slug, name, description, shape, appearance, position, isActive, signCount, ... }]` |
| POST | `/admin/signs/groups` | `{ slug, name, description, shape, appearance, position?, isActive? }` |
| PATCH | `/admin/signs/groups/:id` | qisman |
| DELETE | `/admin/signs/groups/:id` | `204`. Ichida belgi bo'lsa `409` (`params.count`) |

`name`, `description`, `appearance` — `{ uzb, uzc, ru }`, uchala til majburiy. `shape`: `triangle`, `circle`, `rectangle`, `square`, `diamond`, `octagon` yoki `mixed`.

**Belgilar:**

| Metod | Yo'l | Tavsif |
|---|---|---|
| GET | `/admin/signs?groupId&search&missingRu&isActive&page&limit` | Ro'yxat. `missingRu=true` — ruscha tarjimasi yo'q belgilar (tarjima qilish uchun) |
| GET | `/admin/signs/:id` | Bitta belgi (barcha tillarda) |
| POST | `/admin/signs` | `{ groupId, code, slug, name, nameEn?, description, position?, isActive? }`. `position` berilmasa — kategoriya oxiriga |
| PATCH | `/admin/signs/:id` | qisman (kategoriyasini ham o'zgartirsa bo'ladi) |
| DELETE | `/admin/signs/:id` | `204` |
| POST | `/admin/signs/:id/image` | Rasm: SVG (skriptsiz), PNG, JPG, WEBP; 5 MB gacha. `multipart/form-data`, maydon `file` |

- `code` — `1.1`, `5.15.2` ko'rinishida.
- `slug` — kichik lotin harf, raqam va `-` (`5-26-2`), unikal. Band bo'lsa `409 SLUG_TAKEN`.
- Skriptli yoki tashqi havolali SVG `400 INVALID_IMAGE` bilan rad etiladi.

Belgi obyekti:
```json
{
  "id": 1,
  "groupId": 1,
  "group": { "id": 1, "slug": "ogohlantiruvchi", "name": { "uzb": "...", "uzc": "...", "ru": "" } },
  "code": "1.1",
  "slug": "1-1",
  "name": { "uzb": "Shlagbaumli temir yo'l kesishmasi", "uzc": "Шлагбаумли темир йўл кесишмаси", "ru": "" },
  "nameEn": "Railway crossing with a barrier",
  "description": { "uzb": "...", "uzc": "...", "ru": "" },
  "imageUrl": "http://localhost:4002/uploads/signs/1-1.svg",
  "position": 1,
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```
Import qilingan belgilarda `ru` bo'sh (`""`). Tahrirlash formasida uchala til majburiy, shuning uchun admin belgini saqlaganda ruschasini ham kiritadi.

### 3.10. Tariflar, buyurtmalar, qo'lda tarif berish
- `GET /admin/plans`: barcha tariflar (yashirinlari bilan).
- Imkoniyatlar (`features`): `all_tests`, `final_exam`, `explanations`, `smart_review` (aqlli takrorlash, hozir Pro va Max'da), `videos`, `mnemonics`. Standartga ham berish uchun uning `features` iga `smart_review` qo'shing.
- `PATCH /admin/plans/:id`: `{ priceUzs?, durationDays?, features?, status?: "active"|"coming_soon"|"hidden", isPopular?, position?, title?, description? }`. Eski buyurtmalarga ta'sir qilmaydi (buyurtma tarif nusxasini saqlaydi). Max'ni videolar tayyor bo'lganda `status: "active"` qiling.
- `GET /admin/orders?status=paid&provider=click&search=ali&from=2026-11-01&to=2026-12-01&page=1`: buyurtmalar ro'yxati (foydalanuvchi, summa, kim berdi, izoh).
- `GET /admin/orders/stats`: `{ revenueToday, revenueMonth, revenueTotal, paidCount, activeSubscribers, byPlan[], byProvider[] }`.
- `GET /admin/users/:id/access`: foydalanuvchining tarif davrlari (`isActive`, `revokedAt`).
- `POST /admin/users/:id/access`: `{ planId, amount?, note? }` qo'lda beradi: naqd, karta o'tkazma yoki sovg'a (`amount: 0`). "Tez kunda" tarifni ham berish mumkin. Buyurtma `provider: "manual"`, `status: "paid"` bo'lib yoziladi.
- `POST /admin/orders/:id/refund`: faqat `manual` buyurtmani bekor qiladi, kirish darhol yopiladi. Click yoki Payme to'lovining puli o'sha tizim kabineti orqali qaytariladi (Payme `CancelTransaction` yuboradi va kirish avtomatik yopiladi).
- Jamoaviy test (`/admin/group-tests`) hozircha o'chiq: `FEATURE_GROUP_TESTS=true` bo'lmaguncha 404 qaytaradi.

**Admin panelda kerakli sahifalar:**

1. **Tariflar** (`GET /admin/plans`, `PATCH /admin/plans/:id`): jadval + tahrirlash formasi (narx, muddat, imkoniyatlar checkbox, holat: Sotuvda / Tez kunda / Yashirin, POPULAR, tartib, 4 tilda nom va tavsif). Ogohlantirish: "O'zgarish faqat yangi buyurtmalarga ta'sir qiladi".
2. **To'lovlar** (`GET /admin/orders`): filtrlar (holat, Click/Payme/Naqd, sana oralig'i, qidiruv), jadval: #, foydalanuvchi, tarif, summa, usul, holat, admin/izoh, sana. Tepada `GET /admin/orders/stats` kartalari: bugun, shu oy, jami daromad, faol obunachilar; tariflar va usullar bo'yicha kichik diagramma.
3. **Foydalanuvchilar ro'yxati**: `planCode` bo'yicha belgi (PRO / MAX / Standart) va "Tarif: barchasi / premium / bepul" filtri (`premium=true|false`).
4. **Foydalanuvchi sahifasi** → "Tarif" bloki: hozirgi holat `GET /admin/users/:id` dagi `access` dan, tarix `GET /admin/users/:id/access` (davrlar ro'yxati, faol/tugagan/bekor), **"Tarif berish"** tugmasi → modal: tarif, qabul qilingan summa (default — tarif narxi, sovg'a uchun 0), izoh ("naqd, ofisda") → `POST /admin/users/:id/access`.
5. Qo'lda berilgan (`provider: "manual"`, `status: "paid"`) buyurtma qatorida **"Bekor qilish"** → `POST /admin/orders/:id/refund` (tasdiqlash oynasi bilan). Click/Payme qatorlarida bu tugma bo'lmaydi.
6. "Jamoaviy testlar" menyusini yashiring (backend 404 qaytaradi).
7. **Dashboard**: `premiumUsers`, `revenueToday`, `revenueMonth` kartalari va `daily[].revenue` grafigi.

### 3.11. Shpargalka

| Metod | Yo'l | Tavsif |
|---|---|---|
| GET | `/admin/cheat-sheets` | Barcha kartochkalar (yashirinlari bilan), barcha tillarda |
| GET | `/admin/cheat-sheets/:id` | Bitta kartochka |
| POST | `/admin/cheat-sheets` | Yangi. `position` berilmasa — oxiriga |
| PATCH | `/admin/cheat-sheets/:id` | Qisman. **`sections` yuborilsa butunlay almashtiriladi** (bo'lim yoki qatorni alohida tahrirlash endpointi yo'q — formadagi to'liq ro'yxatni yuboring) |
| DELETE | `/admin/cheat-sheets/:id` | `204`. Saytdan vaqtincha olib tashlash uchun `isActive: false` qiling |

Body (`POST`; `PATCH` da hammasi ixtiyoriy):
```json
{
  "slug": "ruxsat-etilgan-tezlik",
  "icon": "gauge",
  "color": "red",
  "title":    { "uzb": "Ruxsat etilgan tezlik", "uzc": "Рухсат этилган тезлик", "ru": "Разрешённая скорость", "kk": "Рұқсат етілген жылдамдық" },
  "subtitle": { "uzb": "...", "uzc": "...", "ru": "...", "kk": "..." },
  "sections": [
    {
      "title": { "uzb": "Aholi punktlaridan tashqarida", "uzc": "...", "ru": "...", "kk": "..." },
      "items": [
        {
          "value": "100",
          "valueText": null,
          "unit":  { "uzb": "km/soat", "uzc": "км/соат", "ru": "км/ч", "kk": "км/сағ" },
          "label": { "uzb": "Yengil avto", "uzc": "Енгил авто", "ru": "Легковой автомобиль", "kk": "Жеңіл автокөлік" }
        }
      ]
    }
  ],
  "position": 1,
  "isActive": true
}
```
- Matnlar `{ uzb, uzc, ru, kk? }`: `uzb`, `uzc`, `ru` majburiy, `kk` ixtiyoriy (bo'lmasa ruschasi chiqadi).
- `value` — 1–30 belgi (`100`, `2.55`, `50–100`). `valueText` — raqam o'rniga tilga qarab matn kerak bo'lsa (masalan `DYHXX` / `ГСБДД`), aks holda `null`. `unit` — birlik yoki `null`.
- `slug` — kichik lotin harf, raqam va `-`, unikal. Band bo'lsa `409 CONFLICT` (`params.field: "slug"`).
- `icon` — lucide nomi (2.9 ga qarang), `color` — `red | blue | violet | amber | green | orange`. Formada tanlov (select) qilib bering.
- Cheklovlar: 20 tagacha bo'lim, bo'limda 50 tagacha qator.

**Admin panel sahifasi:** "Shpargalka" menyusi → kartochkalar jadvali (tartib, ikonka, nom, qatorlar soni, faol/yashirin) → tahrirlash formasi: slug, ikonka, rang, 4 tilda nom va tavsif, so'ng bo'limlar ro'yxati (bo'lim qo'shish/o'chirish/surish; har bo'limda 4 tilda sarlavha va qatorlar jadvali: value, birlik, izoh — har biri 4 tilda; qator qo'shish/o'chirish/surish). Saqlashda butun `sections` bilan `PATCH`.

Boshlang'ich 9 ta kartochka seed bilan yoziladi (`npm run seed:cheat-sheets`, faqat yo'qlarini qo'shadi; `-- --force` fayldagi holatga qaytaradi). Fayl: `src/database/seeds/data/cheat-sheets.ts`.

## 4. Tavsiyalar

- **Token yangilash:** 401 kelsa bitta `refresh` so'rov yuboring, bir vaqtda kelgan boshqa so'rovlarni shu so'rov tugashini kutishga qo'ying, keyin qaytaring.
- **Imtihon, 3-xato:** javob kartochkasini qizil qilib ko'rsating, "Imtihondan o'ta olmadingiz — 3 ta xato" xabarini chiqarib, natija sahifasiga o'ting. Mehmonda buni frontend o'zi aniqlaydi (`wrongCount > maxMistakes`), kirgan foydalanuvchida server `finished: true` qaytaradi.
- **Katta testlar (100, 200 savol):** savollar navigatsiyasi (1–200 tugma) gorizontal scroll yoki "har 20 tadan" sahifalab ko'rsatilsin. Bu faqat kirgan foydalanuvchiga tegishli (mehmon testi 20 savolgacha).
- **Imtihon taymeri:** taymerni `remainingSec` dan boshlang. Tab qayta faollashganda (`visibilitychange`) `GET /attempts/:id` bilan vaqtni yangilang.
- **Mehmon testi:** holatni (`questions`, javoblar, taymer) `sessionStorage` da saqlang, aks holda sahifa yangilanganda test yo'qoladi.
- **Test davom ettirish (kirgan foydalanuvchi):** joriy `attemptId` ni `localStorage` da saqlang. Sahifa ochilganda `GET /attempts/:id` chaqiring: `status: "finished"` bo'lsa natijaga o'ting.
- **Til:** kirgan foydalanuvchi tilni o'zgartirganda `PATCH /me { lang }` yuboring va ochiq test uchun `GET /attempts/:id?lang=...` ni qayta chaqiring. Mehmonda tilni `localStorage` da saqlang va har so'rovga `lang` qilib qo'shing.
- **Natija sahifasi:** `guest: true` bo'lsa "Natijangizni saqlash uchun Telegram orqali kiring" tugmasini ko'rsating. Mehmon natijasida `id` yo'q, shuning uchun uni ulashish yoki qayta ochish havolasi bo'lmaydi.
- **Rasmlar:** URL'lar o'zgarmaydi va bir yil keshlanadi (yangi rasm har doim yangi nom oladi).

## 5. Tekshirish ro'yxati (tariflar va mehmon cheklovlari)

- [ ] `/pricing` sahifasi `GET /plans` dan chiziladi, Max "Tez kunda"
- [ ] Login'siz "Tanlash" → login → pricing ga qaytish
- [ ] Click va Payme tugmalari faqat `providers` da borlari
- [ ] `POST /orders` → `paymentUrl` ga o'tish, tugma qayta bosilmaydi
- [ ] `/payment/result` polling: paid / cancelled / 60 soniya pending
- [ ] `useAccess()` hook va header'dagi tarif belgisi
- [ ] Mehmon: 4-variantdan keyin 🔒 (`requiresLogin`); 50/100/200, real imtihon, mavzular, qiyin savollar 🔒 → login oynasi
- [ ] `LOGIN_REQUIRED` (`reason`) → login oynasi, refresh qilinmaydi
- [ ] "Real imtihon" tugmasi kirgan tarifsizga paywall ochadi
- [ ] Natija sahifasida `explanationsLocked` → qulf bloki
- [ ] Xatolarim / Saqlanganlarda izoh o'rniga qulf bloki (tarifsiz)
- [ ] Mehmon natijasidan login → `/me/explanations` 403 to'g'ri ishlanadi
- [ ] Global `PREMIUM_REQUIRED` interceptor
- [ ] Kabinet: Mening tarifim + To'lovlar tarixi
- [ ] Group test sahifalari yashirilgan
- [ ] 4 til tarjimalari
- [ ] Admin: Tariflar, To'lovlar, Foydalanuvchiga tarif berish
- [ ] Tarif kartasida "Aqlli takrorlash" qatori (`smart_review`, Standartda ✗)
- [ ] Kabinet/bosh sahifa: "Takrorlash" kartasi (`GET /me/review`), tarifsizda 🔒 → paywall `smart_review`
- [ ] Xatolarim kartasida bosqich (`reviewStep/reviewSteps`) va keyingi takrorlash (`dueAt`)
- [ ] Natija / Xatolarim / Saqlanganlarda izoh tagida "💡 Eslab qolish uchun" (`mnemonic`), `mnemonicLocked` → xira blok + paywall `mnemonics`
- [ ] Mavzu sahifasida mnemonika kartochkalari (`GET /me/topics/:id/mnemonics`, mehmonda `mnemonicCount` bilan qulf)
- [ ] Tarif kartasida "Mnemonika usuli" (`mnemonics`) — endi haqiqiy imkoniyat: `lib/constants.ts` dagi `optional: true` ni olib tashlang, hamma kartada ✓/✗ ko'rinsin
- [ ] `@types`: ochilgan savolga `mnemonic: string | null`, `mnemonicLocked: boolean`; `Topic` ga `mnemonicCount`
- [ ] Mehmon natijasidan login → `POST /me/explanations` javobidagi `mnemonic` / `mnemonicLocked` ni ham ishlating
- [ ] Kabinet: tayyorlik foizi bloki (`GET /me/readiness`): foiz, daraja, 3 qism, maslahatlar, zaif mavzular, grafik
