import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import {
  Key, Server, Video, HardDrive, DollarSign,
  Download, Upload, Trash2, ExternalLink, Eye, EyeOff,
  Cpu, CheckCircle, AlertTriangle, ChevronDown, ChevronRight,
  Zap, Package, Monitor, RefreshCw, Wifi, WifiOff, ToggleLeft, ToggleRight,
} from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { GlassCard } from "../ui/glass-card";
import { useAxsStore } from "../../store/useAxsStore";
import { estimateImageCost } from "../../lib/workflows";
import { testComfyUIConnection, detectModelType } from "../../lib/comfyui";
import { resolveComfyWorkflowRoute } from "../../lib/comfyWorkflowRouter";
import { motion, AnimatePresence } from "motion/react";
import { del } from "idb-keyval";
import { BillingPanel } from "../platform/BillingPanel";
import { CommandMetric, CommandPanel } from "../command/CommandDeck";
import type { Character, ForgeResult, ForgeSettings, StylePreset } from "../../lib/types";

// ─── Model + Node data ────────────────────────────────────────────────────────

const COMFY_MODELS = [
  {
    id: "pony",
    name: "Pony Diffusion XL v6",
    size: "~6.5GB",
    vramNeeded: "8GB",
    fits: true,
    useCase: "Uncensored, photorealistic, great for UGC ads",
    folder: "models/checkpoints/",
    filename: "ponyDiffusionV6XL.safetensors",
    url: "https://civitai.com/models/257749",
  },
  {
    id: "epicrealism",
    name: "epiCRealism XL",
    size: "~6.5GB",
    vramNeeded: "8GB",
    fits: true,
    useCase: "Hyper-realistic portraits, commercial quality",
    folder: "models/checkpoints/",
    filename: "epicrealismXL.safetensors",
    url: "https://civitai.com/models/277058",
  },
  {
    id: "dreamshaper",
    name: "DreamShaper XL",
    size: "~6.5GB",
    vramNeeded: "8GB",
    fits: true,
    useCase: "Cinematic / creative — great for campaign visuals",
    folder: "models/checkpoints/",
    filename: "dreamshaperXL.safetensors",
    url: "https://civitai.com/models/112902",
  },
  {
    id: "flux-schnell",
    name: "FLUX.1-schnell (fp8)",
    size: "~9GB",
    vramNeeded: "10GB",
    fits: true,
    useCase: "Best quality on your 3080 — 4 steps, ultra fast",
    folder: "models/checkpoints/",
    filename: "flux1-schnell-fp8.safetensors",
    url: "https://huggingface.co/Kijai/flux-fp8",
  },
  {
    id: "sd15",
    name: "SD 1.5 + AnimateDiff",
    size: "~2GB + 1.7GB",
    vramNeeded: "6GB",
    fits: true,
    useCase: "For video — AnimateDiff loops run great on 3080",
    folder: "models/checkpoints/",
    filename: "v1-5-pruned-emaonly.safetensors",
    url: "https://huggingface.co/runwayml/stable-diffusion-v1-5",
  },
  {
    id: "flux-dev",
    name: "FLUX.1-dev (full)",
    size: "~24GB",
    vramNeeded: "24GB+",
    fits: false,
    useCase: "Too big for 3080 — use RunPod cloud for this",
    folder: "models/unet/",
    filename: "flux1-dev.safetensors",
    url: "https://huggingface.co/black-forest-labs/FLUX.1-dev",
  },
] as const;

const COMFY_NODES = [
  { name: "ComfyUI Manager", desc: "Install/update all other custom nodes from inside ComfyUI. Install this FIRST.", url: "https://github.com/ltdrdata/ComfyUI-Manager" },
  { name: "ComfyUI-GGUF", desc: "Run FLUX quantized (Q4/Q8) — cuts VRAM in half on your 3080.", url: "https://github.com/city96/ComfyUI-GGUF" },
  { name: "AnimateDiff Evolved", desc: "Best video generation for SD 1.5. Runs fine in 8GB+.", url: "https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved" },
  { name: "Impact Pack", desc: "Face detailer, segmentation, quality improvements.", url: "https://github.com/ltdrdata/ComfyUI-Impact-Pack" },
] as const;

const STYLE_PRESETS: StylePreset[] = ["portrait", "cinematic", "editorial", "concept_art", "product", "anime", "raw"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asStylePreset(value: unknown): StylePreset {
  return STYLE_PRESETS.includes(value as StylePreset) ? (value as StylePreset) : "portrait";
}

function sanitizeCharacter(value: unknown): Character | null {
  if (!isRecord(value)) return null;

  const id = asString(value.id);
  const name = asString(value.name);
  if (!id || !name) return null;

  return {
    id,
    name,
    age: asString(value.age),
    heritage: asString(value.heritage),
    bodyType: asString(value.bodyType),
    description: asString(value.description),
    personality: asStringArray(value.personality),
    styleKeywords: asStringArray(value.styleKeywords),
    stylePreset: asStylePreset(value.stylePreset),
    seed: asNumber(value.seed, Math.floor(Math.random() * 1_000_000_000)),
    portraitDataUrl: typeof value.portraitDataUrl === "string" && value.portraitDataUrl.startsWith("data:image/")
      ? value.portraitDataUrl
      : undefined,
    loraName: asString(value.loraName) || undefined,
    loraWeight: typeof value.loraWeight === "number" && Number.isFinite(value.loraWeight) ? value.loraWeight : undefined,
    createdAt: asNumber(value.createdAt, Date.now()),
  };
}

function sanitizeGalleryItem(value: unknown): ForgeResult | null {
  if (!isRecord(value)) return null;

  const id = asString(value.id);
  const url = asString(value.url);
  const type = value.type === "video" ? "video" : value.type === "image" ? "image" : null;
  if (!id || !url || !type) return null;

  return {
    id,
    type,
    url,
    prompt: asString(value.prompt),
    seed: typeof value.seed === "number" && Number.isFinite(value.seed) ? value.seed : undefined,
    characterId: asString(value.characterId) || undefined,
    stylePreset: value.stylePreset ? asStylePreset(value.stylePreset) : undefined,
    width: typeof value.width === "number" && Number.isFinite(value.width) ? value.width : undefined,
    height: typeof value.height === "number" && Number.isFinite(value.height) ? value.height : undefined,
    createdAt: asNumber(value.createdAt, Date.now()),
    favorite: typeof value.favorite === "boolean" ? value.favorite : false,
  };
}

function sanitizeSettings(value: unknown): Partial<ForgeSettings> {
  if (!isRecord(value)) return {};

  const allowedKeys = [
    "useLocalGpu", "comfyuiUrl", "comfyuiModel", "comfyuiLoraBase", "runpodApiKey",
    "runpodEndpointId", "runpodVideoEndpointId", "elevenLabsApiKey", "openaiApiKey",
    "googleTtsApiKey", "localVoiceUrl", "voiceEngine", "stylePreset", "steps", "guidance", "width",
    "height", "batchSize", "scheduler", "enhancePrompt", "upscaleFactor",
    "characterLoraWeight", "defaultNegative", "videoDuration", "videoFluidity",
    "videoFormat", "videoResolution", "videoModel", "videoWorkflow", "fluxClipL",
    "fluxT5xxl", "fluxVae",
  ] as const;

  return Object.fromEntries(
    allowedKeys
      .filter((key) => Object.prototype.hasOwnProperty.call(value, key))
      .map((key) => [key, value[key]])
  ) as Partial<ForgeSettings>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Settings = () => {
  const { settings, updateSettings, characters, gallery, clearGallery } = useAxsStore();
  const [showKey, setShowKey] = useState(false);
  const [gpuHourlyCost, setGpuHourlyCost] = useState(1.5);

  const isSettingsLoaded = Boolean(settings && typeof settings === "object" && !Array.isArray(settings));

  const resetLocalSettings = async () => {
    try {
      await del("axs-vault-v1");
    } catch {
      // If IndexedDB cleanup fails, reload will still start from a safe default state.
    }
    window.location.reload();
  };

  if (!isSettingsLoaded) {
    return (
      <div className="space-y-6 rounded-[24px] border border-rose-400/15 bg-black/40 p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <p className="text-sm font-semibold uppercase tracking-[0.38em] text-rose-300/90">Config Recovery</p>
        <h1 className="text-2xl font-black">Config settings unavailable.</h1>
        <p className="max-w-2xl text-sm text-white/60">
          Your studio configuration could not be loaded safely. Reset local settings or refresh the page to recover and continue working.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={resetLocalSettings} className="border border-rose-400/25 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20">
            Reset Local Settings
          </Button>
          <Button onClick={() => window.location.reload()} className="border border-white/10 bg-white/5 text-white/80 hover:bg-white/10">
            Retry Page
          </Button>
        </div>
      </div>
    );
  }
  const [showComfyGuide, setShowComfyGuide] = useState(false);
  const [showRunpod, setShowRunpod] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Local GPU connection state
  const [testing, setTesting] = useState(false);
  const [connStatus, setConnStatus] = useState<"idle" | "ok" | "error">("idle");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [detectedGpu, setDetectedGpu] = useState("");

  const estimated = estimateImageCost(settings, gpuHourlyCost);
  const activeWorkflowRoute = resolveComfyWorkflowRoute(settings.comfyuiModel || "");

  const handleTestLocal = async () => {
    setTesting(true);
    setConnStatus("idle");
    const result = await testComfyUIConnection(settings.comfyuiUrl);
    setTesting(false);
    if (result.ok) {
      setConnStatus("ok");
      setAvailableModels(result.models ?? []);
      setDetectedGpu(result.gpuName ?? "");
      toast.success("ComfyUI connected!", {
        description: `${result.models?.length ?? 0} models found · ${result.gpuName}`,
      });
    } else {
      setConnStatus("error");
      toast.error("Can't reach ComfyUI", {
        description: `${result.error} — make sure ComfyUI is running with --enable-cors-header`,
      });
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ characters, gallery, settings }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `axs-backup-${Date.now()}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    toast.success("Backup downloaded");
  };

  const importData = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data: unknown = JSON.parse(await f.text());
      if (!data || typeof data !== "object") throw new Error("Backup root must be an object");
      const backup = data as {
        characters?: unknown;
        gallery?: unknown;
        settings?: unknown;
      };
      const state = useAxsStore.getState();
      if (Array.isArray(backup.characters)) {
        backup.characters
          .map(sanitizeCharacter)
          .filter((character): character is Character => Boolean(character))
          .forEach((character) => state.addCharacter(character));
      }
      if (Array.isArray(backup.gallery)) {
        backup.gallery
          .map(sanitizeGalleryItem)
          .filter((item): item is ForgeResult => Boolean(item))
          .forEach((item) => state.addToGallery(item));
      }
      state.updateSettings(sanitizeSettings(backup.settings));
      toast.success("Backup imported");
    } catch {
      toast.error("Invalid backup file");
    }
    e.target.value = "";
  };

  const testRunpodConnection = async () => {
    if (!settings.runpodApiKey || !settings.runpodEndpointId)
      return toast.error("Set API key and Endpoint ID first");
    try {
      const res = await fetch(`https://api.runpod.ai/v2/${settings.runpodEndpointId}/health`, {
        headers: { Authorization: `Bearer ${settings.runpodApiKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        toast.success("RunPod endpoint live", { description: `Workers ready: ${data.workers?.ready ?? "?"}` });
      } else {
        toast.error(`Endpoint returned ${res.status}`);
      }
    } catch (e) {
      toast.error("Connection failed", { description: e instanceof Error ? e.message : "Unknown error" });
    }
  };

  return (
    <div className="space-y-7 axs-workspace-page">
      <CommandPanel className="p-6 lg:p-7">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[var(--axs-gold)]">Config</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Customize your studio, integrations, rendering, and security.
            </h1>
            <p className="mt-2 text-sm text-white/52">
              Command every production setting from one deck: ComfyUI, RunPod, voice, billing, exports, and workspace memory.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CommandMetric label="Render mode" value={settings.useLocalGpu ? "Local" : "Cloud"} delta={settings.useLocalGpu ? "RTX / ComfyUI" : "RunPod"} Icon={settings.useLocalGpu ? Cpu : Server} accent="cyan" />
            <CommandMetric label="Workflow fit" value={activeWorkflowRoute.title.replace(" Workflow", "")} delta={activeWorkflowRoute.kind.toUpperCase()} Icon={Zap} accent="violet" />
            <CommandMetric label="Cost" value={settings.useLocalGpu ? "$0.00" : "$0.004"} delta="per image" Icon={DollarSign} accent="emerald" />
            <CommandMetric label="Assets" value={String(gallery.length)} delta="in vault" Icon={HardDrive} accent="gold" />
          </div>
        </div>
      </CommandPanel>

      <BillingPanel />

      {/* ── Generation Mode Toggle ─────────────────────────────────────────── */}
      <GlassCard className="p-6" glow={settings.useLocalGpu ? "violet" : "none"}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              settings.useLocalGpu
                ? "bg-violet-400/15 border-violet-400/30"
                : "bg-white/[0.05] border-white/10"
            }`}>
              {settings.useLocalGpu
                ? <Cpu className="w-5 h-5 text-violet-400" />
                : <Server className="w-5 h-5 text-cyan-400" />
              }
            </div>
            <div>
              <div className="font-black text-lg">
                {settings.useLocalGpu ? "Local GPU Mode" : "Cloud Mode (RunPod)"}
              </div>
              <div className="text-xs text-white/40">
                {settings.useLocalGpu
                  ? "Using your RTX 3080 via ComfyUI — free generation"
                  : "Using RunPod serverless — billed per image"}
              </div>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ useLocalGpu: !settings.useLocalGpu })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-semibold text-sm"
            style={{
              background: settings.useLocalGpu ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
              borderColor: settings.useLocalGpu ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.1)",
            }}
          >
            {settings.useLocalGpu
              ? <><ToggleRight className="w-5 h-5 text-violet-400" /> Local GPU ON</>
              : <><ToggleLeft className="w-5 h-5 text-white/40" /> Local GPU OFF</>
            }
          </button>
        </div>
      </GlassCard>

      {/* ── Local GPU Config ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {settings.useLocalGpu && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <GlassCard className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black">ComfyUI Connection</h2>
                  <div className="text-xs text-white/40">Your RTX 3080 — free generation, zero per-image cost</div>
                </div>
                {connStatus === "ok" && (
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <Wifi className="w-3.5 h-3.5" /> Connected
                  </div>
                )}
                {connStatus === "error" && (
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                    <WifiOff className="w-3.5 h-3.5" /> Offline
                  </div>
                )}
              </div>

              {/* ComfyUI URL */}
              <div>
                <Label className="mb-1 block">ComfyUI URL</Label>
                <input
                  value={settings.comfyuiUrl}
                  onChange={(e) => updateSettings({ comfyuiUrl: e.target.value })}
                  placeholder="http://127.0.0.1:8188"
                  style={{ fontFamily: "monospace" }}
                />
                <p className="text-xs text-white/30 mt-1.5">
                  Default is <code className="text-white/50">http://127.0.0.1:8188</code> — only change if you moved the port
                </p>
              </div>

              {/* Model selector */}
              <div>
                <Label className="mb-1 block">Active Model</Label>
                {availableModels.length > 0 ? (
                  <select
                    value={settings.comfyuiModel}
                    onChange={(e) => updateSettings({ comfyuiModel: e.target.value })}
                    className="w-full"
                    style={{ fontFamily: "monospace", background: "rgba(255,255,255,0.03)", color: "#fff", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "10px", padding: "10px 14px" }}
                  >
                    <option value="" style={{ background: "#0d0d14" }}>— Select a model —</option>
                    {availableModels.map((m) => (
                      <option key={m} value={m} style={{ background: "#0d0d14" }}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={settings.comfyuiModel}
                    onChange={(e) => updateSettings({ comfyuiModel: e.target.value })}
                    placeholder="ponyDiffusionV6XL.safetensors"
                    style={{ fontFamily: "monospace" }}
                  />
                )}
                <p className="text-xs text-white/30 mt-1.5">
                  {availableModels.length > 0
                    ? `${availableModels.length} models — all types supported (checkpoint, LoRA, FLUX, SD2.1)`
                    : "Hit 'Connect' to auto-detect your installed models"}
                </p>
                {settings.comfyuiModel && (
                  <div className="mt-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.055] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-100/45">
                          Model-aware workflow
                        </div>
                        <div className="mt-1 text-sm font-black text-white">
                          {activeWorkflowRoute.title}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                        <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-white/65">
                          {activeWorkflowRoute.family}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-1 ${
                            activeWorkflowRoute.status === "ready"
                              ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-200"
                              : activeWorkflowRoute.status === "watch"
                                ? "border-amber-300/25 bg-amber-300/10 text-amber-200"
                                : "border-rose-300/25 bg-rose-300/10 text-rose-200"
                          }`}
                        >
                          {activeWorkflowRoute.status}
                        </span>
                        <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-2.5 py-1 text-violet-100">
                          {activeWorkflowRoute.gpuFit}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-white/52 md:grid-cols-4">
                      <div>
                        <span className="text-white/32">Steps</span>
                        <div className="font-mono text-white/75">{activeWorkflowRoute.defaults.steps}</div>
                      </div>
                      <div>
                        <span className="text-white/32">CFG</span>
                        <div className="font-mono text-white/75">{activeWorkflowRoute.defaults.cfg}</div>
                      </div>
                      <div>
                        <span className="text-white/32">Sampler</span>
                        <div className="font-mono text-white/75">{activeWorkflowRoute.defaults.sampler}</div>
                      </div>
                      <div>
                        <span className="text-white/32">Hi-res</span>
                        <div className="font-mono text-white/75">{activeWorkflowRoute.defaults.hires ? "on" : "off"}</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5 text-xs">
                      {activeWorkflowRoute.reasons.slice(0, 2).map((reason) => (
                        <div key={reason} className="text-cyan-50/62">✓ {reason}</div>
                      ))}
                      {activeWorkflowRoute.warnings.map((warning) => (
                        <div key={warning} className="text-amber-100/75">! {warning}</div>
                      ))}
                      {activeWorkflowRoute.requiredConfig.map((item) => (
                        <div key={item} className="text-rose-100/75">Required: {item}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* LoRA base model selector */}
              {settings.comfyuiModel && detectModelType(settings.comfyuiModel) === "lora" && availableModels.length > 0 && (
                <div>
                  <Label className="mb-1 block">Base Model for this LoRA</Label>
                  <select
                    value={settings.comfyuiLoraBase}
                    onChange={(e) => updateSettings({ comfyuiLoraBase: e.target.value })}
                    style={{ background: "rgba(255,255,255,0.03)", color: "#fff", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "10px", padding: "10px 14px", width: "100%", fontFamily: "monospace" }}
                  >
                    <option value="" style={{ background: "#0d0d14" }}>— pick the base checkpoint —</option>
                    {availableModels.filter(m => detectModelType(m) !== "lora" && detectModelType(m) !== "video").map((m) => (
                      <option key={m} value={m} style={{ background: "#0d0d14" }}>{m}</option>
                    ))}
                  </select>
                  <p className="text-xs text-white/30 mt-1.5">The LoRA will be applied on top of this checkpoint</p>
                </div>
              )}

              {/* Detected GPU */}
              {detectedGpu && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-400/[0.06] border border-emerald-400/20">
                  <Monitor className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-emerald-300 font-medium">{detectedGpu} detected</span>
                </div>
              )}

              {/* Connect button */}
              <Button
                onClick={handleTestLocal}
                disabled={testing}
                className="w-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white font-bold border-0"
              >
                {testing
                  ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Connecting…</>
                  : connStatus === "ok"
                    ? <><CheckCircle className="w-4 h-4 mr-2" /> Reconnect / Refresh Models</>
                    : <><Wifi className="w-4 h-4 mr-2" /> Connect to ComfyUI</>
                }
              </Button>

              {connStatus === "error" && (
                <div className="p-4 rounded-xl bg-rose-500/[0.08] border border-rose-500/20 text-xs text-rose-300 space-y-1.5">
                  <div className="font-bold">Can't reach ComfyUI — checklist:</div>
                  <div>1. ComfyUI is running (<code>run_nvidia_gpu.bat</code>)</div>
                  <div>2. You added <code className="text-rose-200">--enable-cors-header</code> to the launch flags</div>
                  <div>3. URL matches what ComfyUI shows in its terminal (usually port 8188)</div>
                  <div className="pt-1.5 border-t border-rose-500/10 text-rose-200/70">
                    Dev mode fallback: if you launched with <code>npm run dev</code>, the app now auto-routes ComfyUI traffic through Vite's proxy — no CORS needed. Just make sure ComfyUI is on port 8188.
                  </div>
                </div>
              )}

              {/* Launch flags reminder */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.07] font-mono text-xs text-white/60 space-y-1.5">
                <div className="text-white/30"># Required ComfyUI launch command (edit run_nvidia_gpu.bat):</div>
                <div className="text-emerald-300 break-all">
                  .\python_embeded\python.exe -s ComfyUI\main.py --windows-standalone-build
                  <span className="text-cyan-300"> --enable-cors-header</span>
                  <span className="text-violet-300"> --fp16-vae</span>
                  <span className="text-amber-300"> --lowvram</span>
                  <span className="text-pink-300"> --use-pytorch-cross-attention</span>
                </div>
                <div className="text-white/30 pt-1">
                  <span className="text-cyan-300">--enable-cors-header</span> is required for the browser to talk to ComfyUI
                </div>
              </div>
            </GlassCard>

            {/* Setup guide (collapsed) */}
            <GlassCard className="overflow-hidden">
              <button
                onClick={() => setShowComfyGuide((v) => !v)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                    <Package className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-bold">ComfyUI Setup Guide — RTX 3080 10GB</div>
                    <div className="text-xs text-white/40">Not installed yet? Start here — takes ~15 min</div>
                  </div>
                </div>
                {showComfyGuide
                  ? <ChevronDown className="w-4 h-4 text-white/40" />
                  : <ChevronRight className="w-4 h-4 text-white/40" />}
              </button>

              <AnimatePresence>
                {showComfyGuide && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-7 pb-7 space-y-7 border-t border-white/[0.06]">

                      {/* Hardware check */}
                      <div className="pt-5 grid sm:grid-cols-3 gap-3">
                        {[
                          { label: "GPU", value: "RTX 3080 10GB", note: "SDXL + FLUX-schnell fit perfectly" },
                          { label: "CPU", value: "i7-10700K", note: "Fast preprocessing, no bottleneck" },
                          { label: "RAM", value: "64GB", note: "CPU offload is super aggressive" },
                        ].map(({ label, value, note }) => (
                          <div key={label} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.03]">
                            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">{label}</div>
                            <div className="font-bold text-sm">{value}</div>
                            <div className="flex items-center gap-1.5 mt-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="text-xs text-white/50">{note}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Step 1 */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-black text-xs font-black flex items-center justify-center flex-shrink-0">1</span>
                          <h3 className="font-bold">Install ComfyUI (Windows Portable — no Python needed)</h3>
                        </div>
                        <div className="ml-8 space-y-2">
                          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.07] font-mono text-xs text-white/70 space-y-1.5">
                            <div className="text-white/30"># Portable version — zero Python setup</div>
                            <div className="text-emerald-300">1. Go to github.com/comfyanonymous/ComfyUI → Releases</div>
                            <div className="text-emerald-300">2. Download ComfyUI_windows_portable_nvidia.7z</div>
                            <div className="text-emerald-300">3. Extract to C:\ComfyUI\ (needs 50GB+ free space)</div>
                            <div className="text-emerald-300">4. Edit run_nvidia_gpu.bat — add flags from above</div>
                            <div className="text-emerald-300">5. Double-click run_nvidia_gpu.bat → opens at localhost:8188</div>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-black text-xs font-black flex items-center justify-center flex-shrink-0">2</span>
                          <h3 className="font-bold">Install custom nodes</h3>
                        </div>
                        <div className="ml-8 space-y-2">
                          {COMFY_NODES.map((node) => (
                            <div key={node.name} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                              <Package className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{node.name}</div>
                                <div className="text-xs text-white/40 mt-0.5">{node.desc}</div>
                              </div>
                              <a href={node.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Step 3 — Models */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-black text-xs font-black flex items-center justify-center flex-shrink-0">3</span>
                          <h3 className="font-bold">Download models — all run on your 3080</h3>
                        </div>
                        <div className="ml-8 space-y-3">
                          {COMFY_MODELS.map((model) => (
                            <div
                              key={model.id}
                              className={`p-4 rounded-xl border ${
                                model.fits
                                  ? "border-white/[0.07] bg-white/[0.03]"
                                  : "border-amber-500/20 bg-amber-500/[0.04]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                  {model.fits
                                    ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    : <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                                  <div>
                                    <span className="font-bold text-sm">{model.name}</span>
                                    <span className="text-xs text-white/40 ml-2">{model.size}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                                    model.fits
                                      ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/20"
                                      : "bg-amber-400/10 text-amber-300 border-amber-400/20"
                                  }`}>
                                    {model.fits ? `✓ Fits ${model.vramNeeded}` : `Needs ${model.vramNeeded}`}
                                  </span>
                                  {model.fits && (
                                    <a href={model.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300">
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-white/50 mt-2">{model.useCase}</div>
                              {model.fits && (
                                <div className="mt-2 font-mono text-[10px] text-white/35">
                                  → {model.folder}{model.filename}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AnimateDiff bonus */}
                      <div className="p-5 rounded-2xl border border-pink-500/20 bg-pink-500/[0.04]">
                        <div className="flex items-center gap-2 mb-2">
                          <Video className="w-4 h-4 text-pink-400" />
                          <span className="font-bold text-sm">Bonus: AnimateDiff video on your 3080</span>
                        </div>
                        <div className="text-xs text-white/50 space-y-1">
                          <div>1. Install AnimateDiff Evolved from ComfyUI Manager</div>
                          <div>2. Download mm_sd_v15_v2.ckpt → <code>custom_nodes/ComfyUI-AnimateDiff-Evolved/models/</code></div>
                          <div>3. Set context_length: 16 frames, fps: 8 → smooth 2s UGC loops</div>
                          <div>4. Combine with SD 1.5 + any character LoRA for consistent UGC ads</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RunPod (secondary / cloud fallback) ───────────────────────────── */}
      <GlassCard className="overflow-hidden">
        <button
          onClick={() => setShowRunpod((v) => !v)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
              <Server className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="font-bold">RunPod Serverless</div>
              <div className="text-xs text-white/40">Cloud GPU — for FLUX.1-dev full res when needed</div>
            </div>
          </div>
          {showRunpod
            ? <ChevronDown className="w-4 h-4 text-white/40" />
            : <ChevronRight className="w-4 h-4 text-white/40" />}
        </button>

        <AnimatePresence>
          {showRunpod && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-7 pb-7 space-y-5 border-t border-white/[0.06] pt-6">
                <div>
                  <Label className="flex items-center gap-2 mb-1">
                    <Key className="w-3.5 h-3.5" /> API Key
                  </Label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      placeholder="rpa_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={settings.runpodApiKey}
                      onChange={(e) => updateSettings({ runpodApiKey: e.target.value })}
                      className="pr-10 font-mono text-sm"
                      style={{ fontFamily: "monospace" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block">Image Endpoint ID</Label>
                    <input
                      placeholder="xxxxxxxxxxxxxx"
                      value={settings.runpodEndpointId}
                      onChange={(e) => updateSettings({ runpodEndpointId: e.target.value })}
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 mb-1">
                      <Video className="w-3.5 h-3.5" /> Video Endpoint ID
                      <span className="text-[10px] text-white/30">(optional)</span>
                    </Label>
                    <input
                      placeholder="xxxxxxxxxxxxxx"
                      value={settings.runpodVideoEndpointId}
                      onChange={(e) => updateSettings({ runpodVideoEndpointId: e.target.value })}
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block">Video Model</Label>
                    <select
                      value={settings.videoModel}
                      onChange={(e) => {
                        const videoModel = e.target.value as ForgeSettings["videoModel"];
                        updateSettings({
                          videoModel,
                          videoWorkflow: videoModel === "ltx-video-1.1"
                            ? "ltx-1.1-rtx-vsr-upscale"
                            : "ltx-2.3-character-consistent-directors-cut",
                        });
                      }}
                      className="w-full"
                    >
                      <option value="ltx-video-1.1" style={{ background: "#0d0d14" }}>LTX 1.1 - RTX 3080 10GB safe</option>
                      <option value="ltx-video-2.3" style={{ background: "#0d0d14" }}>LTX 2.3 - Universe Director&apos;s Cut</option>
                      <option value="wan-2.1" style={{ background: "#0d0d14" }}>WAN 2.1 - custom endpoint</option>
                      <option value="custom" style={{ background: "#0d0d14" }}>Custom video workflow</option>
                    </select>
                  </div>
                  <div>
                    <Label className="mb-1 block">Video Workflow</Label>
                    <input
                      value={settings.videoWorkflow}
                      onChange={(e) => updateSettings({ videoWorkflow: e.target.value as ForgeSettings["videoWorkflow"] })}
                      style={{ fontFamily: "monospace" }}
                    />
                  </div>
                </div>
                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.055] p-4 text-xs leading-5 text-cyan-50/70">
                  LTX 1.1 is the safest local-style profile for a 3080 10GB: short 768x1280 clips, 12-16fps, then RTX VSR 4K upscale. LTX 2.3 stays the premium Universe Forge continuity path.
                </div>
                <Button
                  onClick={testRunpodConnection}
                  className="w-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white"
                >
                  Test RunPod endpoint
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* ── Cost estimator ─────────────────────────────────────────────────── */}
      <GlassCard className="p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-black">Cost Estimator</h2>
            <div className="text-xs text-white/40">
              {settings.useLocalGpu ? "Local = $0.00 per image 🎉" : "Cloud GPU cost per image"}
            </div>
          </div>
        </div>
        {settings.useLocalGpu ? (
          <div className="p-5 rounded-2xl bg-emerald-400/[0.06] border border-emerald-400/20 text-center">
            <div className="text-4xl font-black text-emerald-400">$0.00</div>
            <div className="text-xs text-white/40 mt-1">You own the hardware. Every image is free.</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="mb-1 block">GPU cost ($/hr)</Label>
              <input
                type="number"
                step="0.1"
                value={gpuHourlyCost}
                onChange={(e) => setGpuHourlyCost(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-white/30 mt-1.5">RunPod A100: ~$1.50/hr · H100: ~$3.50/hr</p>
            </div>
            <div className="flex flex-col justify-center p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-xs text-white/40 mb-1">{settings.steps} steps × batch {settings.batchSize}</div>
              <div className="text-4xl font-black text-emerald-400">${estimated.toFixed(4)}</div>
              <div className="text-xs text-white/40 mt-1">per image · ~${(estimated * 30).toFixed(2)}/30 campaign ads</div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* ── Data ───────────────────────────────────────────────────────────── */}
      <GlassCard className="p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
            <HardDrive className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-black">Local Data</h2>
            <div className="text-xs text-white/40">Stored in IndexedDB — never leaves your machine</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Characters", value: characters.length, color: "text-cyan-400" },
            { label: "Gallery", value: gallery.length, color: "text-violet-400" },
            { label: "Favorites", value: gallery.filter((g) => g.favorite).length, color: "text-pink-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.03] text-center">
              <div className={`text-3xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-white/40 mt-1">{label}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportData} className="border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white">
            <Download className="w-4 h-4 mr-2" /> Export backup
          </Button>
          <Button onClick={() => fileRef.current?.click()} className="border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white">
            <Upload className="w-4 h-4 mr-2" /> Import backup
          </Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importData} />
          <Button
            onClick={() => {
              if (confirm("Clear entire gallery? Cannot be undone.")) {
                clearGallery();
                toast.info("Gallery cleared");
              }
            }}
            className="border border-rose-500/20 bg-rose-500/[0.05] text-rose-300 hover:bg-rose-500/[0.1] hover:text-rose-200"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear gallery
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
