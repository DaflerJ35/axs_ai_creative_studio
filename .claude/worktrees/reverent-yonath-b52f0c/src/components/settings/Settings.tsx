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
import { useNyxStore } from "../../store/useNyxStore";
import { estimateImageCost } from "../../lib/workflows";
import { testComfyUIConnection, detectModelType } from "../../lib/comfyui";
import { motion, AnimatePresence } from "motion/react";

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

// ─── Component ────────────────────────────────────────────────────────────────

export const Settings = () => {
  const { settings, updateSettings, characters, gallery, clearGallery } = useNyxStore();
  const [showKey, setShowKey] = useState(false);
  const [gpuHourlyCost, setGpuHourlyCost] = useState(1.5);
  const [showComfyGuide, setShowComfyGuide] = useState(false);
  const [showRunpod, setShowRunpod] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Local GPU connection state
  const [testing, setTesting] = useState(false);
  const [connStatus, setConnStatus] = useState<"idle" | "ok" | "error">("idle");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [detectedGpu, setDetectedGpu] = useState("");

  const estimated = estimateImageCost(settings, gpuHourlyCost);

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
    a.href = URL.createObjectURL(blob);
    a.download = `momentum-backup-${Date.now()}.json`;
    a.click();
    toast.success("Backup downloaded");
  };

  const importData = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      const state = useNyxStore.getState();
      if (data.characters?.length) data.characters.forEach((c: any) => state.addCharacter(c));
      if (data.gallery?.length) data.gallery.forEach((g: any) => state.addToGallery(g));
      if (data.settings) state.updateSettings(data.settings);
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
    } catch (e: any) {
      toast.error("Connection failed", { description: e.message });
    }
  };

  return (
    <div className="space-y-7 max-w-4xl">
      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">System</div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            Configuration
          </span>
        </h1>
      </div>

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
                {settings.comfyuiModel && detectModelType(settings.comfyuiModel) !== "lora" && (
                  <div className="mt-1.5 text-xs px-2 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 inline-block">
                    Type: {detectModelType(settings.comfyuiModel).toUpperCase()} — auto workflow ✓
                  </div>
                )}
                {settings.comfyuiModel && detectModelType(settings.comfyuiModel) === "lora" && (
                  <div className="mt-1.5 text-xs px-2 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-300 inline-block">
                    LoRA detected — select a Base Model below
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
        <div className="grid grid-cols-3 gap-3">
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
