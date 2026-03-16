import { cn } from "../../lib/utils"; 
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "destructive";
};

export function Button({
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
    outline:
      "border border-white/20 bg-transparent text-white hover:bg-white/10 focus:ring-emerald-400",
    ghost:
      "text-slate-300 hover:bg-white/10 focus:ring-emerald-400",
    destructive:
      "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-400",
  };
  return (
    <button
      className={cn(base, variants[variant], "px-4 py-2 text-sm", className)}
      {...props}
    />
  );
}
