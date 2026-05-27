import {
  ArrowLeft,
  Bot,
  ChevronRight,
  Folder,
  ImageUp,
  Image as ImageIcon,
  Images,
  LayoutList,
  Lightbulb,
  ListOrdered,
  Map,
  SlidersHorizontal,
  Loader2,
  Upload,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { type ChangeEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ASSET_ITEMS, CHARACTER_ITEMS, ENVIRONMENT_ITEMS } from "../data/library-items";
import { useSceneBuilderStore } from "../store/useSceneBuilderStore";
import type { AdvancedSceneSettings } from "../types/scene-builder.types";

const railItems = [
  { id: "video", label: "Video", icon: Video },
  { id: "characters", label: "Characters", icon: UserRound },
  { id: "locations", label: "Locations", icon: Images },
  { id: "assets", label: "Assets", icon: Map },
] as const;

const promptActions = [
  { id: "image-count", label: "Add frame", icon: ImageIcon },
  { id: "shot-type", label: "Add character", icon: UserRound },
  { id: "lighting", label: "Add location", icon: Map },
] as const;

const bottomChips = [
  { id: "angle", label: "Angle", icon: ImageIcon },
  { id: "shot-type", label: "Shot Type", icon: Bot },
  { id: "lighting", label: "Lighting", icon: Lightbulb },
  { id: "image-count", label: "1 image", icon: Images },
] as const;

const MODEL_LABELS: Record<AdvancedSceneSettings["model"], string> = {
  "ltx-video-2.3": "LTX Video 2.3",
  "ltx-video-1.1": "LTX Video 1.1",
  "flux-2-flash": "Flux 2.0 Flash",
  "gpt-image-2": "GPT Image 2",
  "nano-banana-2": "Nano Banana 2",
  "nano-banana-pro": "Nano Banana Pro",
  "flux1-dev-fp8": "Flux 1 Dev FP8",
  "flux1-schnell-fp8": "Flux 1 Schnell FP8",
  "biglove-pony2": "bigLove Pony 2",
  "dreamshaper-xl": "DreamShaper XL",
  "sdxl-pony": "SDXL Pony",
  "realvis-xl": "RealVis XL",
  "juggernaut-xl": "Juggernaut XL",
  "custom-realistic": "Custom Realistic",
};

export function StudioControlPanel() {
  const [mentionOpen, setMentionOpen] = useState(false);
  const studioMode = useSceneBuilderStore((state) => state.studioMode);
  const aiDirectorActive = useSceneBuilderStore((state) => state.aiDirectorActive);
  const activeRailTool = useSceneBuilderStore((state) => state.activeRailTool);
  const activePanelMode = useSceneBuilderStore((state) => state.activePanelMode);
  const activeQuickTool = useSceneBuilderStore((state) => state.activeQuickTool);
  const generationStatus = useSceneBuilderStore((state) => state.generationStatus);
  const generationProgress = useSceneBuilderStore((state) => state.generationProgress);
  const isGenerating = useSceneBuilderStore((state) => state.isGenerating);
  const scenePrompt = useSceneBuilderStore((state) => state.scenePrompt);
  const referenceImages = useSceneBuilderStore((state) => state.referenceImages);
  const camera = useSceneBuilderStore((state) => state.camera);
  const advanced = useSceneBuilderStore((state) => state.advanced);
  const setActiveRailTool = useSceneBuilderStore((state) => state.setActiveRailTool);
  const setActivePanelMode = useSceneBuilderStore((state) => state.setActivePanelMode);
  const setActiveQuickTool = useSceneBuilderStore((state) => state.setActiveQuickTool);
  const runGeneration = useSceneBuilderStore((state) => state.runGeneration);
  const advanceGeneration = useSceneBuilderStore((state) => state.advanceGeneration);
  const completeGeneration = useSceneBuilderStore((state) => state.completeGeneration);
  const setScenePrompt = useSceneBuilderStore((state) => state.setScenePrompt);
  const insertPromptMention = useSceneBuilderStore((state) => state.insertPromptMention);
  const removeReferenceImage = useSceneBuilderStore((state) => state.removeReferenceImage);
  const openUploadModal = useSceneBuilderStore((state) => state.openUploadModal);
  const nsfw = studioMode === "nsfw";
  const mentions = useMemo(
    () => [...CHARACTER_ITEMS, ...ENVIRONMENT_ITEMS, ...ASSET_ITEMS].map((item) => item.name),
    []
  );
  const compactSelections = [
    MODEL_LABELS[advanced.model],
    advanced.resolution,
    advanced.aspectRatio,
    camera.type.replace("-", " "),
    camera.lens,
  ];
  const promptPlaceholder =
    activePanelMode === "framing"
      ? "Describe your frame's composition and mood. Type @ to add characters, locations, or assets."
      : "Describe motion, pacing, sensual framing, camera movement, and shot-to-shot direction.";

  const handlePromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextPrompt = event.target.value;
    setScenePrompt(nextPrompt);
    setMentionOpen(nextPrompt.includes("@") && /@\w*$/.test(nextPrompt));
  };

  const handleMentionSelect = (mention: string) => {
    insertPromptMention(mention);
    setMentionOpen(false);
  };

  const handleGenerate = () => {
    runGeneration(activePanelMode === "directing" ? "video" : "image");
    window.setTimeout(advanceGeneration, 250);
    window.setTimeout(advanceGeneration, 650);
    window.setTimeout(advanceGeneration, 1050);
    window.setTimeout(advanceGeneration, 1450);
    window.setTimeout(completeGeneration, 1900);
  };

  return (
    <aside className={cn("relative z-10 hidden h-full transition-colors duration-500 lg:grid lg:grid-cols-[58px_minmax(0,1fr)]", nsfw ? "bg-[#0A0718]" : "bg-[#111112]")}>
      <nav className={cn("flex h-full flex-col items-center border-r py-7 transition-colors duration-500", nsfw ? "border-fuchsia-200/10 bg-[#0B0617]/70" : "border-white/[0.055] bg-[#101011]/80")}>
        <div className="space-y-9">
          {railItems.map(({ id, label, icon: Icon }) => {
            const active = activeRailTool === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveRailTool(id)}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full transition hover:text-white",
                  nsfw ? "text-fuchsia-50/42 hover:bg-fuchsia-300/[0.08]" : "text-white/42 hover:bg-white/[0.055]",
                  active && (nsfw ? "bg-fuchsia-300/[0.14] text-fuchsia-100 shadow-[0_0_22px_rgba(192,38,211,0.18)]" : "bg-white/[0.08] text-white")
                )}
                aria-label={label}
              >
                <Icon className="size-5" strokeWidth={1.65} />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className={cn("mt-auto flex size-10 items-center justify-center rounded-full border transition hover:text-white", nsfw ? "border-fuchsia-200/14 bg-fuchsia-300/[0.055] text-fuchsia-50/58 hover:bg-fuchsia-300/[0.10]" : "border-white/[0.12] bg-white/[0.035] text-white/58 hover:bg-white/[0.07]")}
          aria-label="Open folder"
        >
          <Folder className="size-4" />
        </button>
      </nav>

      <div className="flex h-full items-center justify-center px-4 py-4">
        <section
          className={cn(
            "relative flex h-full w-full max-w-full flex-col overflow-hidden rounded-2xl border backdrop-blur-2xl transition-all duration-500 before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent",
            nsfw
              ? "border-fuchsia-200/18 bg-[#10091F]/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_40px_rgba(192,38,211,0.12),0_16px_48px_rgba(0,0,0,0.45)]"
              : "border-white/[0.12] bg-[#101011]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_16px_48px_rgba(0,0,0,0.40)]"
          )}
        >
          <header className={cn("flex h-16 shrink-0 items-center justify-between border-b px-5", nsfw ? "border-fuchsia-200/12" : "border-white/[0.10]")}>
            <Button type="button" variant="ghost" size="icon-sm" className={cn("rounded-full hover:text-white", nsfw ? "text-fuchsia-50/80 hover:bg-fuchsia-300/[0.08]" : "text-white/80 hover:bg-white/[0.06]")} aria-label="Back">
              <ArrowLeft className="size-4" />
            </Button>
            <div className={cn("flex min-w-0 items-center gap-2 text-xs font-black", nsfw ? "text-fuchsia-50/58" : "text-white/54")}>
              {compactSelections.map((selection, index) => (
                <span key={`${selection}-${index}`} className="contents">
                  {index > 0 && <span className={cn("size-1 rounded-full", nsfw ? "bg-fuchsia-200/26" : "bg-white/22")} />}
                  <span className="max-w-[112px] truncate capitalize">{selection}</span>
                </span>
              ))}
            </div>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setActiveQuickTool("angle")} className={cn("rounded-full hover:text-white", nsfw ? "text-fuchsia-50/62 hover:bg-fuchsia-300/[0.08]" : "text-white/62 hover:bg-white/[0.06]")} aria-label="Panel settings">
              <SlidersHorizontal className="size-4" />
            </Button>
          </header>

          <div className="flex-1 px-4 py-4">
            <div className={cn("relative overflow-hidden rounded-[24px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_28%_0%,rgba(255,255,255,0.12),transparent_34%)]", nsfw ? "border-fuchsia-200/14 bg-[#0B0617]/68" : "border-white/[0.12] bg-[#0E0E0F]/62")}>
              <div className={cn("grid grid-cols-2 rounded-full border p-1", nsfw ? "border-fuchsia-200/14 bg-black/35" : "border-white/[0.12] bg-black/45")}>
                {(["framing", "directing"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setActivePanelMode(mode)}
                    className={cn(
                      "flex h-10 items-center justify-center gap-2 rounded-full text-sm font-black transition",
                      activePanelMode === mode
                        ? nsfw
                          ? "bg-fuchsia-300/[0.16] text-fuchsia-50 shadow-[0_0_28px_rgba(192,38,211,0.22)]"
                          : "bg-white/[0.11] text-white shadow-[0_0_24px_rgba(255,255,255,0.08)]"
                        : nsfw ? "text-fuchsia-50/38" : "text-white/38"
                    )}
                  >
                    {mode === "framing" ? "Framing" : "Directing"}
                    {mode === "framing" && <ChevronRight className="size-4" />}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {promptActions.map(({ id, label, icon: Icon }) => {
                    const active = activeQuickTool === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setActiveQuickTool(id);
                          if (id === "image-count") openUploadModal("reference");
                          if (id === "shot-type") setMentionOpen(true);
                        }}
                        className={cn(
                          "flex size-10 items-center justify-center rounded-full border transition hover:text-white",
                          nsfw ? "border-fuchsia-200/14 bg-fuchsia-300/[0.055] text-fuchsia-50/62 hover:bg-fuchsia-300/[0.10]" : "border-white/[0.12] bg-white/[0.045] text-white/62 hover:bg-white/[0.08]",
                          active && (nsfw ? "bg-fuchsia-300/[0.16] text-fuchsia-50" : "bg-white/[0.10] text-white")
                        )}
                        aria-label={label}
                      >
                        <Icon className="size-4" />
                      </button>
                    );
                  })}
                </div>
                <div className={cn("flex items-center rounded-xl border p-1", nsfw ? "border-fuchsia-200/14 bg-fuchsia-300/[0.045]" : "border-white/[0.12] bg-white/[0.035]")}>
                  <button type="button" onClick={() => setActivePanelMode("framing")} className={cn("flex size-8 items-center justify-center rounded-lg text-white", activePanelMode === "framing" ? (nsfw ? "bg-fuchsia-300/[0.14]" : "bg-white/[0.10]") : "text-white/34")} aria-label="List view">
                    <LayoutList className="size-4" />
                  </button>
                  <button type="button" onClick={() => setActivePanelMode("directing")} className={cn("flex size-8 items-center justify-center rounded-lg", activePanelMode === "directing" ? (nsfw ? "bg-fuchsia-300/[0.14] text-white" : "bg-white/[0.10] text-white") : "text-white/34")} aria-label="Ordered view">
                    <ListOrdered className="size-4" />
                  </button>
                </div>
              </div>

              <div className="relative mt-6">
                {aiDirectorActive && (
                  <div className={cn("mb-3 rounded-2xl border px-4 py-3 text-sm font-semibold leading-6", nsfw ? "border-fuchsia-200/12 bg-fuchsia-300/[0.045] text-fuchsia-50/56" : "border-white/[0.08] bg-white/[0.025] text-white/48")}>
                    Director&apos;s Notes: open with a slow, intimate push-in, keep Character DNA locked, let the key light sculpt silhouette and emotion, then build tension with precise pacing.
                  </div>
                )}
                <textarea
                  value={scenePrompt}
                  onChange={handlePromptChange}
                  onFocus={() => setMentionOpen(scenePrompt.includes("@") && /@\w*$/.test(scenePrompt))}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setMentionOpen(false);
                  }}
                  placeholder={promptPlaceholder}
                  className={cn(
                    "min-h-[132px] w-full resize-none rounded-2xl border bg-transparent px-4 py-3 text-[16px] font-semibold leading-7 outline-none transition placeholder:text-white/32",
                    nsfw ? "border-fuchsia-200/12 text-fuchsia-50/72 focus:border-fuchsia-200/28 focus:bg-fuchsia-300/[0.035]" : "border-white/[0.08] text-white/72 focus:border-white/18 focus:bg-white/[0.025]"
                  )}
                />
                {mentionOpen && (
                  <div className={cn("absolute left-3 top-12 z-20 w-64 overflow-hidden rounded-2xl border p-1 shadow-[0_22px_70px_rgba(0,0,0,0.45)]", nsfw ? "border-fuchsia-200/18 bg-[#130B24]" : "border-white/12 bg-[#101011]")}>
                    {mentions.map((mention) => (
                      <button
                        key={mention}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleMentionSelect(mention)}
                        className={cn("block w-full rounded-xl px-3 py-2 text-left text-sm font-black transition", nsfw ? "text-fuchsia-50/74 hover:bg-fuchsia-300/[0.10]" : "text-white/74 hover:bg-white/[0.07]")}
                      >
                        @{mention}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {referenceImages.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {referenceImages.map((image) => (
                    <div key={image.id} className={cn("group relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border", nsfw ? "border-fuchsia-200/18" : "border-white/12")}>
                      <img src={image.dataUrl} alt={image.name} className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeReferenceImage(image.id)} className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100" aria-label={`Remove ${image.name}`}>
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className={cn("mt-4 rounded-2xl border px-4 py-3 text-xs font-black capitalize", nsfw ? "border-fuchsia-200/12 bg-fuchsia-300/[0.045] text-fuchsia-50/58" : "border-white/[0.08] bg-white/[0.025] text-white/44")}>
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">Active: {activeRailTool} / {activePanelMode} / {activeQuickTool.replace("-", " ")}</span>
                  <span>{generationProgress}%</span>
                </div>
                <div className={cn("mt-2 h-1.5 overflow-hidden rounded-full", nsfw ? "bg-fuchsia-950/60" : "bg-white/10")}>
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", nsfw ? "bg-fuchsia-300" : "bg-cyan-200")}
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <div className="mt-2 normal-case">{generationStatus}</div>
              </div>
            </div>
          </div>

          <footer className="flex shrink-0 items-center gap-2 px-4 pb-4">
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
              {bottomChips.map(({ id, label, icon: Icon }) => {
                const active = activeQuickTool === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setActiveQuickTool(id);
                      if (id === "image-count") openUploadModal("reference");
                    }}
                    className={cn(
                      "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:text-white",
                      nsfw ? "border-fuchsia-200/16 bg-fuchsia-300/[0.055] text-fuchsia-50/62 hover:bg-fuchsia-300/[0.10]" : "border-white/[0.15] bg-white/[0.045] text-white/62 hover:bg-white/[0.08]",
                      active && (nsfw ? "bg-fuchsia-300/[0.16] text-fuchsia-50" : "bg-white/[0.12] text-white")
                    )}
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => openUploadModal("reference")}
              className={cn("flex size-10 shrink-0 items-center justify-center rounded-full border transition hover:text-white", nsfw ? "border-fuchsia-200/18 bg-fuchsia-300/[0.08] text-fuchsia-50/72 hover:bg-fuchsia-300/[0.14]" : "border-white/14 bg-white/[0.055] text-white/72 hover:bg-white/[0.09]")}
              aria-label="Open upload modal"
            >
              <ImageUp className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className={cn("flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-black text-black transition hover:bg-white", nsfw ? "bg-fuchsia-200 shadow-[0_0_28px_rgba(192,38,211,0.55)]" : "bg-cyan-50 shadow-[0_0_24px_rgba(210,246,255,0.55)]")}
              aria-label={activePanelMode === "directing" ? "Generate video" : "Generate image"}
            >
              {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {isGenerating ? `${generationProgress}%` : "Generate"}
            </button>
          </footer>
        </section>
      </div>
    </aside>
  );
}
