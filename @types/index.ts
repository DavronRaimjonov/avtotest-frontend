// Landing API tiplari — avtotest-backend/FRONTEND-API.md bo'yicha (prefiks /api/landing)

// ---------- Umumiy ----------
// Test tili: o'zbek (lotin), o'zbek (kirill), rus
export type TestLang = "uzb" | "uzc" | "ru" | "kk";

// practice — javob va izoh darhol; exam — natija faqat oxirida, vaqt serverda tekshiriladi
export type ExamMode = "practice" | "exam";

export type AttemptSource = "variant" | "topic" | "mistakes" | "bookmarks" | "random" | "hard";

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

export interface GoogleLoginBody {
  idToken: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  lang?: TestLang;
}

// register / resend-code / forgot-password javobi
export interface CodeSentResponse {
  email?: string;
  codeSent: true;
  resendInSec?: number;
  codeTtlMin: number;
}

export interface VerifyEmailBody {
  email: string;
  code: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface ForgotPasswordBody {
  email: string;
  lang?: TestLang;
}

export interface ResetPasswordBody {
  email: string;
  code: string;
  newPassword: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  lang: TestLang;
  isBlocked: boolean;
  // Parol o'rnatilganmi ("Parolni o'zgartirish" yoki "Parol o'rnatish"), Google ulanganmi
  hasPassword: boolean;
  hasGoogle: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Barcha kirish usullari (login, verify-email, reset-password, google) shu shaklda.
// isNew — akkaunt shu so'rovda yaratildi (login va reset-password da kelmaydi)
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
}

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

export interface ReviewItem extends AttemptQuestion {
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
export type GuestSource = Exclude<AttemptSource, "mistakes" | "bookmarks">;

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

export interface SavedQuestion extends Omit<DemoQuestion, "correctAnswerId"> {
  correctAnswerId: number;
}

export interface MistakeItem extends SavedQuestion {
  wrongCount: number;
  lastWrongAt: string;
  // Oxirgi xatoda tanlangan javob; noma'lum yoki javob o'chirilgan bo'lsa null
  myAnswerId: number | null;
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

// ---------- Xatolar ----------
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "ACCOUNT_BLOCKED"
  | "INVALID_GOOGLE_TOKEN"
  | "GOOGLE_AUTH_DISABLED"
  | "EMAIL_TAKEN"
  | "EMAIL_NOT_VERIFIED"
  | "INVALID_OTP"
  | "OTP_ATTEMPTS_EXHAUSTED"
  | "OTP_TOO_SOON"
  | "MAIL_SEND_FAILED"
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
  | "TOO_MANY_REQUESTS";

export interface ApiError {
  statusCode: number;
  code: ApiErrorCode;
  message: string;
  error?: string;
  params?: Record<string, string | number>;
  errors?: { field: string; message: string }[];
}
