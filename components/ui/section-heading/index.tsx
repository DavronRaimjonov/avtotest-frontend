import { cn } from "@/lib/helpers";

type Props = {
  eyebrow?: string;
  title: string;
  className?: string;
  children?: React.ReactNode;
};

// Bo'lim sarlavhasi: kichik ko'k yozuv + katta sarlavha. children — o'ng tomondagi tugma
export const SectionHeading = ({ eyebrow, title, className, children }: Props) => (
  <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
    <div className="flex flex-col gap-3">
      {eyebrow && (
        <span className="text-[13px] font-extrabold tracking-[0.08em] text-navy-2">{eyebrow}</span>
      )}
      <h2 className="m-0 max-w-180 text-[32px] font-extrabold tracking-tight sm:text-[40px]">
        {title}
      </h2>
    </div>
    {children}
  </div>
);
