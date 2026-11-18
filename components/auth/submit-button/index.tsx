import { cn } from "@/lib/helpers";

// Forma tugmasi: yuborilayotganda bosilmaydi va matni almashadi
export const SubmitButton = ({
  pending,
  pendingText,
  children,
  className,
}: {
  pending: boolean;
  pendingText: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    type="submit"
    disabled={pending}
    className={cn(
      "btn-hover mt-1 h-12 rounded-xl bg-accent text-[15px] font-extrabold text-navy disabled:opacity-60",
      className,
    )}
  >
    {pending ? pendingText : children}
  </button>
);
