import { Link } from "@/components/ui/link";
import { WheelIcon } from "@/components/ui/icons";
import { ROUTES } from "@/lib/routes";

export const Logo = () => (
  <Link href={ROUTES.home} className="flex items-center gap-2.5 text-white no-underline">
    <span className="flex size-[38px] items-center justify-center rounded-[10px] bg-accent text-navy">
      <WheelIcon size={22} />
    </span>
    <span className="text-xl font-extrabold tracking-tight">
      Avto<span className="text-accent">Test</span>
    </span>
  </Link>
);
