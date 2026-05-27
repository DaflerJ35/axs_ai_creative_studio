export const LTX_23_VIDEO_MODEL = {
  id: "ltx-video-2.3",
  label: "LTX Video 2.3",
  workflowId: "ltx-2.3-character-consistent-directors-cut",
  description:
    "Flagship character-consistent video workflow for Universe Forge, Scene Builder, and Director's Cut.",
} as const;

export type Ltx23WorkflowMode = "universe-series" | "single-i2v" | "flux-hybrid";

export interface Ltx23WorkflowBlueprint {
  id: string;
  model: typeof LTX_23_VIDEO_MODEL.id;
  workflow: typeof LTX_23_VIDEO_MODEL.workflowId;
  mode: Ltx23WorkflowMode;
  resolution: "832x1216" | "1216x832" | "768x1280" | "1024x576";
  fps: 12 | 16 | 24;
  steps: number;
  cfg: number;
  denoise: number;
  ipAdapterStrength: number;
  faceLockStrength: number;
  bodyLockStrength: number;
  controlNetStrength: number;
  continuityPasses: Array<"dna" | "wardrobe" | "pose" | "lighting" | "timeline" | "audio">;
  post: {
    upscale: "RTX VSR 4K" | "native";
    interpolation: "RIFE 2x" | "off";
    colorPass: "director-grade" | "neutral";
  };
}

export const LTX_23_WORKFLOW_BLUEPRINTS: Record<Ltx23WorkflowMode, Ltx23WorkflowBlueprint> = {
  "universe-series": {
    id: "axs-universe-forge-ltx23-character-consistent",
    model: "ltx-video-2.3",
    workflow: "ltx-2.3-character-consistent-directors-cut",
    mode: "universe-series",
    resolution: "832x1216",
    fps: 16,
    steps: 28,
    cfg: 4.1,
    denoise: 0.92,
    ipAdapterStrength: 0.86,
    faceLockStrength: 0.9,
    bodyLockStrength: 0.78,
    controlNetStrength: 0.62,
    continuityPasses: ["dna", "wardrobe", "pose", "lighting", "timeline", "audio"],
    post: {
      upscale: "RTX VSR 4K",
      interpolation: "RIFE 2x",
      colorPass: "director-grade",
    },
  },
  "single-i2v": {
    id: "axs-fast-single-i2v-ltx23",
    model: "ltx-video-2.3",
    workflow: "ltx-2.3-character-consistent-directors-cut",
    mode: "single-i2v",
    resolution: "1216x832",
    fps: 16,
    steps: 22,
    cfg: 3.8,
    denoise: 0.86,
    ipAdapterStrength: 0.8,
    faceLockStrength: 0.84,
    bodyLockStrength: 0.68,
    controlNetStrength: 0.52,
    continuityPasses: ["dna", "pose", "lighting"],
    post: {
      upscale: "RTX VSR 4K",
      interpolation: "off",
      colorPass: "neutral",
    },
  },
  "flux-hybrid": {
    id: "axs-flux-ltx23-hybrid-directors-cut",
    model: "ltx-video-2.3",
    workflow: "ltx-2.3-character-consistent-directors-cut",
    mode: "flux-hybrid",
    resolution: "832x1216",
    fps: 24,
    steps: 30,
    cfg: 4.4,
    denoise: 0.9,
    ipAdapterStrength: 0.9,
    faceLockStrength: 0.92,
    bodyLockStrength: 0.82,
    controlNetStrength: 0.66,
    continuityPasses: ["dna", "wardrobe", "pose", "lighting", "timeline"],
    post: {
      upscale: "RTX VSR 4K",
      interpolation: "RIFE 2x",
      colorPass: "director-grade",
    },
  },
};

export function getLtx23WorkflowBlueprint(mode: Ltx23WorkflowMode = "universe-series") {
  return LTX_23_WORKFLOW_BLUEPRINTS[mode];
}
