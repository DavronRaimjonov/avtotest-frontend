"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { useSignGroupQuery } from "@/hooks/useQuery";
import { ROUTES } from "@/lib/routes";
import { SignCard, SignCardSkeleton } from "../sign-card";

// Kategoriya ichidagi barcha belgilar
export const SignGroupView = () => {
  const { t } = useTranslation();
  const { group } = useParams<{ group: string }>();
  const { data, isPending, isError } = useSignGroupQuery(group);

  return (
    <div className="mx-auto flex max-w-300 flex-col gap-6 px-6 pt-10 pb-20">
      <Link
        href={ROUTES.signs}
        className="flex items-center gap-1.5 self-start text-sm font-bold text-navy-2 no-underline"
      >
        <ChevronLeftIcon size={16} />
        {t("signs.allGroups")}
      </Link>
      {isError ? (
        <p className="m-0 font-semibold text-bad-text">{t("signs.notFound")}</p>
      ) : (
        <>
          <div className="flex max-w-180 flex-col gap-2">
            {isPending ? (
              <span className="h-10 w-72 animate-pulse rounded-lg bg-soft" />
            ) : (
              <>
                <h1 className="m-0 text-[32px] font-extrabold tracking-tight">{data.name}</h1>
                <p className="m-0 text-[15px] leading-relaxed text-muted">{data.description}</p>
                <span className="text-sm font-bold text-navy-2">{t("signs.count", { count: data.signCount })}</span>
              </>
            )}
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
            {isPending
              ? Array.from({ length: 12 }, (_, i) => <SignCardSkeleton key={i} />)
              : data.signs.map((s) => <SignCard key={s.id} sign={s} group={group} />)}
          </div>
        </>
      )}
    </div>
  );
};
