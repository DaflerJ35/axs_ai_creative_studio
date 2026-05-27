import { useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Flame,
  Globe2,
  HardDrive,
  Layers,
  Maximize2,
  Minimize2,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAxsStore } from "../../store/useAxsStore";
import type { ForgeTab } from "../../lib/types";

interface CopilotAction {
  id: string;
  label: string;
  tab: ForgeTab;
  urgency: "high" | "medium" | "low";
}

const nextActions: CopilotAction[] = [
  { id: "a1", label: "Generate campaign images", tab: "images", urgency: "high" },
  { id: "a2", label: "Write launch scripts", tab: "scripts", urgency: "high" },
  { id: "a3", label: "Review universe continuity", tab: "universe", urgency: "medium" },
  { id: "a4", label: "Build distribution pipeline", tab: "distribute", urgency: "medium" },
  { id: "a5", label: "Update character DNA", tab: "dna", urgency: "low" },
];

function UrgencyBadge({ level }: { level: CopilotAction["urgency"] }) {
  const map = {
    high: { bg: "bg-rose-500/12", text: "text-rose-300", dot: "bg-rose-400" },
    medium: { bg: "bg-amber-500/12", text: "text-amber-300", dot: "bg-amber-400" },
    low: { bg: "bg-white/5", text: "text-white/40", dot: "bg-white/30" },
  };
  const s = map[level];
  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${s.bg} ${s.text}`}>
      <span className={`h-1 w-1 rounded-full ${s.dot}`} />
      {level}
    </span>
  );
}

export function CommandDeckCopilotRail() {
  const { setActiveTab } = useAxsStore();
  const [minimized, setMinimized] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1 pb-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 border border-cyan-500/20">
            <BrainCircuit className="h-3.5 w-3.5 text-cyan-300" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">
            Co-Pilot
          </span>
        </div>
        <button
          onClick={() => setMinimized((v) => !v)}
          className="text-white/30 hover:text-white/70 transition-colors"
        >
          {minimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!minimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 overflow-y-auto min-h-0 space-y-5 pt-4"
          >
            {/* Next Best Actions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-3 w-3 text-amber-300/70" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
                  Next Best Actions
                </span>
              </div>
              <div className="space-y-2">
                {nextActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setActiveTab(action.tab)}
                    className="group w-full text-left rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-cyan-500/25 transition-all px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">
                        {action.label}
                      </span>
                      <ArrowRight className="h-3 w-3 text-white/20 group-hover:text-cyan-300/70 transition-colors mt-0.5 shrink-0" />
                    </div>
                    <div className="mt-1.5">
                      <UrgencyBadge level={action.urgency} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Memory */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-3 w-3 text-violet-300/70" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
                  Active Memory
                </span>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50">Universe</span>
                  <span className="text-[11px] font-medium text-white/80 truncate max-w-[140px]">
                    Cyberpunk 2077
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50">Characters</span>
                  <span className="text-[11px] font-medium text-white/80">6 Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50">Last Sync</span>
                  <span className="text-[11px] font-medium text-emerald-300/80">2m ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50">Continuity</span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-cyan-300/80">
                    <CheckCircle2 className="h-3 w-3" /> Locked
                  </span>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="h-3 w-3 text-emerald-300/70" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
                  System Health
                </span>
              </div>
              <div className="space-y-3">
                <HealthMeter icon={HardDrive} label="Memory Sync" value={92} color="violet" />
                <HealthMeter icon={Globe2} label="Launch Readiness" value={87} color="cyan" />
                <HealthMeter icon={Flame} label="GPU Utilization" value={64} color="amber" />
              </div>
            </div>

            {/* Footer status */}
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <div className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                AXS Core v2.1
              </div>
              <div className="mt-1 text-[9px] text-white/25">All systems nominal</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HealthMeter({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Cpu;
  label: string;
  value: number;
  color: "cyan" | "violet" | "amber" | "emerald";
}) {
  const colorMap = {
    cyan: { bar: "bg-cyan-400", glow: "shadow-[0_0_8px_rgba(34,211,238,0.35)]", text: "text-cyan-300" },
    violet: { bar: "bg-violet-400", glow: "shadow-[0_0_8px_rgba(139,92,246,0.35)]", text: "text-violet-300" },
    amber: { bar: "bg-amber-400", glow: "shadow-[0_0_8px_rgba(251,191,36,0.35)]", text: "text-amber-300" },
    emerald: { bar: "bg-emerald-400", glow: "shadow-[0_0_8px_rgba(52,211,153,0.35)]", text: "text-emerald-300" },
  };
  const c = colorMap[color];
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className={`h-3 w-3 ${c.text}`} />
          <span className="text-[11px] text-white/50">{label}</span>
        </div>
        <span className={`text-[11px] font-bold ${c.text}`}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${c.bar} ${c.glow}`}
        />
      </div>
    </div>
  );
}
