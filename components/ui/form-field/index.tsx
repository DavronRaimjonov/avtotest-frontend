import { cn } from "@/lib/helpers";

type Props = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

// Yorliq + maydon + xato (yoki maslahat) matni
export const FormField = ({ label, htmlFor, error, hint, className, children }: Props) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <label htmlFor={htmlFor} className="text-[13px] font-bold text-slate">
      {label}
    </label>
    {children}
    {error ? (
      <span id={`${htmlFor}-error`} role="alert" className="text-[13px] font-semibold text-bad-text">
        {error}
      </span>
    ) : (
      hint && <span className="text-xs text-muted">{hint}</span>
    )}
  </div>
);
