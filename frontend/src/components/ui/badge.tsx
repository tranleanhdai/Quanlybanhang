import { cn } from "../../lib/utils"; 
import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "destructive";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  const variants = {
    default: "bg-emerald-500/20 text-emerald-300",
    secondary: "bg-white/10 text-white",
    destructive: "bg-rose-500/20 text-rose-300",
  };
  return <span className={cn(base, variants[variant], className)} {...props} />;
}
