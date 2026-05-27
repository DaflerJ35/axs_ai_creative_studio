export type LibraryTab = "characters" | "environments" | "assets";

export type StudioMode = "sfw" | "nsfw";

export type UploadTarget = "reference" | "start-frame" | "end-frame";

export type SceneLibraryItemType = "character" | "environment" | "asset";

export interface SceneLibraryItem {
  id: string;
  type: SceneLibraryItemType;
  name: string;
  subtitle: string;
  dnaPrompt: string;
  thumbnail: string;
  accent: string;
}

export interface SceneCanvasItem extends SceneLibraryItem {
  instanceId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  layer: number;
}

export interface SceneReferenceImage {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: number;
}

export interface SceneFrameSlots {
  startFrame?: SceneReferenceImage;
  endFrame?: SceneReferenceImage;
}

export interface CameraSettings {
  angle: "eye-level" | "low-angle" | "high-angle" | "over-shoulder" | "drone";
  type: "auto" | "cinema" | "handheld" | "drone" | "macro";
  distance: number;
  lens: "24mm" | "35mm" | "50mm" | "85mm" | "anamorphic";
  movement: "locked" | "dolly-in" | "orbit" | "handheld" | "crane";
}

export interface LightingSettings {
  timeOfDay: "blue-hour" | "golden-hour" | "midnight" | "studio" | "neon-night";
  style: "cinematic" | "noir" | "high-key" | "volumetric" | "editorial";
  intensity: number;
}

export interface AdvancedSceneSettings {
  nsfwEnabled: boolean;
  model:
    | "nano-banana-2"
    | "flux-2-flash"
    | "gpt-image-2"
    | "nano-banana-pro"
    | "ltx-video-2.3"
    | "ltx-video-1.1"
    | "flux1-dev-fp8"
    | "flux1-schnell-fp8"
    | "biglove-pony2"
    | "dreamshaper-xl"
    | "sdxl-pony"
    | "realvis-xl"
    | "juggernaut-xl"
    | "custom-realistic";
  resolution: "2K" | "4K" | "512px" | "1K";
  quality: "draft" | "studio" | "premium" | "master";
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5" | "2.39:1";
}
