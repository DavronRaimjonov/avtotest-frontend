"use client";

import { useTranslation } from "react-i18next";
import type { GroupTestListItem } from "@/@types";
import { ChevronRightIcon, UsersIcon } from "@/components/ui/icons";
import { FormField } from "@/components/ui/form-field";
import { Link } from "@/components/ui/link";
import { TextInput } from "@/components/ui/text-input";
import { useAppForm } from "@/hooks/useAppForm";
import { useGroupTestsQuery } from "@/hooks/useQuery";
import { GROUP_CODE_LENGTH } from "@/lib/constants";
import { cn, formatDate, getErrorMessage } from "@/lib/helpers";
import { ROUTES } from "@/lib/routes";
import { useJoinGroupTestMutation } from "@/request/mutation";
import { groupCodeSchema } from "@/schema/group-test/group-test.schema";
import { useAuthStore } from "@/store/auth.store";

// /group-test: o'qituvchi bergan 6 xonali kod bilan qo'shilish va mening jamoaviy testlarim
// (davom etayotgan testga qaytish uchun). Mehmonga — kirish taklifi
export const GroupJoin = () => {
  const { t } = useTranslation();
  const hasSession = useAuthStore((s) => s.hasSession);
  const openLogin = useAuthStore((s) => s.openLogin);

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-7 px-4 pt-10 pb-20 sm:px-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 text-[28px] font-extrabold tracking-tight sm:text-[32px]">{t("groupTest.title")}</h1>
        <p className="m-0 text-[15px] text-muted">{t("groupTest.join.subtitle")}</p>
      </div>

      {hasSession ? (
        <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
          <JoinForm />
          <MyGroupTests />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-[28px] border border-line bg-white px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-tint-blue text-navy-2">
            <UsersIcon size={28} />
          </span>
          <b className="text-lg">{t("groupTest.loginTitle")}</b>
          <p className="m-0 max-w-md text-[15px] text-muted">{t("groupTest.loginText")}</p>
          <button
            type="button"
            onClick={() => openLogin()}
            className="btn-hover mt-2 h-12 rounded-xl bg-navy px-6 font-bold text-white"
          >
            {t("common.login")}
          </button>
        </div>
      )}
    </div>
  );
};

const JoinForm = () => {
  const { t } = useTranslation();
  const { values, errors, setField, handleSubmit } = useAppForm(groupCodeSchema, { code: "" });
  const join = useJoinGroupTestMutation();
  // INVALID_GROUP_CODE, GROUP_TEST_NOT_INVITED, GROUP_TEST_KICKED, TOO_MANY_REQUESTS — maydon ostida
  const error = errors.code ?? (join.isError ? getErrorMessage(join.error) : undefined);

  return (
    <form
      onSubmit={handleSubmit(({ code }) => join.mutate(code))}
      noValidate
      className="flex flex-col gap-4 rounded-[28px] border border-line bg-white p-5 sm:p-7"
    >
      <h2 className="m-0 text-xl font-extrabold">{t("groupTest.join.title")}</h2>
      <FormField label={t("groupTest.join.code")} htmlFor="group-code" error={error} hint={t("groupTest.join.hint")}>
        <TextInput
          id="group-code"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          maxLength={GROUP_CODE_LENGTH}
          placeholder={"•".repeat(GROUP_CODE_LENGTH)}
          value={values.code}
          onChange={(e) => {
            setField("code", e.target.value.replace(/\D/g, "").slice(0, GROUP_CODE_LENGTH));
            if (join.isError) join.reset();
          }}
          invalid={!!error}
          className="h-14 text-center text-2xl font-extrabold tracking-[0.5em]"
        />
      </FormField>
      <button
        type="submit"
        disabled={join.isPending || join.isSuccess}
        className="btn-hover h-12 rounded-xl bg-accent px-6 font-extrabold text-navy disabled:opacity-60"
      >
        {join.isPending || join.isSuccess ? t("groupTest.join.joining") : t("groupTest.join.submit")}
      </button>
    </form>
  );
};

const MyGroupTests = () => {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useGroupTestsQuery();

  return (
    <section aria-labelledby="my-group-tests" className="flex flex-col gap-3">
      <h2 id="my-group-tests" className="m-0 text-xl font-extrabold">
        {t("groupTest.mine.title")}
      </h2>

      {isPending && (
        <div className="flex flex-col gap-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-[76px] animate-pulse rounded-2xl bg-soft" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4">
          <span className="mr-auto text-[15px] text-muted">{t("groupTest.mine.error")}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="h-10 rounded-[10px] border-[1.5px] border-line bg-white px-4 text-sm font-bold text-navy"
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      {data?.length === 0 && (
        <p className="m-0 rounded-2xl border border-dashed border-line bg-white px-5 py-6 text-[15px] text-muted">
          {t("groupTest.mine.empty")}
        </p>
      )}

      {!!data?.length && (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {data.map((item) => (
            <li key={item.id}>
              <Link
                href={ROUTES.groupTest(item.id)}
                className="flex items-center gap-4 rounded-2xl border border-line bg-white px-4 py-3.5 text-ink no-underline transition-colors hover:border-navy focus-visible:border-navy sm:px-5"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <b className="truncate">{item.title}</b>
                  <span className="text-[13px] text-muted">
                    {t("groupTest.mine.meta", {
                      count: item.questionCount,
                      min: Math.round(item.timeLimitSec / 60),
                    })}
                    {" · "}
                    {formatDate(item.finishedAt ?? item.startedAt ?? item.joinedAt)}
                  </span>
                </span>
                <StatusBadge item={item} />
                <ChevronRightIcon size={18} className="flex-none text-subtle" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

// Lobby — kutilmoqda, ishlayapman — davom etmoqda, men tugatdim — natija kutilmoqda, yakunlangan — foiz
const StatusBadge = ({ item }: { item: GroupTestListItem }) => {
  const { t } = useTranslation();
  const badge = (() => {
    if (item.status === "waiting" || item.status === "draft") {
      return { text: t("groupTest.status.waiting"), tone: "bg-warn-bg text-warn-text" };
    }
    if (item.status === "running") {
      return item.attemptStatus === "finished"
        ? { text: t("groupTest.status.submitted"), tone: "bg-soft text-slate" }
        : { text: t("groupTest.status.running"), tone: "bg-tint-yellow text-tint-yellow-fg" };
    }
    if (item.percent == null) return { text: t("groupTest.status.finished"), tone: "bg-soft text-slate" };
    return item.passed
      ? { text: t("groupTest.status.passed", { percent: item.percent }), tone: "bg-ok-bg text-ok-text" }
      : { text: t("groupTest.status.failed", { percent: item.percent }), tone: "bg-bad-bg text-bad-text" };
  })();

  return (
    <span className={cn("flex-none rounded-full px-3 py-1.5 text-xs font-extrabold whitespace-nowrap", badge.tone)}>
      {badge.text}
    </span>
  );
};
