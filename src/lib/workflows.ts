/**
 * AXS AI Creative Studios — high-level job builders.
 * Nothing here ever takes an uploaded photo of a person.
 *
 * Prompt composition has been moved to composePrompt.ts.
 * ImageForge pre-composes the prompt (with per-gen tag overrides) before
 * calling forgeImage, so buildImageInput receives an already-composed string
 * and passes it through unchanged.
 */
import { RunPodClient } from "./runpod";
import { comfyGenerate, uploadReferenceImage } from "./comfyui";
import { composeFromCharacter } from "./composePrompt";
import { resolveVideoWorkflowProfile } from "./workflowRegistry";
import type {
  Character,
  ForgeSettings,
  ImageJobInput,
  ImageJobOutput,
  StylePreset,
  VideoJobInput,
} from "./types";

export interface ForgeImageArgs {
  prompt: string;
  negativePrompt?: string;
  character?: Character | null;
  stylePreset?: StylePreset;
  settings: ForgeSettings;
  seedOverride?: number;
  quality?: "realism" | "ultra" | "cinematic";
  model?: string;
  /** Body/style reference image — img2img at 0.75 denoise. */
  referenceImageDataUrl?: string;
  /**
   * Face reference for FaceID mode — img2img at 0.88 denoise to preserve
   * face identity more faithfully than a plain style reference.
   */
  faceRefImageDataUrl?: string;
  faceRefStrength?: number;
  /** Optional LoRA from the loras/ folder to stack on top of the checkpoint. */
  lora?: string;
  loraWeight?: number;
  /**
   * Multi-LoRA stacking — when provided, takes precedence over single lora/loraWeight.
   * Generates a chained LoraLoader workflow: loras[0] → loras[1] → KSampler.
   */
  loras?: Array<{ name: string; weight: number }>;
}

export function buildImageInput(args: ForgeImageArgs): ImageJobInput {
  const { prompt, negativePrompt, character, stylePreset, settings, seedOverride } = args;
  const seed = seedOverride ?? character?.seed;

  return {
    prompt,
    negative_prompt: negativePrompt || settings.defaultNegative,
    seed,
    steps: settings.steps,
    guidance: settings.guidance,
    width: settings.width,
    height: settings.height,
    batch_size: settings.batchSize,
    scheduler: settings.scheduler,
    style_preset: stylePreset || character?.stylePreset || settings.stylePreset,
    enhance_prompt: settings.enhancePrompt,
    upscale_factor: settings.upscaleFactor,
    character_lora: character?.loraName,
    character_lora_weight: character?.loraWeight ?? settings.characterLoraWeight,
  };
}

// Bug 8 fix: treat absent key as true (local ComfyUI is the default).
// Before IDB rehydrates on first load, the key is absent — without this default
// the first generation would incorrectly route to RunPod instead of ComfyUI.
const isLocal = () => {
  const val = localStorage.getItem("axs.useLocal");
  return val === null ? true : val === "true";
};

/** Fire an image job — routes to local ComfyUI or RunPod based on settings. */
export async function forgeImage(args: ForgeImageArgs): Promise<ImageJobOutput> {
  const input = buildImageInput(args);
  if (isLocal()) {
    // Upload reference images in parallel when present
    const [referenceImage, faceRefImage] = await Promise.all([
      args.referenceImageDataUrl ? uploadReferenceImage(args.referenceImageDataUrl) : Promise.resolve(undefined),
      args.faceRefImageDataUrl   ? uploadReferenceImage(args.faceRefImageDataUrl)   : Promise.resolve(undefined),
    ]);

    // Resolve LoRA(s): multi-lora array takes precedence over single lora param
    const resolvedLoras = args.loras ??
      ((args.lora || input.character_lora)
        ? [{ name: (args.lora || input.character_lora)!, weight: args.loraWeight ?? input.character_lora_weight ?? 0.85 }]
        : undefined);

    return comfyGenerate({
      prompt:         input.prompt,
      negative_prompt: input.negative_prompt,
      seed:           input.seed,
      steps:          input.steps,
      guidance:       input.guidance,
      width:          input.width,
      height:         input.height,
      batch_size:     input.batch_size,
      scheduler:      input.scheduler,
      quality:        args.quality,
      model:          args.model,
      referenceImage,
      faceRefImage,
      faceRefStrength: args.faceRefStrength,
      fluxClipL:        args.settings.fluxClipL,
      fluxT5xxl:        args.settings.fluxT5xxl,
      fluxVae:          args.settings.fluxVae,
      loras:           resolvedLoras,
      // Legacy single-lora fallback for RunPod compat (comfyGenerate handles both)
      lora:            resolvedLoras?.length === 1 ? resolvedLoras[0].name : undefined,
      loraWeight:      resolvedLoras?.length === 1 ? resolvedLoras[0].weight : undefined,
    });
  }
  // RunPod: extend input with new fields
  const runpodInput = {
    ...input,
    loras:            args.loras,
    face_ref_strength: args.faceRefStrength,
  };
  return RunPodClient.runSync<ImageJobOutput>(runpodInput);
}

/** Async variant — local mode runs synchronously via ComfyUI (same result). */
export async function forgeImageAsync(args: ForgeImageArgs) {
  if (isLocal()) return forgeImage(args);
  const input = buildImageInput(args);
  return RunPodClient.runAsync(input);
}

export interface ForgeVideoArgs {
  prompt: string;
  negativePrompt?: string;
  character?: Character | null;
  settings: ForgeSettings;
  seedOverride?: number;
}

export function buildVideoInput(args: ForgeVideoArgs): VideoJobInput {
  const { prompt, negativePrompt, character, settings, seedOverride } = args;
  const profile = resolveVideoWorkflowProfile(settings.videoModel);
  const [profileWidth, profileHeight] = profile.resolution.split("x").map(Number);
  // Video always composes from character DNA (no per-gen tag overrides in VideoForge yet)
  return {
    model: settings.videoModel || "ltx-video-2.3",
    workflow: settings.videoWorkflow || "ltx-2.3-character-consistent-directors-cut",
    prompt: composeFromCharacter(character ?? null, { userPrompt: prompt }).prompt,
    negative_prompt: negativePrompt || settings.defaultNegative,
    seed: seedOverride ?? character?.seed,
    duration_seconds: settings.videoDuration,
    fluidity: settings.videoFluidity,
    width: Number.isFinite(profileWidth) ? profileWidth : settings.width,
    height: Number.isFinite(profileHeight) ? profileHeight : settings.height,
    character_lora: character?.loraName,
    character_lora_weight: character?.loraWeight ?? settings.characterLoraWeight,
    format: settings.videoFormat,
  };
}

export async function forgeVideoAsync(args: ForgeVideoArgs) {
  const input = buildVideoInput(args);
  const endpoint = localStorage.getItem("axs.videoEndpointId") || undefined;
  return RunPodClient.runAsync(input, endpoint);
}

export async function pollVideo(
  jobId: string,
  onProgress?: (s: string, attempt: number) => void
) {
  const endpoint = localStorage.getItem("axs.videoEndpointId") || undefined;
  return RunPodClient.poll(
    jobId,
    (st, attempt) => onProgress?.(st.status, attempt),
    endpoint
  );
}

/** Cost estimator — rough per-second GPU costs. Tune in Settings. */
export function estimateImageCost(settings: ForgeSettings, gpuUsdPerHour = 1.5) {
  // Rough: FLUX txt2img ~0.6s per step at 1024x1024 on A100
  const seconds = settings.steps * 0.6 * settings.batchSize;
  return (seconds / 3600) * gpuUsdPerHour;
}
