import {
  AlertTriangle,
  CheckCircle2,
  Clapperboard,
  Film,
  Play,
  RefreshCcw,
  Scissors,
  Send,
  ShieldAlert,
  Sparkles,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAxsStore } from "@/store/useAxsStore";
import { cn } from "@/lib/utils";
import { useUniverseForgeStore } from "../store/useUniverseForgeStore";
import { UniverseHandoffActions } from "./UniverseHandoffActions";

const STATUS_STYLES = {
  ok: "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100/72",
  watch: "border-amber-300/20 bg-amber-300/[0.07] text-amber-100/72",
  break: "border-rose-300/20 bg-rose-300/[0.07] text-rose-100/72",
};

const SHOT_STATUS_STYLES = {
  queued: "border-white/[0.08] text-white/42",
  ready: "border-cyan-200/20 bg-cyan-300/[0.06] text-cyan-50/78",
  rendering: "border-violet-200/20 bg-violet-300/[0.08] text-violet-50/78",
  regenerating: "border-amber-200/20 bg-amber-300/[0.08] text-amber-50/78",
  complete: "border-emerald-200/20 bg-emerald-300/[0.08] text-emerald-50/78",
};

export function SeriesGenerator({
  compact,
  isNsfw,
  continuityScore,
  onToggleNsfw,
}: {
  compact?: boolean;
  isNsfw?: boolean;
  continuityScore?: number;
  onToggleNsfw?: () => void;
}) {
  const storyBeats = useUniverseForgeStore((state) => state.storyBeats);
  const seriesShots = useUniverseForgeStore((state) => state.seriesShots);
  const continuityChecks = useUniverseForgeStore((state) => state.continuityChecks);
  const generationStatus = useUniverseForgeStore((state) => state.generationStatus);
  const generationProgress = useUniverseForgeStore((state) => state.generationProgress);
  const directorCutStatus = useUniverseForgeStore((state) => state.directorCutStatus);
  const activeWorkflowMode = useUniverseForgeStore((state) => state.activeWorkflowMode);
  const workflowProfile = useUniverseForgeStore((state) => state.workflowProfile);
  const generateSeries = useUniverseForgeStore((state) => state.generateSeries);
  const regenerateShot = useUniverseForgeStore((state) => state.regenerateShot);
  const assembleDirectorsCut = useUniverseForgeStore((state) => state.assembleDirectorsCut);
  const runContinuityAudit = useUniverseForgeStore((state) => state.runContinuityAudit);
  const setWorkflowMode = useUniverseForgeStore((state) => state.setWorkflowMode);
  const setActiveTab = useAxsStore((state) => state.setActiveTab);
  const readyShots = seriesShots.filter((shot) => shot.status === "ready" || shot.status === "complete").length;
  const selectedArc = `${storyBeats.length}-episode arc`;
  const heroShot = seriesShots.find((shot) => shot.status === "ready" || shot.status === "complete") ?? seriesShots[0];
  const suggestedMoves = [
    "35mm slow push through emotional reveal",
    "85mm controlled close-up for DNA lock",
    "Match cut on wardrobe state change",
  ];

  return (
    <section className={cn("axs-universe-lower axs-director-studio relative overflow-hidden rounded-[16px] border border-[rgba(212,160,23,0.24)] bg-[rgba(15,15,26,0.68)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_34px_120px_rgba(0,0,0,0.46),0_0_70px_rgba(124,58,237,0.06)] backdrop-blur-3xl before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[rgba(212,160,23,0.64)] before:to-transparent", compact && "p-4")}>
      <div className="pointer-events-none absolute -right-20 top-10 size-64 rounded-full bg-violet-400/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-20 size-72 rounded-full bg-cyan-300/[0.055] blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-violet-100/50">
            <Clapperboard className="size-4" />
            One-Click Series Generator / LTX 2.3
          </div>
          <h2 className={cn("mt-2 font-black tracking-tight text-white", compact ? "text-2xl" : "text-3xl")}>Director's Cut Studio</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            Select the active Story Arc, generate coherent LTX 2.3 clips with locked Character DNA, then stitch the final cinematic sequence.
          </p>
        </div>
        <div className={cn("flex flex-wrap items-center gap-2", compact && "w-full")}>
          <Button
            type="button"
            onClick={generateSeries}
            className="h-11 rounded-full bg-cyan-100 px-6 text-sm font-black text-black shadow-[0_0_42px_rgba(0,212,255,0.24)] hover:bg-white"
          >
            <Play className="size-4" />
            Generate Full Series
          </Button>
          <Button
            type="button"
            onClick={assembleDirectorsCut}
            className="h-11 rounded-full bg-gradient-to-r from-violet-200 to-fuchsia-300 px-6 text-sm font-black text-black shadow-[0_0_52px_rgba(168,85,247,0.40)] hover:brightness-110"
          >
            <Scissors className="size-4" />
            Stitch Director's Cut
          </Button>
        </div>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-[14px] border border-[rgba(212,160,23,0.16)] bg-black/34 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] border border-white/[0.10] bg-[radial-gradient(circle_at_50%_42%,rgba(0,212,255,0.24),transparent_28%),radial-gradient(circle_at_80%_78%,rgba(168,85,247,0.22),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.9),rgba(5,5,10,0.98)_52%,rgba(168,85,247,0.24))]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-[78%] rounded-full border border-white/12 bg-white/[0.07] px-4 py-2 text-center text-xs font-black leading-5 text-white/62 backdrop-blur-xl">
              {heroShot ? heroShot.title : "Live Director Preview"}
            </div>
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/38 px-3 py-1 text-[11px] font-black text-cyan-50/68 backdrop-blur-xl">
            <Video className="size-3.5" />
            Live continuity preview
          </div>
        </div>
      </div>

      <div className={cn("relative mt-5 grid gap-4", compact ? "grid-cols-1" : "xl:grid-cols-[1fr_1fr_1fr]")}>
        <div className="rounded-[14px] border border-[rgba(212,160,23,0.16)] bg-black/28 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/36">
            <Film className="size-3.5" />
            LTX 2.3 Workflow
          </div>
          <div className="mt-3 text-2xl font-black text-white">LTX Video 2.3</div>
          <div className="mt-1 text-sm font-semibold text-white/42">
            {selectedArc} / {workflowProfile.resolution} / {workflowProfile.fps}fps
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["universe-series", "single-i2v", "flux-hybrid"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setWorkflowMode(mode)}
                className={cn(
                  "rounded-full border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] transition",
                  activeWorkflowMode === mode
                    ? "border-cyan-200/35 bg-cyan-300/[0.14] text-cyan-50"
                    : "border-white/[0.08] bg-white/[0.03] text-white/34 hover:text-white"
                )}
              >
                {mode === "universe-series" ? "Season" : mode === "single-i2v" ? "Fast" : "Hybrid"}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[14px] border border-[rgba(212,160,23,0.16)] bg-black/28 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/36">
            <Sparkles className="size-3.5" />
            Continuity Score
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="text-4xl font-black text-white">{continuityScore ?? generationProgress}%</div>
            <div className="text-xs font-black text-cyan-100/58">{readyShots}/{seriesShots.length} ready</div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-300 transition-all duration-700" style={{ width: `${generationProgress}%` }} />
          </div>
          <div className="mt-2 text-xs font-bold leading-5 text-white/42">{generationStatus}</div>
        </div>

        <div className="rounded-[14px] border border-[rgba(212,160,23,0.16)] bg-black/28 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/36">
            <Scissors className="size-3.5" />
            Final Assembly
          </div>
          <div className="mt-3 text-2xl font-black capitalize text-white">{directorCutStatus}</div>
          <div className="mt-1 text-sm font-semibold text-white/42">
            Smooth transitions, pacing, and continuity locks
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <div className="text-[9px] font-black uppercase tracking-[0.14em] text-white/28">FaceLock</div>
              <div className="mt-1 text-sm font-black text-white/76">{workflowProfile.faceLockStrength.toFixed(2)}</div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <div className="text-[9px] font-black uppercase tracking-[0.14em] text-white/28">IP Adapter</div>
              <div className="mt-1 text-sm font-black text-white/76">{workflowProfile.ipAdapterStrength.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-5 rounded-[14px] border border-[rgba(212,160,23,0.16)] bg-black/28 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/36">Suggested Camera Moves</div>
          <span className="rounded-full border border-cyan-200/16 bg-cyan-300/[0.07] px-2.5 py-1 text-[10px] font-black text-cyan-50/64">
            AI Director
          </span>
        </div>
        <div className="space-y-2">
          {suggestedMoves.map((move) => (
            <div key={move} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs font-bold leading-5 text-white/54">
              {move}
            </div>
          ))}
        </div>
        {onToggleNsfw && (
          <button
            type="button"
            onClick={onToggleNsfw}
            className={cn(
              "mt-4 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition",
              isNsfw
                ? "border-fuchsia-200/30 bg-fuchsia-300/[0.12] text-fuchsia-50 shadow-[0_0_34px_rgba(192,38,211,0.16)]"
                : "border-white/12 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
            )}
          >
            <ShieldAlert className="size-4" />
            {isNsfw ? "NSFW Director's Cut Enabled" : "Enable NSFW Director's Cut"}
          </button>
        )}
        <div className="mt-4">
          <UniverseHandoffActions className="justify-center" />
        </div>
      </div>

      <div className={cn("relative mt-5 grid gap-3", compact ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-4")}>
        {continuityChecks.map((check) => (
          <button
            key={check.id}
            type="button"
            onClick={runContinuityAudit}
            className={cn("rounded-2xl border p-4 text-left transition hover:-translate-y-0.5", STATUS_STYLES[check.status])}
          >
            <div className="flex items-center gap-2 text-sm font-black">
              {check.status === "ok" ? <CheckCircle2 className="size-4" /> : check.status === "watch" ? <AlertTriangle className="size-4" /> : <ShieldAlert className="size-4" />}
              {check.label}
            </div>
            <p className="mt-2 text-xs leading-5 opacity-80">{check.detail}</p>
          </button>
        ))}
      </div>

      <div className={cn("relative mt-5 space-y-2 overflow-y-auto pr-1", compact ? "max-h-[420px]" : "max-h-[520px]")}>
        {seriesShots.length === 0 && (
          <div className="rounded-[26px] border border-white/[0.10] bg-black/24 p-8 text-center">
            <Film className="mx-auto size-8 text-violet-100/50" />
            <h3 className="mt-3 text-xl font-black text-white">No shots queued yet</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/44">
              Generate a Story Arc first, then One-Click Series will create coherent shots with DNA, wardrobe, emotion, and transition continuity.
            </p>
          </div>
        )}
        {seriesShots.map((shot, index) => (
          <div
            key={shot.id}
            className="grid gap-3 rounded-[24px] border border-white/[0.08] bg-black/22 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:grid-cols-[44px_minmax(0,1fr)_auto]"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-white/[0.06] text-xs font-black text-white/62">
              {index + 1}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-white">{shot.title}</div>
              <div className="mt-1 truncate text-xs text-white/38">{shot.camera} / {shot.transition}</div>
              <div className="mt-1 truncate text-xs text-cyan-50/38">{shot.continuityLock}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full border px-3 py-1 text-xs font-black capitalize", SHOT_STATUS_STYLES[shot.status])}>
                {shot.status}
              </span>
              <button
                type="button"
                onClick={() => regenerateShot(shot.id)}
                className="flex items-center gap-1 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-xs font-black text-white/54 transition hover:bg-white hover:text-black"
              >
                <RefreshCcw className="size-3.5" />
                Regenerate
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        onClick={() => setActiveTab("scene")}
        variant="outline"
        className="relative mt-5 w-full rounded-full border-cyan-200/18 bg-cyan-300/[0.06] text-cyan-50/82 hover:bg-cyan-300/[0.12]"
      >
        <Send className="size-4" />
        Send Next Ready Shot To Scene Builder
      </Button>
    </section>
  );
}
