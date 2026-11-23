import Image from "next/image";
import { ImageIcon } from "@/components/ui/icons";

// Rasmlar backenddan keladi: domen next.config.ts images.remotePatterns ga qo'shilgach unoptimized olib tashlanadi
export const QuestionImage = ({ src, alt, noImage }: { src: string | null; alt: string; noImage: string }) => (
  <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-[20px] border border-line bg-img">
    {src ? (
      <Image src={src} alt={alt} fill unoptimized className="object-contain" />
    ) : (
      <span className="flex flex-col items-center gap-2 text-sm font-semibold text-muted">
        <ImageIcon size={40} className="text-subtle" />
        {noImage}
      </span>
    )}
  </div>
);
