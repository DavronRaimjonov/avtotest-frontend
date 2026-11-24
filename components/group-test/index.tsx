"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Attempt, GroupTestState, GroupTestStatus } from "@/@types";
import { ActiveTest } from "@/components/test";
import { useGroupTestSocket } from "@/hooks/useGroupTestSocket";
import { useGroupTestQuery } from "@/hooks/useQuery";
import { GROUP_TIME_UP_REFETCH_MS } from "@/lib/constants";
import { getErrorCode, getErrorMessage } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useGroupAnswerMutation, useGroupFinishMutation } from "@/request/mutation";
import { GroupLobby } from "./lobby";
import { GroupResultView } from "./result";
import { GroupMessage, GroupTestSkeleton } from "./shell";

export { GroupTestSkeleton };

// Shu holatlarda real vaqt kanaliga ulanamiz (boshlanish / yakunlanish signallari)
const LIVE_STATUSES: GroupTestStatus[] = ["draft", "waiting", "running"];

// Server ulanishni uzgan holatlar: chiqarildi yoki test boshqa qurilmada ochildi
type Stopped = "kicked" | "replaced" | null;

// /group-test/<id>: holatga qarab lobby → test → natija (→ yakunlangach tahlil). Hammasi bitta sahifada,
// o'tishlar socket "status" hodisasi bilan darhol (server — yagona manba, sahifa har safar holatni qayta oladi)
export const GroupTestRunner = () => {
  const { id } = useParams<{ id: string }>();
  return <GroupTest key={id} id={id} />;
};

const GroupTest = ({ id }: { id: string }) => {
  const { t } = useTranslation();
  const { data: state, isPending, isError, error, refetch } = useGroupTestQuery(id);
  const [stopped, setStopped] = useState<Stopped>(null);

  const errorCode = isError ? getErrorCode(error) : undefined;
  const kicked = stopped === "kicked" || errorCode === "GROUP_TEST_KICKED";
  // Bekor qilingan test ham 404 qaytaradi
  const gone = errorCode === "NOT_FOUND" || state?.status === "cancelled";
  const live = !!state && LIVE_STATUSES.includes(state.status) && !stopped && !kicked && !gone;

  const { connected, emitViewing } = useGroupTestSocket(id, live, {
    onStatus: () => refetch(),
    onKicked: () => setStopped("kicked"),
    onReplaced: () => setStopped("replaced"),
    onUnauthorized: () => refetch(),
    onReconnect: () => refetch(),
  });

  // Vkladkaga qaytilganda qolgan vaqt va holat serverdan yangilanadi
  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && refetch();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refetch]);

  if (kicked) return <GroupMessage title={t("groupTest.kicked")} text={t("groupTest.kickedText")} />;

  if (stopped === "replaced") {
    return (
      <GroupMessage title={t("groupTest.replaced")} text={t("groupTest.replacedText")}>
        <button
          type="button"
          onClick={() => {
            setStopped(null);
            refetch();
          }}
          className="h-12 rounded-xl bg-navy px-6 font-bold text-white"
        >
          {t("groupTest.continueHere")}
        </button>
      </GroupMessage>
    );
  }

  if (gone) return <GroupMessage title={t("groupTest.notFound")} text={t("groupTest.notFoundText")} />;

  if (isPending) return <GroupTestSkeleton />;

  // Holat umuman olinmagan (tarmoq va h.k.). Holat bor bo'lsa, vaqtinchalik xatoda eski ko'rinish qoladi
  if (!state) {
    return (
      <GroupMessage title={t("groupTest.openError")} text={getErrorMessage(error)}>
        <button type="button" onClick={() => refetch()} className="h-12 rounded-xl bg-navy px-6 font-bold text-white">
          {t("common.retry")}
        </button>
      </GroupMessage>
    );
  }

  if (state.status === "waiting" || state.status === "draft") {
    return <GroupLobby state={state} connected={connected} />;
  }

  if (state.status === "running" && state.attemptStatus === "in_progress" && state.questions) {
    return <GroupActiveTest key={state.attemptId} state={state} onView={emitViewing} onTimeUp={() => refetch()} />;
  }

  if (state.result) return <GroupResultView state={state} result={state.result} connected={connected} />;

  // Test boshlanganda lobbyda bo'lmagan (attempt ochilmagan)
  return <GroupMessage title={t("groupTest.notParticipant")} text={t("groupTest.notParticipantText")} />;
};

// Jamoaviy test savollarini test ekrani (ActiveTest) shakliga keltiradi. To'g'ri/xato faqat instantFeedback
// testda va server javobni tekshirib qaytargandan keyin (isCorrect: null — hali ochilmagan), taymer — server bergan qolgan vaqtdan
const toAttempt = (s: GroupTestState): Attempt => {
  const questions = (s.questions ?? []).map((q) => ({ ...q, isCorrect: q.isCorrect ?? null }));
  const checked = s.instantFeedback ? questions.filter((q) => q.isCorrect !== null) : [];
  const correct = checked.filter((q) => q.isCorrect).length;
  return {
    id: s.attemptId ?? s.id,
    source: "group",
    mode: "exam",
    status: "in_progress",
    variant: null,
    topicId: null,
    groupTestId: s.id,
    questionCount: s.questionCount,
    timeLimitSec: s.timeLimitSec,
    correctCount: s.instantFeedback ? correct : null,
    wrongCount: s.instantFeedback ? checked.length - correct : null,
    percent: null,
    passed: null,
    passPercent: s.passPercent,
    maxMistakes: null,
    finishReason: null,
    durationSec: null,
    startedAt: s.startedAt ?? "",
    finishedAt: null,
    lang: s.lang,
    remainingSec: s.remainingSec,
    mistakesLeft: null,
    deadline: s.deadline ?? null,
    answeredCount: s.answeredCount ?? questions.filter((q) => q.myAnswerId !== null).length,
    questions,
  };
};

type ActiveProps = {
  state: GroupTestState;
  onView: (questionId: number) => void;
  onTimeUp: () => void;
};

const GroupActiveTest = ({ state, onView, onTimeUp }: ActiveProps) => {
  const answer = useGroupAnswerMutation(state.id);
  const finish = useGroupFinishMutation(state.id);
  const attempt = useMemo(() => toAttempt(state), [state]);

  // Vaqt tugaganda testni server yakunlaydi (bir necha soniya kechikish bilan) va "status" yuboradi.
  // Socket uzilgan bo'lsa ham — natija ko'rinmaguncha holat zaxira sifatida qayta-qayta so'raladi
  const timeUpTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      if (timeUpTimer.current) clearInterval(timeUpTimer.current);
    },
    [],
  );

  const onFinish = (timeUp?: boolean) => {
    if (timeUp) {
      timeUpTimer.current ??= setInterval(onTimeUp, GROUP_TIME_UP_REFETCH_MS);
      return;
    }
    if (!finish.isPending) finish.mutate();
  };

  return (
    <ActiveTest
      attempt={attempt}
      title={state.title}
      backHref={ROUTES.groupTests}
      blind={!state.instantFeedback}
      onView={onView}
      onAnswer={answer.mutate}
      onFinish={onFinish}
      finishing={finish.isPending}
    />
  );
};
