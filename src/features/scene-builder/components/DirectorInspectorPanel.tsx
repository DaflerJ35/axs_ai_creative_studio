import { Clapperboard, Film, Sparkles, WandSparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSceneBuilderStore } from "../store/useSceneBuilderStore";

export function DirectorInspectorPanel() {
  const studioMode = useSceneBuilderStore((state) => state.studioMode);
  const aiDirectorActive = useSceneBuilderStore((state) => state.aiDirectorActive);
  const directorsCutActive = useSceneBuilderStore((state) => state.directorsCutActive);
  const generationStatus = useSceneBuilderStore((state) => state.generationStatus);
  const generationProgress = useSceneBuilderStore((state) => state.generationProgress);
  const isGenerating = useSceneBuilderStore((state) => state.isGenerating);
  const canvasItems = useSceneBuilderStore((state) => state.canvasItems);
  const lighting = useSceneBuilderStore((state) => state.lighting);
  const camera = useSceneBuilderStore((state) => state.camera);
  const nsfw = studioMode === "nsfw";

  return (
    <aside
      className={cn(
        "hidden h-full border-l p-3 transition-colors duration-500 xl:block",
        nsfw ? "border-fuchsia-200/10 bg-[#0A0718]/80" : "border-white/[0.055] bg-[#101011]"
      )}
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[26px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/38 before:to-transparent after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_34%)]",
          nsfw
            ? "border-fuchsia-200/16 bg-[#10091F] shadow-[0_0_70px_rgba(192,38,211,0.12)]"
            : "border-white/[0.12] bg-[#111112]"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              nsfw ? "bg-fuchsia-300/12 text-fuchsia-100" : "bg-white/[0.06] text-white/72"
            )}
          >
            <WandSparkles className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">AI Director</h2>
            <p className={cn("mt-0.5 text-xs font-semibold", nsfw ? "text-fuchsia-50/38" : "text-white/34")}>
              {aiDirectorActive ? "Live cinematic intelligence" : "Standby"}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className={cn("rounded-2xl border p-4", nsfw ? "border-fuchsia-200/12 bg-fuchsia-300/[0.045]" : "border-white/[0.08] bg-white/[0.03]")}>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/42">
              <Sparkles className="size-3.5" />
              Director&apos;s Notes
            </div>
            <p className={cn("mt-3 text-sm leading-6", nsfw ? "text-fuchsia-50/62" : "text-white/58")}>
              {aiDirectorActive
                ? "Scene reads as a controlled premium frame. Use a slow push-in, keep the subject locked in DNA continuity, and let lighting carry emotion before cutting to motion."
                : "Activate AI Director for cinematic analysis, shot suggestions, pacing, lighting, emotional framing, and multi-shot sequence planning."}
            </p>
          </div>

          <div className={cn("rounded-2xl border p-4", nsfw ? "border-fuchsia-200/12 bg-[#0B0617]" : "border-white/[0.08] bg-white/[0.025]")}>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/42">
              <Film className="size-3.5" />
              Scene Analysis
            </div>
            <div className="mt-4 space-y-3 text-xs font-semibold">
              <div className="flex justify-between gap-3">
                <span className={nsfw ? "text-fuchsia-50/38" : "text-white/34"}>Layers</span>
                <span className="text-white/78">{canvasItems.length}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className={nsfw ? "text-fuchsia-50/38" : "text-white/34"}>Camera</span>
                <span className="text-white/78">{camera.type} / {camera.lens}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className={nsfw ? "text-fuchsia-50/38" : "text-white/34"}>Lighting</span>
                <span className="text-white/78 capitalize">{lighting.style}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className={nsfw ? "text-fuchsia-50/38" : "text-white/34"}>Status</span>
                <span className="max-w-36 truncate text-right text-white/78">{generationStatus}</span>
              </div>
              {isGenerating && (
                <div>
                  <div className="mb-2 flex justify-between text-white/50">
                    <span>Progress</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <div className={cn("h-1.5 overflow-hidden rounded-full", nsfw ? "bg-fuchsia-950/60" : "bg-white/10")}>
                    <div className={cn("h-full rounded-full transition-all duration-500", nsfw ? "bg-fuchsia-300" : "bg-cyan-200")} style={{ width: `${generationProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={cn("rounded-2xl border p-4", directorsCutActive ? "border-fuchsia-300/28 bg-fuchsia-300/[0.08]" : nsfw ? "border-fuchsia-200/12 bg-[#0B0617]" : "border-white/[0.08] bg-white/[0.025]")}>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/42">
              <Clapperboard className="size-3.5" />
              Director&apos;s Cut
            </div>
            <p className={cn("mt-3 text-sm leading-6", nsfw ? "text-fuchsia-50/58" : "text-white/52")}>
              {directorsCutActive
                ? "Ready to assemble clips into one cohesive cinematic sequence with smooth transitions and locked Character DNA."
                : "Use Director&apos;s Cut to stitch generated shots into a polished film sequence with pacing and continuity."}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
