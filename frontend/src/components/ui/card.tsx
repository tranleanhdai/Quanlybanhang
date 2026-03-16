// frontend/src/components/ui/card.tsx
import React from "react";
import { cn } from "../../lib/utils"; // nếu chưa có, đổi sang className join thủ công

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/5 shadow-sm",
        className
      )}
      {...rest}
    />
  );
}

export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div className={cn("px-6 pt-6 pb-2", className)} {...rest} />
  );
}

export function CardTitle(
  props: React.HTMLAttributes<HTMLHeadingElement>
) {
  const { className, ...rest } = props;
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...rest}
    />
  );
}

export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div className={cn("px-6 pb-6 pt-2", className)} {...rest} />
  );
}
