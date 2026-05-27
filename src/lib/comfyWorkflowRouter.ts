import type { ComfyParams, ModelType } from "./comfyui";

export type ComfyWorkflowUseCase =
  | "text-to-image"
  | "image-reference"
  | "face-lock"
  | "lora-stack"
  | "video"
  | "post-upscale"
  | "universe-series";

export type ComfyWorkflowKind =
  | "sdxl-realistic"
  | "sdxl-lightning"
  | "sdxl-pony"
  | "sdxl-pony-lightning"
  | "sd21"
  | "flux"
  | "lora-checkpoint-blocked"
  | "video-model-blocked"
  | "ltx-1.1-i2v"
  | "ltx-2.3-universe"
  | "post-upscale";

export type ComfyModelFamily =
  | "flux"
  | "pony-sdxl"
  | "realistic-sdxl"
  | "generic-sdxl"
  | "sd21"
  | "lora"
  | "ltx"
  | "wan"
  | "video"
  | "unknown";

export type ComfyRouteStatus = "ready" | "watch" | "blocked";

export interface ComfyModelFingerprint {
  rawModel: string;
  normalized: string;
  type: ModelType;
  family: ComfyModelFamily;
  isLightning: boolean;
  isPony: boolean;
  isFlux: boolean;
  isLora: boolean;
  isVideo: boolean;
  isLtx: boolean;
  isRealistic: boolean;
}

export interface ComfyWorkflowDefaults {
  steps: number;
  cfg: number;
  sampler: string;
  scheduler: string;
  width: number;
  height: number;
  hires: boolean;
  denoise?: number;
}

export interface ComfyWorkflowRoute {
  kind: ComfyWorkflowKind;
  profileId: string;
  title: string;
  status: ComfyRouteStatus;
  useCase: ComfyWorkflowUseCase;
  family: ComfyModelFamily;
  gpuFit: "3080-10gb-safe" | "3080-10gb-tight" | "cloud-recommended";
  defaults: ComfyWorkflowDefaults;
  reasons: string[];
  warnings: string[];
  requiredConfig: string[];
}

function normalizeModelName(model: string): string {
  return model
    .toLowerCase()
    .replace(/\\/g, "/")
    .split("/")
    .pop()!
    .replace(/\.(safetensors|ckpt|pt|pth|gguf)$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function detectComfyModelType(model: string): ModelType {
  const n = normalizeModelName(model);
  if ((n.includes("wan") && (n.includes("t2v") || n.includes("i2v"))) || n.includes("ltx")) {
    return "video";
  }
  if (n.includes("flux")) return "flux";
  if (n.match(/v2-?1/) || (n.includes("768") && n.includes("pruned"))) return "sd21";
  if (n.includes("lora") || n.match(/-\d{6}$/) || n.match(/-\d{6}-/)) return "lora";
  return "sdxl";
}

export function fingerprintComfyModel(model: string): ComfyModelFingerprint {
  const normalized = normalizeModelName(model);
  const type = detectComfyModelType(model);
  const isLightning =
    normalized.includes("lightning") ||
    normalized.includes("turbo") ||
    normalized.includes("lcm") ||
    normalized.includes("hyper") ||
    normalized.includes("schnell");
  const isPony = normalized.includes("pony");
  const isFlux = type === "flux";
  const isLora = type === "lora";
  const isLtx = normalized.includes("ltx");
  const isVideo = type === "video";
  const isRealistic =
    normalized.includes("realvis") ||
    normalized.includes("juggernaut") ||
    normalized.includes("epicrealism") ||
    normalized.includes("realistic") ||
    normalized.includes("photon") ||
    normalized.includes("cyberrealistic");

  let family: ComfyModelFamily = "generic-sdxl";
  if (isFlux) family = "flux";
  else if (isLora) family = "lora";
  else if (isLtx) family = "ltx";
  else if (normalized.includes("wan")) family = "wan";
  else if (isVideo) family = "video";
  else if (type === "sd21") family = "sd21";
  else if (isPony) family = "pony-sdxl";
  else if (isRealistic) family = "realistic-sdxl";

  return {
    rawModel: model,
    normalized,
    type,
    family,
    isLightning,
    isPony,
    isFlux,
    isLora,
    isVideo,
    isLtx,
    isRealistic,
  };
}

function inferUseCase(params?: Partial<ComfyParams>, requested?: ComfyWorkflowUseCase): ComfyWorkflowUseCase {
  if (requested) return requested;
  if (params?.faceRefImage) return "face-lock";
  if (params?.referenceImage) return "image-reference";
  if ((params?.loras?.length ?? 0) > 0 || params?.lora) return "lora-stack";
  return "text-to-image";
}

function sizeFor(params?: Partial<ComfyParams>): Pick<ComfyWorkflowDefaults, "width" | "height"> {
  return {
    width: params?.width ?? 1024,
    height: params?.height ?? 1024,
  };
}

export function resolveComfyWorkflowRoute(
  model: string,
  params?: Partial<ComfyParams>,
  requestedUseCase?: ComfyWorkflowUseCase
): ComfyWorkflowRoute {
  const fingerprint = fingerprintComfyModel(model);
  const useCase = inferUseCase(params, requestedUseCase);
  const size = sizeFor(params);
  const reasons: string[] = [];
  const warnings: string[] = [];
  const requiredConfig: string[] = [];

  if (!model) {
    return {
      kind: "sdxl-realistic",
      profileId: "realistic-dna-photo",
      title: "No Model Selected",
      status: "blocked",
      useCase,
      family: "unknown",
      gpuFit: "3080-10gb-safe",
      defaults: { steps: 28, cfg: 5.5, sampler: "dpmpp_2m", scheduler: "karras", hires: false, ...size },
      reasons: ["No active ComfyUI model is selected."],
      warnings: ["Pick a checkpoint in Config before generating."],
      requiredConfig: ["Active ComfyUI checkpoint"],
    };
  }

  if (useCase === "post-upscale") {
    return {
      kind: "post-upscale",
      profileId: "rtx-video-super-resolution",
      title: "RTX Video Super Resolution Upscale",
      status: "ready",
      useCase,
      family: fingerprint.family,
      gpuFit: "3080-10gb-safe",
      defaults: { steps: 1, cfg: 1, sampler: "rtx-vsr", scheduler: "target-dimensions", width: 3840, height: 2160, hires: false },
      reasons: ["Request is an upscale pass, so AXS routes to the RTX VSR post-process workflow."],
      warnings,
      requiredConfig,
    };
  }

  if (fingerprint.isLora) {
    return {
      kind: "lora-checkpoint-blocked",
      profileId: "sdxl-pony-controlnet",
      title: "LoRA Needs a Base Checkpoint",
      status: "blocked",
      useCase,
      family: "lora",
      gpuFit: "3080-10gb-safe",
      defaults: { steps: 30, cfg: 7, sampler: "dpmpp_2m", scheduler: "karras", hires: true, ...size },
      reasons: ["The selected file looks like a LoRA, not a full checkpoint."],
      warnings: ["Select a full checkpoint as Active Model, then attach this LoRA in the LoRA slot."],
      requiredConfig: ["Base checkpoint"],
    };
  }

  if (fingerprint.isVideo || useCase === "video" || useCase === "universe-series") {
    const isUniverse = useCase === "universe-series" || fingerprint.normalized.includes("2-3");
    return {
      kind: isUniverse ? "ltx-2.3-universe" : "ltx-1.1-i2v",
      profileId: isUniverse ? "ltx-2.3-universe-directors-cut" : "ltx-1.1-3080-i2v",
      title: isUniverse ? "LTX 2.3 Universe Director's Cut" : "LTX 1.1 3080 Image-to-Video",
      status: isUniverse ? "watch" : "ready",
      useCase,
      family: fingerprint.isLtx ? "ltx" : fingerprint.family,
      gpuFit: isUniverse ? "cloud-recommended" : "3080-10gb-safe",
      defaults: {
        steps: isUniverse ? 28 : 22,
        cfg: isUniverse ? 4.1 : 3.5,
        sampler: "ltx-i2v",
        scheduler: "cinematic",
        width: isUniverse ? 832 : 768,
        height: isUniverse ? 1216 : 1280,
        hires: false,
      },
      reasons: [
        isUniverse
          ? "Universe series request needs continuity-first LTX routing."
          : "Video model/request detected; image workflows are bypassed.",
      ],
      warnings: isUniverse ? ["LTX 2.3 is best with cloud/offload for heavier multi-shot scenes."] : [],
      requiredConfig: isUniverse ? ["Video endpoint or local LTX 2.3 workflow"] : [],
    };
  }

  if (fingerprint.isFlux) {
    requiredConfig.push("FLUX clip_l encoder", "FLUX T5 encoder");
    reasons.push("Filename contains FLUX, so AXS uses the split-encoder FLUX graph.");
    if (fingerprint.isLightning) reasons.push("Distilled FLUX variant detected; steps and CFG stay low.");
    return {
      kind: "flux",
      profileId: "flux-fp8-character-lock",
      title: "FLUX FP8 Character Lock",
      status: "watch",
      useCase,
      family: "flux",
      gpuFit: "3080-10gb-tight",
      defaults: {
        steps: fingerprint.normalized.includes("schnell") ? 4 : 25,
        cfg: fingerprint.normalized.includes("schnell") ? 1 : 3.5,
        sampler: "euler",
        scheduler: "simple",
        hires: false,
        ...size,
      },
      reasons,
      warnings: ["FLUX checkpoints often need external CLIP/T5 encoders to avoid ComfyUI clip=None errors."],
      requiredConfig,
    };
  }

  if (fingerprint.type === "sd21") {
    return {
      kind: "sd21",
      profileId: "realistic-dna-photo",
      title: "Stable Diffusion 2.1 Legacy",
      status: "ready",
      useCase,
      family: "sd21",
      gpuFit: "3080-10gb-safe",
      defaults: { steps: 30, cfg: 7, sampler: "dpmpp_2m", scheduler: "karras", width: 768, height: 768, hires: false },
      reasons: ["SD 2.1 checkpoint detected; AXS uses the lighter legacy image workflow."],
      warnings,
      requiredConfig,
    };
  }

  if (fingerprint.isPony) {
    const lightning = fingerprint.isLightning;
    return {
      kind: lightning ? "sdxl-pony-lightning" : "sdxl-pony",
      profileId: "sdxl-pony-controlnet",
      title: lightning ? "Pony SDXL Lightning Studio" : "Pony / SDXL ControlNet Studio",
      status: "ready",
      useCase,
      family: "pony-sdxl",
      gpuFit: "3080-10gb-safe",
      defaults: {
        steps: lightning ? 6 : 30,
        cfg: lightning ? 2 : 6.5,
        sampler: lightning ? "euler" : "dpmpp_2m",
        scheduler: lightning ? "sgm_uniform" : "karras",
        hires: !lightning,
        ...size,
      },
      reasons: ["Pony model fingerprint detected, so AXS injects Pony score tags and SDXL-safe defaults."],
      warnings: lightning ? ["Lightning Pony models skip hi-res fix and use very low CFG."] : [],
      requiredConfig,
    };
  }

  if (fingerprint.isLightning) {
    return {
      kind: "sdxl-lightning",
      profileId: "realistic-dna-photo",
      title: "Realistic SDXL Lightning",
      status: "ready",
      useCase,
      family: fingerprint.family,
      gpuFit: "3080-10gb-safe",
      defaults: { steps: 6, cfg: 2, sampler: "euler", scheduler: "sgm_uniform", hires: false, ...size },
      reasons: ["Lightning/Turbo/LCM fingerprint detected; AXS disables hi-res fix and uses fast low-CFG sampling."],
      warnings,
      requiredConfig,
    };
  }

  return {
    kind: "sdxl-realistic",
    profileId: "realistic-dna-photo",
    title: fingerprint.isRealistic ? "Realistic DNA Photo Studio" : "SDXL Cinematic Image Studio",
    status: "ready",
    useCase,
    family: fingerprint.family,
    gpuFit: "3080-10gb-safe",
    defaults: { steps: 28, cfg: 5.5, sampler: "dpmpp_2m", scheduler: "karras", hires: true, ...size },
    reasons: [
      fingerprint.isRealistic
        ? "Realistic SDXL model fingerprint detected."
        : "Generic SDXL checkpoint detected; AXS applies the safe cinematic SDXL workflow.",
    ],
    warnings,
    requiredConfig,
  };
}
