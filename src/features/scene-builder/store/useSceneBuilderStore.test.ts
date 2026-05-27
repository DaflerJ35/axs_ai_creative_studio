import { describe, expect, it, beforeEach } from "vitest";
import { useSceneBuilderStore } from "./useSceneBuilderStore";

describe("useSceneBuilderStore", () => {
  beforeEach(() => {
    useSceneBuilderStore.setState({
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
      scenePrompt: "",
      referenceImages: [],
      frameSlots: {},
      uploadModalOpen: false,
      uploadTarget: "reference",
      advanced: {
        nsfwEnabled: true,
        model: "nano-banana-2",
        resolution: "2K",
        quality: "premium",
        aspectRatio: "16:9",
      },
    });
  });

  it("switches studio mode and keeps NSFW generation state in sync", () => {
    useSceneBuilderStore.getState().setStudioMode("nsfw");

    expect(useSceneBuilderStore.getState().studioMode).toBe("nsfw");
    expect(useSceneBuilderStore.getState().advanced.nsfwEnabled).toBe(true);

    useSceneBuilderStore.getState().setStudioMode("sfw");

    expect(useSceneBuilderStore.getState().studioMode).toBe("sfw");
    expect(useSceneBuilderStore.getState().advanced.nsfwEnabled).toBe(false);
  });

  it("updates interactive studio tools", () => {
    useSceneBuilderStore.getState().setActiveRailTool("characters");
    useSceneBuilderStore.getState().setActivePanelMode("directing");
    useSceneBuilderStore.getState().setActiveQuickTool("lighting");
    useSceneBuilderStore.getState().setAiDirectorActive(true);

    expect(useSceneBuilderStore.getState().activeRailTool).toBe("characters");
    expect(useSceneBuilderStore.getState().activePanelMode).toBe("directing");
    expect(useSceneBuilderStore.getState().activeQuickTool).toBe("lighting");
    expect(useSceneBuilderStore.getState().aiDirectorActive).toBe(true);
  });

  it("updates generation status for Director's Cut", () => {
    useSceneBuilderStore.getState().runGeneration("directors-cut");

    expect(useSceneBuilderStore.getState().directorsCutActive).toBe(true);
    expect(useSceneBuilderStore.getState().generationStatus).toContain("Director's Cut");
    expect(useSceneBuilderStore.getState().isGenerating).toBe(true);
    expect(useSceneBuilderStore.getState().activePanelMode).toBe("directing");
    expect(useSceneBuilderStore.getState().advanced.model).toBe("ltx-video-2.3");
    expect(useSceneBuilderStore.getState().advanced.resolution).toBe("4K");
  });

  it("advances and completes generation progress", () => {
    useSceneBuilderStore.getState().runGeneration("image");
    const firstProgress = useSceneBuilderStore.getState().generationProgress;
    useSceneBuilderStore.getState().advanceGeneration();

    expect(useSceneBuilderStore.getState().generationProgress).toBeGreaterThan(firstProgress);
    expect(useSceneBuilderStore.getState().generationStage).not.toBe("idle");

    useSceneBuilderStore.getState().completeGeneration();
    expect(useSceneBuilderStore.getState().isGenerating).toBe(false);
    expect(useSceneBuilderStore.getState().generationProgress).toBe(100);
  });

  it("supports editable prompts and @ mention insertion", () => {
    useSceneBuilderStore.getState().setScenePrompt("Frame this with @");
    useSceneBuilderStore.getState().insertPromptMention("Aria Vale");

    expect(useSceneBuilderStore.getState().scenePrompt).toBe("Frame this with @Aria Vale ");
  });

  it("adds and removes reference images", () => {
    useSceneBuilderStore.getState().addReferenceImage({
      name: "start-frame.png",
      dataUrl: "data:image/png;base64,abc",
    });

    const [image] = useSceneBuilderStore.getState().referenceImages;
    expect(image.name).toBe("start-frame.png");
    expect(useSceneBuilderStore.getState().activeQuickTool).toBe("image-count");
    expect(useSceneBuilderStore.getState().generationStatus).toContain("reference frame");

    useSceneBuilderStore.getState().removeReferenceImage(image.id);
    expect(useSceneBuilderStore.getState().referenceImages).toHaveLength(0);
  });

  it("routes uploaded images into Start and End frame slots", () => {
    useSceneBuilderStore.getState().openUploadModal("start-frame");
    expect(useSceneBuilderStore.getState().uploadModalOpen).toBe(true);

    useSceneBuilderStore.getState().addReferenceImage({
      name: "start.png",
      dataUrl: "data:image/png;base64,start",
    });

    expect(useSceneBuilderStore.getState().uploadModalOpen).toBe(false);
    expect(useSceneBuilderStore.getState().frameSlots.startFrame?.name).toBe("start.png");
    expect(useSceneBuilderStore.getState().generationStatus).toContain("Start frame");

    useSceneBuilderStore.getState().openUploadModal("end-frame");
    useSceneBuilderStore.getState().addReferenceImage({
      name: "end.png",
      dataUrl: "data:image/png;base64,end",
    });

    expect(useSceneBuilderStore.getState().frameSlots.endFrame?.name).toBe("end.png");
    expect(useSceneBuilderStore.getState().generationStatus).toContain("End frame");
  });
});
