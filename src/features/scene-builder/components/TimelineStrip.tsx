import { Folder, Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSceneBuilderStore } from "../store/useSceneBuilderStore";

export function TimelineStrip() {
  const studioMode = useSceneBuilderStore((state) => state.studioMode);
  const runGeneration = useSceneBuilderStore((state) => state.runGeneration);
  const setActiveQuickTool = useSceneBuilderStore((state) => state.setActiveQuickTool);
  const nsfw = studioMode === "nsfw";

  return (
    <footer className={cn("shrink-0 px-10 pb-7 transition-colors duration-500 2xl:px-16", nsfw ? "bg-[#0A0718]/30" : "bg-[#111112]")}>
      <div className={cn("relative mx-auto flex max-w-[1240px] items-center gap-4 overflow-hidden rounded-[28px] border px-5 py-4 shadow-[0_22px_80px_rgba(0,0,0,0.30)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/42 before:to-transparent after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(255,255,255,0.09),transparent_28%)]", nsfw ? "border-fuchsia-200/18 bg-[#10091F]/74" : "border-white/[0.18] bg-[#111112]/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_22px_80px_rgba(0,0,0,0.30)]")}>
        <button
          type="button"
          onClick={() => runGeneration("video")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/38 transition hover:bg-white/[0.06] hover:text-white"
          aria-label="Play timeline"
        >
          <Play className="size-4 fill-current" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-white/56">
              <Folder className="size-3.5 text-white/50" />
              <span className="truncate">Untitled folder</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveQuickTool("shot-type")}
              className="rounded-full border-white/12 bg-white/[0.03] text-white/72 hover:bg-white/[0.07]"
            >
              <Plus className="size-3.5" />
              New Folder
            </Button>
          </div>

          <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveQuickTool("angle")}
              className="h-20 w-36 shrink-0 rounded-xl border border-white/80 bg-[#0D0D0E] px-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-cyan-200"
            >
              <span className="block text-xs font-black text-white">Shot 1</span>
              <span className="mt-1 block text-[11px] font-semibold text-white/35">Start frame</span>
            </button>
            <button
              type="button"
              onClick={() => runGeneration("image")}
              className="flex h-20 w-36 shrink-0 flex-col items-center justify-center rounded-xl border border-white/14 bg-white/[0.025] text-white/68 transition hover:border-white/28 hover:bg-white/[0.045]"
            >
              <Plus className="mb-2 size-4" />
              <span className="text-xs font-black">New Shot</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
