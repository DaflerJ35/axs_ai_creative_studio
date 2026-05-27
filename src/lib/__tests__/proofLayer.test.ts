import { describe, expect, it } from "vitest";
import { buildAxsProofSummary, type AxsProofInput } from "../proofLayer";

const baseInput: AxsProofInput = {
  activeTab: "universe",
  activeCharacter: {
    id: "elli",
    name: "Elli Voss",
    portraitDataUrl: "data:image/png;base64,abc",
    loraName: "elli.safetensors",
  },
  brandVoice: {
    trained: true,
    confidence: 0.91,
    name: "AXS Signature",
  },
  contentRating: "PG-13",
  settings: {
    useLocalGpu: true,
    comfyuiUrl: "http://127.0.0.1:8188",
    runpodEndpointId: "",
    runpodVideoEndpointId: "video-endpoint",
    videoModel: "ltx-video-1.1",
    voiceEngine: "local",
    localVoiceUrl: "http://127.0.0.1:8020/tts",
  },
  scene: {
    model: "nano-banana-2",
    canvasItemCount: 2,
    referenceImageCount: 1,
    startFrameReady: true,
    endFrameReady: false,
    aiDirectorActive: true,
    directorsCutActive: false,
    studioMode: "sfw",
  },
  universe: {
    title: "Afterglow Protocol",
    characterCount: 3,
    relationshipCount: 3,
    timelineCount: 4,
    storyBeatCount: 10,
    seriesShotCount: 30,
    continuityChecks: [
      { status: "ok" },
      { status: "ok" },
      { status: "ok" },
    ],
    directorCutStatus: "idle",
  },
};

describe("buildAxsProofSummary", () => {
  it("returns ready when DNA, universe memory, workflow, and brand voice are present", () => {
    const summary = buildAxsProofSummary(baseInput);

    expect(summary.status).toBe("ready");
    expect(summary.overallScore).toBeGreaterThanOrEqual(82);
    expect(summary.categories.identity.status).toBe("ready");
    expect(summary.categories.continuity.status).toBe("ready");
    expect(summary.categories.workflow.status).toBe("ready");
    expect(summary.categories.brandVoice.status).toBe("ready");
  });

  it("blocks identity proof when no active character is locked", () => {
    const summary = buildAxsProofSummary({ ...baseInput, activeCharacter: null });

    expect(summary.categories.identity.status).toBe("blocked");
    expect(summary.signals.find((signal) => signal.id === "identity-active-character")?.status).toBe("blocked");
  });

  it("lowers continuity proof when Universe Forge reports a break", () => {
    const summary = buildAxsProofSummary({
      ...baseInput,
      universe: {
        ...baseInput.universe,
        continuityChecks: [{ status: "ok" }, { status: "break" }],
      },
    });

    expect(summary.categories.continuity.status).toBe("blocked");
    expect(summary.signals.find((signal) => signal.id === "continuity-audit")?.detail).toContain("continuity break");
  });

  it("falls back safely for custom video workflows", () => {
    const summary = buildAxsProofSummary({
      ...baseInput,
      settings: { ...baseInput.settings, videoModel: "custom" },
    });

    expect(summary.signals.find((signal) => signal.id === "workflow-video-profile")?.detail).toContain("LTX 1.1");
  });

  it("blocks endpoint proof when no local or cloud generation route is configured", () => {
    const summary = buildAxsProofSummary({
      ...baseInput,
      settings: {
        ...baseInput.settings,
        useLocalGpu: false,
        comfyuiUrl: "",
        runpodEndpointId: "",
        runpodVideoEndpointId: "",
      },
    });

    expect(summary.signals.find((signal) => signal.id === "workflow-endpoints")?.status).toBe("blocked");
    expect(summary.categories.workflow.status).toBe("blocked");
  });

  it("keeps rounded fractional scores and status thresholds consistent", () => {
    const summary = buildAxsProofSummary({
      ...baseInput,
      brandVoice: { ...baseInput.brandVoice, confidence: 0.819 },
    });

    const brandVoiceSignal = summary.signals.find((signal) => signal.id === "brand-voice-memory");
    expect(brandVoiceSignal?.score).toBe(82);
    expect(brandVoiceSignal?.status).toBe("ready");
  });

  it("exposes typed fix intents for actionable identity, workflow, and brand voice signals", () => {
    const summary = buildAxsProofSummary({
      ...baseInput,
      activeCharacter: null,
      brandVoice: { trained: false, confidence: 0.31, name: "Starter Voice" },
      settings: {
        ...baseInput.settings,
        useLocalGpu: false,
        comfyuiUrl: "",
        runpodEndpointId: "",
        runpodVideoEndpointId: "",
      },
    });

    expect(summary.signals.find((signal) => signal.id === "identity-active-character")?.action?.intent).toBe("open-dna-lock");
    expect(summary.signals.find((signal) => signal.id === "identity-reference-strength")?.action?.intent).toBe("open-dna-lock");
    expect(summary.signals.find((signal) => signal.id === "workflow-endpoints")?.action?.intent).toBe("open-settings");
    expect(summary.signals.find((signal) => signal.id === "brand-voice-memory")?.action?.intent).toBe("open-brand-training");
  });

  it("keeps continuity audit as a non-destructive repair intent", () => {
    const summary = buildAxsProofSummary({
      ...baseInput,
      universe: {
        ...baseInput.universe,
        continuityChecks: [{ status: "break" }],
      },
    });

    const auditSignal = summary.signals.find((signal) => signal.id === "continuity-audit");
    expect(auditSignal?.status).toBe("blocked");
    expect(auditSignal?.action?.intent).toBe("run-continuity-audit");
    expect(auditSignal?.action?.targetTab).toBe("universe");
  });

  it("keeps every category explainable with at least two signals", () => {
    const summary = buildAxsProofSummary(baseInput);

    expect(summary.categories.identity.signals.length).toBeGreaterThanOrEqual(2);
    expect(summary.categories.continuity.signals.length).toBeGreaterThanOrEqual(2);
    expect(summary.categories.workflow.signals.length).toBeGreaterThanOrEqual(2);
    expect(summary.categories.brandVoice.signals.length).toBeGreaterThanOrEqual(2);
    expect(summary.categories.distribution.signals.length).toBeGreaterThanOrEqual(2);
  });

  it("marks distribution as watch when launch assets are missing but content class is valid", () => {
    const summary = buildAxsProofSummary({
      ...baseInput,
      scene: {
        ...baseInput.scene,
        canvasItemCount: 0,
        referenceImageCount: 0,
      },
      universe: {
        ...baseInput.universe,
        seriesShotCount: 0,
      },
    });

    expect(summary.categories.distribution.status).toBe("watch");
    expect(summary.signals.find((signal) => signal.id === "distribution-assets")?.status).toBe("watch");
  });
});
