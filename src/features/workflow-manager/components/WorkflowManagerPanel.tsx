import { CheckCircle2, Cpu, Layers3, Loader2, Lock, Sparkles, Workflow } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useWorkflowManagerStore } from "../store/useWorkflowManagerStore";
import type { WorkflowModelId } from "../types/workflow-manager.types";

export function WorkflowAutoLoader({ model }: { model: WorkflowModelId }) {
  const loadWorkflowForModel = useWorkflowManagerStore((state) => state.loadWorkflowForModel);
  const completeWorkflowLoad = useWorkflowManagerStore((state) => state.completeWorkflowLoad);

  useEffect(() => {
    loadWorkflowForModel(model);
    const timer = window.setTimeout(completeWorkflowLoad, 520);
    return () => window.clearTimeout(timer);
  }, [model, loadWorkflowForModel, completeWorkflowLoad]);

  return null;
}

export function WorkflowManagerPanel({ nsfw }: { nsfw?: boolean }) {
  const activeWorkflow = useWorkflowManagerStore((state) => state.activeWorkflow);
  const isLoading = useWorkflowManagerStore((state) => state.isLoading);
  const loadMessage = useWorkflowManagerStore((state) => state.loadMessage);
  const loadProgress = useWorkflowManagerStore((state) => state.loadProgress);

  const dnaSection = activeWorkflow.sections.find((section) => section.id === "character-dna-lock");

  return (
    <section
      className={cn(
        "mx-4 mt-3 overflow-hidden rounded-[26px] border px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_18px_70px_rgba(0,0,0,0.30)] backdrop-blur-2xl transition-all duration-500",
        nsfw
          ? "border-fuchsia-200/16 bg-[#12091F]/78 shadow-fuchsia-950/20"
          : "border-white/[0.12] bg-white/[0.045]"
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-full",
            nsfw ? "bg-fuchsia-300 text-[#16051D]" : "bg-cyan-100 text-black"
          )}
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Workflow className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-black text-white">{activeWorkflow.title}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em]", nsfw ? "bg-fuchsia-300/[0.12] text-fuchsia-50/70" : "bg-cyan-300/[0.10] text-cyan-50/70")}>
              {activeWorkflow.badge}
            </span>
          </div>
          <div className="mt-1 truncate text-xs font-semibold text-white/40">{loadMessage}</div>
        </div>
        <div className="hidden items-center gap-2 xl:flex">
          {[
            { icon: Cpu, label: activeWorkflow.vramProfile },
            { icon: Layers3, label: `${activeWorkflow.steps} steps / CFG ${activeWorkflow.cfg}` },
            { icon: Lock, label: dnaSection ? "DNA Lock ready" : "DNA optional" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex h-8 items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/24 px-3 text-[11px] font-black text-white/48">
              <Icon className="size-3.5" />
              {label}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/26 px-3 py-2 text-xs font-black text-white/54">
          {isLoading ? <Sparkles className="size-3.5 animate-pulse" /> : <CheckCircle2 className="size-3.5 text-cyan-100/70" />}
          {isLoading ? `${loadProgress}%` : "Ready"}
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all duration-500", nsfw ? "bg-gradient-to-r from-fuchsia-300 to-violet-300" : "bg-gradient-to-r from-cyan-200 to-violet-300")}
          style={{ width: `${isLoading ? loadProgress : 100}%` }}
        />
      </div>
    </section>
  );
}
