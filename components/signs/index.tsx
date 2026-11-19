"use client";

import Image from "next/image";
import { useDeferredValue, useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { useSignGroupsQuery, useSignSearchQuery } from "@/hooks/useQuery";
import { ROUTES } from "@/lib/routes";
import { SignCard, SignCardSkeleton } from "./sign-card";

// Yo'l belgilari: kategoriyalar + qidiruv (raqam yoki nom bo'yicha)
export const SignGroups = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const groups = useSignGroupsQuery();
  const results = useSignSearchQuery(deferred);
  const searching = deferred.trim().length > 0;
  // Qidiruv natijasida kategoriya slug'i yo'q — id bo'yicha topiladi (API slug o'rniga id ham qabul qiladi)
  const groupSlug = (groupId: number) => groups.data?.find((g) => g.id === groupId)?.slug ?? String(groupId);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 pt-10 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex max-w-[640px] flex-col gap-2">
          <span className="text-[13px] font-extrabold tracking-[0.08em] text-navy-2">{t("signs.eyebrow")}</span>
          <h1 className="m-0 text-[32px] font-extrabold tracking-tight sm:text-[40px]">{t("signs.title")}</h1>
          <p className="m-0 text-[15px] leading-relaxed text-muted">{t("signs.text")}</p>
        </div>
        <label className="relative w-full max-w-[380px]">
          <span className="sr-only">{t("signs.search")}</span>
          <SearchIcon size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("signs.search")}
            className="h-12 w-full rounded-xl border-[1.5px] border-line bg-white pr-4 pl-11 text-[15px] outline-none focus:border-navy"
          />
        </label>
      </div>

      {searching ? (
        <section className="flex flex-col gap-4">
          {results.data?.length === 0 && <p className="m-0 text-muted">{t("signs.noResults")}</p>}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
            {results.isPending
              ? Array.from({ length: 8 }, (_, i) => <SignCardSkeleton key={i} />)
              : results.data?.map((s) => <SignCard key={s.id} sign={s} group={groupSlug(s.groupId)} />)}
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {groups.isPending
            ? Array.from({ length: 7 }, (_, i) => <span key={i} className="h-[150px] animate-pulse rounded-[20px] bg-soft" />)
            : groups.data?.map((g) => (
                <Link
                  key={g.id}
                  href={ROUTES.signGroup(g.slug)}
                  className="lift flex gap-4 rounded-[20px] border border-line bg-white p-5 text-ink no-underline"
                >
                  <span className="relative size-20 flex-none rounded-2xl bg-bg">
                    {g.previewImageUrl && (
                      <Image src={g.previewImageUrl} alt="" fill unoptimized className="object-contain p-3" />
                    )}
                  </span>
                  <span className="flex flex-col gap-1">
                    <b className="text-[17px] leading-snug">{g.name}</b>
                    <span className="line-clamp-2 text-[13px] leading-normal text-muted">{g.description}</span>
                    <span className="text-[13px] font-bold text-navy-2">{t("signs.count", { count: g.signCount })}</span>
                  </span>
                </Link>
              ))}
        </div>
      )}
      {groups.isError && <p className="m-0 font-semibold text-bad-text">{t("signs.loadError")}</p>}
    </div>
  );
};
