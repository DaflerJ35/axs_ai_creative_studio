import type { AxsProofStatus } from "../../lib/proofLayer";
import { cn } from "../../lib/utils";

export function ProofBadge({
  label,
  score,
  status,
  detail,
  variant = "compact",
  className,
}: {
  label: string;
  score?: number;
  status: AxsProofStatus;
  detail?: string;
  variant?: "compact" | "full";
  className?: string;
}) {
  const full = variant === "full";

  return (
    <div
      className={cn(
        full
          ? "rounded-2xl border p-4 text-left"
          : "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em]",
        status === "ready" && "border-cyan-200/24 bg-cyan-200/[0.10] text-cyan-50 shadow-[0_0_24px_rgba(0,212,255,0.10)]",
        status === "watch" && "border-amber-200/24 bg-amber-300/[0.10] text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.10)]",
        status === "blocked" && "border-rose-200/24 bg-rose-300/[0.10] text-rose-50 shadow-[0_0_24px_rgba(244,63,94,0.10)]",
        className
      )}
      title={detail ?? `${label}${typeof score === "number" ? `: ${score}%` : ""}`}
    >
      <div className={cn("flex items-center gap-2", full && "justify-between")}>
        <span
          className={cn(
            "size-2 rounded-full",
            status === "ready" && "bg-cyan-200",
            status === "watch" && "bg-amber-200",
            status === "blocked" && "bg-rose-200"
          )}
        />
        <span className={cn(full && "text-[10px] font-black uppercase tracking-[0.16em]")}>{label}</span>
        {typeof score === "number" ? <span className="opacity-70">{score}%</span> : null}
      </div>
      {full && detail ? <p className="mt-2 text-xs font-semibold leading-5 text-white/48 normal-case tracking-normal">{detail}</p> : null}
    </div>
  );
}
