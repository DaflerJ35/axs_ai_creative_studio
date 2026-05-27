import { describe, expect, it, beforeEach } from "vitest";
import { resolveWorkflowForModel } from "../../data/eliteWorkflows";
import { exportComfyWorkflowBlueprint } from "../../utils/exportComfyWorkflow";
import { useWorkflowManagerStore } from "../useWorkflowManagerStore";

describe("workflow manager", () => {
  beforeEach(() => {
    useWorkflowManagerStore.setState(useWorkflowManagerStore.getInitialState(), true);
  });

  it("resolves elite workflows by active model family", () => {
    expect(resolveWorkflowForModel("flux1-dev-fp8").family).toBe("flux");
    expect(resolveWorkflowForModel("biglove-pony2").family).toBe("sdxl-pony");
    expect(resolveWorkflowForModel("ltx-video-2.3").family).toBe("ltx-video");
    expect(resolveWorkflowForModel("realvis-xl").family).toBe("realistic");
  });

  it("loads workflow state when the selected model changes", () => {
    useWorkflowManagerStore.getState().loadWorkflowForModel("ltx-video-2.3");

    expect(useWorkflowManagerStore.getState().isLoading).toBe(true);
    expect(useWorkflowManagerStore.getState().activeWorkflow.id).toBe("ltx23-i2v-directors-cut-v1");
    expect(useWorkflowManagerStore.getState().loadMessage).toContain("LTX 2.3");

    useWorkflowManagerStore.getState().completeWorkflowLoad();
    expect(useWorkflowManagerStore.getState().isLoading).toBe(false);
    expect(useWorkflowManagerStore.getState().loadProgress).toBe(100);
  });

  it("exports organized ComfyUI blueprint groups", () => {
    const blueprint = exportComfyWorkflowBlueprint(resolveWorkflowForModel("flux1-dev-fp8"));

    expect(blueprint.groups[0].title).toContain("Character DNA");
    expect(blueprint.sections[0].title).toBe("Character DNA Lock");
    expect(blueprint.notes.join(" ")).toContain("Resolution");
  });
});
