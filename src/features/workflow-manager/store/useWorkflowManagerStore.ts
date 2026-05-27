import { create } from "zustand";
import { DEFAULT_WORKFLOW, resolveWorkflowForModel } from "../data/eliteWorkflows";
import type { WorkflowManagerState } from "../types/workflow-manager.types";

export const useWorkflowManagerStore = create<WorkflowManagerState>((set) => ({
  activeWorkflow: DEFAULT_WORKFLOW,
  isLoading: false,
  loadProgress: 100,
  loadMessage: "Realistic DNA Photo Studio loaded",
  lastLoadedModel: DEFAULT_WORKFLOW.modelIds[0],
  loadWorkflowForModel: (model) => {
    const activeWorkflow = resolveWorkflowForModel(model);
    set({
      activeWorkflow,
      isLoading: true,
      loadProgress: 18,
      loadMessage: `Loading ${activeWorkflow.title}`,
      lastLoadedModel: model,
    });
  },
  completeWorkflowLoad: () =>
    set((state) => ({
      isLoading: false,
      loadProgress: 100,
      loadMessage: `${state.activeWorkflow.title} ready`,
    })),
}));
