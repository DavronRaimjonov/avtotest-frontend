"use client";

import { useCallback, useState } from "react";
import type { z } from "zod";

type Errors<T> = Partial<Record<keyof T, string>>;

// Zod bilan oddiy forma: submit'da tekshiradi, xato bo'lgan maydon o'zgarsa xatosi o'chadi
export const useAppForm = <S extends z.ZodType<Record<string, unknown>>>(schema: S, initialValues: z.input<S>) => {
  type Values = z.input<S>;
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors<Values>>({});

  // Barqaror funksiya: useEffect bog'liqliklarida ishlatsa bo'ladi
  const setField = useCallback(<K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...(prev as object), [key]: value }) as Values);
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const handleSubmit = (onValid: (data: z.output<S>) => void) => (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (result.success) return onValid(result.data);

    const next: Errors<Values> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof Values;
      next[key] ??= issue.message;
    }
    setErrors(next);
  };

  return { values, errors, setField, handleSubmit };
};
