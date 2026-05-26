import { cn } from "@/lib/utils";

const variants = {
  default:   "bg-brand-100 text-brand-700",
  success:   "bg-green-100 text-green-700",
  warning:   "bg-yellow-100 text-yellow-700",
  danger:    "bg-red-100 text-red-700",
  info:      "bg-blue-100 text-blue-700",
  accent:    "bg-accent/10 text-accent-dark",
};

interface BadgeProps {
  variant?: keyof typeof variants;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span className={cn("badge", variants[variant], className)}>
      {children}
    </span>
  );
}
