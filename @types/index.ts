// Landing API tiplari — avtotest-backend/FRONTEND-API.md bo'yicha (prefiks /api/landing)

// ---------- Umumiy ----------
// Test tili: o'zbek (lotin), o'zbek (kirill), rus
export type TestLang = "uzb" | "uzc" | "ru" | "kk";

// practice — javob va izoh darhol; exam — natija faqat oxirida, vaqt serverda tekshiriladi
export type ExamMode = "practice" | "exam";

// exam — real imtihon: har doim 20 ta tasodifiy savol, imtihon rejimida (backend majburlaydi).
// group — jamoaviy test (faqat tarixda keladi; /landing/group-tests orqali ishlanadi)
// review — aqlli takrorlash: vaqti kelgan xatolar (tarif smart_review)
export type AttemptSource = "variant" | "topic" | "mistakes" | "bookmarks" | "random" | "hard" | "exam" | "review" | "group";

export type AttemptStatus = "in_progress" | "finished";

// completed — oxirigacha ishlandi, time_up — vaqt tugadi, mistakes_limit — imtihonda xatolar limitidan oshdi
export type FinishReason = "completed" | "time_up" | "mistakes_limit";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PageParams {
  page?: number;
  limit?: number;
}

// ---------- Auth ----------
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

// forgot-password javobi: kod Telegram botga yuborildi
export interface CodeSentResponse {
  codeSent: true;
  channel?: "telegram";
  codeTtlMin: number;
}

// Telefon istalgan ko'rinishda ("+998 90 123-45-67") — server "+998901234567" ga keltiradi
export interface LoginBody {
  phone: string;
  password: string;
}

export interface ForgotPasswordBody {
  phone: string;
  lang?: TestLang;
}

export interface ResetPasswordBody {
  phone: string;
  code: string;
  newPassword: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: string;
  // Odatda null (faqat eski akkauntlarda bor) — ekranda telefon va ism ko'rsatiladi
  email: string | null;
  // "+998901234567"; Telegram username "@" siz
  phone: string | null;
  telegramUsername: string | null;
  hasTelegram: boolean;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  lang: TestLang;
  isBlocked: boolean;
  // Parol bormi: "Parolni o'zgartirish" yoki "Parol yaratish" (set-password)
  hasPassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- Telegram orqali kirish ----------
export interface TelegramStart {
  token: string;
  // Saytda ko'rsatiladigan 2 xonali raqam — botda shuni tanlaydi
  code: number;
  botUrl: string;
  expiresAt: string;
}

// password_required — parolsiz foydalanuvchi (yangi ro'yxatdan o'tgan): token berilmaydi, "Parol yarating" →
// POST /auth/telegram/complete. confirmed — tokenlar faqat bir marta; linked — profilga ulandi (tokensiz)
export type TelegramStatus =
  | { status: "pending"; expiresAt: string }
  | { status: "expired" | "rejected" | "used" }
  | { status: "password_required"; isNew: boolean; firstName: string | null; phone: string | null }
  | ({ status: "confirmed" } & AuthResponse)
  | { status: "linked"; user: User };

// Telegram tasdiqlagan, parol kutilayotgan so'rov (telegram/complete uchun)
export interface TelegramPending {
  token: string;
  isNew: boolean;
  firstName: string | null;
}

// Kirish usullari (telegram status, login, reset-password) shu shaklda.
// isNew — akkaunt shu so'rovda yaratildi (faqat Telegram orqali birinchi kirishda)
export interface AuthResponse extends AuthTokens {
  isNew?: boolean;
  user: User;
}

export interface UpdateMeBody {
  firstName?: string;
  lastName?: string;
  lang?: TestLang;
}

// ---------- Katalog ----------
export interface Meta {
  questionCount: number;
  questionsWithImage: number;
  topicCount: number;
  // { "10": 133, "20": 67 }
  variantsBySize: Record<string, number>;
  exam: {
    questionCount: number;
    timeLimitMin: number;
    passPercent: number;
    maxMistakes: number;
    secondsPerQuestion: number;
  };
  langs: TestLang[];
  // Mehmon cheklovlari: birinchi N ta variant (har formatda) va shuncha savolgacha tasodifiy test
  guestLimits?: GuestLimits;
}

export interface GuestLimits {
  freeVariants: number;
  maxTestSize: number;
}

// 401 LOGIN_REQUIRED (mehmon cheklovdan oshdi) params.reason
export type LoginRequiredReason = "variant" | "test_size" | "exam" | "source";

export interface Answer {
  id: number;
  // F1, F2, ... tugmasi raqami
  position: number;
  text: string;
}

export interface TopicRef {
  id: number;
  name: string;
}

export interface DemoQuestion {
  id: number;
  text: string;
  imageUrl: string | null;
  topic: TopicRef | null;
  answers: Answer[];
  correctAnswerId: number;
  explanation: string | null;
}

export type VariantSize = 10 | 20;

export interface VariantResult {
  bestPercent: number;
  lastPercent: number;
  passed: boolean;
  attempts: number;
  lastAt: string;
}

export interface Variant {
  // API'ga id yuboriladi, ekranda number ko'rsatiladi
  id: number;
  number: number;
  size: VariantSize;
  questionCount: number;
  timeLimitSec: number;
  // Token bo'lmasa yoki yechilmagan bo'lsa null
  result: VariantResult | null;
  // Mehmonda 4-variantdan boshlab true (kirish kerak), kirganda doim false
  requiresLogin?: boolean;
}

export interface VariantList {
  items: Variant[];
  total: number;
  solved: number;
  passed: number;
  passPercent: number;
}

export interface Topic {
  id: number;
  slug: string;
  name: string;
  questionCount: number;
  // Mavzu sahifasidagi "Eslab qolish uchun" kartochkalari soni (0 — blok chiqmaydi)
  mnemonicCount?: number;
}

// "Eslab qolish uchun" (Max, feature mnemonics): mnemonic — matn (ochiq bo'lsa);
// mnemonicLocked — savolda bor, lekin tarif yo'q (xira blok). Ikkalasi ham bo'sh — blok chiqmaydi
export interface MnemonicFields {
  mnemonic?: string | null;
  mnemonicLocked?: boolean;
}

export interface TopicMnemonics {
  topic: { id: number; name: string | null };
  locked: boolean;
  count: number;
  items: string[];
}

// ---------- Test (attempt) ----------
export interface StartAttemptBody {
  source: AttemptSource;
  mode: ExamMode;
  variantId?: number;
  topicId?: number;
  // variant'dan boshqa manbalar uchun, 1–50 (default 20)
  count?: number;
  lang?: TestLang;
}

export interface VariantRef {
  id: number;
  number: number;
  size: VariantSize;
}

// Ochilmagan savolda correctAnswerId va explanation umuman kelmaydi
export interface AttemptQuestion {
  number: number;
  id: number;
  text: string;
  imageUrl: string | null;
  topic: TopicRef | null;
  answers: Answer[];
  myAnswerId: number | null;
  // true / false / null (hali ochilmagan)
  isCorrect: boolean | null;
  correctAnswerId?: number;
  explanation?: string | null;
}

// Test holati, natija va tarix uchun umumiy maydonlar
export interface AttemptBase {
  id: string;
  source: AttemptSource;
  mode: ExamMode;
  status: AttemptStatus;
  variant: VariantRef | null;
  topicId: number | null;
  // Faqat source=group: jamoaviy test id'si (havola /group-test/<id>)
  groupTestId?: string | null;
  questionCount: number;
  // Mashqda null
  timeLimitSec: number | null;
  // Imtihon davomida null
  correctCount: number | null;
  wrongCount: number | null;
  percent: number | null;
  passed: boolean | null;
  passPercent: number;
  // Imtihonda ruxsat etilgan xatolar (20 savolda 2), mashqda null
  maxMistakes: number | null;
  finishReason: FinishReason | null;
  durationSec: number | null;
  startedAt: string;
  finishedAt: string | null;
  lang: TestLang;
  // Tarifsiz foydalanuvchida true: izoh o'rniga "Tarif oling" bloki. Holatda faqat yakunlangan testda keladi
  explanationsLocked?: boolean;
}

export interface Attempt extends AttemptBase {
  // Imtihonda qolgan soniya, mashqda null
  remainingSec: number | null;
  // Imtihonda yana nechta xato mumkin (2 → 1 → 0), mashqda null
  mistakesLeft: number | null;
  // Frontend maydoni: remainingSec kelgan paytdan hisoblangan tugash vaqti (Date.now() ms), mashqda null
  deadline?: number | null;
  answeredCount: number;
  questions: AttemptQuestion[];
}

export interface AnswerBody {
  questionId: number;
  answerId: number;
}

// Ikkala rejimda bir xil: natija darhol. finished — imtihon xatolar limiti bilan tugadi
export interface AnswerResponse {
  saved: true;
  isCorrect: boolean;
  correctAnswerId: number;
  explanation: string | null;
  correctCount: number;
  wrongCount: number;
  mistakesLeft: number | null;
  finished: boolean;
  finishReason: FinishReason | null;
}

export interface ReviewItem extends AttemptQuestion, MnemonicFields {
  correctAnswerId: number;
  explanation: string | null;
}

export interface AttemptResult extends AttemptBase {
  correctCount: number;
  wrongCount: number;
  percent: number;
  passed: boolean;
  finishReason: FinishReason;
  durationSec: number;
  unansweredCount: number;
  avgSecPerQuestion: number;
  review: ReviewItem[];
}

// Natija sahifasi uchun umumiy shakl: kirgan foydalanuvchi (/attempts/:id/result) va mehmon (/guest/result).
// Mehmonda id, source, startedAt, finishedAt yo'q; durationSec va avgSecPerQuestion null bo'lishi mumkin
export type ResultData = Omit<
  AttemptResult,
  "id" | "source" | "startedAt" | "finishedAt" | "durationSec" | "avgSecPerQuestion" | "topicId"
> & {
  id?: string;
  source?: AttemptSource;
  topicId?: number | null;
  guest?: boolean;
  durationSec: number | null;
  avgSecPerQuestion: number | null;
};

// ---------- Mehmon (tokensiz, hech narsa saqlanmaydi) ----------
// /guest/tests da mistakes va bookmarks yo'q
export type GuestSource = Exclude<AttemptSource, "mistakes" | "bookmarks" | "review" | "group">;

export type GuestQuestion = Pick<AttemptQuestion, "number" | "id" | "text" | "imageUrl" | "topic" | "answers">;

export interface GuestTest {
  guest: true;
  source: GuestSource;
  mode: ExamMode;
  variant: VariantRef | null;
  topicId: number | null;
  lang: TestLang;
  questionCount: number;
  // Mashqda null — taymer frontendda shundan boshlanadi
  timeLimitSec: number | null;
  passPercent: number;
  // Imtihonda ruxsat etilgan xatolar, mashqda null. wrong > maxMistakes bo'lishi bilan test to'xtatiladi
  maxMistakes: number | null;
  questions: GuestQuestion[];
}

export interface GuestCheckBody extends AnswerBody {
  lang?: TestLang;
}

export interface GuestCheckResponse {
  isCorrect: boolean;
  correctAnswerId: number;
  explanation: string | null;
}

export interface GuestResultBody {
  // tests javobidagi tartibda
  questionIds: number[];
  // Faqat javob berilganlari — javobsiz savol xato hisoblanadi
  answers: AnswerBody[];
  mode?: ExamMode;
  variantId?: number;
  durationSec?: number;
  // Vaqt tugagani uchun yakunlanmoqda (finishReason: time_up)
  timeUp?: boolean;
  lang?: TestLang;
}

export type GuestResult = ResultData & { guest: true };

// ---------- Yo'l belgilari ----------
export type SignShape = "triangle" | "circle" | "rectangle" | "mixed";

export interface SignGroup {
  id: number;
  slug: string;
  name: string;
  description: string;
  shape: SignShape;
  appearance: string;
  signCount: number;
  previewImageUrl: string | null;
}

export interface Sign {
  id: number;
  groupId: number;
  // 5.26 kabi raqam takrorlanishi mumkin — manzilda slug ishlatiladi
  code: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface SignGroupDetail extends Omit<SignGroup, "previewImageUrl"> {
  signs: Sign[];
}

export interface SignRef {
  id: number;
  slug: string;
  code: string;
}

export interface SignDetail extends Sign {
  group: { id: number; slug: string; name: string };
  prev: SignRef | null;
  next: SignRef | null;
}

// ---------- Kabinet ----------
export interface UserStats {
  finishedTests: number;
  exams: number;
  examsPassed: number;
  avgPercent: number;
  variantsSolved: number;
  totalTimeSec: number;
  answered: number;
  correctRate: number;
  uniqueQuestionsSeen: number;
  totalQuestions: number;
  mistakesCount: number;
  bookmarksCount: number;
  topics: { id: number; name: string; answered: number; correctRate: number }[];
}

export interface SavedQuestion extends Omit<DemoQuestion, "correctAnswerId">, MnemonicFields {
  correctAnswerId: number;
}

export interface MistakeItem extends SavedQuestion {
  wrongCount: number;
  lastWrongAt: string;
  // Oxirgi xatoda tanlangan javob; noma'lum yoki javob o'chirilgan bo'lsa null
  myAnswerId: number | null;
  // Aqlli takrorlash: bosqich (0..reviewSteps-1; reviewSteps da o'rganiladi) va keyingi takrorlash vaqti
  reviewStep: number;
  reviewSteps: number;
  dueAt: string;
}

// ---------- Aqlli takrorlash va tayyorlik (2.6.1, 2.6.2) ----------
export interface ReviewSummary {
  // true — tarifda smart_review yo'q: raqamlar keladi, takrorlash testi paywall
  locked: boolean;
  dueNow: number;
  dueNext24h: number;
  learning: number;
  learned: number;
  nextDueAt: string | null;
  byStep: number[];
  intervalsDays: number[];
  stepsToLearn: number;
}

export type ReadinessLevel = "low" | "medium" | "good" | "ready";

export type ReadinessTip =
  | { code: "take_exam" }
  | { code: "review_due"; params: { count: number } }
  | { code: "weak_topic"; params: { topicId: number; name: string; correctRate: number } }
  | { code: "low_coverage"; params: { seen: number; total: number } }
  | { code: "keep_going" };

export interface Readiness {
  score: number;
  level: ReadinessLevel;
  // false — 50 tadan kam javob: foiz taxminiy
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

export interface BookmarkItem extends SavedQuestion {
  savedAt: string;
}

export interface ReportBody {
  message: string;
}

export interface ReportResponse {
  id: number;
  status: "open" | "resolved" | "rejected";
}

// ---------- Jamoaviy test ----------
// draft — admin hali e'lon qilmagan; waiting — lobby (kod bilan qo'shilish ochiq); running — hamma bir vaqtda ishlayapti
export type GroupTestStatus = "draft" | "waiting" | "running" | "finished" | "cancelled";

// time_up — vaqt tugadi, all_finished — hamma tugatdi, stopped — admin to'xtatdi
export type GroupTestFinishReason = "time_up" | "all_finished" | "stopped";

export interface JoinGroupTestResponse {
  id: string;
  status: GroupTestStatus;
}

// GET /group-tests — mening jamoaviy testlarim (avval faollari, 30 tagacha)
export interface GroupTestListItem {
  id: string;
  title: string;
  status: GroupTestStatus;
  questionCount: number;
  timeLimitSec: number;
  startedAt: string | null;
  endsAt: string | null;
  finishedAt: string | null;
  joinedAt: string;
  attemptId: string | null;
  attemptStatus: AttemptStatus | null;
  percent: number | null;
  passed: boolean | null;
}

// Javoblar har bir o'quvchiga alohida aralashtirilgan, position — F1..Fn tartibi.
// To'g'ri javob test davomida kelmaydi; faqat instantFeedback=true bo'lsa javob berilgan savolda keladi
export interface GroupQuestion {
  number: number;
  id: number;
  text: string;
  imageUrl: string | null;
  topic: TopicRef | null;
  answers: Answer[];
  myAnswerId: number | null;
  isCorrect?: boolean;
  correctAnswerId?: number;
}

export interface GroupReviewItem extends GroupQuestion, MnemonicFields {
  correctAnswerId: number;
  explanation: string | null;
  isCorrect: boolean;
}

// wrongCount ga javobsizlar ham kiradi (total - correct)
export interface GroupResult {
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  percent: number;
  passed: boolean;
  durationSec: number;
  finishedAt: string;
}

// GET /group-tests/:id — holatga qarab maydonlar qo'shiladi:
// lobby — faqat asosiylari; ishlayapman — questions; tugatdim — result; test yakunlandi — result + review
export interface GroupTestState {
  id: string;
  title: string;
  status: GroupTestStatus;
  questionCount: number;
  timeLimitSec: number;
  passPercent: number;
  // true — javob bosilishi bilan to'g'ri/xatoligi va to'g'ri javob ko'rsatiladi (admin test yaratishda tanlaydi)
  instantFeedback: boolean;
  startedAt: string | null;
  endsAt: string | null;
  // Faqat running'da, boshqa holatda null
  remainingSec: number | null;
  finishReason: GroupTestFinishReason | null;
  participantCount: number;
  lang: TestLang;
  attemptId: string | null;
  attemptStatus: AttemptStatus | null;
  answeredCount?: number;
  questions?: GroupQuestion[];
  result?: GroupResult;
  review?: GroupReviewItem[];
  // Frontend maydoni: remainingSec kelgan paytdan hisoblangan tugash vaqti (Date.now() ms)
  deadline?: number | null;
}

export interface GroupAnswerResponse {
  saved: true;
  answeredCount: number;
  total: number;
  // Faqat instantFeedback=true testda
  isCorrect?: boolean;
  correctAnswerId?: number;
}

// Socket "status" hodisasi: admin boshladi / test yakunlandi / bekor qilindi
export interface GroupStatusEvent {
  id: string;
  status: GroupTestStatus;
  startedAt: string | null;
  endsAt: string | null;
  remainingSec: number | null;
  finishReason: GroupTestFinishReason | null;
}

// ---------- Tariflar va to'lov (FRONTEND-API.md 2.8, docs/FRONTEND-TARIFLAR.md) ----------
export type PlanFeature = "all_tests" | "final_exam" | "explanations" | "smart_review" | "videos" | "mnemonics";
export type PaymentProvider = "click" | "payme";
// manual — admin qo'lda bergan (naqd / karta o'tkazma / sovg'a)
export type OrderProvider = PaymentProvider | "manual";
export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";

export interface Plan {
  id: number;
  // standard | pro | max (yangilari qo'shilishi mumkin)
  code: string;
  title: string;
  description: string | null;
  priceUzs: number;
  durationDays: number;
  features: PlanFeature[];
  isPopular: boolean;
  // "Tez kunda" — sotib bo'lmaydi
  comingSoon: boolean;
}

export interface PlansResponse {
  items: Plan[];
  // Serverda ulangan to'lov tizimlari. Bo'sh bo'lsa to'lov tugmalari yashiriladi
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
  // Hozir ochiq imkoniyatlar — paywall shu ro'yxat bo'yicha
  features: PlanFeature[];
  current: { planCode: string; planTitle: string | null; expiresAt: string } | null;
  // Navbatdagi davrlar bilan birga oxirgi kirish kuni
  accessUntil: string | null;
  active: AccessPeriod[];
  // Oldingisi tugagach boshlanadigan davrlar
  upcoming: AccessPeriod[];
}

export interface CreateOrderBody {
  planId: number;
  provider: PaymentProvider;
  lang?: TestLang;
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

// ---------- Shpargalka (FRONTEND-API.md 2.9) ----------
// icon — lucide nomi (gauge, timer, ban, ...), color — red | blue | violet | amber | green | orange
export interface CheatSheetCard {
  id: number;
  slug: string;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  itemCount: number;
}

export interface CheatSheetItem {
  // Matn: "2.55", "50–100", "DYHXX" — formatlanmaydi
  value: string;
  unit: string | null;
  label: string;
}

export interface CheatSheetRef {
  slug: string;
  title: string;
}

export interface CheatSheet extends Omit<CheatSheetCard, "itemCount"> {
  sections: { title: string; items: CheatSheetItem[] }[];
  prev: CheatSheetRef | null;
  next: CheatSheetRef | null;
}

// ---------- Xatolar ----------
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "ACCOUNT_BLOCKED"
  | "INVALID_OTP"
  | "OTP_ATTEMPTS_EXHAUSTED"
  | "OTP_TOO_SOON"
  | "INVALID_CREDENTIALS"
  | "INVALID_CURRENT_PASSWORD"
  | "INVALID_REFRESH_TOKEN"
  | "NOT_FOUND"
  | "NO_QUESTIONS"
  | "LOGIN_REQUIRED"
  | "UNKNOWN_QUESTIONS"
  | "ATTEMPT_FINISHED"
  | "ATTEMPT_NOT_FINISHED"
  | "ALREADY_ANSWERED"
  | "QUESTION_NOT_IN_ATTEMPT"
  | "ANSWER_NOT_IN_QUESTION"
  | "TOO_MANY_REQUESTS"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INVALID_GROUP_CODE"
  | "GROUP_TEST_NOT_INVITED"
  | "GROUP_TEST_KICKED"
  | "GROUP_TEST_INVALID_STATE"
  | "GROUP_ATTEMPT"
  | "PREMIUM_REQUIRED"
  | "PLAN_NOT_AVAILABLE"
  | "PAYMENT_PROVIDER_DISABLED"
  | "ORDER_INVALID_STATE"
  | "TELEGRAM_AUTH_DISABLED"
  | "PASSWORD_ALREADY_SET"
  | "PHONE_NOT_REGISTERED"
  | "PASSWORD_NOT_SET"
  | "LAST_LOGIN_METHOD"
  | "PHONE_TAKEN"
  | "CODE_SEND_FAILED";

export interface ApiError {
  statusCode: number;
  code: ApiErrorCode;
  message: string;
  error?: string;
  params?: Record<string, string | number>;
  errors?: { field: string; message: string }[];
}
