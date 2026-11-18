import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/helpers";

type Props = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const inputClass =
  "h-12 w-full rounded-xl border-[1.5px] bg-white px-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-subtle focus:border-navy";

export const TextInput = ({ invalid, className, id, ...props }: Props) => (
  <input
    id={id}
    aria-invalid={invalid || undefined}
    aria-describedby={invalid ? `${id}-error` : undefined}
    className={cn(inputClass, invalid ? "border-bad" : "border-line", className)}
    {...props}
  />
);
