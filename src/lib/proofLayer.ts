import type { ForgeTab } from "./types";
import { resolveVideoWorkflowProfile, resolveWorkflowProfile, type WorkflowModelInput } from "./workflowRegistry";

export type AxsProofCategory = "identity" | "continuity" | "workflow" | "brandVoice" | "distribution";
export type AxsProofStatus = "ready" | "watch" | "blocked";
export type AxsProofActionIntent =
  | "navigate"
  | "run-continuity-audit"
  | "open-settings"
  | "open-dna-lock"
  | "open-brand-training"
  | "prepare-distribution";

export interface AxsProofAction {
  label: string;
  targetTab?: ForgeTab;
  intent?: AxsProofActionIntent;
}

export interface AxsProofSignal {
  id: string;
  category: AxsProofCategory;
  label: string;
  status: AxsProofStatus;
  score: number;
  detail: string;
  action?: AxsProofAction;
}

export interface AxsProofCategorySummary {
  category: AxsProofCategory;
  label: string;
  status: AxsProofStatus;
  score: number;
  signals: AxsProofSignal[];
}

export interface AxsProofSummary {
  overallScore: number;
  status: AxsProofStatus;
  readyCount: number;
  watchCount: number;
  blockedCount: number;
  signals: AxsProofSignal[];
  categories: Record<AxsProofCategory, AxsProofCategorySummary>;
}

export interface AxsProofInput {
  activeTab: ForgeTab;
  activeCharacter?: { id: string; name: string; portraitDataUrl?: string; loraName?: string; description?: string } | null;
  brandVoice: { trained: boolean; confidence: number; name: string };
  contentRating: string;
  settings: {
    useLocalGpu: boolean;
    comfyuiUrl?: string;
    runpodEndpointId?: string;
    runpodVideoEndpointId?: string;
    videoModel: WorkflowModelInput;
    voiceEngine: string;
    localVoiceUrl?: string;
  };
  scene: {
    model: WorkflowModelInput;
    canvasItemCount: number;
    referenceImageCount: number;
    startFrameReady: boolean;
    endFrameReady: boolean;
    aiDirectorActive: boolean;
    directorsCutActive: boolean;
    studioMode: string;
  };
  universe: {
    title: string;
    characterCount: number;
    relationshipCount: number;
    timelineCount: number;
    storyBeatCount: number;
    seriesShotCount: number;
    continuityChecks: Array<{ status: "ok" | "watch" | "break" }>;
    directorCutStatus: string;
  };
}

const CATEGORY_LABELS: Record<AxsProofCategory, string> = {
  identity: "Identity",
  continuity: "Continuity",
  workflow: "Workflow",
  brandVoice: "Brand Voice",
  distribution: "Distribution",
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function signalStatus(score: number, blocked = false): AxsProofStatus {
  if (blocked) return "blocked";
  if (score >= 82) return "ready";
  if (score >= 48) return "watch";
  return "blocked";
}

function overallStatus(signals: AxsProofSignal[]): AxsProofStatus {
  if (signals.some((signal) => signal.status === "blocked")) return "blocked";
  if (signals.some((signal) => signal.status === "watch")) return "watch";
  return "ready";
}

function average(numbers: number[]): number {
  return clampScore(numbers.reduce((total, score) => total + score, 0) / Math.max(1, numbers.length));
}

function buildSignal(
  id: string,
  category: AxsProofCategory,
  label: string,
  score: number,
  detail: string,
  action?: AxsProofAction,
  blocked = false
): AxsProofSignal {
  const clampedScore = clampScore(score);

  return {
    id,
    category,
    label,
    score: clampedScore,
    status: signalStatus(clampedScore, blocked),
    detail,
    action,
  };
}

export function buildAxsProofSummary(input: AxsProofInput): AxsProofSummary {
  const imageWorkflow = resolveWorkflowProfile(input.scene.model);
  const videoWorkflow = resolveVideoWorkflowProfile(input.settings.videoModel);
  const continuityBreaks = input.universe.continuityChecks.filter((check) => check.status === "break").length;
  const continuityWatch = input.universe.continuityChecks.filter((check) => check.status === "watch").length;
  const localVoiceReady = input.settings.voiceEngine === "local" && Boolean(input.settings.localVoiceUrl?.trim());
  const localGpuReady = input.settings.useLocalGpu && Boolean(input.settings.comfyuiUrl?.trim());
  const cloudImageReady = Boolean(input.settings.runpodEndpointId?.trim());
  const cloudVideoReady = Boolean(input.settings.runpodVideoEndpointId?.trim());

  const signals: AxsProofSignal[] = [
    buildSignal(
      "identity-active-character",
      "identity",
      "Active Character DNA",
      input.activeCharacter ? 92 : 38,
      input.activeCharacter
        ? `${input.activeCharacter.name} is the active DNA source for generation memory.`
        : "No active character is locked, so identity consistency cannot be proven yet.",
      { label: input.activeCharacter ? "View DNA" : "Lock DNA", targetTab: "dna", intent: "open-dna-lock" },
      !input.activeCharacter
    ),
    buildSignal(
      "identity-reference-strength",
      "identity",
      "Reference Anchors",
      input.activeCharacter?.portraitDataUrl || input.activeCharacter?.loraName ? 90 : input.activeCharacter ? 64 : 34,
      input.activeCharacter?.portraitDataUrl || input.activeCharacter?.loraName
        ? "Portrait/LoRA anchor is available for identity proof."
        : input.activeCharacter
          ? "Character exists, but portrait or LoRA anchor is missing."
          : "Create or select a Character DNA profile before generating identity-locked scenes.",
      { label: "Character Studio", targetTab: "dna", intent: "open-dna-lock" }
    ),
    buildSignal(
      "continuity-universe-memory",
      "continuity",
      "Universe Memory",
      input.universe.characterCount > 0 && input.universe.storyBeatCount > 0 ? 94 : 52,
      `${input.universe.title} has ${input.universe.characterCount} characters, ${input.universe.storyBeatCount} beats, and ${input.universe.timelineCount} timeline events.`,
      { label: "Universe Forge", targetTab: "universe", intent: "navigate" }
    ),
    buildSignal(
      "continuity-audit",
      "continuity",
      "Continuity Audit",
      continuityBreaks > 0 ? 38 : continuityWatch > 0 ? 74 : 96,
      continuityBreaks > 0
        ? `${continuityBreaks} continuity break${continuityBreaks === 1 ? "" : "s"} need review before final output.`
        : continuityWatch > 0
          ? `${continuityWatch} watch item${continuityWatch === 1 ? "" : "s"} detected; continuity is usable but not pristine.`
          : "Wardrobe, emotion, lighting, and timeline checks are currently clean.",
      { label: "Run Audit", targetTab: "universe", intent: "run-continuity-audit" },
      continuityBreaks > 0
    ),
    buildSignal(
      "continuity-directors-cut",
      "continuity",
      "Director's Cut Readiness",
      input.universe.seriesShotCount >= 8 || input.scene.directorsCutActive ? 88 : input.universe.storyBeatCount >= 4 ? 70 : 50,
      input.universe.seriesShotCount >= 8
        ? `${input.universe.seriesShotCount} shots are available for Director's Cut assembly.`
        : input.universe.storyBeatCount >= 4
          ? "Story memory is strong, but more generated shots are needed before stitching."
          : "Build an arc or generate more shots before Director's Cut can prove pacing.",
      { label: "Director's Cut", targetTab: "universe", intent: "navigate" }
    ),
    buildSignal(
      "workflow-image-profile",
      "workflow",
      "Image Workflow Fit",
      imageWorkflow.gpuFit === "3080-10gb-safe" ? 94 : imageWorkflow.gpuFit === "3080-10gb-tight" ? 76 : 82,
      `${imageWorkflow.title} is active for still-image work. ${imageWorkflow.vramNotes}`,
      { label: "Image Forge", targetTab: "images", intent: "navigate" }
    ),
    buildSignal(
      "workflow-video-profile",
      "workflow",
      "Video Workflow Fit",
      videoWorkflow.gpuFit === "3080-10gb-safe" ? 94 : videoWorkflow.gpuFit === "cloud-recommended" ? 72 : 78,
      `${videoWorkflow.title} is selected for video. ${videoWorkflow.vramNotes}`,
      { label: "Motion Studio", targetTab: "videos", intent: "navigate" }
    ),
    buildSignal(
      "workflow-endpoints",
      "workflow",
      "Generation Endpoints",
      localGpuReady || cloudImageReady || cloudVideoReady ? 86 : 44,
      localGpuReady
        ? "Local ComfyUI is configured as the primary generation route."
        : cloudImageReady || cloudVideoReady
          ? "Cloud endpoint configuration is present for generation fallback."
          : "No local ComfyUI URL or RunPod endpoint is configured.",
      { label: "Settings", targetTab: "config", intent: "open-settings" },
      !(localGpuReady || cloudImageReady || cloudVideoReady)
    ),
    buildSignal(
      "brand-voice-memory",
      "brandVoice",
      "Creator Hub Voice",
      input.brandVoice.trained ? Math.max(82, input.brandVoice.confidence * 100) : 58,
      input.brandVoice.trained
        ? `${input.brandVoice.name} is trained at ${Math.round(input.brandVoice.confidence * 100)}% confidence and ready to apply across prompts.`
        : "Starter voice is active. Train Creator Hub to prove brand tone consistency.",
      { label: "Creator Hub", targetTab: "creator", intent: "open-brand-training" }
    ),
    buildSignal(
      "brand-voice-tts",
      "brandVoice",
      "Voice Engine",
      localVoiceReady ? 86 : input.settings.voiceEngine === "local" ? 48 : 74,
      localVoiceReady
        ? "Local open-source voice endpoint is configured for generation."
        : input.settings.voiceEngine === "local"
          ? "Local voice is selected but no endpoint URL is configured."
          : `${input.settings.voiceEngine} is selected as the voice engine.`,
      { label: "Voice Studio", targetTab: "voice", intent: "navigate" }
    ),
    buildSignal(
      "distribution-content-class",
      "distribution",
      "Content Class",
      input.contentRating === "PG" || input.contentRating === "PG-13" ? 92 : 82,
      `${input.contentRating} mode is active, so publishing and visibility rules can be evaluated before launch.`,
      { label: "Distribution", targetTab: "distribute", intent: "prepare-distribution" }
    ),
    buildSignal(
      "distribution-assets",
      "distribution",
      "Launch Assets",
      input.universe.seriesShotCount > 0 ? 82 : input.scene.canvasItemCount > 0 || input.scene.referenceImageCount > 0 ? 68 : 52,
      input.universe.seriesShotCount > 0
        ? `${input.universe.seriesShotCount} series shots are available for campaign packaging.`
        : "No finished series shots are available yet; create scene, image, or video assets before launch.",
      { label: "Distribute", targetTab: "distribute", intent: "prepare-distribution" }
    ),
  ];

  const categories = (Object.keys(CATEGORY_LABELS) as AxsProofCategory[]).reduce(
    (acc, category) => {
      const categorySignals = signals.filter((signal) => signal.category === category);
      const score = average(categorySignals.map((signal) => signal.score));
      acc[category] = {
        category,
        label: CATEGORY_LABELS[category],
        score,
        status: overallStatus(categorySignals),
        signals: categorySignals,
      };
      return acc;
    },
    {} as Record<AxsProofCategory, AxsProofCategorySummary>
  );

  const overallScore = average(Object.values(categories).map((category) => category.score));
  return {
    overallScore,
    status: overallStatus(signals),
    readyCount: signals.filter((signal) => signal.status === "ready").length,
    watchCount: signals.filter((signal) => signal.status === "watch").length,
    blockedCount: signals.filter((signal) => signal.status === "blocked").length,
    signals,
    categories,
  };
}
