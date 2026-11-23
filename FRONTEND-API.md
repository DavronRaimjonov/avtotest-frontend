# AvtoTest API — frontend uchun qo'llanma

Backend: NestJS + PostgreSQL. Ikki alohida qism:

| Qism | Prefiks | Kim ishlatadi | Kirish |
|---|---|---|---|
| **Landing** | `/api/landing/*` | Sayt (foydalanuvchilar) | Email + parol (emailga kod bilan tasdiqlanadi) yoki Google. Test ishlash uchun shart emas (2.3) |
| **Admin** | `/api/admin/*` | Admin panel | Email + parol |

- **Base URL (lokal):** `http://localhost:4002`
- **Swagger:** `http://localhost:4002/api/docs` (yuqoridagi ro'yxatdan Landing yoki Admin tanlanadi). Har bir maydonning to'liq tavsifi shu yerda. Mehmon endpoint'lari `guest` tegi ostida.
- Landing tokeni admin API'da ishlamaydi, admin tokeni landing'da ishlamaydi (401).
- **Test ishlash uchun login shart emas.** Mehmon `/api/landing/guest/*` orqali test ishlaydi, lekin uning hech narsasi saqlanmaydi (2.3 va 2.4 bo'limlar).

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
| `INVALID_GOOGLE_TOKEN` | Google ID token yaroqsiz |
| `EMAIL_TAKEN` | Bu email bilan ro'yxatdan o'tilgan (kirish yoki parolni tiklashni taklif qiling) |
| `EMAIL_NOT_VERIFIED` | Login: parol to'g'ri, lekin email tasdiqlanmagan. Kod yuborildi → kod oynasini oching (`params.resendInSec`) |
| `INVALID_OTP` | Kod noto'g'ri yoki muddati o'tgan |
| `OTP_ATTEMPTS_EXHAUSTED` | 5 marta xato kod kiritildi — yangi kod so'rash kerak |
| `OTP_TOO_SOON` | Yangi kod 60 soniyadan keyin (`params.seconds`, 429) |
| `MAIL_SEND_FAILED` | Xat yuborilmadi (503) — birozdan keyin qayta urinish |
| `GOOGLE_AUTH_DISABLED` | Serverda Google sozlanmagan (503) |
| `INVALID_REFRESH_TOKEN` | Refresh token yaroqsiz → qayta login |
| `INVALID_CREDENTIALS` | Email yoki parol noto'g'ri (landing va admin) |
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
| `SLUG_TAKEN` / `EMAIL_TAKEN` | Admin: band |
| `SUPERADMIN_PROTECTED` | Admin: o'zini bloklash yoki rolini tushirish mumkin emas |
| `TOO_MANY_REQUESTS` | Juda ko'p so'rov (429) |

### Rasmlar
`imageUrl` — to'liq manzil (`http://.../uploads/questions/xxx.jpg`), to'g'ridan-to'g'ri `<img src>` ga qo'yiladi. Rasm bo'lmasa `null` keladi: dizayndagi "Bu savolda rasm yo'q" holatini ko'rsating.

---

## 2. Landing API

### 2.1. Ro'yxatdan o'tish va kirish

Ikki yo'l bor, ikkalasi ham bir xil tokenlar qaytaradi:
- **Email + parol** (Gmail yoki istalgan email). Ro'yxatdan o'tishda emailga **6 xonali kod** boradi, kod tasdiqlangach foydalanuvchi tizimga kiradi.
- **Google** — bitta tugma, alohida ro'yxatdan o'tish yo'q.

Bir xil email bilan ikkalasini ham ishlatsa bo'ladi: email bilan ro'yxatdan o'tgan foydalanuvchi keyin Google bilan kirsa, o'sha akkauntga ulanadi.

#### Ro'yxatdan o'tish oqimi
```
1. POST /auth/register      { email, password, firstName, lastName?, lang? }
        ─► 201 { email, codeSent, resendInSec: 60, codeTtlMin: 10 }   → "Emailingizga kod yubordik" oynasi
2. POST /auth/verify-email  { email, code }
        ─► 200 { access_token, refresh_token, isNew: true, user }      → tizimga kirdi
   (kod kelmasa, 60 soniyadan keyin: POST /auth/resend-code { email })
```

#### `POST /api/landing/auth/register` — tokensiz
```json
{ "email": "ali@gmail.com", "password": "parol1234", "firstName": "Ali", "lastName": "Valiyev", "lang": "uzb" }
```
| Maydon | Qoida |
|---|---|
| `email` | Istalgan to'g'ri email (bo'sh joylar va katta harflar avtomatik tozalanadi) |
| `password` | Kamida 8 belgi, kamida bitta harf va bitta raqam |
| `firstName` | 1–50 belgi, majburiy |
| `lastName` | ixtiyoriy |
| `lang` | Xat va testlar tili (`uzb` / `uzc` / `ru` / `kk`) |

Javob `201`:
```json
{ "email": "ali@gmail.com", "codeSent": true, "resendInSec": 60, "codeTtlMin": 10 }
```
Xatolar: `409 EMAIL_TAKEN` (allaqachon tasdiqlangan email), `503 MAIL_SEND_FAILED`.

Email tasdiqlanmagan bo'lsa, qayta `register` qilish mumkin (masalan, foydalanuvchi parolni o'zgartirmoqchi yoki kod yo'qolgan) — ma'lumotlar yangilanadi va yangi kod boradi.

#### `POST /api/landing/auth/verify-email` — tokensiz
```json
{ "email": "ali@gmail.com", "code": "373670" }
```
Javob `200`: `{ access_token, refresh_token, isNew: true, user }`.
Xatolar: `400 INVALID_OTP`, `400 OTP_ATTEMPTS_EXHAUSTED` (5 ta xato urinishdan keyin — "Kodni qayta yuborish" tugmasini ko'rsating).

#### `POST /api/landing/auth/resend-code` — tokensiz
```json
{ "email": "ali@gmail.com" }
```
Javob: `{ codeSent: true, resendInSec: 60, codeTtlMin: 10 }`. 60 soniya o'tmagan bo'lsa `429 OTP_TOO_SOON` (`params.seconds`) — tugmada teskari sanoq ko'rsating.

#### `POST /api/landing/auth/login` — tokensiz
```json
{ "email": "ali@gmail.com", "password": "parol1234" }
```
Javob `200`: `{ access_token, refresh_token, user }`.
Xatolar:
- `401 INVALID_CREDENTIALS` — email yoki parol noto'g'ri (qaysi biri ekani aytilmaydi).
- `403 EMAIL_NOT_VERIFIED` — parol to'g'ri, lekin email tasdiqlanmagan. Server kodni o'zi qayta yuboradi → `verify-email` oynasini oching (`params.resendInSec` — qayta yuborishgacha soniya).

#### Parolni tiklash
```
1. POST /auth/forgot-password  { email, lang? }  ─► 200 { codeSent: true, codeTtlMin: 10 }
2. POST /auth/reset-password   { email, code, newPassword }  ─► 200 { access_token, refresh_token, user }
```
- `forgot-password` har doim bir xil javob beradi (email ro'yxatda bor-yo'qligini oshkor qilmaslik uchun). "Agar bu email ro'yxatdan o'tgan bo'lsa, kod yubordik" deb yozing.
- `reset-password` dan keyin foydalanuvchi tizimga kiradi, boshqa qurilmalardan chiqariladi.
- Faqat Google bilan kirgan foydalanuvchi ham shu yo'l bilan parol o'rnatishi mumkin.

#### `POST /api/landing/auth/change-password` — token kerak
```json
{ "currentPassword": "parol1234", "newPassword": "yangi12345" }
```
Javob: yangi `{ access_token, refresh_token }` — ularni saqlang (eski tokenlar va boshqa qurilmalar bekor bo'ladi).
`user.hasPassword === false` bo'lsa (faqat Google), bu formani emas, "Parol o'rnatish" → `forgot-password` oqimini ko'rsating.

#### Google bilan kirish

Frontend [Google Identity Services](https://developers.google.com/identity/gsi/web) orqali `credential` (ID token) oladi va backend'ga yuboradi.

> **Client ID** backend `.env` dagi `GOOGLE_CLIENT_ID` bilan bir xil bo'lishi kerak. Uni backend jamoasidan oling.

```js
google.accounts.id.initialize({
  client_id: GOOGLE_CLIENT_ID,
  callback: async ({ credential }) => {
    const res = await fetch(`${API}/api/landing/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: credential }),
    });
    const data = await res.json(); // { access_token, refresh_token, isNew, user }
  },
});
```

#### `POST /api/landing/auth/google` — tokensiz
Body: `{ "idToken": "eyJhbGciOi..." }`

Javob `200`:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "isNew": true,
  "user": {
    "id": "uuid",
    "email": "ali@gmail.com",
    "emailVerified": true,
    "firstName": "Ali",
    "lastName": "Valiyev",
    "avatarUrl": "https://lh3.googleusercontent.com/...",
    "lang": "uzb",
    "isBlocked": false,
    "hasPassword": false,
    "hasGoogle": true,
    "lastLoginAt": "2026-11-18T09:00:00.000Z",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```
`isNew: true` bo'lsa salomlashish yoki onboarding ko'rsatish mumkin. `user` obyekti barcha kirish usullarida bir xil:
- `hasPassword` — parol o'rnatilganmi ("Parolni o'zgartirish" yoki "Parol o'rnatish").
- `hasGoogle` — Google ulanganmi.
- `avatarUrl` — faqat Google'dan keladi, email bilan ro'yxatdan o'tganda `null` (bosh harflardan avatar chizing).

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
- **Izoh qoidasi:** `explanation` faqat **kirgan foydalanuvchiga** va **test yakunlangandan keyin** keladi: `/attempts/:id/result`, yakunlangan attempt holati, `/me/mistakes`, `/me/bookmarks`. Mehmon rejimida, demo savolda (shu endpoint) va davom etayotgan testda doim `null`. `null` bo'lsa izoh blokini yashiring.

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
[{ "id": 3, "slug": "yol-belgilari", "name": "Yo'l belgilari", "questionCount": 120 }]
```
`questionCount === 0` bo'lgan mavzuni nofaol ko'rsating (hozircha savollar mavzularga biriktirilmagan).

---

### 2.3. Mehmon va kirgan foydalanuvchi

Test ishlash uchun login **shart emas**. Lekin kirmagan foydalanuvchining hech narsasi saqlanmaydi.

| Imkoniyat | Mehmon (tokensiz) | Kirgan (Google) |
|---|---|---|
| Variant, mavzu, aralash, qiyin savollar bo'yicha test | ✅ `/guest/*` | ✅ `/attempts/*` |
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
| Variantlar → "Testni boshlash" | `{ source: "variant", variantId, mode }` | `POST /guest/tests` | `POST /attempts` |
| **"Real imtihon topshirish"** (bosh sahifadagi katta tugma, "Real imtihon" kartasi) | `{ source: "exam", mode: "exam" }` — har safar 20 ta yangi tasodifiy savol | `POST /guest/tests` | `POST /attempts` |
| 50 / 100 / 200 savollik test | `{ source: "random", mode: "exam" \| "practice", count: 50 \| 100 \| 200 }` | `POST /guest/tests` | `POST /attempts` |
| "Mavzular bo'yicha" | `{ source: "topic", topicId, mode: "practice" }` | `POST /guest/tests` | `POST /attempts` |
| "Qiyin savollar" | `{ source: "hard", mode: "practice" }` | `POST /guest/tests` | `POST /attempts` |
| "Xatolar ustida ishlash" | `{ source: "mistakes", mode: "practice" }` | ❌ login oynasi | `POST /attempts` |
| Saqlangan savollar | `{ source: "bookmarks", mode: "practice" }` | ❌ login oynasi | `POST /attempts` |

Mehmonga ❌ bo'lgan tugmalarni ("Saqlash", "Xatolar ustida ishlash", "Xato haqida xabar", kabinet) ko'rsatish mumkin, lekin bosilganda Google login oynasini oching. Natija sahifasida "Natijangizni saqlash uchun tizimga kiring" bannerini ko'rsatish tavsiya etiladi.

Mehmon kirish talab qilinadigan endpoint'ga tokensiz murojaat qilsa `401` oladi.

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
Body (`/attempts` bilan bir xil, lekin `source` faqat `variant`, `topic`, `random`, `hard` yoki `exam`):
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

> Mehmon test o'rtasida Google bilan kirsa, joriy test davom etadi, lekin saqlanmaydi. Keyingi test `/attempts` orqali boshlanadi va saqlanadi.

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
| `source` | ha | `variant` · `topic` · `mistakes` (xatolarim) · `bookmarks` (saqlanganlar) · `random` (aralash) · `hard` (qiyin savollar) · `exam` (real imtihon: backend har doim 20 ta tasodifiy savol va `mode: "exam"` qo'yadi — 25 daqiqa, 2 xatogacha; `count`/`mode` e'tiborga olinmaydi) |
| `mode` | ha | `practice` yoki `exam` |
| `variantId` | `source=variant` bo'lsa | Variant **id** si |
| `topicId` | `source=topic` bo'lsa | Mavzu id si |
| `count` | yo'q | Variantdan boshqa manbalar uchun savollar soni, 1–200 (default 20). Tayyor hajmlar: 20, 50, 100, 200 |
| `lang` | yo'q | Berilmasa profildagi til |

Bosh sahifa tugmalari qaysi body yuborishi — 2.3 bo'limdagi jadvalda.

Ro'yxat bo'sh bo'lsa (masalan, xato yo'q) `400 NO_QUESTIONS` keladi: "Hozircha xato qilgan savollaringiz yo'q" deb ko'rsating.

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
  "explanation": "...",
  "correctCount": 15,
  "wrongCount": 3,
  "mistakesLeft": 0,
  "finished": true,
  "finishReason": "mistakes_limit"
}
```

| Maydon | Tavsif |
|---|---|
| `isCorrect`, `correctAnswerId` | Javob to'g'ri yoki noto'g'riligi — darhol ko'rsating (yashil / qizil). `explanation` bu yerda doim `null` — izoh natija sahifasida |
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
`topics` eng zaifidan boshlab tartiblangan ("qaysi mavzu sust"). Hozircha bo'sh, chunki savollar mavzularga biriktirilmagan.

#### Xatolarim
- `POST /api/landing/me/explanations` — `{ "questionIds": [12, 45], "lang": "uzb" }` (1–200 ta) → `[{ "id": 12, "explanation": "..." }]`. Mehmon sifatida ishlangan test natijasida izohlar yopiq ("Izohni ko'rish uchun kiring yoki ro'yxatdan o'ting"); foydalanuvchi kirgach frontend shu endpoint bilan natijadagi savollar izohlarini oladi. Davom etayotgan testidagi savollar (oxirgi 6 soat) qaytmaydi.
- `GET /api/landing/me/mistakes?page=1&limit=20&lang=uzb` — sahifalangan ro'yxat. Har bir element: savol + `correctAnswerId` + `explanation` + `wrongCount` + `lastWrongAt` + `myAnswerId`.
  - `myAnswerId` — foydalanuvchi oxirgi xatoda tanlagan javob. Kartada qizil rangda "Sizning javobingiz" deb ko'rsating, to'g'ri javob esa yashil. Javob keyinroq o'chirilgan bo'lsa `null` keladi — belgi ko'rsatilmaydi.
  - Admin nofaol qilgan savollar ro'yxatga ham, `total` ga ham kirmaydi (saqlanganlarda ham shunday).
- `DELETE /api/landing/me/mistakes/:questionId` → `204`

Savol ro'yxatga xato qilinganda tushadi, keyin to'g'ri javob berilsa o'zi chiqadi.

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

---

## 3. Admin API

Hamma endpoint `/api/admin/*`, admin tokeni bilan.

### 3.1. Kirish
| Metod | Yo'l | Body | Javob |
|---|---|---|---|
| POST | `/admin/auth/login` | `{ email, password }` | `{ access_token, refresh_token, admin }` |
| POST | `/admin/auth/refresh` | `{ refreshToken }` | `{ access_token, refresh_token }` |
| GET | `/admin/auth/me` | — | `admin` |
| POST | `/admin/auth/logout` | — | `204` |
| POST | `/admin/auth/change-password` | `{ currentPassword, newPassword }` | yangi tokenlar (boshqa qurilmalar chiqariladi) |

`admin` obyekti:
```json
{
  "id": "uuid",
  "email": "admin@avtotest.uz",
  "fullName": "Super Admin",
  "role": "superadmin",
  "isActive": true,
  "lastLoginAt": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```
`role`: `superadmin` yoki `admin`. "Adminlar" bo'limini faqat `superadmin` ga ko'rsating.

### 3.2. Dashboard — `GET /admin/dashboard`
```json
{
  "users": 120,
  "newUsers7d": 14,
  "questions": 1353,
  "questionsWithoutTopic": 1353,
  "questionsWithoutExplanation": 1353,
  "activeVariants": 200,
  "finishedAttempts": 540,
  "attempts24h": 37,
  "examPassRate": 61,
  "openReports": 3,
  "daily": [{ "date": "2026-11-18", "attempts": 37, "newUsers": 4 }],
  "hardest": [{ "id": 353, "text": "...", "answered": 40, "wrongRate": 72 }]
}
```
`daily` — oxirgi 30 kun (grafik uchun). `hardest` — kamida 5 marta javob berilgan, eng ko'p xato qilinadigan 10 ta savol.

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

Ro'yxat filtrlari: `?page&limit&search&topicId&variantId&hasImage&hasExplanation&isActive`

| Filtr | Tavsif |
|---|---|
| `search` | 4 tildagi matn bo'yicha yoki aniq savol id si |
| `topicId=0` | Mavzusiz savollar |
| `hasImage`, `hasExplanation`, `isActive` | `true` / `false` |

Savol obyekti:
```json
{
  "id": 46,
  "text": { "uzb": "...", "uzc": "...", "ru": "..." },
  "explanation": null,
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
- `explanation: null` — izohni olib tashlash. `topicId: null` — mavzudan chiqarish.

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
| GET | `/admin/topics` | — → `[{ id, slug, name, position, isActive, questionCount }]` |
| POST | `/admin/topics` | `{ slug, name: {uzb,uzc,ru}, position?, isActive? }` |
| PATCH | `/admin/topics/:id` | qisman |
| DELETE | `/admin/topics/:id` | `204`, savollari mavzusiz qoladi |

`slug` — kichik lotin harflar, raqam va `-` (`yol-belgilari`).

### 3.6. Foydalanuvchilar
| Metod | Yo'l | Tavsif |
|---|---|---|
| GET | `/admin/users?search&isBlocked&page&limit` | Har birida `finishedTests`, `avgPercent` |
| GET | `/admin/users/:id` | Foydalanuvchi + `mistakesCount`, `bookmarksCount`, `recentAttempts` (oxirgi 30 ta) |
| PATCH | `/admin/users/:id` | `{ isBlocked: true }` — bloklansa barcha sessiyalari yopiladi |

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
| POST | `/admin/admins` | `{ email, fullName, password, role? }` |
| PATCH | `/admin/admins/:id` | `{ fullName?, role?, isActive?, password? }` |

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

## 4. Tavsiyalar

- **Token yangilash:** 401 kelsa bitta `refresh` so'rov yuboring, bir vaqtda kelgan boshqa so'rovlarni shu so'rov tugashini kutishga qo'ying, keyin qaytaring.
- **Imtihon, 3-xato:** javob kartochkasini qizil qilib ko'rsating, "Imtihondan o'ta olmadingiz — 3 ta xato" xabarini chiqarib, natija sahifasiga o'ting. Mehmonda buni frontend o'zi aniqlaydi (`wrongCount > maxMistakes`), kirgan foydalanuvchida server `finished: true` qaytaradi.
- **Katta testlar (100, 200 savol):** savollar navigatsiyasi (1–200 tugma) gorizontal scroll yoki "har 20 tadan" sahifalab ko'rsatilsin. Mehmon testida 200 ta savol `sessionStorage` ga sig'adi (~200 KB).
- **Imtihon taymeri:** taymerni `remainingSec` dan boshlang. Tab qayta faollashganda (`visibilitychange`) `GET /attempts/:id` bilan vaqtni yangilang.
- **Mehmon testi:** holatni (`questions`, javoblar, taymer) `sessionStorage` da saqlang, aks holda sahifa yangilanganda test yo'qoladi.
- **Test davom ettirish (kirgan foydalanuvchi):** joriy `attemptId` ni `localStorage` da saqlang. Sahifa ochilganda `GET /attempts/:id` chaqiring: `status: "finished"` bo'lsa natijaga o'ting.
- **Til:** kirgan foydalanuvchi tilni o'zgartirganda `PATCH /me { lang }` yuboring va ochiq test uchun `GET /attempts/:id?lang=...` ni qayta chaqiring. Mehmonda tilni `localStorage` da saqlang va har so'rovga `lang` qilib qo'shing.
- **Natija sahifasi:** `guest: true` bo'lsa "Natijangizni saqlash uchun Google bilan kiring" tugmasini ko'rsating. Mehmon natijasida `id` yo'q, shuning uchun uni ulashish yoki qayta ochish havolasi bo'lmaydi.
- **Rasmlar:** URL'lar o'zgarmaydi va bir yil keshlanadi (yangi rasm har doim yangi nom oladi).
