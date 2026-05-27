import { create } from "zustand";
import type {
  AdvancedSceneSettings,
  CameraSettings,
  LightingSettings,
  SceneCanvasItem,
  SceneFrameSlots,
  SceneLibraryItem,
  SceneReferenceImage,
  StudioMode,
  UploadTarget,
} from "../types/scene-builder.types";
import { resolveVideoWorkflowProfile } from "@/lib/workflowRegistry";

type StudioRailTool = "video" | "characters" | "locations" | "assets";
type StudioPanelMode = "framing" | "directing";
type StudioQuickTool = "angle" | "shot-type" | "lighting" | "image-count";
type GenerationKind = "image" | "video" | "directors-cut";
type GenerationStage = "idle" | "queued" | "analyzing" | "rendering" | "finishing" | "complete";

interface SceneBuilderState {
  canvasItems: SceneCanvasItem[];
  scenePrompt: string;
  referenceImages: SceneReferenceImage[];
  frameSlots: SceneFrameSlots;
  uploadModalOpen: boolean;
  uploadTarget: UploadTarget;
  selectedItemId: string | null;
  sceneTitle: string;
  studioMode: StudioMode;
  nsfwGateAccepted: boolean;
  aiDirectorActive: boolean;
  directorsCutActive: boolean;
  activeRailTool: StudioRailTool;
  activePanelMode: StudioPanelMode;
  activeQuickTool: StudioQuickTool;
  generationStatus: string;
  generationProgress: number;
  generationStage: GenerationStage;
  isGenerating: boolean;
  camera: CameraSettings;
  lighting: LightingSettings;
  advanced: AdvancedSceneSettings;
  setStudioMode: (mode: StudioMode) => void;
  confirmNsfwGate: () => void;
  setAiDirectorActive: (active: boolean) => void;
  setDirectorsCutActive: (active: boolean) => void;
  setActiveRailTool: (tool: StudioRailTool) => void;
  setActivePanelMode: (mode: StudioPanelMode) => void;
  setActiveQuickTool: (tool: StudioQuickTool) => void;
  runGeneration: (kind: GenerationKind) => void;
  advanceGeneration: () => void;
  completeGeneration: () => void;
  setScenePrompt: (scenePrompt: string) => void;
  insertPromptMention: (mention: string) => void;
  openUploadModal: (target: UploadTarget) => void;
  closeUploadModal: () => void;
  addReferenceImage: (image: Omit<SceneReferenceImage, "id" | "createdAt">) => void;
  removeReferenceImage: (id: string) => void;
  addItemToCanvas: (item: SceneLibraryItem) => void;
  selectItem: (instanceId: string | null) => void;
  moveItem: (instanceId: string, delta: { x: number; y: number }) => void;
  updateItem: (instanceId: string, patch: Partial<Pick<SceneCanvasItem, "scale" | "rotation" | "layer">>) => void;
  updateCamera: (patch: Partial<CameraSettings>) => void;
  updateLighting: (patch: Partial<LightingSettings>) => void;
  updateAdvanced: (patch: Partial<AdvancedSceneSettings>) => void;
}

const DEFAULT_CAMERA: CameraSettings = {
  angle: "eye-level",
  type: "auto",
  distance: 48,
  lens: "50mm",
  movement: "locked",
};

const DEFAULT_LIGHTING: LightingSettings = {
  timeOfDay: "blue-hour",
  style: "cinematic",
  intensity: 68,
};

const DEFAULT_ADVANCED: AdvancedSceneSettings = {
  nsfwEnabled: true,
  model: "nano-banana-2",
  resolution: "2K",
  quality: "premium",
  aspectRatio: "16:9",
};

export const useSceneBuilderStore = create<SceneBuilderState>((set) => ({
  canvasItems: [],
  scenePrompt: "",
  referenceImages: [],
  frameSlots: {},
  uploadModalOpen: false,
  uploadTarget: "reference",
  selectedItemId: null,
  sceneTitle: "Untitled cinematic scene",
  studioMode: "sfw",
  nsfwGateAccepted: false,
  aiDirectorActive: false,
  directorsCutActive: false,
  activeRailTool: "video",
  activePanelMode: "framing",
  activeQuickTool: "angle",
  generationStatus: "Ready",
  generationProgress: 0,
  generationStage: "idle",
  isGenerating: false,
  camera: DEFAULT_CAMERA,
  lighting: DEFAULT_LIGHTING,
  advanced: DEFAULT_ADVANCED,
  setStudioMode: (studioMode) =>
    set((state) => ({
      studioMode,
      advanced: { ...state.advanced, nsfwEnabled: studioMode === "nsfw" },
    })),
  confirmNsfwGate: () => set({ nsfwGateAccepted: true }),
  setAiDirectorActive: (aiDirectorActive) => set({ aiDirectorActive }),
  setDirectorsCutActive: (directorsCutActive) => set({ directorsCutActive }),
  setActiveRailTool: (activeRailTool) => set({ activeRailTool }),
  setActivePanelMode: (activePanelMode) => set({ activePanelMode }),
  setActiveQuickTool: (activeQuickTool) => set({ activeQuickTool }),
  runGeneration: (kind) =>
    set((state) => ({
      ...(() => {
        const isVideo = kind === "video" || kind === "directors-cut";
        const profile = isVideo
          ? resolveVideoWorkflowProfile(state.advanced.model, kind === "directors-cut")
          : null;
        const model = profile?.modelIds[0] ?? state.advanced.model;

        return {
          directorsCutActive: kind === "directors-cut" ? true : state.directorsCutActive,
          activePanelMode: isVideo ? "directing" : state.activePanelMode,
          advanced: isVideo
            ? { ...state.advanced, model, resolution: model === "ltx-video-1.1" ? "1K" : "4K", aspectRatio: "16:9" }
            : state.advanced,
          generationProgress: kind === "directors-cut" ? 12 : kind === "video" ? 10 : 18,
          generationStage: "queued" as GenerationStage,
          isGenerating: true,
          generationStatus:
            kind === "directors-cut"
              ? `${profile?.title ?? "Director's Cut"} queued`
              : kind === "video"
                ? `${profile?.title ?? "Video workflow"} queued`
                : "Image generation queued",
        };
      })(),
    })),
  advanceGeneration: () =>
    set((state) => {
      if (!state.isGenerating) return state;
      const nextProgress = Math.min(99, state.generationProgress + 17);
      const generationStage =
        nextProgress >= 82 ? "finishing" : nextProgress >= 42 ? "rendering" : "analyzing";
      const generationStatus =
        generationStage === "analyzing"
          ? `AI Director analyzing scene DNA for ${resolveVideoWorkflowProfile(state.advanced.model).title}`
          : generationStage === "rendering"
            ? `Rendering cinematic motion with ${resolveVideoWorkflowProfile(state.advanced.model).title}`
            : "Finishing color, pacing, upscale, and continuity";

      return { generationProgress: nextProgress, generationStage, generationStatus };
    }),
  completeGeneration: () =>
    set({
      isGenerating: false,
      generationProgress: 100,
      generationStage: "complete",
      generationStatus: "Generation complete",
    }),
  setScenePrompt: (scenePrompt) => set({ scenePrompt }),
  insertPromptMention: (mention) =>
    set((state) => {
      const prompt = state.scenePrompt;
      const atIndex = prompt.lastIndexOf("@");
      const prefix = atIndex >= 0 ? prompt.slice(0, atIndex) : prompt;
      const separator = prefix.length > 0 && !prefix.endsWith(" ") ? " " : "";
      return { scenePrompt: `${prefix}${separator}@${mention} ` };
    }),
  openUploadModal: (uploadTarget) => set({ uploadModalOpen: true, uploadTarget }),
  closeUploadModal: () => set({ uploadModalOpen: false }),
  addReferenceImage: (image) =>
    set((state) => {
      const nextImage: SceneReferenceImage = {
        ...image,
        id: `ref-${Date.now()}-${state.referenceImages.length}`,
        createdAt: Date.now(),
      };
      const frameSlots =
        state.uploadTarget === "start-frame"
          ? { ...state.frameSlots, startFrame: nextImage }
          : state.uploadTarget === "end-frame"
            ? { ...state.frameSlots, endFrame: nextImage }
            : state.frameSlots;

      return {
        activeQuickTool: "image-count",
        uploadModalOpen: false,
        frameSlots,
        generationStatus:
          state.uploadTarget === "start-frame"
            ? `${image.name} set as Start frame`
            : state.uploadTarget === "end-frame"
              ? `${image.name} set as End frame`
              : `${image.name} added as a reference frame`,
        referenceImages: [...state.referenceImages, nextImage],
      };
    }),
  removeReferenceImage: (id) =>
    set((state) => ({
      referenceImages: state.referenceImages.filter((image) => image.id !== id),
    })),
  addItemToCanvas: (item) =>
    set((state) => {
      const nextLayer = state.canvasItems.length + 1;
      const instanceId = `${item.id}-${Date.now()}`;

      return {
        selectedItemId: instanceId,
        canvasItems: [
          ...state.canvasItems,
          {
            ...item,
            instanceId,
            x: 42 + state.canvasItems.length * 28,
            y: 36 + state.canvasItems.length * 18,
            scale: item.type === "environment" ? 1.18 : 1,
            rotation: 0,
            layer: nextLayer,
          },
        ],
      };
    }),
  selectItem: (selectedItemId) => set({ selectedItemId }),
  moveItem: (instanceId, delta) =>
    set((state) => ({
      canvasItems: state.canvasItems.map((item) =>
        item.instanceId === instanceId
          ? {
              ...item,
              x: Math.min(86, Math.max(4, item.x + delta.x / 8)),
              y: Math.min(82, Math.max(8, item.y + delta.y / 6)),
            }
          : item
      ),
    })),
  updateItem: (instanceId, patch) =>
    set((state) => ({
      canvasItems: state.canvasItems.map((item) =>
        item.instanceId === instanceId ? { ...item, ...patch } : item
      ),
    })),
  updateCamera: (patch) => set((state) => ({ camera: { ...state.camera, ...patch } })),
  updateLighting: (patch) => set((state) => ({ lighting: { ...state.lighting, ...patch } })),
  updateAdvanced: (patch) => set((state) => ({ advanced: { ...state.advanced, ...patch } })),
}));
