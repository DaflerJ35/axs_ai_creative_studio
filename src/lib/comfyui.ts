import type { ImageJobOutput } from "./types";
import { detectComfyModelType, resolveComfyWorkflowRoute } from "./comfyWorkflowRouter";

const readLocalSetting = (key: string): string =>
  typeof globalThis.localStorage === "undefined" ? "" : globalThis.localStorage.getItem(key) || "";

function isViteDev(): boolean {
  try {
    return typeof import.meta !== "undefined" && (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;
  } catch {
    return false;
  }
}

const getBase = (): string => {
  const stored = readLocalSetting("axs.comfyuiUrl") || "http://127.0.0.1:8188";
  // In Vite dev mode with the default local URL, route through the Vite proxy
  // so the browser talks same-origin and CORS / mixed-content are bypassed.
  if (isViteDev() && stored === "http://127.0.0.1:8188") {
    return "/__comfyui";
  }
  return stored.replace(/\/$/, "");
};
const getModel = (): string => readLocalSetting("axs.comfyuiModel");
const getLoraBase = (): string => readLocalSetting("axs.comfyuiLoraBase");
const getFluxClipL = (): string => readLocalSetting("axs.fluxClipL");
const getFluxT5xxl = (): string => readLocalSetting("axs.fluxT5xxl");
const getFluxVae = (): string => readLocalSetting("axs.fluxVae");

export interface ComfyParams {
  prompt: string;
  negative_prompt?: string;
  seed?: number;
  steps?: number;
  guidance?: number;
  width?: number;
  height?: number;
  batch_size?: number;
  scheduler?: string;
  model?: string;
  quality?: "realism" | "ultra" | "cinematic";
  /** Filename returned by /upload/image — triggers img2img workflow (body/style ref) */
  referenceImage?: string;
  /** Optional LoRA file from the loras/ folder — triggers LoRA workflow */
  lora?: string;
  loraWeight?: number;
  /**
   * Stack multiple LoRAs (character + picker). When length >= 2 a chained
   * LoraLoader workflow is used. Overrides single `lora` when present.
   */
  loras?: Array<{ name: string; weight: number }>;
  /**
   * Separate face reference for FaceID mode. Uses higher-fidelity img2img
   * (0.88 denoise by default) to preserve face identity better than a plain
   * style reference. Routed independently from body/style referenceImage.
   */
  faceRefImage?: string;
  /** Denoise strength for the face reference pass (default 0.88). */
  faceRefStrength?: number;
  /** FLUX split text encoder config. Required when a FLUX checkpoint has no bundled CLIP. */
  fluxClipL?: string;
  fluxT5xxl?: string;
  fluxVae?: string;
}

/** Upload a data URL as a reference image to ComfyUI, returns the server filename. */
export async function uploadReferenceImage(dataUrl: string): Promise<string> {
  const fetchRes = await fetch(dataUrl);
  const blob = await fetchRes.blob();
  const form = new FormData();
  form.append("image", blob, "reference.png");
  const res = await fetch(`${getBase()}/upload/image`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Reference image upload failed: ${res.status}`);
  const data = await res.json();
  return data.name as string;
}

// ─── Model spec (VRAM / RAM offload / gen time) ───────────────────────────────

export interface ModelSpec {
  vramGb: number;
  ramOffloadGb: number;
  fits10GB: "yes" | "tight" | "no";
  genTime: { min: number; max: number };   // seconds
  label: string;                           // human-readable compatibility label
  note?: string;
}

export function getModelSpec(
  filename: string,
  quality: "realism" | "ultra" | "cinematic" = "realism"
): ModelSpec {
  const n = filename.toLowerCase();
  const type = detectModelType(filename);
  const isLightning = n.includes("lightning") || n.includes("turbo") || n.includes("schnell");
  const isBakedVae = n.includes("bakedvae");

  let vramGb: number;
  let baseTime: { min: number; max: number };
  let note: string | undefined;

  switch (type) {
    case "lora":
      // LoRA needs a base checkpoint — show base SDXL requirements
      vramGb = 7.5;
      baseTime = { min: 30, max: 60 };
      note = "Requires a base checkpoint — select one in Config";
      break;
    case "flux":
      vramGb = 9.5;
      baseTime = isLightning ? { min: 20, max: 40 } : { min: 100, max: 180 };
      if (!isLightning) note = "FLUX dev — 25 steps, takes longer";
      break;
    case "sd21":
      vramGb = 5.0;
      baseTime = { min: 12, max: 25 };
      break;
    case "video":
      vramGb = 7.5;
      baseTime = { min: 120, max: 300 };
      note = "Video model — use the Videos tab";
      break;
    default: { // sdxl
      vramGb = isBakedVae ? 6.8 : 7.2;
      if (isLightning) {
        baseTime = { min: 8, max: 20 };
      } else {
        baseTime = { min: 35, max: 65 };
      }
    }
  }

  // Hi-res fix adds VRAM + time — Lightning/Turbo/LCM never use hi-res fix
  const usesHires = (type === "sdxl" || type === "lora") && !isLightning;
  if (usesHires) {
    if (quality === "ultra") {
      vramGb += 2.5;
      baseTime = { min: baseTime.min + 55, max: baseTime.max + 110 };
    } else {
      vramGb += 1.2;
      baseTime = { min: baseTime.min + 25, max: baseTime.max + 50 };
    }
  }

  const fits10GB: ModelSpec["fits10GB"] =
    vramGb <= 8.5 ? "yes" : vramGb <= 10.5 ? "tight" : "no";
  const ramOffloadGb = vramGb > 10 ? Math.round((vramGb - 10) * 2 + 2) : 0;

  const label =
    fits10GB === "yes"  ? "✓ Runs on 3080 10 GB" :
    fits10GB === "tight"? "⚡ Tight — may offload to RAM" :
                          "✗ Exceeds 10 GB — heavy RAM offload";

  return { vramGb: Math.round(vramGb * 10) / 10, ramOffloadGb, fits10GB, genTime: baseTime, label, note };
}

// ─── Model type detection ─────────────────────────────────────────────────────

export type ModelType = "sdxl" | "lora" | "flux" | "sd21" | "video";

export function detectModelType(filename: string): ModelType {
  return detectComfyModelType(filename);
}

/** Lightning / Turbo / LCM / Hyper — distilled, needs ≤8 steps, low CFG, NO hi-res fix */
function isLightning(filename: string): boolean {
  const n = filename.toLowerCase();
  return n.includes("lightning") || n.includes("turbo") || n.includes("lcm") || n.includes("hyper");
}

/** Pony Diffusion models need score_ quality tags injected into prompts */
function isPony(filename: string): boolean {
  return filename.toLowerCase().includes("pony");
}

// ─── Realism prompt injection ─────────────────────────────────────────────────
// These terms are proven to push photorealism on SDXL/Pony/epiCRealism models

const REALISM_SUFFIX: Record<NonNullable<ComfyParams["quality"]>, string> = {
  realism: [
    "RAW photo", "photorealistic", "ultra-detailed", "8k uhd", "DSLR",
    "sharp focus", "natural lighting", "skin pores", "skin texture",
    "film grain", "Fujifilm XT3", "50mm lens", "f/1.8",
  ].join(", "),

  ultra: [
    "hyperrealistic photograph", "shot on Sony A7R IV", "85mm f/1.4 lens",
    "shallow depth of field", "bokeh background", "studio lighting",
    "subsurface scattering", "micro skin detail", "pore-level detail",
    "catch light in eyes", "physically based rendering", "8k RAW",
    "professional retouching", "Vogue editorial",
  ].join(", "),

  cinematic: [
    "cinematic photograph", "anamorphic lens flare", "35mm film",
    "dramatic lighting", "golden hour", "Hollywood color grade",
    "shallow depth of field", "shot on ARRI Alexa", "cinematic bokeh",
    "ultra-detailed skin", "photorealistic", "8k",
  ].join(", "),
};

const BASE_NEGATIVE =
  "painting, illustration, cartoon, anime, sketch, render, 3d, cgi, drawing, " +
  "blurry, out of focus, deformed, mutated, extra limbs, bad anatomy, disfigured, " +
  "watermark, text, signature, logo, jpeg artifacts, low quality, worst quality, " +
  "oversaturated, plastic skin, fake skin, artificial, uncanny, mannequin, " +
  "bad hands, extra fingers, missing fingers, fused fingers";

function buildPrompts(p: ComfyParams, model = ""): { pos: string; neg: string } {
  const q = p.quality ?? "realism";
  let pos = `${p.prompt}, ${REALISM_SUFFIX[q]}`;
  let neg = p.negative_prompt
    ? `${p.negative_prompt}, ${BASE_NEGATIVE}`
    : BASE_NEGATIVE;

  // Pony Diffusion requires score_ quality tags — without these it outputs low-quality renders
  if (isPony(model)) {
    pos = `score_9, score_8_up, score_7_up, score_6_up, ${pos}`;
    neg = `score_1, score_2, score_3, score_4, score_5, ${neg}`;
  }

  return { pos, neg };
}

// ─── Optimal SDXL native sizes ────────────────────────────────────────────────

function getOptimalSize(w: number, h: number): { w: number; h: number } {
  const ratio = w / h;
  // SDXL native bucket sizes
  const buckets: Array<[number, number]> = [
    [1024, 1024], [1152, 896], [896, 1152],
    [1216, 832], [832, 1216], [1344, 768],
    [768, 1344], [1536, 640], [640, 1536],
  ];
  return buckets.reduce((best, [bw, bh]) => {
    const br = bw / bh;
    return Math.abs(br - ratio) < Math.abs(best.w / best.h - ratio)
      ? { w: bw, h: bh } : best;
  }, { w: 1024, h: 1024 });
}

// ─── Workflow builders ────────────────────────────────────────────────────────

// Standard pass: base KSampler
function baseNodes(
  model: string, pos: string, neg: string, seed: number,
  w: number, h: number, steps: number, cfg: number,
  sampler: string, scheduler: string, batch: number
) {
  return {
    "4":  { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: model } },
    "5":  { class_type: "EmptyLatentImage", inputs: { width: w, height: h, batch_size: batch } },
    "6":  { class_type: "CLIPTextEncode", inputs: { text: pos, clip: ["4", 1] } },
    "7":  { class_type: "CLIPTextEncode", inputs: { text: neg, clip: ["4", 1] } },
    "3":  {
      class_type: "KSampler",
      inputs: {
        seed, control_after_generate: "fixed",
        steps, cfg, sampler_name: sampler, scheduler, denoise: 1.0,
        model: ["4", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["5", 0],
      },
    },
  };
}

// Hi-res fix pass on top of base latent — core of the realism upgrade
function hiresNodes(
  seed: number, steps: number, cfg: number,
  sampler: string, scheduler: string, denoise: number,
  scaleBy: number
) {
  return {
    "11": {
      class_type: "LatentUpscaleBy",
      inputs: {
        upscale_method: "bislerp",
        scale_by: scaleBy,
        samples: ["3", 0],
      },
    },
    "12": {
      class_type: "KSampler",
      inputs: {
        seed: seed + 1, control_after_generate: "fixed",
        steps, cfg, sampler_name: sampler, scheduler, denoise,
        model: ["4", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["11", 0],
      },
    },
  };
}

function saveNodes(fromLatent: string) {
  return {
    "8": { class_type: "VAEDecode", inputs: { samples: [fromLatent, 0], vae: ["4", 2] } },
    "9": { class_type: "SaveImage", inputs: { filename_prefix: "axs", images: ["8", 0] } },
  };
}

// REALISM: DPM++ 2M Karras + hi-res fix 1.5x
function buildRealismWorkflow(p: ComfyParams, model: string): Record<string, unknown> {
  const seed = p.seed ?? Math.floor(Math.random() * 2 ** 32);
  const { w, h } = getOptimalSize(p.width ?? 1024, p.height ?? 1024);
  const { pos, neg } = buildPrompts({ ...p, quality: "realism" }, model);
  return {
    ...baseNodes(model, pos, neg, seed, w, h, 30, 7, "dpmpp_2m", "karras", p.batch_size ?? 1),
    ...hiresNodes(seed, 15, 7, "dpmpp_2m", "karras", 0.45, 1.5),
    ...saveNodes("12"),
  };
}

// ULTRA: DPM++ 2M SDE Karras + hi-res fix 2x + tighter denoise
function buildUltraWorkflow(p: ComfyParams, model: string): Record<string, unknown> {
  const seed = p.seed ?? Math.floor(Math.random() * 2 ** 32);
  const { w, h } = getOptimalSize(p.width ?? 1024, p.height ?? 1024);
  const { pos, neg } = buildPrompts({ ...p, quality: "ultra" }, model);
  return {
    ...baseNodes(model, pos, neg, seed, w, h, 35, 7.5, "dpmpp_2m_sde", "karras", p.batch_size ?? 1),
    ...hiresNodes(seed, 20, 7, "dpmpp_2m_sde", "karras", 0.4, 2.0),
    ...saveNodes("12"),
  };
}

// CINEMATIC: Euler A + strong hi-res + cinematic prompt stack
function buildCinematicWorkflow(p: ComfyParams, model: string): Record<string, unknown> {
  const seed = p.seed ?? Math.floor(Math.random() * 2 ** 32);
  const { w, h } = getOptimalSize(p.width ?? 1024, p.height ?? 1024);
  const { pos, neg } = buildPrompts({ ...p, quality: "cinematic" }, model);
  return {
    ...baseNodes(model, pos, neg, seed, w, h, 30, 8, "euler_ancestral", "normal", p.batch_size ?? 1),
    ...hiresNodes(seed, 15, 7.5, "dpmpp_2m", "karras", 0.5, 1.5),
    ...saveNodes("12"),
  };
}

// Dual-LoRA: chains two LoraLoader nodes — character LoRA → picker LoRA → KSampler
// Node IDs: 4=checkpoint, 10=lora1, 20=lora2, 5=latent, 6=pos, 7=neg, 3=base KSampler,
// 11=upscale, 12=hires KSampler, 8=decode, 9=save
function buildDualLoRAWorkflow(
  p: ComfyParams,
  checkpointModel: string,
  lora1: string, weight1: number,
  lora2: string, weight2: number,
): Record<string, unknown> {
  if (!checkpointModel) throw new Error("Select a base checkpoint before using LoRAs.");
  const seed = p.seed ?? Math.floor(Math.random() * 2 ** 32);
  const { w, h } = getOptimalSize(p.width ?? 1024, p.height ?? 1024);
  const { pos, neg } = buildPrompts({ ...p, quality: p.quality ?? "realism" }, checkpointModel);
  return {
    "4":  { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: checkpointModel } },
    "10": { class_type: "LoraLoader", inputs: { model: ["4", 0],  clip: ["4", 1],  lora_name: lora1, strength_model: weight1, strength_clip: weight1 } },
    "20": { class_type: "LoraLoader", inputs: { model: ["10", 0], clip: ["10", 1], lora_name: lora2, strength_model: weight2, strength_clip: weight2 } },
    "5":  { class_type: "EmptyLatentImage", inputs: { width: w, height: h, batch_size: p.batch_size ?? 1 } },
    "6":  { class_type: "CLIPTextEncode",   inputs: { text: pos, clip: ["20", 1] } },
    "7":  { class_type: "CLIPTextEncode",   inputs: { text: neg, clip: ["20", 1] } },
    "3":  {
      class_type: "KSampler",
      inputs: {
        seed, control_after_generate: "fixed",
        steps: 30, cfg: 7, sampler_name: "dpmpp_2m", scheduler: "karras", denoise: 1.0,
        model: ["20", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["5", 0],
      },
    },
    "11": { class_type: "LatentUpscaleBy", inputs: { upscale_method: "bislerp", scale_by: 1.5, samples: ["3", 0] } },
    "12": {
      class_type: "KSampler",
      inputs: {
        seed: seed + 1, control_after_generate: "fixed",
        steps: 15, cfg: 7, sampler_name: "dpmpp_2m", scheduler: "karras", denoise: 0.45,
        model: ["20", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["11", 0],
      },
    },
    "8":  { class_type: "VAEDecode",  inputs: { samples: ["12", 0], vae: ["4", 2] } },
    "9":  { class_type: "SaveImage",  inputs: { filename_prefix: "axs", images: ["8", 0] } },
  };
}

// LoRA: applies LoRA on top of a base checkpoint, then full realism pipeline
function buildLoRAWorkflow(p: ComfyParams, checkpointModel: string, loraName: string, loraWeight = 0.85): Record<string, unknown> {
  if (!checkpointModel) throw new Error("Select a base checkpoint before using a LoRA.");
  const baseModel = checkpointModel;
  const seed = p.seed ?? Math.floor(Math.random() * 2 ** 32);
  const { w, h } = getOptimalSize(p.width ?? 1024, p.height ?? 1024);
  const { pos, neg } = buildPrompts({ ...p, quality: p.quality ?? "realism" }, baseModel);
  return {
    "4":  { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: baseModel } },
    "10": { class_type: "LoraLoader", inputs: { model: ["4", 0], clip: ["4", 1], lora_name: loraName, strength_model: loraWeight, strength_clip: loraWeight } },
    "5":  { class_type: "EmptyLatentImage", inputs: { width: w, height: h, batch_size: p.batch_size ?? 1 } },
    "6":  { class_type: "CLIPTextEncode", inputs: { text: pos, clip: ["10", 1] } },
    "7":  { class_type: "CLIPTextEncode", inputs: { text: neg, clip: ["10", 1] } },
    "3":  {
      class_type: "KSampler",
      inputs: {
        seed, control_after_generate: "fixed",
        steps: 30, cfg: 7, sampler_name: "dpmpp_2m", scheduler: "karras", denoise: 1.0,
        model: ["10", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["5", 0],
      },
    },
    "11": { class_type: "LatentUpscaleBy", inputs: { upscale_method: "bislerp", scale_by: 1.5, samples: ["3", 0] } },
    "12": {
      class_type: "KSampler",
      inputs: {
        seed: seed + 1, control_after_generate: "fixed",
        steps: 15, cfg: 7, sampler_name: "dpmpp_2m", scheduler: "karras", denoise: 0.45,
        model: ["10", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["11", 0],
      },
    },
    "8":  { class_type: "VAEDecode", inputs: { samples: ["12", 0], vae: ["4", 2] } },
    "9":  { class_type: "SaveImage", inputs: { filename_prefix: "axs", images: ["8", 0] } },
  };
}

// FLUX: own sampler config — no hi-res fix, cfg 1.0/3.5, simple scheduler
function buildFluxWorkflow(p: ComfyParams, model: string): Record<string, unknown> {
  const seed = p.seed ?? Math.floor(Math.random() * 2 ** 32);
  const { w, h } = getOptimalSize(p.width ?? 1024, p.height ?? 1024);
  const isSchnell = model.toLowerCase().includes("schnell");
  const { pos } = buildPrompts({ ...p, quality: "ultra" }, model);
  const fluxClipL = p.fluxClipL || getFluxClipL();
  const fluxT5xxl = p.fluxT5xxl || getFluxT5xxl();
  const fluxVae = p.fluxVae || getFluxVae();

  if (!fluxClipL || !fluxT5xxl) {
    throw new Error(
      [
        "FLUX model selected, but no valid FLUX text encoders are configured.",
        "Install clip_l.safetensors and a FLUX T5 encoder such as t5xxl_fp8_e4m3fn.safetensors into ComfyUI/models/text_encoders or ComfyUI/models/clip.",
        "Then set axs.fluxClipL and axs.fluxT5xxl in Settings/localStorage.",
        "This prevents ComfyUI's 'clip input is invalid: None' crash.",
      ].join(" ")
    );
  }

  return {
    "4": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: model } },
    "40": { class_type: "DualCLIPLoader", inputs: { clip_name1: fluxClipL, clip_name2: fluxT5xxl, type: "flux" } },
    "5": { class_type: "EmptyLatentImage", inputs: { width: w, height: h, batch_size: p.batch_size ?? 1 } },
    "6": { class_type: "CLIPTextEncode", inputs: { text: pos, clip: ["40", 0] } },
    "7": { class_type: "CLIPTextEncode", inputs: { text: "", clip: ["40", 0] } },
    "3": {
      class_type: "KSampler",
      inputs: {
        seed, control_after_generate: "fixed",
        steps: isSchnell ? 4 : 25, cfg: isSchnell ? 1.0 : 3.5,
        sampler_name: "euler", scheduler: "simple", denoise: 1.0,
        model: ["4", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["5", 0],
      },
    },
    ...(fluxVae ? { "41": { class_type: "VAELoader", inputs: { vae_name: fluxVae } } } : {}),
    "8": { class_type: "VAEDecode", inputs: { samples: ["3", 0], vae: fluxVae ? ["41", 0] : ["4", 2] } },
    "9": { class_type: "SaveImage", inputs: { filename_prefix: "axs", images: ["8", 0] } },
  };
}

// LIGHTNING / TURBO: distilled models — NEVER use hi-res fix, very few steps, low CFG
function buildLightningWorkflow(p: ComfyParams, model: string): Record<string, unknown> {
  const seed = p.seed ?? Math.floor(Math.random() * 2 ** 32);
  const { w, h } = getOptimalSize(p.width ?? 1024, p.height ?? 1024);
  const { pos, neg } = buildPrompts({ ...p, quality: p.quality ?? "realism" }, model);
  // DPM SDE models (Dreamshaper Lightning DPM SDE) use dpmpp_sde + karras
  // Standard lightning (RealVis Lightning) use euler + sgm_uniform
  const n = model.toLowerCase();
  const sampler = (n.includes("dpmsde") || n.includes("dpm_sde") || n.includes("dpm-sde")) ? "dpmpp_sde" : "euler";
  const scheduler = sampler === "dpmpp_sde" ? "karras" : "sgm_uniform";
  return {
    ...baseNodes(model, pos, neg, seed, w, h, 6, 2.0, sampler, scheduler, p.batch_size ?? 1),
    ...saveNodes("3"),
  };
}

function buildSD21Workflow(p: ComfyParams, model: string): Record<string, unknown> {
  const seed = p.seed ?? Math.floor(Math.random() * 2 ** 32);
  const { pos, neg } = buildPrompts({ ...p, quality: "realism" }, model);
  return {
    ...baseNodes(model, pos, neg, seed, 768, 768, 30, 7, "dpmpp_2m", "karras", p.batch_size ?? 1),
    ...saveNodes("3"),
  };
}

// IMG2IMG: reference image via VAEEncode, strength-based denoise.
// denoiseOverride: caller controls how much of the reference to preserve.
//   - Body/style refs: 0.75 (moderate creativity, style preserved)
//   - Face refs (FaceID mode): 0.88 (high fidelity — face identity locked)
function buildImg2ImgWorkflow(
  p: ComfyParams, model: string, refImage: string, denoiseOverride = 0.75,
): Record<string, unknown> {
  const seed = p.seed ?? Math.floor(Math.random() * 2 ** 32);
  const { w, h } = getOptimalSize(p.width ?? 1024, p.height ?? 1024);
  const q = p.quality ?? "realism";
  const { pos, neg } = buildPrompts({ ...p, quality: q }, model);
  const cfg = isLightning(model) ? 2.0 : q === "ultra" ? 7.5 : q === "cinematic" ? 8 : 7;
  const sampler = isLightning(model) ? "euler" : q === "cinematic" ? "euler_ancestral" : "dpmpp_2m";
  const scheduler = isLightning(model) ? "sgm_uniform" : q === "cinematic" ? "normal" : "karras";
  const steps = isLightning(model) ? 6 : q === "ultra" ? 30 : 25;
  return {
    "4":  { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: model } },
    "13": { class_type: "LoadImage",    inputs: { image: refImage, upload: "image" } },
    "15": { class_type: "ImageScale",   inputs: { image: ["13", 0], upscale_method: "lanczos", width: w, height: h, crop: "center" } },
    "14": { class_type: "VAEEncode",    inputs: { pixels: ["15", 0], vae: ["4", 2] } },
    "6":  { class_type: "CLIPTextEncode", inputs: { text: pos, clip: ["4", 1] } },
    "7":  { class_type: "CLIPTextEncode", inputs: { text: neg, clip: ["4", 1] } },
    "3":  {
      class_type: "KSampler",
      inputs: {
        seed, control_after_generate: "fixed",
        steps, cfg, sampler_name: sampler, scheduler,
        denoise: denoiseOverride,
        model: ["4", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["14", 0],
      },
    },
    "8":  { class_type: "VAEDecode", inputs: { samples: ["3", 0], vae: ["4", 2] } },
    "9":  { class_type: "SaveImage", inputs: { filename_prefix: "axs", images: ["8", 0] } },
  };
}

// ─── Main selector ────────────────────────────────────────────────────────────

export function buildWorkflow(p: ComfyParams): Record<string, unknown> {
  const model = p.model || getModel();
  if (!model) throw new Error("No model selected — pick one at the top of Image Forge.");
  const route = resolveComfyWorkflowRoute(model, p);
  const q = p.quality ?? "realism";

  // Face reference (FaceID) takes priority — higher denoise preserves face identity
  if (p.faceRefImage) {
    return buildImg2ImgWorkflow(p, model, p.faceRefImage, p.faceRefStrength ?? 0.88);
  }

  // Body/style img2img
  if (p.referenceImage) return buildImg2ImgWorkflow(p, model, p.referenceImage);

  // Multi-LoRA stacking — chain two LoraLoader nodes when both character + picker are active
  if (p.loras && p.loras.length >= 2) {
    return buildDualLoRAWorkflow(p, model, p.loras[0].name, p.loras[0].weight, p.loras[1].name, p.loras[1].weight);
  }

  // Single LoRA
  if (p.loras && p.loras.length === 1) {
    if (isLightning(model)) return buildLightningWorkflow(p, model);
    return buildLoRAWorkflow(p, model, p.loras[0].name, p.loras[0].weight);
  }

  // Legacy single-LoRA path (backwards compat with direct lora/loraWeight params)
  if (p.lora) {
    if (isLightning(model)) return buildLightningWorkflow(p, model);
    return buildLoRAWorkflow(p, model, p.lora, p.loraWeight ?? 0.85);
  }

  switch (route.kind) {
    case "flux":  return buildFluxWorkflow(p, model);
    case "sd21":  return buildSD21Workflow(p, model);
    case "video-model-blocked":
    case "ltx-1.1-i2v":
    case "ltx-2.3-universe":
      throw new Error(`"${model}" is a video model — use the Videos tab.`);
    case "lora-checkpoint-blocked":
      throw new Error(`"${model}" is a LoRA file — select a full checkpoint as the base model, then pick this LoRA from the LoRA slot below.`);
    default: {
      if (route.kind === "sdxl-lightning" || route.kind === "sdxl-pony-lightning" || isLightning(model)) {
        return buildLightningWorkflow(p, model);
      }
      if (q === "ultra")      return buildUltraWorkflow(p, model);
      if (q === "cinematic")  return buildCinematicWorkflow(p, model);
      return buildRealismWorkflow(p, model);
    }
  }
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function submitPrompt(workflow: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${getBase()}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow, client_id: crypto.randomUUID() }),
  });
  if (!res.ok) throw new Error(`ComfyUI /prompt ${res.status}: ${await res.text().catch(() => "")}`);
  const data = await res.json();
  if (!data.prompt_id) throw new Error("ComfyUI returned no prompt_id");
  return data.prompt_id as string;
}

type ComfyOutputs = Record<string, { images?: Array<{ filename: string; subfolder: string; type: string }> }>;

function getComfyExceptionMessage(value: unknown): string | null {
  if (value && typeof value === "object" && "exception_message" in value) {
    const message = (value as { exception_message?: unknown }).exception_message;
    return typeof message === "string" ? message : null;
  }
  return null;
}

async function pollHistory(promptId: string, onProgress?: (i: number) => void): Promise<ComfyOutputs> {
  for (let i = 0; i < 180; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`${getBase()}/history/${promptId}`);
    if (!res.ok) { onProgress?.(i); continue; }
    const data = await res.json();
    const entry = data[promptId];
    if (!entry) { onProgress?.(i); continue; }
    const messages: Array<[string, unknown]> = entry.status?.messages ?? [];
    const err = messages.find(([t]) => t === "execution_error");
    if (err) throw new Error(`ComfyUI: ${getComfyExceptionMessage(err[1]) ?? JSON.stringify(err[1])}`);
    if (entry.status?.completed === true) {
      const outputs = entry.outputs as ComfyOutputs;
      if (!outputs || Object.keys(outputs).length === 0)
        throw new Error("Job completed but no output — model may be corrupted or VRAM too low.");
      return outputs;
    }
    onProgress?.(i);
  }
  throw new Error("ComfyUI timed out — hi-res pass on 3080 can take 2-3 min, try again");
}

async function imageToBase64(filename: string, subfolder: string, type: string): Promise<string> {
  const res = await fetch(`${getBase()}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${type}`);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Public ───────────────────────────────────────────────────────────────────

export async function comfyGenerate(params: ComfyParams, onProgress?: (i: number) => void): Promise<ImageJobOutput> {
  const seed = params.seed ?? Math.floor(Math.random() * 2 ** 32);
  const workflow = buildWorkflow({ ...params, seed });
  const promptId = await submitPrompt(workflow);
  const outputs = await pollHistory(promptId, onProgress);
  const images: Array<{ image: string; mime: string; seed: number; index: number }> = [];
  let index = 0;
  for (const nodeOut of Object.values(outputs)) {
    if (nodeOut.images) {
      for (const img of nodeOut.images) {
        // Bug 3 fix: imageToBase64 already returns the full data URL with the correct
        // MIME type from the blob (could be PNG, WebP, JPEG). Strip prefix here so
        // ImageForge can re-wrap with the exact same MIME rather than hardcoding /png.
        const dataUrl = await imageToBase64(img.filename, img.subfolder, img.type);
        const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
        const mime = mimeMatch?.[1] ?? "image/png";
        images.push({ image: dataUrl.replace(/^data:[^;]+;base64,/, ""), mime, seed, index: index++ });
      }
    }
  }
  if (images.length === 0) throw new Error("ComfyUI returned no images");
  return { status: "success", images };
}

function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
    return AbortSignal.timeout(ms);
  }
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

export async function testComfyUIConnection(url?: string): Promise<{ ok: boolean; models?: string[]; loras?: string[]; gpuName?: string; error?: string }> {
  const base = (url || getBase()).replace(/\/$/, "");
  try {
    const [statsRes, modelsRes, lorasRes] = await Promise.all([
      fetch(`${base}/system_stats`, { signal: timeoutSignal(5000) }),
      fetch(`${base}/object_info/CheckpointLoaderSimple`, { signal: timeoutSignal(5000) }),
      fetch(`${base}/object_info/LoraLoader`, { signal: timeoutSignal(5000) }),
    ]);
    if (!statsRes.ok) throw new Error(`HTTP ${statsRes.status}`);
    const stats = await statsRes.json();
    const gpuName: string = stats?.devices?.[0]?.name ?? "Unknown GPU";
    let models: string[] = [];
    let loras: string[] = [];
    if (modelsRes.ok) {
      const d = await modelsRes.json();
      // Filter out any files that ended up in checkpoints but are actually LoRAs
      const all: string[] = d?.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] ?? [];
      models = all.filter((m) => detectModelType(m) !== "lora");
    }
    if (lorasRes.ok) {
      const d = await lorasRes.json();
      loras = d?.LoraLoader?.input?.required?.lora_name?.[0] ?? [];
    }
    return { ok: true, models, loras, gpuName };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
