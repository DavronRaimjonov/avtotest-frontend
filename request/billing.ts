import type { CreatedOrder, CreateOrderBody, MyAccess, Order, Paginated, PlansResponse, TestLang } from "@/@types";
import { request } from ".";

// Tariflar (narxlar sahifasi) — tokensiz. Narx va muddatni admin o'zgartiradi: frontendga qattiq yozilmaydi
export const getPlans = (lang?: TestLang) =>
  request.get<PlansResponse>("/landing/plans", { params: { lang } }).then((r) => r.data);

// Mening tarifim: nimalar ochiq va qachongacha
export const getMyAccess = (lang?: TestLang) =>
  request.get<MyAccess>("/landing/me/access", { params: { lang } }).then((r) => r.data);

// Buyurtma: javobdagi paymentUrl'ga shu tabda o'tiladi (Click / Payme sahifasi)
export const createOrder = (body: CreateOrderBody) =>
  request.post<CreatedOrder>("/landing/orders", body).then((r) => r.data);

// To'lovdan qaytgach holati: pending | paid | cancelled | refunded. Faqat o'z buyurtmasi, boshqasiga 404
export const getOrder = (id: number, lang?: TestLang) =>
  request.get<Order>(`/landing/orders/${id}`, { params: { lang } }).then((r) => r.data);

// Mening to'lovlarim (paid va refunded)
export const getOrders = (params: { page?: number; limit?: number; lang?: TestLang }) =>
  request.get<Paginated<Order>>("/landing/orders", { params }).then((r) => r.data);
