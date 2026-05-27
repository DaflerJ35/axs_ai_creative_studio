import { Camera, Clapperboard, Eye, Layers3, Lightbulb, Lock, Sparkles, Wand2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ProofBadge } from "@/components/platform/ProofBadge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { getSliderNumber } from "@/lib/sliderValue";
import { useAxsProofSummary } from "@/lib/useAxsProofSummary";
import { cn } from "@/lib/utils";
import { useSceneBuilderStore } from "../store/useSceneBuilderStore";
import type {
  AdvancedSceneSettings,
  CameraSettings,
  LightingSettings,
  SceneCanvasItem,
} from "../types/scene-builder.types";

const cameraAngles: CameraSettings["angle"][] = ["eye-level", "low-angle", "high-angle", "over-shoulder", "drone"];
const lenses: CameraSettings["lens"][] = ["24mm", "35mm", "50mm", "85mm", "anamorphic"];
const lightingStyles: LightingSettings["style"][] = ["cinematic", "noir", "high-key", "volumetric", "editorial"];
const qualities: AdvancedSceneSettings["quality"][] = ["draft", "studio", "premium", "master"];
const aspectRatios: AdvancedSceneSettings["aspectRatio"][] = ["16:9", "9:16", "1:1", "4:5", "2.39:1"];

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Camera; children: ReactNode }) {
  return (
    <section className="space-y-4 border-b border-white/[0.06] px-5 py-5">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/42">
        <Icon className="size-3.5 text-white/34" />
        {title}
      </div>
      {children}
    </section>
  );
}

function ChipGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-bold capitalize transition",
            value === option
              ? "border-white/70 bg-white text-black"
              : "border-white/[0.10] bg-white/[0.025] text-white/48 hover:border-white/22 hover:text-white/78"
          )}
        >
          {option.replace("-", " ")}
        </button>
      ))}
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-bold text-white/46">{label}</span>
        <span className="font-black text-white/70">{value}</span>
      </div>
      <Slider
        min={min}
        max={max}
        value={[value]}
        onValueChange={(nextValue) => onChange(getSliderNumber(nextValue, value, min, max))}
        className="[&_[data-slot=slider-range]]:bg-white/80 [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-thumb]]:border-white/80"
      />
    </div>
  );
}

function buildPrompt(canvasItems: SceneCanvasItem[], camera: CameraSettings, lighting: LightingSettings, nsfwEnabled: boolean): string {
  const sceneDNA = canvasItems.map((item) => item.dnaPrompt).join(", ");

  return [
    sceneDNA || "premium cinematic production still",
    `${camera.angle.replace("-", " ")} camera, ${camera.lens} lens`,
    `${lighting.style} lighting, ${lighting.intensity} intensity`,
    nsfwEnabled ? "adult-capable scene direction enabled when requested" : "",
    "coherent Character DNA, high-end film color, production-grade detail",
  ]
    .filter(Boolean)
    .join(", ");
}

export function SceneControls() {
  const proof = useAxsProofSummary();
  const canvasItems = useSceneBuilderStore((state) => state.canvasItems);
  const selectedItemId = useSceneBuilderStore((state) => state.selectedItemId);
  const camera = useSceneBuilderStore((state) => state.camera);
  const lighting = useSceneBuilderStore((state) => state.lighting);
  const advanced = useSceneBuilderStore((state) => state.advanced);
  const updateItem = useSceneBuilderStore((state) => state.updateItem);
  const updateCamera = useSceneBuilderStore((state) => state.updateCamera);
  const updateLighting = useSceneBuilderStore((state) => state.updateLighting);
  const updateAdvanced = useSceneBuilderStore((state) => state.updateAdvanced);
  const selectedItem = canvasItems.find((item) => item.instanceId === selectedItemId);
  const prompt = buildPrompt(canvasItems, camera, lighting, advanced.nsfwEnabled);
  const workflowDetail = proof.categories.workflow.signals[0]?.detail;

  return (
    <aside className="flex h-full w-full flex-col border-l border-white/[0.06] bg-[#0F0F10]">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
        <div>
          <div className="text-sm font-black text-white">Inspector</div>
          <div className="mt-0.5 text-xs font-semibold text-white/32">
            {selectedItem ? selectedItem.name : "Scene settings"}
          </div>
        </div>
        <div className="flex size-8 items-center justify-center rounded-full border border-white/[0.08] text-white/35">
          <Eye className="size-3.5" />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section title="Production Proof" icon={Sparkles}>
          <div className="flex flex-wrap gap-2">
            <ProofBadge label="DNA" score={proof.categories.identity.score} status={proof.categories.identity.status} />
            <ProofBadge label="Continuity" score={proof.categories.continuity.score} status={proof.categories.continuity.status} />
            <ProofBadge label="Workflow" score={proof.categories.workflow.score} status={proof.categories.workflow.status} />
          </div>
          <ProofBadge
            label="Workflow Proof"
            score={proof.categories.workflow.score}
            status={proof.categories.workflow.status}
            detail={workflowDetail}
            variant="full"
          />
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-white/36">AXS Proof Score</span>
              <span className="text-xl font-black text-white">{proof.overallScore}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full",
                  proof.status === "ready" ? "bg-cyan-200" : proof.status === "watch" ? "bg-amber-200" : "bg-rose-300"
                )}
                style={{ width: `${proof.overallScore}%` }}
              />
            </div>
          </div>
        </Section>

        {selectedItem ? (
          <Section title="Selected Layer" icon={Layers3}>
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
              <div className={cn("flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-black text-black", selectedItem.accent)}>
                {selectedItem.thumbnail}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-white/88">{selectedItem.name}</div>
                <div className="truncate text-xs font-semibold capitalize text-white/34">{selectedItem.type}</div>
              </div>
            </div>
            <div className="space-y-5">
              <RangeControl label="Scale" min={60} max={160} value={Math.round(selectedItem.scale * 100)} onChange={(scale) => updateItem(selectedItem.instanceId, { scale: scale / 100 })} />
              <RangeControl label="Rotate" min={-45} max={45} value={selectedItem.rotation} onChange={(rotation) => updateItem(selectedItem.instanceId, { rotation })} />
              <RangeControl label="Layer" min={1} max={12} value={selectedItem.layer} onChange={(layer) => updateItem(selectedItem.instanceId, { layer })} />
            </div>
          </Section>
        ) : (
          <Section title="Scene Info" icon={Clapperboard}>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
              <div className="text-sm font-black text-white/88">MOMENTUM Scene 01</div>
              <div className="mt-2 text-xs font-semibold text-white/34">{canvasItems.length} layers on canvas</div>
            </div>
          </Section>
        )}

        <Section title="Camera" icon={Camera}>
          <ChipGroup value={camera.angle} options={cameraAngles} onChange={(angle) => updateCamera({ angle })} />
          <ChipGroup value={camera.lens} options={lenses} onChange={(lens) => updateCamera({ lens })} />
          <RangeControl label="Distance" min={12} max={100} value={camera.distance} onChange={(distance) => updateCamera({ distance })} />
        </Section>

        <Section title="Lighting" icon={Lightbulb}>
          <ChipGroup value={lighting.style} options={lightingStyles} onChange={(style) => updateLighting({ style })} />
          <RangeControl label="Intensity" min={0} max={100} value={lighting.intensity} onChange={(intensity) => updateLighting({ intensity })} />
        </Section>

        <Section title="Prompt" icon={Wand2}>
          <Textarea value={prompt} readOnly className="min-h-28 rounded-2xl border-white/[0.08] bg-black/20 text-xs leading-5 text-white/50" />
        </Section>

        <Section title="Output" icon={Sparkles}>
          <ChipGroup value={advanced.quality} options={qualities} onChange={(quality) => updateAdvanced({ quality })} />
          <ChipGroup value={advanced.aspectRatio} options={aspectRatios} onChange={(aspectRatio) => updateAdvanced({ aspectRatio })} />
          <button
            type="button"
            onClick={() => updateAdvanced({ nsfwEnabled: !advanced.nsfwEnabled })}
            className={cn(
              "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
              advanced.nsfwEnabled ? "border-white/22 bg-white/[0.055]" : "border-white/[0.08] bg-white/[0.025]"
            )}
          >
            <span>
              <span className="block text-sm font-black text-white/84">NSFW Ready</span>
              <span className="mt-1 block text-xs font-semibold text-white/34">Adult-capable direction enabled.</span>
            </span>
            <Lock className={cn("size-4", advanced.nsfwEnabled ? "text-white/76" : "text-white/28")} />
          </button>
        </Section>
      </div>

      <div className="shrink-0 border-t border-white/[0.06] p-5">
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-11 rounded-full bg-white text-sm font-black text-black hover:bg-cyan-100">
            <Sparkles className="size-4" />
            Image
          </Button>
          <Button className="h-11 rounded-full border border-white/12 bg-white/[0.04] text-sm font-black text-white hover:bg-white/[0.08]">
            <Clapperboard className="size-4" />
            Video
          </Button>
        </div>
      </div>
    </aside>
  );
}
