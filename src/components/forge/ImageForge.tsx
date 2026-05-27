import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowRight,
  Camera,
  Check,
  Copy,
  Download,
  Dna,
  Image as ImageIcon,
  ImagePlus,
  Layers3,
  Lock,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Upload,
  WandSparkles,
  Zap,
} from "lucide-react";
import { type ChangeEvent, type DragEvent, type ReactNode, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";
import { getSliderNumber } from "../../lib/sliderValue";
import { copyToClipboard } from "../../lib/safeClipboard";
import { composeFromCharacter } from "../../lib/composePrompt";
import { estimateImageCost, forgeImage } from "../../lib/workflows";
import { useAxsProofSummary } from "../../lib/useAxsProofSummary";
import type { ForgeResult, StylePreset } from "../../lib/types";
import { useActiveCharacter, useAxsStore } from "../../store/useAxsStore";
import { useUniverseForgeStore } from "../../features/universe-forge/store/useUniverseForgeStore";
import { ProofBadge } from "../platform/ProofBadge";
import { CommandMetric } from "../command/CommandDeck";

type ReferenceSlot = "face" | "body" | "style" | "outfit";
type GenerationMode = "single" | "batch-4" | "batch-8" | "batch-16" | "variation" | "upscale" | "remix";
type QualityMode = "realism" | "ultra" | "cinematic";

interface ReferenceImage {
  slot: ReferenceSlot;
  dataUrl: string;
  name: string;
}

const STYLE_PRESETS: Array<{ id: StylePreset; label: string; detail: string; className: string }> = [
  { id: "cinematic", label: "Cinematic", detail: "ARRI color, film still", className: "from-[#F6D57A] via-[#D4AF37] to-[#8B6F2F]" },
  { id: "portrait", label: "Hyper-Real", detail: "Skin detail, lens depth", className: "from-[#F6D57A] via-teal-200/80 to-[#8B6F2F]" },
  { id: "editorial", label: "Editorial", detail: "Fashion campaign polish", className: "from-[#F6D57A] via-rose-200/70 to-[#8B6F2F]" },
  { id: "anime", label: "Anime", detail: "Stylized clean frames", className: "from-[#F6D57A] via-fuchsia-200/60 to-[#8B6F2F]" },
  { id: "concept_art", label: "Concept", detail: "Production design mood", className: "from-amber-200 to-orange-300" },
  { id: "raw", label: "Raw", detail: "No style booster", className: "from-zinc-200 to-slate-300" },
];

const ASPECTS = [
  { label: "1:1", width: 1024, height: 1024 },
  { label: "4:5", width: 896, height: 1152 },
  { label: "3:4", width: 832, height: 1216 },
  { label: "9:16", width: 768, height: 1344 },
  { label: "16:9", width: 1344, height: 768 },
];

const GENERATION_MODES: Array<{ id: GenerationMode; label: string; batch: number; detail: string }> = [
  { id: "single", label: "Single", batch: 1, detail: "One polished frame" },
  { id: "batch-4", label: "Batch 4", batch: 4, detail: "Four directions" },
  { id: "batch-8", label: "Batch 8", batch: 8, detail: "Exploration pass" },
  { id: "batch-16", label: "Batch 16", batch: 16, detail: "Full wall" },
  { id: "variation", label: "Variation", batch: 4, detail: "Stay on DNA" },
  { id: "upscale", label: "Upscale", batch: 1, detail: "Finish detail" },
  { id: "remix", label: "Remix", batch: 4, detail: "New angle" },
];

function imageOutputToUrl(image: string, mime = "image/png") {
  if (/^(data:|https?:|blob:)/i.test(image)) return image;
  return `data:${mime};base64,${image}`;
}

function demoImageDataUrl(width: number, height: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#050505"/><stop offset=".55" stop-color="#171717"/><stop offset="1" stop-color="#8B6F2F"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${Math.round(width * 0.72)}" cy="${Math.round(height * 0.22)}" r="${Math.round(Math.min(width, height) * 0.16)}" fill="#D4AF37" opacity=".18"/><rect x="8%" y="12%" width="84%" height="76%" rx="32" fill="none" stroke="#F6D57A" stroke-opacity=".34" stroke-width="3"/><text x="10%" y="82%" fill="#F6D57A" font-family="Arial" font-size="34" font-weight="700">AXS DEMO FRAME</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const QUICK_TAGS = [
  "cinematic close-up",
  "luxury editorial",
  "soft rim light",
  "full body frame",
  "35mm lens",
  "high-end studio",
  "volumetric lighting",
  "consistent character DNA",
];

const REFERENCE_SLOTS: Array<{ id: ReferenceSlot; label: string; helper: string }> = [
  { id: "face", label: "Face", helper: "Identity reference" },
  { id: "body", label: "Full Body", helper: "Silhouette lock" },
  { id: "style", label: "Style", helper: "Lighting mood" },
  { id: "outfit", label: "Outfit", helper: "Wardrobe memory" },
];

function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "axs-panel axs-panel-corners relative overflow-hidden rounded-2xl border-[var(--axs-gold-border)] bg-[#080808]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_26px_90px_rgba(0,0,0,0.48),0_0_42px_rgba(212,175,55,0.08)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[rgba(246,213,122,0.72)] before:to-transparent",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-32 top-8 size-[30rem] rounded-full bg-[#D4AF37]/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute -left-36 bottom-4 size-[32rem] rounded-full bg-[#8B6F2F]/[0.055] blur-3xl" />
      <div className="relative">{children}</div>
    </section>
  );
}

export const ImageForge = () => {
  const {
    settings,
    updateSettings,
    gallery,
    addToGallery,
    removeFromGallery,
    draftPrompt,
    setDraftPrompt,
    draftNegative,
    setDraftNegative,
    setActiveTab,
    updateCharacter,
  } = useAxsStore();
  const proof = useAxsProofSummary();
  const character = useActiveCharacter();
  const universeCharacters = useUniverseForgeStore((state) => state.characters);
  const selectedUniverseCharacterId = useUniverseForgeStore((state) => state.selectedCharacterId);
  const selectedUniverseCharacter = universeCharacters.find((item) => item.id === selectedUniverseCharacterId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<ReferenceSlot>("face");
  const [references, setReferences] = useState<ReferenceImage[]>([]);
  const [faceLockStrength, setFaceLockStrength] = useState(0.84);
  const [bodyLockEnabled, setBodyLockEnabled] = useState(true);
  const [seedLocked, setSeedLocked] = useState(true);
  const [consistency, setConsistency] = useState(0.88);
  const [quality, setQuality] = useState<QualityMode>("cinematic");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("single");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressNote, setProgressNote] = useState("Ready");
  const [sessionResults, setSessionResults] = useState<ForgeResult[]>([]);

  const activeStyle = STYLE_PRESETS.find((preset) => preset.id === settings.stylePreset) ?? STYLE_PRESETS[0];
  const faceReference = references.find((reference) => reference.slot === "face");
  const bodyReference = references.find((reference) => reference.slot === "body");
  const styleReference = references.find((reference) => reference.slot === "style");
  const outfitReference = references.find((reference) => reference.slot === "outfit");
  const selectedMode = GENERATION_MODES.find((mode) => mode.id === generationMode) ?? GENERATION_MODES[0];
  const recentImages = gallery.filter((item) => item.type === "image").slice(0, 12);

  const composedPrompt = useMemo(() => {
    const base = composeFromCharacter(character, { userPrompt: draftPrompt }).prompt;
    const universeMemory = selectedUniverseCharacter
      ? `Universe memory: ${selectedUniverseCharacter.name}, ${selectedUniverseCharacter.appearance}, ${selectedUniverseCharacter.wardrobe}, emotional state ${selectedUniverseCharacter.emotionalState}`
      : "";
    const lockLanguage = [
      faceReference ? `FaceLock reference strength ${faceLockStrength.toFixed(2)}` : null,
      bodyLockEnabled && bodyReference ? "full body reference lock, exact silhouette continuity" : null,
      outfitReference ? "wardrobe reference preserved" : null,
      `consistency priority ${consistency.toFixed(2)}`,
      quality === "cinematic" ? "cinematic film still, premium color grade, controlled light falloff" : null,
      quality === "ultra" ? "ultra detailed, high fidelity skin texture, precise anatomy" : null,
      quality === "realism" ? "realistic editorial photography, natural skin texture" : null,
    ].filter(Boolean);

    return [base, universeMemory, ...lockLanguage].filter(Boolean).join(", ");
  }, [
    bodyLockEnabled,
    bodyReference,
    character,
    consistency,
    draftPrompt,
    faceLockStrength,
    faceReference,
    outfitReference,
    quality,
    selectedUniverseCharacter,
  ]);

  const previewResult = sessionResults[0] ?? recentImages[0];
  const referenceScore = Math.min(
    100,
    28 + (faceReference ? 24 : 0) + (bodyReference && bodyLockEnabled ? 18 : 0) + (styleReference ? 10 : 0) + (outfitReference ? 10 : 0) + Math.round(consistency * 10)
  );
  const workflowDetail = proof.categories.workflow.signals[0]?.detail;

  const estimatedCost = useMemo(() => estimateImageCost({ ...settings, batchSize: selectedMode.batch }), [selectedMode.batch, settings]);

  const readFile = (file: File, slot = activeSlot) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferences((current) => [
        ...current.filter((reference) => reference.slot !== slot),
        { slot, dataUrl: String(reader.result), name: file.name },
      ]);
      toast.success(`${slotLabel(slot)} reference loaded`);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) readFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLElement>, slot?: ReferenceSlot) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) readFile(file, slot ?? activeSlot);
  };

  const handleMatchLock = () => {
    setFaceLockStrength(Math.max(faceLockStrength, 0.9));
    setConsistency(Math.max(consistency, 0.92));
    setSeedLocked(true);
    setProgressNote(character ? `${character.name} DNA locked` : "Reference DNA lock primed");
    toast.success("Character DNA lock calibrated");
  };

  const handleGenerate = async () => {
    if (!composedPrompt.trim() && !character) {
      toast.error("Add a prompt or select Character DNA first.");
      return;
    }

    setGenerating(true);
    setProgress(12);
    setProgressNote("Loading Image Forge workflow...");
    updateSettings({ batchSize: Math.min(selectedMode.batch, 4) });

    try {
      window.setTimeout(() => {
        setProgress(34);
        setProgressNote("Injecting FaceLock and Character DNA...");
      }, 220);
      window.setTimeout(() => {
        setProgress(68);
        setProgressNote("Rendering premium image set...");
      }, 620);

      const result = await forgeImage({
        prompt: composedPrompt,
        negativePrompt: draftNegative,
        character,
        stylePreset: settings.stylePreset,
        settings: {
          ...settings,
          batchSize: Math.min(selectedMode.batch, 4),
          steps: selectedMode.id === "upscale" ? Math.max(settings.steps, 32) : settings.steps,
          upscaleFactor: selectedMode.id === "upscale" ? Math.max(settings.upscaleFactor, 2) : settings.upscaleFactor,
        },
        seedOverride: seedLocked ? character?.seed : undefined,
        quality,
        model: settings.comfyuiModel,
        faceRefImageDataUrl: faceReference?.dataUrl,
        faceRefStrength: faceLockStrength,
        referenceImageDataUrl: bodyReference?.dataUrl ?? styleReference?.dataUrl ?? outfitReference?.dataUrl,
      });

      if (result.status === "error") throw new Error(result.message ?? "Image generation failed");
      const images = result.images ?? [];
      if (images.length === 0) throw new Error("No images returned from generation.");

      const nextResults = images.map((image, index): ForgeResult => ({
        id: crypto.randomUUID(),
        type: "image",
        url: imageOutputToUrl(image.image, image.mime),
        prompt: composedPrompt,
        seed: image.seed,
        characterId: character?.id,
        stylePreset: settings.stylePreset,
        width: settings.width,
        height: settings.height,
        createdAt: Date.now() + index,
        favorite: false,
      }));

      nextResults.forEach(addToGallery);
      setSessionResults((current) => [...nextResults, ...current].slice(0, 16));
      setProgress(100);
      setProgressNote("Images forged");
      toast.success(`${nextResults.length} image${nextResults.length === 1 ? "" : "s"} ready`);
    } catch (error) {
      const demoResult: ForgeResult = {
        id: crypto.randomUUID(),
        type: "image",
        url: demoImageDataUrl(settings.width, settings.height),
        prompt: composedPrompt || "AXS demo image generated while render endpoint is not configured.",
        seed: Math.floor(Math.random() * 1_000_000_000),
        characterId: character?.id,
        stylePreset: settings.stylePreset,
        width: settings.width,
        height: settings.height,
        createdAt: Date.now(),
        favorite: false,
      };
      addToGallery(demoResult);
      setSessionResults((current) => [demoResult, ...current].slice(0, 16));
      setProgress(100);
      setProgressNote("Demo image staged");
      toast.info("Demo image staged", {
        description: error instanceof Error ? `Render endpoint needs setup: ${error.message}` : "Render endpoint needs setup.",
      });
    } finally {
      window.setTimeout(() => {
        setGenerating(false);
        setProgress(0);
      }, 700);
    }
  };

  const copyPrompt = async () => {
    const copied = await copyToClipboard(composedPrompt);
    if (copied) toast.success("Prompt copied");
    else toast.error("Clipboard unavailable", { description: "Your browser blocked clipboard access." });
  };

  const downloadImage = (item: ForgeResult) => {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = `axs-${item.seed ?? Date.now()}.png`;
    link.click();
  };

  const addToDna = (item: ForgeResult) => {
    if (!character) {
      toast.info("Select a character first to add this image to DNA.");
      return;
    }
    updateCharacter(character.id, { portraitDataUrl: item.url, seed: item.seed ?? character.seed });
    toast.success(`${character.name} DNA preview updated`);
  };

  return (
    <div className="axs-module-page text-white">
      <div className="hidden" />
      <div className="hidden" />
      <svg className="hidden" viewBox="0 0 1400 1200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="imageForgeEnergyLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="35%" stopColor="#F6D57A" stopOpacity=".72" />
            <stop offset="70%" stopColor="#D4AF37" stopOpacity=".58" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          <filter id="imageForgeGlowLine"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path d="M-80 260 C 280 160, 470 360, 730 300 S 1080 150, 1510 230" stroke="url(#imageForgeEnergyLine)" strokeWidth="3" fill="none" filter="url(#imageForgeGlowLine)" />
        <path d="M-90 760 C 260 620, 470 790, 760 705 S 1120 540, 1510 620" stroke="url(#imageForgeEnergyLine)" strokeWidth="2.5" fill="none" filter="url(#imageForgeGlowLine)" />
      </svg>

      <div className="relative z-10 w-full min-w-0">
        <section className="mb-5 w-full rounded-[28px] border border-amber-300/20 bg-slate-950/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-200/70">Visual Forge</p>
              <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">Images</h1>
              <p className="mt-3 max-w-3xl text-slate-300">Generate production-grade visuals, lock characters, train style consistency, and push finished frames straight into video or campaigns.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Quick Start", "Inspiration", "Batch Creator", "Canvas Studio"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    if (item === "Quick Start") setDraftPrompt("Premium cinematic portrait, black and gold studio lighting, consistent Character DNA, production still.");
                    if (item === "Batch Creator") setGenerationMode("variation");
                    if (item === "Canvas Studio") setActiveTab("scene");
                    toast.success(`${item} selected`, { description: "Image Forge updated the local workspace." });
                  }}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-200"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CommandMetric label="Total images" value={gallery.length > 0 ? String(gallery.length) : "3,842"} delta="+128 this week" Icon={ImageIcon} accent="cyan" />
          <CommandMetric label="Active DNA" value={character?.name ?? "No lock"} delta={character ? "Character locked" : "Select character"} Icon={Dna} accent="violet" />
          <CommandMetric label="Workflow" value={settings.comfyuiModel ? "Auto-fit" : "Default"} delta={settings.comfyuiModel || "ComfyUI"} Icon={WandSparkles} accent="gold" />
          <CommandMetric label="Proof score" value={`${proof.overallScore}%`} delta={proof.status} Icon={Lock} accent="cyan" />
        </section>
        <main className="mx-auto grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(28rem,1fr)] 2xl:grid-cols-[minmax(0,0.92fr)_minmax(32rem,1.08fr)]">
          <div className="min-w-0 space-y-5">
            <GlassPanel className="p-6 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/14 bg-cyan-300/[0.07] px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-100/64">
                    <Dna className="size-4" />
                    Reference / FaceLock
                  </div>
                  <h1 className="mt-6 max-w-xl text-[clamp(2.5rem,4.3vw,4.8rem)] font-black leading-[.94] tracking-tight text-white">
                    Visual production lab.
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-white/54">
                    Upload face, body, style, and outfit references, then lock Character DNA from Character Studio or Universe Forge before generating.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <ProofBadge label="DNA Proof" score={proof.categories.identity.score} status={proof.categories.identity.status} />
                    <ProofBadge label="Workflow Fit" score={proof.categories.workflow.score} status={proof.categories.workflow.status} />
                    <ProofBadge label="Continuity" score={proof.categories.continuity.score} status={proof.categories.continuity.status} />
                  </div>
                  <div className="mt-4 max-w-xl">
                    <ProofBadge
                      label="Image Workflow Proof"
                      score={proof.categories.workflow.score}
                      status={proof.categories.workflow.status}
                      detail={workflowDetail}
                      variant="full"
                    />
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/[0.12] bg-black/28 p-4 text-right">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/32">DNA Source</div>
                  <div className="mt-1 max-w-44 truncate text-lg font-black text-white">
                    {character?.name ?? selectedUniverseCharacter?.name ?? "Unclaimed"}
                  </div>
                  <div className="mt-1 text-xs font-bold text-cyan-50/42">
                    {character ? `seed ${character.seed}` : selectedUniverseCharacter ? "Universe memory" : "Add a reference"}
                  </div>
                </div>
              </div>

              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                {REFERENCE_SLOTS.map((slot) => {
                  const reference = references.find((item) => item.slot === slot.id);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setActiveSlot(slot.id);
                        fileInputRef.current?.click();
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleDrop(event, slot.id)}
                      className={cn(
                        "group relative min-h-44 overflow-hidden rounded-[32px] border p-4 text-left transition hover:-translate-y-0.5",
                        reference
                          ? "border-cyan-200/28 bg-cyan-300/[0.08] shadow-[0_0_46px_rgba(0,212,255,0.14)]"
                          : "border-white/[0.13] bg-black/26 hover:border-white/24"
                      )}
                    >
                      {reference ? (
                        <img src={reference.dataUrl} alt={reference.name} className="absolute inset-0 size-full object-cover opacity-72 transition group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_35%)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/20 to-transparent" />
                      <div className="relative flex h-full min-h-36 flex-col justify-between">
                        <div className="flex size-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.07] backdrop-blur-xl">
                          {reference ? <Check className="size-5 text-cyan-100" /> : <Upload className="size-5 text-white/56" />}
                        </div>
                        <div>
                          <div className="text-xl font-black text-white">{slot.label}</div>
                          <div className="mt-1 text-sm font-semibold text-white/44">{reference?.name ?? slot.helper}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />

              <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_220px]">
                <div className="rounded-[30px] border border-white/[0.12] bg-black/28 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <Label className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">FaceLock Strength</Label>
                    <span className="rounded-full border border-cyan-200/16 bg-cyan-300/[0.08] px-3 py-1 text-sm font-black text-cyan-50/82">
                      {faceLockStrength.toFixed(2)}
                    </span>
                  </div>
                  <Slider value={[faceLockStrength]} min={0} max={1} step={0.01} onValueChange={(value) => setFaceLockStrength(getSliderNumber(value, faceLockStrength, 0, 1))} />
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-violet-300 to-fuchsia-300"
                      animate={{ width: `${faceLockStrength * 100}%` }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleMatchLock}
                  className="rounded-[30px] bg-gradient-to-r from-cyan-200 via-violet-300 to-fuchsia-300 px-6 py-5 text-left text-black shadow-[0_0_74px_rgba(168,85,247,0.48)] transition hover:brightness-110"
                >
                  <Lock className="size-5" />
                  <div className="mt-4 text-xl font-black">Match & Lock</div>
                  <div className="mt-1 text-xs font-black text-black/52">Calibrate DNA</div>
                </button>
              </div>
            </GlassPanel>

            <GlassPanel className="p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-violet-100/50">
                    <WandSparkles className="size-4" />
                    Prompt Studio
                  </div>
                  <h2 className="mt-3 text-4xl font-black tracking-tight text-white">Command the image.</h2>
                </div>
                <div className="text-right text-xs font-bold text-white/34">
                  Est. ${estimatedCost.toFixed(4)}
                </div>
              </div>

              <div className="mt-8 space-y-7">
                <Field label="Positive prompt">
                  <Textarea
                    value={draftPrompt}
                    onChange={(event) => setDraftPrompt(event.target.value)}
                    rows={7}
                    placeholder="Describe the image: composition, emotion, wardrobe, camera, lighting, and world context..."
                    className="mt-3 min-h-48 resize-none rounded-[30px] border-white/[0.12] bg-black/28 px-5 py-5 text-base leading-7 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  />
                </Field>

                <div>
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/44">Quick Tags / Mentions</Label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(character ? [`@${character.name}`] : selectedUniverseCharacter ? [`@${selectedUniverseCharacter.name}`] : []).concat(QUICK_TAGS).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setDraftPrompt(`${draftPrompt}${draftPrompt.trim() ? ", " : ""}${tag}`)}
                        className="rounded-full border border-white/[0.10] bg-white/[0.045] px-3 py-2 text-xs font-black text-white/54 transition hover:border-cyan-200/28 hover:bg-cyan-300/[0.08] hover:text-white"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Negative prompt">
                  <Textarea
                    value={draftNegative}
                    onChange={(event) => setDraftNegative(event.target.value)}
                    rows={3}
                    placeholder="identity drift, bad hands, low quality, text, watermark..."
                    className="mt-3 resize-none rounded-[26px] border-white/[0.12] bg-black/28 px-5 py-4 text-white"
                  />
                </Field>

                <div>
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/44">Style Presets</Label>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {STYLE_PRESETS.map((preset) => {
                      const active = settings.stylePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => updateSettings({ stylePreset: preset.id })}
                          className={cn(
                            "relative overflow-hidden rounded-[26px] border p-4 text-left transition",
                            active ? "border-cyan-200/34 bg-cyan-300/[0.08]" : "border-white/[0.10] bg-black/24 hover:border-white/22"
                          )}
                        >
                          <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", preset.className)} />
                          <div className="font-black text-white">{preset.label}</div>
                          <div className="mt-1 text-xs font-semibold text-white/38">{preset.detail}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/44">Generation Mode</Label>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {GENERATION_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setGenerationMode(mode.id)}
                        className={cn(
                          "rounded-[24px] border p-4 text-left transition",
                          generationMode === mode.id ? "border-violet-200/38 bg-violet-300/[0.10]" : "border-white/[0.10] bg-black/24 hover:border-white/22"
                        )}
                      >
                        <div className="text-sm font-black text-white">{mode.label}</div>
                        <div className="mt-1 text-xs font-semibold text-white/36">{mode.detail}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <ControlSlider label="Consistency" value={consistency} min={0} max={1} step={0.01} onChange={setConsistency} />
                  <ControlSlider label="Steps" value={settings.steps} min={8} max={50} step={1} onChange={(steps) => updateSettings({ steps })} />
                  <ControlSlider label="Guidance" value={settings.guidance} min={1} max={10} step={0.1} onChange={(guidance) => updateSettings({ guidance })} />
                  <ControlSlider label="Upscale" value={settings.upscaleFactor} min={1} max={2} step={0.5} suffix="x" onChange={(upscaleFactor) => updateSettings({ upscaleFactor })} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <ToggleCard label="Body Reference Lock" detail="Preserve silhouette, posture, and wardrobe proportions." enabled={bodyLockEnabled} onClick={() => setBodyLockEnabled(!bodyLockEnabled)} />
                  <ToggleCard label="Seed Lock" detail={character ? `Use ${character.name}'s seed when available.` : "Keep the same seed behavior across variations."} enabled={seedLocked} onClick={() => setSeedLocked(!seedLocked)} />
                </div>

                <div>
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/44">Aspect Ratio</Label>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {ASPECTS.map((aspect) => {
                      const active = settings.width === aspect.width && settings.height === aspect.height;
                      return (
                        <button
                          key={aspect.label}
                          type="button"
                          onClick={() => updateSettings({ width: aspect.width, height: aspect.height })}
                          className={cn(
                            "rounded-2xl border px-3 py-3 text-sm font-black transition",
                            active ? "border-cyan-200/36 bg-cyan-300/[0.10] text-cyan-50" : "border-white/[0.10] bg-black/22 text-white/42 hover:text-white"
                          )}
                        >
                          {aspect.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>

          <div className="min-w-0 space-y-5">
            <GlassPanel className="xl:sticky xl:top-24 rounded-[34px] p-6 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100/52">
                    <ImageIcon className="size-4" />
                    Live Preview
                  </div>
                  <h2 className="mt-3 max-w-2xl text-[clamp(2rem,3.4vw,4rem)] font-black tracking-tight text-white">
                    {previewResult ? "Latest Forge" : "Ready for Image DNA"}
                  </h2>
                </div>
                <Button
                  type="button"
                  onClick={copyPrompt}
                  className="rounded-full border border-white/12 bg-white/[0.08] px-4 text-sm font-black text-white hover:bg-white hover:text-black"
                >
                  <Copy className="size-4" />
                  Copy Prompt
                </Button>
              </div>

              <div className="mt-9 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_72px_rgba(0,0,0,0.40)]">
                  <div className="aspect-[4/5] max-h-[min(64vh,680px)] min-h-[360px]">
                    <AnimatePresence mode="wait">
                      {previewResult ? (
                        <motion.img
                          key={previewResult.id}
                          src={previewResult.url}
                          alt="Latest forged result"
                          initial={{ opacity: 0, scale: 1.015 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.99 }}
                          className="size-full object-cover"
                        />
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_50%_24%,rgba(0,212,255,0.16),transparent_26%),radial-gradient(circle_at_50%_62%,rgba(168,85,247,0.24),transparent_38%),linear-gradient(145deg,#070B14,#030406)]"
                        >
                          <div className="max-w-md text-center">
                            <div className="mx-auto flex size-32 items-center justify-center rounded-[38px] border border-white/[0.14] bg-white/[0.065] backdrop-blur-2xl">
                              <Camera className="size-12 text-white/54" />
                            </div>
                            <div className="mt-7 text-2xl font-black text-white">Ready for Character DNA</div>
                            <div className="mt-3 text-sm leading-7 text-white/44">
                              Add a prompt, upload references, or pull a character from Universe Forge.
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className={cn("absolute inset-x-10 bottom-0 h-1.5 rounded-full bg-gradient-to-r", activeStyle.className)} />
                  {generating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/72 backdrop-blur-md">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                          className="mx-auto size-16 rounded-full border-2 border-cyan-200 border-t-transparent"
                        />
                        <div className="mt-4 text-sm font-black text-white">{progressNote}</div>
                        <div className="mt-3 w-56 overflow-hidden rounded-full bg-white/10">
                          <div className="h-2 rounded-full bg-gradient-to-r from-cyan-200 to-fuchsia-300 transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <PreviewMetric label="DNA Score" value={`${referenceScore}%`} />
                  <PreviewMetric label="Style" value={activeStyle.label} />
                  <PreviewMetric label="Mode" value={selectedMode.label} />
                  <PreviewMetric label="Resolution" value={`${settings.width}x${settings.height}`} />
                  <PreviewMetric label="Quality" value={quality} />
                  <PreviewMetric label="References" value={`${references.length}/4 active`} />
                  <div className="rounded-[28px] border border-white/[0.11] bg-black/26 p-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30">Prompt Memory</div>
                    <p className="mt-3 line-clamp-8 text-sm font-semibold leading-7 text-white/50">
                      {composedPrompt || "Your final composed prompt will appear here instantly."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-9 grid gap-4 md:grid-cols-[1fr_240px]">
                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="h-20 rounded-full bg-gradient-to-r from-[#F6D57A] via-[#D4AF37] to-[#8B6F2F] text-lg font-black text-black shadow-[0_0_70px_rgba(212,175,55,0.30)] hover:brightness-110"
                >
                  {generating ? <Sparkles className="size-5 animate-pulse" /> : <Zap className="size-5" />}
                  Forge Images Now
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setGenerationMode("variation");
                    handleGenerate();
                  }}
                  disabled={generating || !previewResult}
                  title={!previewResult ? "Generate or select an image before re-forging." : "Create a variation from the latest image."}
                  variant="outline"
                  className="h-24 rounded-full border-white/12 bg-white/[0.065] px-6 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white hover:text-black"
                >
                  <RefreshCw className="size-4" />
                  Re-forge
                </Button>
              </div>
            </GlassPanel>
          </div>
        </main>

        <GallerySection
          images={recentImages}
          onUseInScene={() => setActiveTab("scene")}
          onMotion={() => setActiveTab("videos")}
          onDownload={downloadImage}
          onDelete={removeFromGallery}
          onAddToDna={addToDna}
        />
      </div>
    </div>
  );
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/44">{label}</Label>
      {children}
    </label>
  );
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const safeValue = getSliderNumber(value, min, min, max);
  return (
    <div className="rounded-[28px] border border-white/[0.10] bg-black/24 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Label className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">{label}</Label>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-cyan-50/76">
          {safeValue.toFixed(step >= 1 ? 0 : 2)}{suffix}
        </span>
      </div>
      <Slider value={[safeValue]} min={min} max={max} step={step} onValueChange={(next) => onChange(getSliderNumber(next, safeValue, min, max))} />
    </div>
  );
}

function ToggleCard({
  label,
  detail,
  enabled,
  onClick,
}: {
  label: string;
  detail: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="rounded-[28px] border border-white/[0.10] bg-black/24 p-5 text-left transition hover:border-white/22">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-black text-white">{label}</div>
          <div className="mt-1 text-xs font-semibold text-white/40">{detail}</div>
        </div>
        <span className={cn("relative block h-6 w-12 rounded-full border transition", enabled ? "border-cyan-200/30 bg-cyan-300/30" : "border-white/12 bg-white/[0.06]")}>
          <span className={cn("absolute top-1 size-4 rounded-full bg-white shadow transition", enabled ? "left-7" : "left-1")} />
        </span>
      </div>
    </button>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/[0.11] bg-black/26 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30">{label}</div>
      <div className="mt-1 truncate text-sm font-black capitalize text-white/72">{value}</div>
    </div>
  );
}

function GallerySection({
  images,
  onUseInScene,
  onMotion,
  onDownload,
  onDelete,
  onAddToDna,
}: {
  images: ForgeResult[];
  onUseInScene: () => void;
  onMotion: () => void;
  onDownload: (item: ForgeResult) => void;
  onDelete: (id: string) => void;
  onAddToDna: (item: ForgeResult) => void;
}) {
  return (
    <GlassPanel className="mx-auto mt-10 p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100/50">
            <Layers3 className="size-4" />
            Recent Generations
          </div>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-white">Image command wall</h2>
        </div>
        <Button type="button" variant="outline" className="rounded-full border-white/12 bg-white/[0.05] text-white/62 hover:bg-white hover:text-black">
          Load More
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
        {images.length === 0 && (
          <div className="col-span-full rounded-[34px] border border-dashed border-white/[0.14] bg-black/20 p-16 text-center">
            <ImagePlus className="mx-auto size-10 text-white/30" />
            <div className="mt-4 text-xl font-black text-white">No generated images yet</div>
            <div className="mt-2 text-sm text-white/42">Your forged frames will appear here with studio actions.</div>
          </div>
        )}
        {images.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative aspect-[4/5] overflow-hidden rounded-[30px] border border-white/[0.12] bg-black/30 shadow-[0_28px_90px_rgba(0,0,0,0.34)]"
          >
            <img src={item.url} alt={item.prompt} className="size-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/18 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="absolute inset-x-3 bottom-3 translate-y-4 space-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
              <div className="truncate rounded-full border border-white/10 bg-black/44 px-3 py-2 text-[10px] font-black text-white/58 backdrop-blur-xl">
                seed {item.seed ?? "random"}
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                <GalleryAction label="Scene" icon={<Send className="size-3.5" />} onClick={onUseInScene} />
                <GalleryAction label="Motion" icon={<WandSparkles className="size-3.5" />} onClick={onMotion} />
                <GalleryAction label="DNA" icon={<Dna className="size-3.5" />} onClick={() => onAddToDna(item)} />
                <GalleryAction label="Save" icon={<Download className="size-3.5" />} onClick={() => onDownload(item)} />
                <GalleryAction label="Delete" icon={<Trash2 className="size-3.5" />} onClick={() => onDelete(item.id)} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassPanel>
  );
}

function GalleryAction({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.08] text-white/70 backdrop-blur-xl transition hover:bg-white hover:text-black"
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

function slotLabel(slot: ReferenceSlot) {
  return slot === "body" ? "Full body" : slot[0].toUpperCase() + slot.slice(1);
}
