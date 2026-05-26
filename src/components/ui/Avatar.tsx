import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <div className={cn("rounded-full overflow-hidden flex-shrink-0", sizes[size], className)}>
        <Image src={src} alt={name} width={48} height={48} className="object-cover w-full h-full" />
      </div>
    );
  }

  return (
    <div className={cn("rounded-full bg-accent flex items-center justify-center flex-shrink-0 font-medium text-white", sizes[size], className)}>
      {initials}
    </div>
  );
}
