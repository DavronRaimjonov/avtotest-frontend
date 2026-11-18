import type { DemoQuestion, Meta, TestLang, Topic, VariantList, VariantSize } from "@/@types";
import { request } from ".";

// Hero va "Imtihon qanday o'tadi" raqamlari
export const getMeta = () => request.get<Meta>("/landing/meta").then((r) => r.data);

// "Sinab ko'ring" bloki: tasodifiy rasmli savol to'g'ri javobi bilan (tekshiruv frontendda)
export const getDemoQuestion = (lang: TestLang) =>
  request.get<DemoQuestion>("/landing/demo-question", { params: { lang } }).then((r) => r.data);

// Token bo'lsa har bir variantda foydalanuvchi natijasi (result) keladi
export const getVariants = (size: VariantSize) =>
  request.get<VariantList>("/landing/variants", { params: { size } }).then((r) => r.data);

export const getTopics = (lang: TestLang) =>
  request.get<Topic[]>("/landing/topics", { params: { lang } }).then((r) => r.data);
