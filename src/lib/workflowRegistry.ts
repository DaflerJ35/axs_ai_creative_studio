import type { AdvancedSceneSettings } from "@/features/scene-builder/types/scene-builder.types";
import type { ForgeSettings } from "@/lib/types";
import { resolveComfyWorkflowRoute } from "./comfyWorkflowRouter";

export type WorkflowUseCase = "image" | "video" | "universe-series" | "post-upscale";
export type WorkflowGpuFit = "3080-10gb-safe" | "3080-10gb-tight" | "cloud-recommended";
export type WorkflowModelInput = AdvancedSceneSettings["model"] | ForgeSettings["videoModel"] | string;

export interface WorkflowProfile {
  id: string;
  modelIds: AdvancedSceneSettings["model"][];
  title: string;
  useCase: WorkflowUseCase;
  family: "flux" | "sdxl" | "realistic" | "ltx" | "hosted";
  gpuFit: WorkflowGpuFit;
  resolution: string;
  fps?: number;
  steps: number;
  cfg: number;
  vramNotes: string;
  continuity: {
    characterDna: boolean;
    faceLock: number;
    bodyLock: number;
    ipAdapter: number;
    controlNet: string[];
  };
  postProcess: string[];
  promptNotes: string[];
}

export const WORKFLOW_PROFILES: WorkflowProfile[] = [
  {
    id: "flux-fp8-character-lock",
    modelIds: ["flux1-dev-fp8", "flux1-schnell-fp8", "flux-2-flash"],
    title: "FLUX FP8 Character Lock",
    useCase: "image",
    family: "flux",
    gpuFit: "3080-10gb-tight",
    resolution: "1024x1344",
    steps: 24,
    cfg: 3.5,
    vramNotes: "Use FP8/GGUF and split CLIP/T5 encoders. Batch size 1 on RTX 3080 10GB.",
    continuity: {
      characterDna: true,
      faceLock: 0.88,
      bodyLock: 0.72,
      ipAdapter: 0.84,
      controlNet: ["optional-depth", "optional-openpose"],
    },
    postProcess: ["detail-upscale-optional", "metadata-save"],
    promptNotes: ["strong prompt adherence", "premium realism", "identity-preserving DNA prompt"],
  },
  {
    id: "sdxl-pony-controlnet",
    modelIds: ["biglove-pony2", "dreamshaper-xl"],
    title: "Pony / SDXL ControlNet Studio",
    useCase: "image",
    family: "sdxl",
    gpuFit: "3080-10gb-safe",
    resolution: "1024x1024",
    steps: 30,
    cfg: 6.5,
    vramNotes: "Safe on RTX 3080 10GB with SDXL/Pony batch size 1 and moderate ControlNet strengths.",
    continuity: {
      characterDna: true,
      faceLock: 0.82,
      bodyLock: 0.7,
      ipAdapter: 0.78,
      controlNet: ["openpose", "depth"],
    },
    postProcess: ["optional-refiner", "optional-1.5x-upscale"],
    promptNotes: ["score tags for Pony", "pose/depth controlled composition"],
  },
  {
    id: "realistic-dna-photo",
    modelIds: ["realvis-xl", "juggernaut-xl", "nano-banana-2", "nano-banana-pro", "gpt-image-2"],
    title: "Realistic DNA Photo Studio",
    useCase: "image",
    family: "realistic",
    gpuFit: "3080-10gb-safe",
    resolution: "1024x1536",
    steps: 28,
    cfg: 5.5,
    vramNotes: "Best all-around still-image path for local realistic character frames.",
    continuity: {
      characterDna: true,
      faceLock: 0.84,
      bodyLock: 0.68,
      ipAdapter: 0.78,
      controlNet: ["optional-depth"],
    },
    postProcess: ["face-detailer-optional", "metadata-save"],
    promptNotes: ["natural skin texture", "editorial lighting", "low identity drift"],
  },
  {
    id: "ltx-1.1-3080-i2v",
    modelIds: ["ltx-video-1.1"],
    title: "LTX 1.1 3080 Image-to-Video",
    useCase: "video",
    family: "ltx",
    gpuFit: "3080-10gb-safe",
    resolution: "768x1280",
    fps: 12,
    steps: 22,
    cfg: 3.5,
    vramNotes: "3080-safe path: short clips, 12-16fps, 768x1280 or 832x1216, then RTX VSR upscale.",
    continuity: {
      characterDna: true,
      faceLock: 0.86,
      bodyLock: 0.72,
      ipAdapter: 0.8,
      controlNet: ["first-frame", "optional-openpose", "optional-depth"],
    },
    postProcess: ["VHS_VideoCombine", "RTXVideoSuperResolution", "H264 MP4"],
    promptNotes: ["first-frame identity lock", "short cinematic camera move", "avoid long multi-character motion"],
  },
  {
    id: "ltx-2.3-universe-directors-cut",
    modelIds: ["ltx-video-2.3"],
    title: "LTX 2.3 Universe Director's Cut",
    useCase: "universe-series",
    family: "ltx",
    gpuFit: "cloud-recommended",
    resolution: "832x1216",
    fps: 16,
    steps: 28,
    cfg: 4.1,
    vramNotes: "Best Universe Forge continuity path. Use cloud or aggressive offload for heavier multi-shot sequences.",
    continuity: {
      characterDna: true,
      faceLock: 0.9,
      bodyLock: 0.78,
      ipAdapter: 0.86,
      controlNet: ["first-frame", "openpose", "depth", "timeline-continuity"],
    },
    postProcess: ["RTX VSR 4K", "RIFE optional", "director-grade color pass"],
    promptNotes: ["story arc memory", "wardrobe continuity", "lighting continuity", "multi-shot pacing"],
  },
];

export const DEFAULT_WORKFLOW_PROFILE = WORKFLOW_PROFILES.find((profile) => profile.id === "realistic-dna-photo")!;

export function resolveWorkflowProfile(model: WorkflowModelInput): WorkflowProfile {
  const routedProfile = WORKFLOW_PROFILES.find(
    (profile) => profile.id === resolveComfyWorkflowRoute(String(model || "")).profileId
  );
  if (routedProfile) return routedProfile;

  return (
    WORKFLOW_PROFILES.find((profile) =>
      profile.modelIds.includes(model as AdvancedSceneSettings["model"])
    ) ?? DEFAULT_WORKFLOW_PROFILE
  );
}

export function resolveVideoWorkflowProfile(
  model: WorkflowModelInput,
  preferUniverseContinuity = false
): WorkflowProfile {
  if (preferUniverseContinuity) {
    return WORKFLOW_PROFILES.find((profile) => profile.id === "ltx-2.3-universe-directors-cut")!;
  }
  const profile = resolveWorkflowProfile(model);
  return profile.useCase === "video" || profile.useCase === "universe-series"
    ? profile
    : WORKFLOW_PROFILES.find((item) => item.id === "ltx-1.1-3080-i2v")!;
}
