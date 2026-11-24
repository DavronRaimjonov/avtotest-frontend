"use client";

import { useTranslation } from "react-i18next";
import type { MnemonicFields, Topic } from "@/@types";
import { BulbIcon, LockIcon } from "@/components/ui/icons";
import { useTopicMnemonicsQuery } from "@/hooks/useQuery";
import { cn } from "@/lib/helpers";
import { useAuthStore } from "@/store/auth.store";
import { usePaywallStore } from "@/store/paywall.store";

// Izoh tagidagi "Eslab qolish uchun" (2.6.3). mnemonic bor — ochiq blok; mnemonicLocked — xira blok +
// "Max bilan ochish" (paywall mnemonics); ikkalasi ham yo'q — hech narsa chiqmaydi
export const MnemonicBlock = ({ mnemonic, mnemonicLocked, className }: MnemonicFields & { className?: string }) => {
  const { t } = useTranslation();
  const openPaywall = usePaywallStore((s) => s.openPaywall);
  if (!mnemonic && !mnemonicLocked) return null;

  return (
    <div className={cn("flex flex-col gap-1.5 rounded-xl border border-tint-yellow bg-[#FFFBEB] px-4 py-3 text-sm", className)}>
      <span className="flex items-center gap-2">
        <BulbIcon size={16} className="flex-none text-tint-yellow-fg" />
        <b className="text-ink">{t("mnemonic.title")}</b>
        {!mnemonic && <MaxBadge />}
      </span>
      {mnemonic ? (
        <p className="m-0 leading-relaxed text-slate">{mnemonic}</p>
      ) : (
        <div className="flex flex-col items-start gap-2.5">
          {/* Haqiqiy matn kelmaydi — xira "skelet" chiziqlar */}
          <span className="flex w-full flex-col gap-1.5 blur-[1.5px]" aria-hidden="true">
            <span className="h-2.5 w-11/12 rounded-full bg-tint-yellow-fg/20" />
            <span className="h-2.5 w-3/4 rounded-full bg-tint-yellow-fg/20" />
          </span>
          <button
            type="button"
            onClick={() => openPaywall("mnemonics")}
            className="rounded-lg bg-white px-3 py-1.5 text-[13px] font-bold text-navy-2 shadow-sm hover:bg-bg"
          >
            {t("mnemonic.unlock")} →
          </button>
        </div>
      )}
    </div>
  );
};

const MaxBadge = () => (
  <span className="ml-auto flex items-center gap-1 text-xs font-bold text-tint-yellow-fg">
    <LockIcon size={12} strokeWidth={2.6} />
    Max
  </span>
);

// Mavzu sahifasidagi kartochkalar: GET /me/topics/:id/mnemonics. Max yo'q (locked) — count ta xira kartochka va
// paywall. Mehmonga so'rov yuborilmaydi — Topic.mnemonicCount bilan qulf karta, tugma kirish oynasini ochadi
export const TopicMnemonics = ({ topic }: { topic: Topic }) => {
  const { t } = useTranslation();
  const hasSession = useAuthStore((s) => s.hasSession);
  const openLogin = useAuthStore((s) => s.openLogin);
  const openPaywall = usePaywallStore((s) => s.openPaywall);
  const hasAny = (topic.mnemonicCount ?? 0) > 0;
  const { data, isPending } = useTopicMnemonicsQuery(topic.id, hasAny);

  if (!hasAny || (hasSession && isPending)) return null;
  const count = data?.count ?? topic.mnemonicCount ?? 0;
  const items = data && !data.locked ? data.items : [];
  if (!count) return null;

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-tint-yellow text-tint-yellow-fg">
          <BulbIcon size={20} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <b className="text-lg leading-tight">{t("mnemonic.title")}</b>
          <span className="text-[13px] text-muted">{t("mnemonic.topicCount", { n: count })}</span>
        </div>
        {!items.length && <MaxBadge />}
      </div>

      {items.length > 0 ? (
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {items.map((text, i) => (
            <li key={i} className="flex gap-3 rounded-2xl bg-[#FFFBEB] px-4 py-3 text-[15px] leading-relaxed text-slate">
              <b className="text-tint-yellow-fg">{i + 1}</b>
              {text}
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <ul className="m-0 flex w-full list-none flex-col gap-2 p-0" aria-hidden="true">
            {Array.from({ length: Math.min(count, 4) }, (_, i) => (
              <li key={i} className="flex flex-col gap-1.5 rounded-2xl bg-bg px-4 py-3.5 blur-[1.5px]">
                <span className="h-2.5 w-11/12 rounded-full bg-soft" />
                <span className="h-2.5 w-2/3 rounded-full bg-soft" />
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => (hasSession ? openPaywall("mnemonics") : openLogin())}
            className="btn-hover h-11 rounded-xl bg-accent px-5 text-sm font-extrabold text-navy"
          >
            {hasSession ? t("mnemonic.unlock") : t("common.login")}
          </button>
        </div>
      )}
    </section>
  );
};
