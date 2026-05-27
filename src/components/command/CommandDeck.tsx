import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";

export function CommandDeckBackground() {
  return (
    <div className="axs-command-bg fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[var(--axs-base)]" />
      <div className="absolute inset-0 axs-command-circuit-depth opacity-40" />
      <div className="absolute inset-0 axs-command-circuit-board opacity-30" />
      <div className="absolute inset-0 axs-command-current-field opacity-20" />
      <div className="absolute inset-0 axs-command-depth-veil opacity-80" />
    </div>
  );
}

export function CommandPanel({
  children,
  className = "",
  active = false,
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div className={`axs-panel relative overflow-hidden ${active ? "axs-panel-active border-white/20" : "border-white/10"} ${className}`}>
      <div className="axs-panel-corners opacity-40" />
      {children}
    </div>
  );
}

export function CommandMetric({
  label,
  value,
  detail,
  delta,
  Icon,
  tone = "cyan",
  accent,
}: {
  label: string;
  value: string | number;
  detail?: string;
  delta?: string;
  Icon?: LucideIcon;
  tone?: "cyan" | "violet" | "gold" | "emerald";
  accent?: "cyan" | "violet" | "gold" | "emerald";
}) {
  const resolvedTone = accent ?? tone;
  const resolvedDetail = detail ?? delta;

  return (
    <div className="axs-command-stat min-w-[8.5rem] border-l border-white/5 px-6 py-2 first:border-l-0">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[9px] font-black uppercase tracking-[0.22em] text-white/30">{label}</div>
        {Icon ? <Icon className="h-3.5 w-3.5 text-white/40" /> : null}
      </div>
      <div className="mt-1 text-2xl font-bold text-white/90">{value}</div>
      {resolvedDetail ? (
        <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-white/40">
          <span className={`h-1 w-1 rounded-full ${toneDot(resolvedTone)}`} />
          {resolvedDetail}
        </div>
      ) : null}
    </div>
  );
}

export function CommandModuleCard({
  title,
  subtitle,
  eyebrow,
  Icon,
  active = false,
  complete = false,
  onClick,
  className = "",
}: {
  title: string;
  subtitle: string;
  eyebrow?: string;
  Icon: LucideIcon;
  active?: boolean;
  complete?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={`group block text-left ${className}`}>
      <CommandPanel active={active} className="axs-module-card h-full p-5 transition duration-300 group-hover:-translate-y-1 group-hover:border-white/20">
        <div className="relative z-10 flex h-full flex-col justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <Icon className="h-7 w-7 text-white/60" />
              {eyebrow ? <span className="text-[10px] font-black tracking-[0.12em] text-white/30">{eyebrow}</span> : null}
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white/90">{title}</h3>
            <p className="mt-1.5 text-xs leading-5 text-white/40">{subtitle}</p>
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <span className={`text-[10px] font-bold ${active ? "text-cyan-400/70" : "text-white/30"}`}>{active ? "Active" : "Open"}</span>
            <span className={`flex h-4 w-4 items-center justify-center rounded-full border text-[9px] ${complete ? "border-emerald-500/30 text-emerald-400/70" : "border-white/10 text-white/30"}`}>
              {complete ? "✓" : "›"}
            </span>
          </div>
        </div>
      </CommandPanel>
    </button>
  );
}

export function CommandSearch() {
  return (
    <div className="hidden min-w-0 max-w-[min(760px,50vw)] flex-1 items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-2xl md:flex">
      <Search className="h-4 w-4 text-white/40" />
      <span className="flex-1 min-w-0 text-sm text-white/20 truncate">Ask AXS or run a command...</span>
      <span className="shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-white/30">⌘K</span>
    </div>
  );
}

function toneDot(tone: "cyan" | "violet" | "gold" | "emerald") {
  if (tone === "violet") return "bg-violet-500/50";
  if (tone === "gold") return "bg-amber-500/50";
  if (tone === "emerald") return "bg-emerald-500/50";
  return "bg-cyan-500/50";
}
