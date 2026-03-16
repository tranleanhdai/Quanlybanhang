// frontend/src/components/ui/input.tsx
import * as React from "react";
import { cn } from "../../lib/utils"; // nếu chưa có, thay bằng join className như trên

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm",
          "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
