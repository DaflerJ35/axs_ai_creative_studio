import React, { useEffect, useRef, useMemo, useState, useReducer, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Sparkles, Wand2, Download, Layers, Settings2, Gauge, Ratio,
  User as UserIcon, X, ImagePlus, Cpu, Lock, Unlock, Key, ChevronDown,
  ChevronUp, Dna, Camera, Sun, Zap, RefreshCw, Plus,
} from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { GlassCard } from "../ui/glass-card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";
import { useNyxStore, useActiveCharacter } from "../../store/useNyxStore";
import { forgeImage, estimateImageCost } from "../../lib/workflows";
import { composeFromCharacter } from "../../lib/composePrompt";
import {
  lockStateReducer, INITIAL_LOCK_STATE,
  loadPersistedLockState, savePersistedLockState,
} from "../../lib/lockState";
import { testComfyUIConnection, detectModelType, getModelSpec } from "../../lib/comfyui";
import type { StylePreset } from "../../lib/types";

// ── Constants ─────────────────────────────────────────────────────────────

const STYLE_CHIPS: { id: StylePreset; label: string; color: string }[] = [
  { id: "portrait",    label: "Hyper Portrait",    color: "from-cyan-400 to-blue-500" },
  { id: "editorial",   label: "Fashion Editorial", color: "from-pink-400 to-rose-500" },
  { id: "cinematic",   label: "Cinematic",         color: "from-orange-400 to-red-500" },
  { id: "concept_art", label: "Concept Art",       color: "from-violet-400 to-purple-500" },
  { id: "product",     label: "Product Shot",      color: "from-emerald-400 to-teal-500" },
  { id: "anime",       label: "Anime",             color: "from-fuchsia-400 to-pink-500" },
  { id: "raw",         label: "Raw (no preset)",   color: "from-zinc-400 to-zinc-600" },
];

const ASPECTS: { label: string; w: number; h: number }[] = [
  { label: "1:1",  w: 1024, h: 1024 },
  { label: "4:5",  w: 896,  h: 1152 },
  { label: "3:4",  w: 832,  h: 1216 },
  { label: "9:16", w: 768,  h: 1344 },
  { label: "16:9", w: 1344, h: 768  },
];

const CAMERA_SIMS = [
  { value: "85mm_f18",   label: "85mm f/1.8 — Portrait" },
  { value: "50mm_f14",   label: "50mm f/1.4 — Natural" },
  { value: "35mm",       label: "35mm f/2.8 — Street" },
  { value: "iphone",     label: "iPhone 15 Pro — UGC" },
  { value: "anamorphic", label: "Anamorphic — Cinema" },
  { value: "telephoto",  label: "200mm Telephoto — Compressed" },
];

const LIGHTING_PRESETS = [
  { value: "natural",       label: "Natural Ambient" },
  { value: "golden_hour",   label: "Golden Hour" },
  { value: "rim_light",     label: "Dramatic Rim Light" },
  { value: "soft_overcast", label: "Soft Overcast" },
  { value: "studio",        label: "Professional Studio" },
  { value: "candlelight",   label: "Candlelight — Intimate" },
];

const CAMERA_PROMPT: Record<string, string> = {
  "85mm_f18":   "85mm f/1.8 portrait lens, shallow depth of field, beautiful bokeh",
  "50mm_f14":   "50mm f/1.4 lens, natural perspective, soft background separation",
  "35mm":       "35mm f/2.8, street photography aesthetic, environmental context",
  "iphone":     "shot on iPhone 15 Pro, natural computational photography, authentic UGC feel",
  "anamorphic": "anamorphic 2.4:1 widescreen lens, horizontal lens flares, cinematic squeeze",
  "telephoto":  "200mm telephoto, heavily compressed perspective, extreme background bokeh",
};

const LIGHTING_PROMPT: Record<string, string> = {
  "natural":       "natural ambient lighting, soft shadows",
  "golden_hour":   "golden hour warm sunlight, long soft shadows, orange glow",
  "rim_light":     "dramatic rim lighting, dark background, hair light, studio setup",
  "soft_overcast": "soft overcast daylight, perfectly diffused, no harsh shadows",
  "studio":        "professional studio lighting, key light + fill + rim, clean shadows",
  "candlelight":   "warm candlelight, intimate low-key, flickering warm tones",
};

const MODEL_TYPE_COLORS: Record<string, string> = {
  sdxl:  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  lora:  "bg-violet-500/20 text-violet-300 border-violet-500/30",
  flux:  "bg-orange-500/20 text-orange-300 border-orange-500/30",
  sd21:  "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  video: "bg-red-500/20 text-red-300 border-red-500/30",
};

const QUICK_ACTIONS = [
  {
    id: "best_full",
    label: "Best Full Body",
    icon: "⚡",
    color: "from-pink-500/20 to-rose-600/10 border-pink-500/30 hover:border-pink-400/60",
    prompt: "full body portrait, perfect anatomy, natural standing pose, flawless skin, cinematic lighting, photorealistic",
    batchSize: 1,
  },
  {
    id: "match_ref",
    label: "Match Reference",
    icon: "🎯",
    color: "from-cyan-500/20 to-blue-600/10 border-cyan-500/30 hover:border-cyan-400/60",
    prompt: "exact reference match, consistent character appearance, same lighting, same composition, hyper-consistent",
    batchSize: 1,
  },
  {
    id: "variations",
    label: "4 Variations",
    icon: "◈",
    color: "from-violet-500/20 to-purple-600/10 border-violet-500/30 hover:border-violet-400/60",
    prompt: null,
    batchSize: 4,
  },
];

interface RefImage {
  id: string;
  url: string;
  strength: number;
  type: "face" | "body" | "style";
}

// ── Component ─────────────────────────────────────────────────────────────

export const ImageForge = () => {
  const {
    settings, updateSettings, addToGallery,
    draftPrompt, setDraftPrompt,
    draftNegative, setDraftNegative,
    setActiveTab, updateCharacter,
  } = useNyxStore();
  const character = useActiveCharacter();

  // ── Model picker ──────────────────────────────────────────────────────────
  const [models, setModels] = useState<string[]>([]);
  const [loras, setLoras] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(
    () => localStorage.getItem("momentum.comfyuiModel") || ""
  );
  const [selectedLora, setSelectedLora] = useState<string>("");
  const [loraWeight, setLoraWeight] = useState(0.85);
  const [modelsLoading, setModelsLoading] = useState(false);

  useEffect(() => {
    setModelsLoading(true);
    testComfyUIConnection()
      .then(({ models: m, loras: l }) => {
        if (m && m.length > 0) {
          setModels(m);
          if (!selectedModel) setSelectedModel(m[0]);
        }
        if (l && l.length > 0) setLoras(l);
      })
      .catch(() => {})
      .finally(() => setModelsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modelType = selectedModel ? detectModelType(selectedModel) : null;

  // ── DNA lock state machine ─────────────────────────────────────────────────
  // Extracted to a pure reducer so it's independently testable (see lockState.test.ts).
  const [lockState, dispatch] = useReducer(lockStateReducer, INITIAL_LOCK_STATE);
  const prevCharIdRef = useRef<string | null>(null);

  // ── Per-generation tag overrides (ephemeral — never mutate saved DNA) ──────
  const [disabledTags, setDisabledTags] = useState<Set<string>>(new Set());
  const [disabledPersonality, setDisabledPersonality] = useState<Set<string>>(new Set());

  const toggleStyleTag = useCallback((tag: string) => {
    setDisabledTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  }, []);

  const togglePersonalityTag = useCallback((tag: string) => {
    setDisabledPersonality((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  }, []);

  const resetTags = useCallback(() => {
    setDisabledTags(new Set());
    setDisabledPersonality(new Set());
  }, []);

  // Hard reset + load persisted state on character switch
  useEffect(() => {
    const newId = character?.id ?? null;
    if (newId !== prevCharIdRef.current) {
      prevCharIdRef.current = newId;
      dispatch({ type: "CHARACTER_SWITCH" });
      setRefImages([]);
      setDisabledTags(new Set());
      setDisabledPersonality(new Set());
      // Bug 4 fix: load persisted state for character OR the global sentinel (null = no character)
      const persisted = loadPersistedLockState(newId);
      if (Object.keys(persisted).length > 0) {
        dispatch({ type: "LOAD_PERSISTED", state: persisted });
      }
    }
  }, [character?.id]);

  // Auto-apply character seed when locking with no seed set
  useEffect(() => {
    if (lockState.locked && lockState.lockedSeed == null && character?.seed != null) {
      dispatch({ type: "SET_SEED", seed: character.seed });
    }
  }, [lockState.locked, lockState.lockedSeed, character?.seed]);

  // Persist lock state to localStorage after every change.
  // Bug 4 fix: no longer gated on character?.id — uses sentinel key when no character.
  useEffect(() => {
    savePersistedLockState(character?.id ?? null, lockState);
  }, [character?.id, lockState]);

  // ── Multi-reference images ─────────────────────────────────────────────────
  const [refImages, setRefImages] = useState<RefImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeRefType, setActiveRefType] = useState<RefImage["type"]>("face");

  const addRefImage = (dataUrl: string) => {
    setRefImages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), url: dataUrl, strength: 0.75, type: activeRefType },
    ]);
  };

  const readRefFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => addRefImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRefDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) readRefFile(file);
  };

  // ── Generation state ───────────────────────────────────────────────────────
  const [generating, setGenerating] = useState(false);
  const [progressNote, setProgressNote] = useState<string>("");
  const [quality, setQuality] = useState<"realism" | "ultra" | "cinematic">("realism");
  const [results, setResults] = useState<{ dataUrl: string; seed: number; prompt: string }[]>([]);

  // ── Advanced settings ──────────────────────────────────────────────────────
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [realismBooster, setRealismBooster] = useState(true);
  const [cameraSimulation, setCameraSimulation] = useState("85mm_f18");
  const [lightingPreset, setLightingPreset] = useState("natural");
  const [anatomyFixer, setAnatomyFixer] = useState(0.7);

  const modelSpec = selectedModel ? getModelSpec(selectedModel, quality) : null;
  const estimatedCost = useMemo(() => estimateImageCost(settings), [settings]);

  // Bug 5 fix: live composed prompt preview — what FLUX actually receives.
  // Recalculates on every draft / tag toggle change without hitting the network.
  const composedPreview = useMemo(() => {
    if (!character && !draftPrompt.trim()) return null;
    return composeFromCharacter(character ?? null, {
      userPrompt:          draftPrompt,
      disabledStyleTags:   [...disabledTags],
      disabledPersonality: [...disabledPersonality],
    });
  }, [character, draftPrompt, disabledTags, disabledPersonality]);

  const [previewOpen, setPreviewOpen] = useState(false);

  const consistencyScore = useMemo(() => {
    if (!lockState.locked) return null;
    let score = 0;
    if (lockState.lockedSeed) score += 30;
    score += 20;
    if (lockState.faceIdEnabled) score += 15;
    if (lockState.bodyRefEnabled) score += 10;
    score += Math.min(refImages.length * 5, 20);
    if (realismBooster) score += 5;
    return Math.min(score, 100);
  }, [lockState, refImages.length, realismBooster]);

  const buildFinalPrompt = (base: string) => {
    let p = base;
    if (realismBooster) p += ", RAW photo, ultra-detailed skin texture, pore detail, photorealistic";
    if (cameraSimulation && cameraSimulation !== "none") p += `, ${CAMERA_PROMPT[cameraSimulation] || ""}`;
    if (lightingPreset && lightingPreset !== "natural") p += `, ${LIGHTING_PROMPT[lightingPreset] || ""}`;
    if (anatomyFixer > 0.5) p += ", perfect anatomy, correct hands, natural body proportions";
    if (lockState.locked && lockState.faceIdEnabled) p += ", consistent face identity, facial feature preservation";
    if (lockState.locked && lockState.bodyRefEnabled) p += ", consistent body proportions, full body reference locked";
    return p;
  };

  // ── LoRA precedence ────────────────────────────────────────────────────────
  // Resolution order:
  //   1. character.loraName (locked)   → full character weight
  //   2. character.loraName (unlocked) → 85% weight (allows drift)
  //   3. manual picker only            → user-controlled weight
  //
  // Bug 1 fix: when both are present, build a loras[] array for the
  // dual-LoraLoader workflow instead of silently dropping the picker LoRA.
  const charLoraActive = !!character?.loraName;
  const loraStacking = charLoraActive && !!selectedLora;

  const resolveLoRAs = (): Array<{ name: string; weight: number }> => {
    const result: Array<{ name: string; weight: number }> = [];
    if (character?.loraName) {
      const base = character.loraWeight ?? settings.characterLoraWeight;
      result.push({ name: character.loraName, weight: lockState.locked ? base : base * 0.85 });
    }
    // Picker LoRA stacked at a conservative weight to avoid overwhelming character DNA
    if (selectedLora) result.push({ name: selectedLora, weight: loraStacking ? Math.min(loraWeight, 0.4) : loraWeight });
    return result;
  };

  // ── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = async (overridePrompt?: string, overrideBatch?: number) => {
    const rawInput = (overridePrompt || draftPrompt).trim();

    if (!rawInput && !character) {
      toast.error("Add a prompt or load character DNA.");
      return;
    }
    if (!rawInput) { toast.error("Write a prompt first."); return; }
    if (!selectedModel) { toast.error("Pick a model first."); return; }

    // Warn if FaceID is on but no face-typed reference image was uploaded
    if (lockState.locked && lockState.faceIdEnabled &&
        refImages.filter((r) => r.type === "face").length === 0) {
      toast.warning("FaceID on but no face reference uploaded — using prompt-only face guidance.");
    }

    if (overrideBatch) updateSettings({ batchSize: overrideBatch });

    // Pre-compose: DNA (with per-gen overrides) → physical + personality + style + user
    const composed = composeFromCharacter(character, {
      userPrompt:         rawInput,
      disabledStyleTags:  [...disabledTags],
      disabledPersonality: [...disabledPersonality],
    });
    const finalPrompt = buildFinalPrompt(composed.prompt);
    const activeLoRAs = resolveLoRAs();

    // Bug 2 fix: route face-typed refs through faceRefImageDataUrl (0.88 denoise)
    // and body/style refs through referenceImageDataUrl (0.75 denoise).
    const faceRef  = lockState.faceIdEnabled  ? refImages.find((r) => r.type === "face")  : undefined;
    const bodyRef  = lockState.bodyRefEnabled ? refImages.find((r) => r.type === "body")  : undefined;
    const styleRef = refImages.find((r) => r.type === "style");
    // Priority: face (FaceID on) → body (BodyRef on) → style → first available
    const bodyStyleRef = bodyRef ?? styleRef ?? (faceRef ? undefined : refImages[0]);

    setGenerating(true);
    setProgressNote(refImages.length > 0 ? "Uploading reference…" : "Warming the furnace…");

    try {
      const out = await forgeImage({
        prompt:               finalPrompt,
        negativePrompt:       draftNegative,
        character:            null,  // pre-composed above; null prevents double-composition
        settings:             overrideBatch ? { ...settings, batchSize: overrideBatch } : settings,
        quality,
        model:                selectedModel,
        referenceImageDataUrl:  bodyStyleRef?.url,
        faceRefImageDataUrl:    faceRef?.url,
        faceRefStrength:        faceRef?.strength,
        loras:                  activeLoRAs.length > 0 ? activeLoRAs : undefined,
        seedOverride:           lockState.lockedSeed ?? undefined,
      });

      if (out.status !== "success" || !out.images?.length) {
        throw new Error(out.message || "No images returned");
      }

      setProgressNote("");
      const newResults = out.images.map((img) => ({
        dataUrl: `data:image/png;base64,${img.image}`,
        seed:    img.seed,
        prompt:  finalPrompt,
      }));

      // Record the seed in lock history
      if (lockState.locked && newResults[0]) {
        dispatch({ type: "GENERATION_COMPLETE", seed: newResults[0].seed });
      }

      setResults((r) => [...newResults, ...r].slice(0, 24));
      newResults.forEach((r, i) => {
        addToGallery({
          id: crypto.randomUUID(), type: "image", url: r.dataUrl, prompt: finalPrompt,
          seed: r.seed, characterId: character?.id, stylePreset: settings.stylePreset,
          width: settings.width, height: settings.height, createdAt: Date.now() + i, favorite: false,
        });
      });
      toast.success(`Forged ${newResults.length} image${newResults.length > 1 ? "s" : ""}`, {
        description: `Seed ${newResults[0].seed}`,
      });
    } catch (e: unknown) {
      const err = e as { message?: string; kind?: string };
      if (err?.kind === "lora_missing") {
        const loraNames = activeLoRAs.map((l) => l.name).join(", ");
        console.error(`[ImageForge] LoRA missing for character ${character?.id}:`, loraNames);
        toast.error("LoRA not found on server", {
          description: `Falling back to base model. Check that ${loraNames || "the LoRA"} is in the loras/ folder.`,
        });
      } else {
        toast.error("Forge failed", { description: err?.message || "Check ComfyUI is running." });
      }
    } finally {
      setGenerating(false);
      setProgressNote("");
    }
  };

  const downloadImage = (url: string, seed: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `nyx-${seed}.png`;
    a.click();
  };

  // Empty prompt AND no character → forge disabled
  const forgeDisabled = generating || !selectedModel || (!draftPrompt.trim() && !character);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">Image Forge</div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">Forge</span>{" "}
          the next frame
        </h1>
      </div>

      {/* ── MODEL PICKER ────────────────────────────────────────────────────── */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Cpu className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-white/70 uppercase tracking-wider">Model</span>
          </div>
          <div className="flex-1 min-w-0">
            {models.length > 0 ? (
              <Select value={selectedModel} onValueChange={(v) => {
                setSelectedModel(v);
                localStorage.setItem("momentum.comfyuiModel", v);
              }}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white font-medium">
                  <SelectValue placeholder="Pick a model…" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {models.map((m) => (
                    <SelectItem key={m} value={m}>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${MODEL_TYPE_COLORS[detectModelType(m)]}`}>
                          {detectModelType(m)}
                        </span>
                        <span className="truncate">{m}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-white/40">
                {modelsLoading ? "Connecting to ComfyUI…" : "ComfyUI not connected — start it and refresh"}
              </div>
            )}
          </div>
          {modelType && (
            <span className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full border font-bold uppercase ${MODEL_TYPE_COLORS[modelType]}`}>
              {modelType}
            </span>
          )}
        </div>

        {modelSpec && (
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px]">
            <span className={`font-bold ${modelSpec.fits10GB === "yes" ? "text-emerald-400" : modelSpec.fits10GB === "tight" ? "text-amber-400" : "text-red-400"}`}>
              {modelSpec.label}
            </span>
            <span className="text-white/50"><span className="text-white/80 font-semibold">~{modelSpec.vramGb} GB</span> VRAM</span>
            {modelSpec.ramOffloadGb > 0 && (
              <span className="text-amber-300/80">+<span className="font-semibold">{modelSpec.ramOffloadGb} GB</span> RAM offload</span>
            )}
            <span className="text-white/50">⏱ <span className="text-white/80 font-semibold">
              {modelSpec.genTime.min < 60
                ? `${modelSpec.genTime.min}–${modelSpec.genTime.max}s`
                : `${Math.round(modelSpec.genTime.min / 60)}–${Math.round(modelSpec.genTime.max / 60)} min`}
            </span> est.</span>
            {modelSpec.note && <span className="text-white/35 italic">{modelSpec.note}</span>}
          </div>
        )}

        {loras.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider shrink-0">+ LoRA</span>
              <div className="flex-1 min-w-0">
                <Select value={selectedLora} onValueChange={setSelectedLora}>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white/80 text-sm h-9">
                    <SelectValue placeholder="None (optional)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="">None</SelectItem>
                    {loras.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {selectedLora && (
                <div className="flex items-center gap-2 shrink-0 min-w-[140px]">
                  <span className="text-xs text-white/40 w-14 text-right tabular-nums">{loraWeight.toFixed(2)}</span>
                  <input type="range" min={0.1} max={1.0} step={0.05} value={loraWeight}
                    onChange={(e) => setLoraWeight(Number(e.target.value))}
                    className="flex-1 accent-violet-400 h-1" />
                </div>
              )}
            </div>
          </div>
        )}
      </GlassCard>

      {/* ── CHARACTER DNA PANEL ─────────────────────────────────────────────── */}
      {character ? (
        <GlassCard className={`transition-all duration-300 overflow-hidden ${
          lockState.locked
            ? "border-violet-500/50 shadow-[0_0_28px_rgba(139,92,246,0.25)]"
            : "border-white/10"
        }`}>
          {/* Top row: circular avatar + identity + Load DNA + lock button */}
          <div className="flex items-center gap-3 p-4">
            {/* Circular avatar — ring animates on lock state change (200ms) */}
            <div className={`w-14 h-14 rounded-full overflow-hidden bg-black shrink-0 ring-2 transition-all duration-200 ${
              lockState.locked
                ? "ring-violet-500/70 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
                : "ring-white/15"
            }`}>
              {character.portraitDataUrl
                ? <img src={character.portraitDataUrl} alt={character.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-white/30"><UserIcon className="w-5 h-5" /></div>
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Forging as</div>
              <div className="font-black text-base truncate">{character.name}</div>
              <div className="text-xs text-white/40 truncate">
                {[character.age && `${character.age}yo`, character.heritage].filter(Boolean).join(" · ")}
              </div>
            </div>

            {/* Load character DNA into prompt */}
            <button
              onClick={() => {
                const dna = [character.description, ...character.styleKeywords, ...character.personality]
                  .filter(Boolean).join(", ");
                setDraftPrompt(dna);
                toast.success("Character DNA loaded into prompt");
              }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-xs text-white/50 hover:border-cyan-400/40 hover:text-cyan-300 transition-all"
              title="Load character DNA into prompt"
            >
              <Wand2 className="w-3.5 h-3.5" /> Load DNA
            </button>

            {/* Lock button — when locked shows key icon + clickable seed value */}
            {lockState.locked ? (
              <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border border-violet-400/60 bg-violet-500/20 shadow-[0_0_16px_rgba(139,92,246,0.4)]">
                <Key className="w-3.5 h-3.5 text-violet-300 shrink-0" />
                <button
                  onClick={() => navigator.clipboard.writeText(String(lockState.lockedSeed ?? ""))}
                  className="font-mono text-xs text-violet-200 hover:text-white transition-colors"
                  title="Click to copy seed"
                >
                  {lockState.lockedSeed ?? "—"}
                </button>
                <button
                  onClick={() => dispatch({ type: "UNLOCK" })}
                  className="ml-1 p-0.5 rounded text-violet-400/60 hover:text-violet-300 transition-colors"
                  title="Unlock DNA"
                >
                  <Unlock className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => dispatch({ type: "LOCK" })}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-violet-400/30 text-violet-400 hover:border-violet-400/60 hover:bg-violet-500/10 text-sm font-black transition-all"
              >
                <Lock className="w-3.5 h-3.5" /> LOCK DNA
              </button>
            )}
          </div>

          {/* Personality + style tags — always visible, click to toggle for this gen */}
          {(character.personality.length > 0 || character.styleKeywords.length > 0) && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5 items-center">
              {character.personality.map((t) => {
                const off = disabledPersonality.has(t);
                return (
                  <button key={t} onClick={() => togglePersonalityTag(t)}
                    title={off ? "Click to re-enable for this generation" : "Click to exclude from this generation"}
                    className={`group relative text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                      off
                        ? "border-white/10 bg-white/5 text-white/25 line-through"
                        : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-400/15"
                    }`}>
                    {t}
                    {!off && <X className="w-2.5 h-2.5 ml-1 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                );
              })}
              {character.styleKeywords.map((t) => {
                const off = disabledTags.has(t);
                return (
                  <button key={t} onClick={() => toggleStyleTag(t)}
                    title={off ? "Click to re-enable for this generation" : "Click to exclude from this generation"}
                    className={`group relative text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                      off
                        ? "border-white/10 bg-white/5 text-white/25 line-through"
                        : "border-violet-400/20 bg-violet-400/10 text-violet-300 hover:border-violet-400/50 hover:bg-violet-400/15"
                    }`}>
                    {t}
                    {!off && <X className="w-2.5 h-2.5 ml-1 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                );
              })}
              {(disabledTags.size > 0 || disabledPersonality.size > 0) && (
                <button onClick={resetTags}
                  className="text-[10px] text-white/30 hover:text-violet-300 underline underline-offset-2 transition-colors ml-1">
                  Reset to character defaults
                </button>
              )}
            </div>
          )}

          {/* Unlocked nudge */}
          {!lockState.locked && (
            <div className="mx-4 mb-4 px-4 py-3 rounded-xl bg-violet-500/8 border border-violet-500/20 flex items-center gap-3">
              <Dna className="w-4 h-4 text-violet-400 shrink-0" />
              <div className="text-xs text-white/60 flex-1">
                Lock the DNA to freeze the seed, enforce the character's LoRA, and inject consistency terms into every generation.
              </div>
              <button
                onClick={() => dispatch({ type: "LOCK" })}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-400/40 text-violet-200 text-xs font-bold hover:bg-violet-500/30 transition-colors"
              >
                Lock Now
              </button>
            </div>
          )}

          {/* Locked controls */}
          <AnimatePresence>
            {lockState.locked && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1 grid md:grid-cols-3 gap-4 border-t border-white/[0.06]">

                  {/* Consistency strength */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-white/50 flex items-center gap-1.5">
                        <Dna className="w-3 h-3 text-violet-400" /> Consistency
                      </span>
                      <span className="text-xs font-bold text-violet-300 tabular-nums">
                        {lockState.consistencyStrength.toFixed(2)}
                      </span>
                    </div>
                    <input type="range" min={0.6} max={1.2} step={0.05}
                      value={lockState.consistencyStrength}
                      onChange={(e) => {
                        // Bug 3 fix: guard against parseFloat("") → NaN
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) dispatch({ type: "SET_CONSISTENCY_STRENGTH", value: v });
                      }}
                      className="w-full accent-violet-400 h-1" />
                    <div className="flex justify-between text-[10px] text-white/25 mt-0.5">
                      <span>Flexible</span><span>Rigid</span>
                    </div>
                  </div>

                  {/* FaceID + BodyRef toggles */}
                  <div className="space-y-2">
                    {([
                      { label: "FaceID + IP-Adapter", action: "TOGGLE_FACE_ID" as const, active: lockState.faceIdEnabled },
                      { label: "Body Reference Lock",  action: "TOGGLE_BODY_REF" as const, active: lockState.bodyRefEnabled },
                    ]).map(({ label, action, active }) => (
                      <button key={label} onClick={() => dispatch({ type: action })}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                          active
                            ? "border-violet-500/40 bg-violet-500/10 text-violet-200"
                            : "border-white/10 text-white/40 hover:border-white/20"
                        }`}>
                        {label}
                        <div className={`w-8 h-4 rounded-full transition-colors relative ${active ? "bg-violet-500" : "bg-white/10"}`}>
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${active ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Seed display + history + LoRA status */}
                  <div className="space-y-2">
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Active seed</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-2 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-xs font-mono text-violet-200 truncate">
                          {lockState.lockedSeed ?? "—"}
                        </div>
                        <button
                          onClick={() => dispatch({ type: "RESET_TO_CHARACTER_SEED", characterSeed: character.seed })}
                          title="Reset to character's saved seed"
                          className="p-1.5 rounded-lg border border-white/10 hover:border-violet-400/40 hover:text-violet-300 transition-all">
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => dispatch({ type: "RANDOMIZE_SEED" })}
                          title="New random seed"
                          className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-400/40 hover:text-cyan-300 transition-all">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Recent seeds — last 5 for this character */}
                    {lockState.seedHistory.length > 0 && (
                      <div>
                        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Recent</div>
                        <div className="flex flex-wrap gap-1">
                          {lockState.seedHistory.map((seed) => (
                            <button key={seed}
                              onClick={() => dispatch({ type: "SET_SEED", seed })}
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all ${
                                lockState.lockedSeed === seed
                                  ? "border-violet-400/60 bg-violet-500/20 text-violet-200"
                                  : "border-white/10 text-white/30 hover:border-violet-400/40 hover:text-violet-300"
                              }`}>
                              {seed}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LoRA status — stacking chip when both character + manual LoRAs active */}
                    {loraStacking ? (
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25">
                        <Layers className="w-3 h-3 text-amber-400 shrink-0" />
                        <div className="text-[10px] text-amber-300 leading-tight">
                          Character LoRA + picker LoRA stacked (capped at 0.40 weight)
                        </div>
                      </div>
                    ) : charLoraActive ? (
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                        <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                        <div className="text-[10px] text-emerald-300 truncate">
                          Character LoRA: <span className="font-mono font-bold">
                            {character.loraName!.replace(/\.safetensors$/i, "")}
                          </span>
                        </div>
                      </div>
                    ) : selectedLora ? (
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25">
                        <Layers className="w-3 h-3 text-amber-400 shrink-0" />
                        <div className="text-[10px] text-amber-300 truncate">
                          Picker LoRA: {selectedLora.replace(/\.safetensors$/i, "")}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      ) : (
        /* No character nudge */
        <div className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-white/10 text-white/40">
          <UserIcon className="w-5 h-5 shrink-0" />
          <div className="text-sm flex-1">
            No character selected —{" "}
            <button onClick={() => setActiveTab("studio")}
              className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">
              go to Studio
            </button>{" "}
            to build and lock one for consistent results.
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── CONTROLS ──────────────────────────────────────────────────────── */}
        <GlassCard className="lg:col-span-3 p-6 md:p-8 space-y-6">

          {/* Prompt */}
          <div>
            <Label className="flex items-center gap-2"><Wand2 className="w-4 h-4" /> Prompt</Label>
            <Textarea rows={4} value={draftPrompt} onChange={(e) => setDraftPrompt(e.target.value)}
              placeholder="walking through Tokyo neon-lit streets at night, leather jacket, rain reflections…"
              className="text-base" />

            {/* Bug 5 fix: live composed-prompt preview — shows what FLUX actually receives */}
            {composedPreview && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-violet-300 transition-colors"
                >
                  {previewOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Composed prompt preview
                  <span className="text-white/20 ml-1">~{composedPreview.approxTokens} tokens</span>
                </button>
                <AnimatePresence>
                  {previewOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-[11px] text-white/50 leading-relaxed font-mono break-all">
                        {composedPreview.prompt || <span className="text-white/20 italic">Nothing composed yet — add a prompt or load character DNA.</span>}
                      </div>
                      {composedPreview.needsCompression && (
                        <div className="mt-1 text-[10px] text-amber-400/80 flex items-center gap-1">
                          <span>⚠</span> Prompt exceeds ~250 tokens — consider trimming for best results.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div>
            <Label>Negative prompt</Label>
            <Textarea rows={2} value={draftNegative || settings.defaultNegative}
              onChange={(e) => setDraftNegative(e.target.value)}
              placeholder="blurry, deformed, watermark…" />
          </div>

          {/* Reference images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4" /> Reference Images
                <span className="text-white/30 font-normal text-xs">(optional · img2img)</span>
              </Label>
              <div className="flex gap-1">
                {(["face", "body", "style"] as const).map((t) => (
                  <button key={t} onClick={() => setActiveRefType(t)}
                    className={`text-[10px] px-2 py-0.5 rounded border font-semibold uppercase transition-all ${
                      activeRefType === t ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-white/30 hover:text-white/60"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2">
              {refImages.map((ref) => (
                <div key={ref.id} className="relative rounded-xl overflow-hidden border border-white/10 group">
                  <img src={ref.url} alt="" className="w-full aspect-square object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] uppercase font-bold px-1.5 rounded ${
                        ref.type === "face" ? "bg-violet-500/40 text-violet-200" :
                        ref.type === "body" ? "bg-cyan-500/40 text-cyan-200" : "bg-pink-500/40 text-pink-200"
                      }`}>{ref.type}</span>
                      <button onClick={() => setRefImages((r) => r.filter((x) => x.id !== ref.id))}
                        className="text-white/40 hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <input type="range" min={0.1} max={1.0} step={0.05} value={ref.strength}
                      onChange={(e) => setRefImages((r) => r.map((x) => x.id === ref.id ? { ...x, strength: Number(e.target.value) } : x))}
                      className="w-full accent-cyan-400 h-0.5" />
                    <span className="text-[9px] text-white/40 tabular-nums">{ref.strength.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {refImages.length < 6 && (
                <div
                  className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-white/25 flex flex-col items-center justify-center cursor-pointer text-white/30 hover:text-white/50 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleRefDrop}
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] mt-1 capitalize">{activeRefType}</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) readRefFile(f); }} />
            {refImages.length > 0 && (
              <div className="text-[11px] text-white/30">
                First image used for img2img · strength sliders control blending
              </div>
            )}
          </div>

          {/* Style preset */}
          <div>
            <Label>Style preset</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {STYLE_CHIPS.map((s) => {
                const on = settings.stylePreset === s.id;
                return (
                  <button key={s.id} type="button" onClick={() => updateSettings({ stylePreset: s.id })}
                    className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all border ${on ? "border-white/30 text-white" : "border-white/10 text-white/60 hover:text-white hover:border-white/20"}`}>
                    {on && <motion.div layoutId="active-style" className={`absolute inset-0 rounded-full bg-gradient-to-r ${s.color} opacity-30`} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                    <span className="relative">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality tier */}
          <div>
            <Label>Quality tier</Label>
            <div className="flex gap-2 mt-2">
              {(["realism", "ultra", "cinematic"] as const).map((q) => {
                const on = quality === q;
                const colors = { realism: "from-emerald-400 to-teal-500", ultra: "from-violet-400 to-purple-600", cinematic: "from-orange-400 to-red-500" };
                const labels = { realism: "Realism", ultra: "Ultra HD", cinematic: "Cinematic" };
                return (
                  <button key={q} type="button" onClick={() => setQuality(q)}
                    className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${on ? "border-white/30 text-white" : "border-white/10 text-white/50 hover:text-white hover:border-white/20"}`}>
                    {on && <motion.div layoutId="active-quality" className={`absolute inset-0 rounded-xl bg-gradient-to-r ${colors[q]} opacity-25`} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                    <span className="relative">{labels[q]}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-white/30 mt-1.5">
              {quality === "realism" && "DPM++ 2M Karras · 30+15 steps · hi-res 1.5×"}
              {quality === "ultra" && "DPM++ 2M SDE Karras · 35+20 steps · hi-res 2× · Vogue-grade"}
              {quality === "cinematic" && "Euler A + DPM++ · 30+15 steps · ARRI Alexa color grade"}
            </div>
          </div>

          {/* Aspect */}
          <div>
            <Label className="flex items-center gap-2"><Ratio className="w-4 h-4" /> Aspect</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {ASPECTS.map((a) => {
                const on = settings.width === a.w && settings.height === a.h;
                return (
                  <button key={a.label} type="button" onClick={() => updateSettings({ width: a.w, height: a.h })}
                    className={`py-2 rounded-xl text-[11px] font-semibold border transition-all ${on ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-200" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "Steps",   icon: <Gauge className="w-4 h-4" />, key: "steps"         as const, min: 8,  max: 50,  step: 1,   fmt: (v: number) => `${v}` },
              { label: "Guidance",icon: null,                           key: "guidance"      as const, min: 1,  max: 10,  step: 0.1, fmt: (v: number) => v.toFixed(1) },
              { label: "Batch",   icon: <Layers className="w-4 h-4" />,key: "batchSize"     as const, min: 1,  max: 4,   step: 1,   fmt: (v: number) => `${v}` },
              { label: "Upscale", icon: null,                           key: "upscaleFactor" as const, min: 1,  max: 2,   step: 0.5, fmt: (v: number) => `${v.toFixed(1)}×` },
            ].map(({ label, icon, key, min, max, step, fmt }) => (
              <div key={key}>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">{icon} {label}</Label>
                  <span className="text-sm text-white/60 tabular-nums">{fmt(settings[key] as number)}</span>
                </div>
                <Slider value={[settings[key] as number]} min={min} max={max} step={step}
                  onValueChange={(v) => updateSettings({ [key]: Array.isArray(v) ? v[0] : v } as Parameters<typeof updateSettings>[0])} />
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2"><Settings2 className="w-4 h-4" /> Scheduler</Label>
              <Select value={settings.scheduler} onValueChange={(v) => updateSettings({ scheduler: v as "euler" | "euler_ancestral" | "dpm++" | "heun" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="euler">Euler</SelectItem>
                  <SelectItem value="euler_ancestral">Euler Ancestral</SelectItem>
                  <SelectItem value="dpm++">DPM++</SelectItem>
                  <SelectItem value="heun">Heun</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prompt enhancer</Label>
              <button type="button" onClick={() => updateSettings({ enhancePrompt: !settings.enhancePrompt })}
                className={`w-full h-10 rounded-md border px-3 text-sm font-semibold transition-all ${settings.enhancePrompt ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-100" : "border-white/10 text-white/50"}`}>
                {settings.enhancePrompt ? "On — adds realism tags" : "Off — raw prompt"}
              </button>
            </div>
          </div>

          {/* Advanced settings */}
          <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
            <button
              onClick={() => setAdvancedOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white/60 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Advanced Settings
              </span>
              {advancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {advancedOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-white/[0.07]">
                  <div className="p-4 space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">Realism Booster</div>
                        <div className="text-xs text-white/40">Injects RAW photo, skin texture, film grain terms</div>
                      </div>
                      <button onClick={() => setRealismBooster((v) => !v)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${realismBooster ? "bg-emerald-500" : "bg-white/10"}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${realismBooster ? "translate-x-7" : "translate-x-1"}`} />
                      </button>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2"><Camera className="w-4 h-4 text-cyan-400" /> Camera Simulation</Label>
                      <Select value={cameraSimulation} onValueChange={setCameraSimulation}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CAMERA_SIMS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2"><Sun className="w-4 h-4 text-amber-400" /> Lighting Preset</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {LIGHTING_PRESETS.map((l) => (
                          <button key={l.value} onClick={() => setLightingPreset(l.value)}
                            className={`px-2 py-2 rounded-xl text-[11px] font-semibold border transition-all text-center ${
                              lightingPreset === l.value ? "border-amber-400/60 bg-amber-400/10 text-amber-200" : "border-white/10 text-white/40 hover:border-white/25"
                            }`}>
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Anatomy Fixer</Label>
                        <span className="text-xs text-white/50 tabular-nums">{anatomyFixer.toFixed(2)}</span>
                      </div>
                      <Slider value={[anatomyFixer]} min={0} max={1} step={0.1}
                        onValueChange={(v) => setAnatomyFixer(Array.isArray(v) ? v[0] : v)} />
                      <div className="text-[11px] text-white/30 mt-1">Injects correct anatomy terms into prompt</div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold mb-2">Prompt Weight Helper</div>
                      <div className="text-xs text-white/40 mb-2">Wrap words in parentheses to emphasize</div>
                      <div className="flex flex-wrap gap-2">
                        {["(word:1.3)", "((strong))", "[de-emphasize]"].map((ex) => (
                          <button key={ex} onClick={() => {
                            const sel = window.getSelection()?.toString();
                            if (sel) setDraftPrompt(draftPrompt.replace(sel, `(${sel}:1.3)`));
                            else setDraftPrompt(draftPrompt + ` ${ex}`);
                          }}
                          className="text-[11px] px-2.5 py-1 rounded border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all font-mono">
                            {ex}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">Quick Actions</div>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_ACTIONS.map((qa) => (
                <button key={qa.id} type="button" disabled={generating}
                  onClick={() => {
                    if (qa.prompt) setDraftPrompt(qa.prompt);
                    if (qa.batchSize > 1) updateSettings({ batchSize: qa.batchSize });
                    handleGenerate(
                      qa.id === "variations" ? draftPrompt : (qa.prompt || draftPrompt),
                      qa.batchSize
                    );
                  }}
                  className={`relative py-2.5 px-3 rounded-xl border text-xs font-bold transition-all bg-gradient-to-br ${qa.color} text-white/80 hover:text-white disabled:opacity-40`}
                >
                  <span className="mr-1.5">{qa.icon}</span>{qa.label}
                </button>
              ))}
            </div>
          </div>

          {/* Forge button — pulses violet glow when DNA locked + prompt ready */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-xs text-white/40">
              Est. cost: <span className="text-white/70 font-semibold">${estimatedCost.toFixed(4)}</span>
            </div>
            <motion.div
              animate={lockState.locked && draftPrompt.trim() ? {
                boxShadow: [
                  "0 0 20px rgba(139,92,246,0.3)",
                  "0 0 44px rgba(139,92,246,0.75)",
                  "0 0 20px rgba(139,92,246,0.3)",
                ],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-2xl"
            >
              <Button
                onClick={() => handleGenerate()}
                disabled={forgeDisabled}
                title={!draftPrompt.trim() && !character ? "Add a prompt or load character DNA" : undefined}
                className="h-14 px-8 text-base font-black bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:brightness-110 shadow-[0_0_24px_rgba(192,38,211,0.3)]"
              >
                {generating
                  ? <><Sparkles className="w-5 h-5 mr-2 animate-pulse" />FORGING…</>
                  : <><Sparkles className="w-5 h-5 mr-2" />FORGE IMAGE</>}
              </Button>
            </motion.div>
          </div>

          {generating && (
            <div className="relative h-1 rounded-full bg-white/5 overflow-hidden">
              <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
            </div>
          )}
          {progressNote && <div className="text-xs text-white/50">{progressNote}</div>}
        </GlassCard>

        {/* ── RESULTS ──────────────────────────────────────────────────────── */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4 min-h-[500px]">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">Session output</div>
            {results.length > 0 && (
              <button onClick={() => setResults([])} className="text-xs text-white/40 hover:text-white flex items-center gap-1">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Consistency score bar */}
          {consistencyScore !== null && (
            <div className="p-3 rounded-xl border border-violet-500/30 bg-violet-500/5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                  <Dna className="w-3.5 h-3.5" /> Consistency Score
                </div>
                <span className={`text-sm font-black tabular-nums ${
                  consistencyScore >= 80 ? "text-emerald-400" :
                  consistencyScore >= 60 ? "text-violet-300" : "text-amber-400"
                }`}>{consistencyScore}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${consistencyScore}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    consistencyScore >= 80 ? "bg-gradient-to-r from-emerald-500 to-cyan-400" :
                    consistencyScore >= 60 ? "bg-gradient-to-r from-violet-500 to-pink-400" :
                    "bg-gradient-to-r from-amber-500 to-orange-400"
                  }`}
                />
              </div>
              <div className="text-[10px] text-white/30 mt-1.5">
                {consistencyScore >= 80 ? "Excellent — outputs will look like the same person" :
                 consistencyScore >= 60 ? "Good — strong resemblance across generations" :
                 "Fair — lock seed and add references to improve"}
              </div>
            </div>
          )}

          <AnimatePresence>
            {results.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-[400px] rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-white/30 gap-3">
                <Sparkles className="w-10 h-10" />
                <div className="text-sm">Your forged images land here</div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {results.map((r, i) => (
                  <motion.div key={r.dataUrl} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-white/10">
                    <img src={r.dataUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-1.5">
                      <div className="text-[10px] font-mono text-white/60">seed {r.seed}</div>
                      {/* Primary actions */}
                      <div className="flex gap-1">
                        <button onClick={() => downloadImage(r.dataUrl, r.seed)}
                          className="flex-1 h-7 rounded-md bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors" title="Download">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {/* Lock this seed → also pushes to character's saved DNA */}
                        <button
                          onClick={() => {
                            dispatch({ type: "SET_SEED", seed: r.seed });
                            if (!lockState.locked) dispatch({ type: "LOCK" });
                            if (character) updateCharacter(character.id, { seed: r.seed });
                            toast.success(
                              `Seed ${r.seed} locked${character ? ` to ${character.name}` : ""}`
                            );
                          }}
                          className="flex-1 h-7 rounded-md bg-white/10 hover:bg-violet-500/40 flex items-center justify-center transition-colors"
                          title="Lock seed to character DNA">
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { addRefImage(r.dataUrl); toast.success("Added as reference"); }}
                          className="flex-1 h-7 rounded-md bg-white/10 hover:bg-cyan-500/40 flex items-center justify-center transition-colors" title="Use as reference">
                          <ImagePlus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Secondary actions */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setActiveTab("videos"); toast.success("Sent to Motion Studio"); }}
                          className="flex-1 h-6 rounded-md bg-pink-500/20 hover:bg-pink-500/40 text-[9px] font-bold text-pink-300 transition-colors">
                          Motion
                        </button>
                        <button onClick={() => toast.info("Inpaint — coming soon")}
                          className="flex-1 h-6 rounded-md bg-orange-500/20 hover:bg-orange-500/40 text-[9px] font-bold text-orange-300 transition-colors">
                          Inpaint
                        </button>
                        <button onClick={() => toast.info("Outpaint — coming soon")}
                          className="flex-1 h-6 rounded-md bg-emerald-500/20 hover:bg-emerald-500/40 text-[9px] font-bold text-emerald-300 transition-colors">
                          Expand
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
};
