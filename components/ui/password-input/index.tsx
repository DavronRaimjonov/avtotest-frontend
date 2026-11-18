"use client";

import { type InputHTMLAttributes, useState } from "react";
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { cn } from "@/lib/helpers";
import { inputClass } from "../text-input";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { invalid?: boolean };

// Parol maydoni: ko'z tugmasi bilan ko'rsatish / yashirish
export const PasswordInput = ({ invalid, className, id, ...props }: Props) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={cn(inputClass, "pr-12", invalid ? "border-bad" : "border-line", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
        className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-bg"
      >
        {visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
      </button>
    </div>
  );
};
