"use client";

import Image from "next/image";
import type { Sign } from "@/@types";
import { Link } from "@/components/ui/link";
import { ROUTES } from "@/lib/routes";

// Belgi kartochkasi: SVG rasm, raqam va nom. group — manzil uchun kategoriya slug'i
export const SignCard = ({ sign, group }: { sign: Sign; group: string }) => (
  <Link
    href={ROUTES.sign(group, sign.slug)}
    className="lift flex flex-col gap-3 rounded-[20px] border border-line bg-white p-4 text-ink no-underline"
  >
    <span className="relative flex aspect-square items-center justify-center rounded-2xl bg-bg p-4">
      <Image src={sign.imageUrl} alt={sign.name} fill unoptimized className="object-contain p-4" />
    </span>
    <span className="flex flex-col gap-1">
      <span className="text-[13px] font-extrabold text-navy-2">{sign.code}</span>
      <b className="text-[15px] leading-snug">{sign.name}</b>
    </span>
  </Link>
);

export const SignCardSkeleton = () => <span className="h-[230px] animate-pulse rounded-[20px] bg-soft" />;
