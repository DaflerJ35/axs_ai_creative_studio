import { ArrowLeft, Camera, Check, ChevronDown, Clapperboard, Loader2, SlidersHorizontal, Sparkles, WandSparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSceneBuilderStore } from "../store/useSceneBuilderStore";
import type { AdvancedSceneSettings, CameraSettings, StudioMode } from "../types/scene-builder.types";

const MODELS: { value: AdvancedSceneSettings["model"]; label: string; note: string }[] = [
  { value: "ltx-video-2.3", label: "LTX Video 2.3", note: "Flagship Director's Cut motion model" },
  { value: "flux1-dev-fp8", label: "Flux 1 Dev FP8", note: "Best prompt adherence + DNA lock" },
  { value: "flux1-schnell-fp8", label: "Flux 1 Schnell FP8", note: "Fast FLUX drafts on RTX" },
  { value: "biglove-pony2", label: "bigLove Pony 2", note: "Pony / SDXL character workflow" },
  { value: "dreamshaper-xl", label: "DreamShaper XL", note: "SDXL realistic/editorial workflow" },
  { value: "realvis-xl", label: "RealVis XL", note: "Photoreal DNA studio" },
  { value: "juggernaut-xl", label: "Juggernaut XL", note: "Premium realistic workflow" },
  { value: "ltx-video-1.1", label: "LTX Video 1.1", note: "Legacy RTX upscale workflow" },
  { value: "flux-2-flash", label: "Flux 2.0 Flash", note: "Fast cinematic drafts" },
  { value: "gpt-image-2", label: "GPT Image 2", note: "High fidelity generation" },
  { value: "nano-banana-2", label: "Nano Banana 2", note: "Fast, high-quality image generation" },
  { value: "nano-banana-pro", label: "Nano Banana Pro", note: "Premium consistency mode" },
];

const RESOLUTIONS: AdvancedSceneSettings["resolution"][] = ["2K", "4K", "512px", "1K"];
const ASPECT_RATIOS: AdvancedSceneSettings["aspectRatio"][] = ["16:9", "9:16", "1:1"];
const CAMERA_TYPES: CameraSettings["type"][] = ["auto", "cinema", "handheld", "drone", "macro"];
const LENSES: CameraSettings["lens"][] = ["24mm", "35mm", "50mm", "85mm", "anamorphic"];

function ToolbarPill({
  active,
  nsfw,
  children,
  onClick,
  className,
}: {
  active: boolean;
  nsfw?: boolean;
  children: ReactNode;
  onClick: () => void;
  className?: string;
  key?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-full px-3 text-xs font-black transition",
        active
          ? nsfw
            ? "bg-fuchsia-300 text-[#14051D] shadow-[0_0_24px_rgba(192,38,211,0.28)]"
            : "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
          : nsfw
            ? "text-fuchsia-50/56 hover:bg-fuchsia-300/[0.08] hover:text-fuchsia-50"
            : "text-white/54 hover:bg-white/[0.055] hover:text-white",
        className
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="hidden h-1 w-1 rounded-full bg-white/20 md:block" />;
}

export function TopProjectBar({
  onRequestStudioMode,
}: {
  onRequestStudioMode: (mode: StudioMode) => void;
}) {
  const sceneTitle = useSceneBuilderStore((state) => state.sceneTitle);
  const studioMode = useSceneBuilderStore((state) => state.studioMode);
  const aiDirectorActive = useSceneBuilderStore((state) => state.aiDirectorActive);
  const directorsCutActive = useSceneBuilderStore((state) => state.directorsCutActive);
  const generationProgress = useSceneBuilderStore((state) => state.generationProgress);
  const isGenerating = useSceneBuilderStore((state) => state.isGenerating);
  const camera = useSceneBuilderStore((state) => state.camera);
  const advanced = useSceneBuilderStore((state) => state.advanced);
  const updateCamera = useSceneBuilderStore((state) => state.updateCamera);
  const updateAdvanced = useSceneBuilderStore((state) => state.updateAdvanced);
  const setAiDirectorActive = useSceneBuilderStore((state) => state.setAiDirectorActive);
  const setDirectorsCutActive = useSceneBuilderStore((state) => state.setDirectorsCutActive);
  const runGeneration = useSceneBuilderStore((state) => state.runGeneration);
  const advanceGeneration = useSceneBuilderStore((state) => state.advanceGeneration);
  const completeGeneration = useSceneBuilderStore((state) => state.completeGeneration);
  const activeModel = MODELS.find((model) => model.value === advanced.model) ?? MODELS[2];
  const nsfw = studioMode === "nsfw";
  const handleGenerate = () => {
    runGeneration("image");
    window.setTimeout(advanceGeneration, 250);
    window.setTimeout(advanceGeneration, 650);
    window.setTimeout(advanceGeneration, 1050);
    window.setTimeout(advanceGeneration, 1450);
    window.setTimeout(completeGeneration, 1900);
  };

  return (
    <header className={cn("shrink-0 border-b px-4 py-3 transition-colors duration-500", nsfw ? "border-fuchsia-200/10 bg-[#0A0718]/52" : "border-white/[0.065] bg-[#0B0B0C]/80")}>
      <div
        className={cn(
          "flex min-h-10 items-center gap-3 rounded-[24px] border px-3 py-2 backdrop-blur-2xl transition-all duration-500",
          nsfw
            ? "border-fuchsia-200/16 bg-[#130B24]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_48px_rgba(192,38,211,0.15)]"
            : "border-white/[0.16] bg-[#111112]/74 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.04),0_18px_60px_rgba(0,0,0,0.24)]"
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-white/70 hover:bg-white/[0.06] hover:text-white"
          aria-label="Back to projects"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="hidden min-w-0 flex-col pr-1 xl:flex">
          <span className="max-w-36 truncate text-xs font-black text-white/86">{sceneTitle}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/24">Scene Builder</span>
        </div>

        <Divider />

        <div className={cn("hidden items-center rounded-full p-0.5 xl:flex", nsfw ? "bg-fuchsia-950/50 ring-1 ring-fuchsia-300/12" : "bg-black/45")}>
          <ToolbarPill active={!nsfw} nsfw={nsfw} onClick={() => onRequestStudioMode("sfw")}>
            SFW Studio
          </ToolbarPill>
          <ToolbarPill active={nsfw} nsfw={nsfw} onClick={() => onRequestStudioMode("nsfw")}>
            NSFW Director&apos;s Cut
          </ToolbarPill>
        </div>

        <Divider />

        <Select
          value={advanced.model}
          onValueChange={(model) => updateAdvanced({ model: model as AdvancedSceneSettings["model"] })}
        >
          <SelectTrigger className={cn("h-8 w-[168px] rounded-full border-transparent bg-transparent px-2.5 py-0 text-xs font-black focus-visible:ring-0", nsfw ? "text-fuchsia-50/82 hover:bg-fuchsia-300/[0.08]" : "text-white/78 hover:bg-white/[0.055]")}>
            <Sparkles className={cn("mr-1.5 size-3.5", nsfw ? "text-fuchsia-200/70" : "text-white/46")} />
            <SelectValue>{activeModel.label}</SelectValue>
          </SelectTrigger>
          <SelectContent className="w-72 rounded-2xl border-white/[0.10] bg-[#080809] p-2 text-white shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
            {MODELS.map((model) => (
              <SelectItem
                key={model.value}
                value={model.value}
                className="rounded-xl px-3 py-3 text-white/78 focus:bg-white/[0.08] focus:text-white"
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-black">{model.label}</span>
                    <span className="mt-1 block text-xs font-semibold text-white/38">{model.note}</span>
                  </span>
                  {advanced.model === model.value && <Check className="mt-0.5 size-4 text-white" />}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Divider />

        <div className={cn("hidden items-center rounded-full p-0.5 sm:flex", nsfw ? "bg-fuchsia-950/50" : "bg-black/45")}>
          {RESOLUTIONS.map((resolution) => (
            <ToolbarPill
              key={resolution}
              active={advanced.resolution === resolution}
              nsfw={nsfw}
              onClick={() => updateAdvanced({ resolution })}
            >
              {resolution}
            </ToolbarPill>
          ))}
        </div>

        <Divider />

        <div className={cn("hidden items-center rounded-full p-0.5 md:flex", nsfw ? "bg-fuchsia-950/50" : "bg-black/45")}>
          {ASPECT_RATIOS.map((aspectRatio) => (
            <ToolbarPill
              key={aspectRatio}
              active={advanced.aspectRatio === aspectRatio}
              nsfw={nsfw}
              onClick={() => updateAdvanced({ aspectRatio })}
            >
              {aspectRatio}
            </ToolbarPill>
          ))}
        </div>

        <Divider />

        <Select
          value={camera.type}
          onValueChange={(type) => updateCamera({ type: type as CameraSettings["type"] })}
        >
          <SelectTrigger className={cn("h-8 w-[132px] rounded-full border-transparent bg-transparent px-2.5 py-0 text-xs font-black capitalize focus-visible:ring-0", nsfw ? "text-fuchsia-50/62 hover:bg-fuchsia-300/[0.08]" : "text-white/60 hover:bg-white/[0.055]")}>
            <Camera className={cn("mr-1.5 size-3.5", nsfw ? "text-fuchsia-200/46" : "text-white/36")} />
            <SelectValue>{camera.type.replace("-", " ")}</SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-white/[0.10] bg-[#080809] p-1 text-white">
            {CAMERA_TYPES.map((type) => (
              <SelectItem key={type} value={type} className="rounded-xl capitalize text-white/76 focus:bg-white/[0.08]">
                {type.replace("-", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Divider />

        <Select
          value={camera.lens}
          onValueChange={(lens) => updateCamera({ lens: lens as CameraSettings["lens"] })}
        >
          <SelectTrigger className={cn("h-8 w-[128px] rounded-full border-transparent bg-transparent px-2.5 py-0 text-xs font-black focus-visible:ring-0", nsfw ? "text-fuchsia-50/62 hover:bg-fuchsia-300/[0.08]" : "text-white/60 hover:bg-white/[0.055]")}>
            <SelectValue>{camera.lens}</SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-white/[0.10] bg-[#080809] p-1 text-white">
            {LENSES.map((lens) => (
              <SelectItem key={lens} value={lens} className="rounded-xl text-white/76 focus:bg-white/[0.08]">
                {lens}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            className={cn(
              "hidden h-8 rounded-full px-3 text-xs font-black transition lg:inline-flex",
              aiDirectorActive
                ? nsfw
                  ? "bg-fuchsia-300 text-[#16051D] shadow-[0_0_28px_rgba(192,38,211,0.42)]"
                  : "bg-cyan-100 text-black shadow-[0_0_22px_rgba(0,212,255,0.24)]"
                : nsfw
                  ? "border border-fuchsia-200/12 bg-fuchsia-300/[0.06] text-fuchsia-50/72 hover:bg-fuchsia-300/[0.12]"
                  : "border border-white/12 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]"
            )}
            onClick={() => setAiDirectorActive(!aiDirectorActive)}
          >
            <WandSparkles className="size-3.5" />
            AI Director
          </Button>
          <Button
            type="button"
            className={cn(
              "hidden h-8 rounded-full px-3 text-xs font-black lg:inline-flex",
              directorsCutActive
                ? "bg-gradient-to-r from-fuchsia-400 to-violet-400 text-white shadow-[0_0_30px_rgba(168,85,247,0.34)]"
                : nsfw
                  ? "border border-fuchsia-200/12 bg-[#1B0E2D] text-fuchsia-50/72 hover:bg-fuchsia-300/[0.12]"
                  : "border border-white/12 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]"
            )}
            onClick={() => {
              setDirectorsCutActive(!directorsCutActive);
              if (!directorsCutActive) {
                runGeneration("directors-cut");
                window.setTimeout(advanceGeneration, 250);
                window.setTimeout(advanceGeneration, 650);
                window.setTimeout(advanceGeneration, 1050);
                window.setTimeout(advanceGeneration, 1450);
                window.setTimeout(completeGeneration, 1900);
              }
            }}
          >
            <Clapperboard className="size-3.5" />
            Director&apos;s Cut
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn("rounded-full hover:text-white", nsfw ? "text-fuchsia-50/52 hover:bg-fuchsia-300/[0.08]" : "text-white/52 hover:bg-white/[0.06]")}
            aria-label="Open toolbar settings"
          >
            <SlidersHorizontal className="size-4" />
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn("h-8 rounded-full px-4 text-xs font-black lg:inline-flex", nsfw ? "bg-gradient-to-r from-fuchsia-300 to-violet-300 text-[#14051D] hover:brightness-110" : "bg-white text-black hover:bg-cyan-100")}
          >
            {isGenerating ? `${generationProgress}%` : "Generate"}
            {isGenerating ? <Loader2 className="size-3.5 animate-spin" /> : <ChevronDown className="size-3.5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
