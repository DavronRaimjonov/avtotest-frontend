"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { toLanguage } from "@/i18n";
import { localePath } from "@/lib/routes";

// next/link + joriy til prefiksi: <Link href="/variants"> → /ru/variants (standart tilda prefikssiz)
export const Link = ({ href, ...props }: ComponentProps<typeof NextLink> & { href: string }) => {
  const { i18n } = useTranslation();
  return <NextLink href={localePath(toLanguage(i18n.language), href)} {...props} />;
};

export default Link;
