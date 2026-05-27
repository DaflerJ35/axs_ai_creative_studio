import { X } from "lucide-react";
import { motion } from "motion/react";
import type { AxsProofSignal, AxsProofStatus } from "../../lib/proofLayer";

export interface ProofDetailsDrawerProps {
  signals: AxsProofSignal[];
  onClose: () => void;
  onAction: (signal: AxsProofSignal) => void;
}

export function ProofDetailsDrawer({ signals, onClose, onAction }: ProofDetailsDrawerProps) {
  const sortedSignals = [...signals].sort((a, b) => statusWeight(a.status) - statusWeight(b.status));

  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      role="dialog"
      aria-modal="false"
      aria-label="AXS proof report"
      className="fixed right-[300px] top-[88px] z-50 w-[430px] rounded-[34px] border border-white/[0.14] bg-[#070a11]/92 p-5 shadow-[0_34px_130px_rgba(0,0,0,0.60),0_0_80px_rgba(0,212,255,0.10),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-3xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-100/42">Proof Report</p>
          <h3 className="mt-1 text-xl font-black text-white">Why AXS trusts this project</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/42">Live deterministic checks for identity, continuity, workflow fit, voice memory, and launch readiness.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/52 transition hover:bg-white hover:text-black"
          aria-label="Close proof report"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-5 max-h-[70vh] space-y-3 overflow-y-auto pr-1">
        {sortedSignals.map((signal) => (
          <div key={signal.id} className={`rounded-[24px] border p-4 ${proofCardTone(signal.status)}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] opacity-70">{signal.category}</div>
                <div className="mt-1 text-sm font-black text-white">{signal.label}</div>
              </div>
              <div className="rounded-full border border-white/10 bg-black/28 px-3 py-1 text-xs font-black text-white/76">{signal.score}%</div>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/52">{signal.detail}</p>
            {signal.action ? (
              <button
                type="button"
                onClick={() => onAction(signal)}
                className="mt-3 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-black text-white/68 transition hover:bg-white hover:text-black"
              >
                {signal.action.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function statusWeight(status: AxsProofStatus) {
  return status === "blocked" ? 0 : status === "watch" ? 1 : 2;
}

function proofCardTone(status: AxsProofStatus) {
  if (status === "ready") {
    return "border-cyan-200/18 bg-cyan-200/[0.08] text-cyan-50";
  }
  if (status === "watch") {
    return "border-amber-200/18 bg-amber-300/[0.08] text-amber-50";
  }
  return "border-rose-200/18 bg-rose-300/[0.08] text-rose-50";
}
