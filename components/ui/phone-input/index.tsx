"use client";

import type { InputHTMLAttributes } from "react";
import { formatPhoneInput, UZ_PREFIX } from "@/lib/helpers";
import { TextInput } from "../text-input";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
};

// Telefon: faqat raqam kiritiladi, yozilayotganda "+998 90 123 45 67" ko'rinishiga keltiriladi.
// Bo'sh maydonga bosilganda "+998 " o'zi qo'yiladi; boshqa davlat raqami uchun prefiksni o'chirib yozsa bo'ladi
export const PhoneInput = ({ value, onChange, onFocus, ...props }: Props) => (
  <TextInput
    type="tel"
    inputMode="tel"
    autoComplete="tel"
    placeholder="+998 90 123 45 67"
    value={value}
    onFocus={(e) => {
      if (!value) onChange(UZ_PREFIX);
      onFocus?.(e);
    }}
    onChange={(e) => onChange(formatPhoneInput(e.target.value))}
    {...props}
  />
);
