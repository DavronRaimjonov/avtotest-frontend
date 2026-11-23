"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { Link } from "@/components/ui/link";
import { useSignQuery } from "@/hooks/useQuery";
import { ROUTES } from "@/lib/routes";

// Bitta belgi: katta rasm, raqam, nom, izoh va kategoriyadagi oldingi / keyingi belgi
export const SignView = () => {
  const { t } = useTranslation();
  const { group, sign } = useParams<{ group: string; sign: string }>();
  const { data, isPending, isError } = useSignQuery(sign);

  return (
    <div className="mx-auto flex max-w-260 flex-col gap-6 px-6 pt-10 pb-20">
      <Link
        href={ROUTES.signGroup(group)}
        className="flex items-center gap-1.5 self-start text-sm font-bold text-navy-2 no-underline"
      >
        <ChevronLeftIcon size={16} />
        {data?.group.name ?? t("signs.allGroups")}
      </Link>

      {isError ? (
        <p className="m-0 font-semibold text-bad-text">{t("signs.notFound")}</p>
      ) : isPending ? (
        <span className="h-90 animate-pulse rounded-[28px] bg-soft" />
      ) : (
        <>
          <section className="flex flex-wrap items-center gap-8 rounded-[28px] border border-line bg-white p-6 sm:p-9">
            <span className="relative aspect-square w-full max-w-70 flex-none rounded-3xl bg-bg">
              <Image src={data.imageUrl} alt={data.name} fill unoptimized priority className="object-contain p-8" />
            </span>
            <div className="flex flex-[1_1_320px] flex-col gap-3">
              <span className="self-start rounded-lg bg-tint-blue px-2.5 py-1 text-sm font-extrabold text-navy-2">
                {data.code}
              </span>
              <h1 className="m-0 text-[32px] leading-tight font-extrabold tracking-tight">{data.name}</h1>
              <p className="m-0 text-[17px] leading-relaxed text-slate">{data.description}</p>
            </div>
          </section>
          <nav className="flex justify-between gap-3" aria-label={t("signs.title")}>
            {data.prev ? (
              <Link
                href={ROUTES.sign(group, data.prev.slug)}
                className="flex h-12 items-center gap-2 rounded-xl border-[1.5px] border-line bg-white px-4 font-bold text-ink no-underline"
              >
                <ChevronLeftIcon size={18} />
                {data.prev.code}
              </Link>
            ) : (
              <span />
            )}
            {data.next && (
              <Link
                href={ROUTES.sign(group, data.next.slug)}
                className="flex h-12 items-center gap-2 rounded-xl bg-accent px-4 font-extrabold text-navy no-underline"
              >
                {data.next.code}
                <ChevronRightIcon size={18} />
              </Link>
            )}
          </nav>
        </>
      )}
    </div>
  );
};
