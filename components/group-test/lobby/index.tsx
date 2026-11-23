"use client";

import { useTranslation } from "react-i18next";
import type { GroupTestState } from "@/@types";
import { UsersIcon } from "@/components/ui/icons";
import { useLeaveGroupTestMutation } from "@/request/mutation";
import { ConnectionBadge, GroupShell } from "../shell";

// Lobby: admin testni boshlashi bilan (socket "status") savollar shu sahifada ochiladi
export const GroupLobby = ({ state, connected }: { state: GroupTestState; connected: boolean }) => {
  const { t } = useTranslation();
  const leave = useLeaveGroupTestMutation(state.id);

  const stats = [
    { label: t("groupTest.lobby.questions"), value: state.questionCount },
    { label: t("groupTest.lobby.time"), value: t("groupTest.minutes", { count: Math.round(state.timeLimitSec / 60) }) },
    { label: t("groupTest.lobby.participants"), value: state.participantCount },
  ];

  return (
    <GroupShell title={state.title} subtitle={t("groupTest.lobby.subtitle")} aside={<ConnectionBadge connected={connected} />}>
      <section
        aria-labelledby="lobby-title"
        className="flex animate-fade-in flex-col items-center gap-7 rounded-[28px] border border-line bg-white px-5 py-10 text-center sm:px-8 sm:py-14"
      >
        <WaitingAnimation />
        <div className="flex flex-col gap-2">
          <h1 id="lobby-title" className="m-0 text-2xl font-extrabold tracking-tight sm:text-[32px]">
            {t("groupTest.lobby.title")}
          </h1>
          <p className="m-0 max-w-md leading-relaxed text-muted">{t("groupTest.lobby.text")}</p>
        </div>

        <dl className="m-0 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 rounded-[20px] border border-line bg-bg px-5 py-4">
              <dt className="text-[13px] font-bold text-muted">{s.label}</dt>
              <dd className="m-0 text-2xl font-extrabold">{s.value}</dd>
            </div>
          ))}
        </dl>

        <p className="m-0 max-w-md text-sm text-muted">{t("groupTest.lobby.rules")}</p>

        <button
          type="button"
          onClick={() => leave.mutate()}
          disabled={leave.isPending}
          className="h-12 rounded-xl border-[1.5px] border-line bg-white px-6 font-bold text-bad-text hover:border-bad disabled:opacity-60"
        >
          {leave.isPending ? t("groupTest.lobby.leaving") : t("groupTest.lobby.leave")}
        </button>
      </section>
    </GroupShell>
  );
};

// "Kutish" animatsiyasi: tarqaluvchi halqalar (prefers-reduced-motion'da to'xtaydi — globals.css)
const WaitingAnimation = () => (
  <div className="relative flex size-32 items-center justify-center" aria-hidden="true">
    <span className="absolute inset-0 animate-ping rounded-full bg-accent/25 [animation-duration:2.2s]" />
    <span className="absolute inset-4 animate-ping rounded-full bg-accent/30 [animation-delay:0.6s] [animation-duration:2.2s]" />
    <span className="absolute inset-6 rounded-full bg-tint-yellow" />
    <span className="relative flex size-16 items-center justify-center rounded-full bg-accent text-navy shadow-[0_10px_24px_-10px_rgba(255,194,26,0.9)]">
      <UsersIcon size={30} />
    </span>
  </div>
);
