import type { AdvancedSceneSettings } from "@/features/scene-builder/types/scene-builder.types";

export type WorkflowFamily = "flux" | "sdxl-pony" | "ltx-video" | "realistic" | "default";

export type WorkflowModelId = AdvancedSceneSettings["model"];

export interface WorkflowControl {
  id: string;
  label: string;
  value: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface WorkflowSection {
  id: string;
  title: string;
  description: string;
  color: string;
  nodes: string[];
  controls: WorkflowControl[];
}

export interface EliteWorkflowTemplate {
  id: string;
  modelIds: WorkflowModelId[];
  family: WorkflowFamily;
  title: string;
  shortLabel: string;
  description: string;
  badge: string;
  defaultPrompt: string;
  negativePrompt: string;
  resolution: string;
  steps: number;
  cfg: number;
  sampler: string;
  scheduler: string;
  vramProfile: "RTX 3080 10GB" | "High VRAM" | "Universal";
  output: "image" | "video";
  sections: WorkflowSection[];
  comfy: {
    groups: Array<{ title: string; color: string; bounds: [number, number, number, number] }>;
    nodePlan: string[];
    postProcess: string[];
  };
}

export interface WorkflowManagerState {
  activeWorkflow: EliteWorkflowTemplate;
  isLoading: boolean;
  loadProgress: number;
  loadMessage: string;
  lastLoadedModel: WorkflowModelId;
  loadWorkflowForModel: (model: WorkflowModelId) => void;
  completeWorkflowLoad: () => void;
}
