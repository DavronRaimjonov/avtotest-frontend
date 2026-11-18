"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { REPORT_MAX } from "@/lib/constants";
import { useReportMutation } from "@/request/mutation";
import { reportSchema } from "@/schema/report/report.schema";

// "Xato haqida xabar": savolda xato yoki noaniq rasm bo'lsa adminga yuboriladi
export const ReportForm = ({ questionId, onDone }: { questionId: number; onDone: () => void }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const report = useReportMutation();
  const parsed = reportSchema.safeParse({ message });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed.success) return;
    report.mutate({ questionId, body: parsed.data }, { onSuccess: onDone });
  };

  return (
    <form onSubmit={submit} className="flex animate-fade-in flex-col gap-2.5 rounded-2xl border border-line bg-white p-4">
      <label htmlFor="report-message" className="text-sm font-bold">
        {t("test.reportTitle")}
      </label>
      <textarea
        id="report-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={REPORT_MAX}
        rows={3}
        autoFocus
        placeholder={t("test.reportPlaceholder")}
        className="resize-y rounded-xl border-[1.5px] border-line px-3 py-2.5 text-[15px] outline-none focus:border-navy"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="h-10 rounded-[10px] px-4 text-sm font-bold text-slate">
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          disabled={!parsed.success || report.isPending}
          className="h-10 rounded-[10px] bg-navy px-4 text-sm font-bold text-white disabled:opacity-50"
        >
          {report.isPending ? t("common.sending") : t("common.send")}
        </button>
      </div>
    </form>
  );
};
