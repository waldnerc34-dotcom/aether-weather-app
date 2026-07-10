import { cn } from "../utils/cn";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className, title, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[22px] border border-white/[0.12] bg-[rgba(20,28,42,0.42)] p-4 shadow-2xl shadow-black/30 backdrop-blur-[28px]",
        "ring-1 ring-inset ring-white/[0.06]",
        onClick && "cursor-pointer transition hover:bg-[rgba(28,36,52,0.5)]",
        className
      )}
    >
      {title && (
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
