import { describe, expect, it } from "vitest";
import { resolveVideoWorkflowProfile, resolveWorkflowProfile } from "../workflowRegistry";

describe("workflow registry", () => {
  it("routes LTX 1.1 to a 3080-safe video workflow", () => {
    const profile = resolveWorkflowProfile("ltx-video-1.1");

    expect(profile.id).toBe("ltx-1.1-3080-i2v");
    expect(profile.gpuFit).toBe("3080-10gb-safe");
    expect(profile.resolution).toBe("768x1280");
    expect(profile.postProcess).toContain("RTXVideoSuperResolution");
  });

  it("routes Universe Forge video work to LTX 2.3 continuity profile when requested", () => {
    const profile = resolveVideoWorkflowProfile("ltx-video-1.1", true);

    expect(profile.id).toBe("ltx-2.3-universe-directors-cut");
    expect(profile.continuity.controlNet).toContain("timeline-continuity");
  });

  it("falls back image models to the realistic DNA workflow", () => {
    const profile = resolveWorkflowProfile("nano-banana-2");

    expect(profile.id).toBe("realistic-dna-photo");
    expect(profile.continuity.characterDna).toBe(true);
  });

  it("routes real ComfyUI checkpoint filenames through the same profile brain", () => {
    expect(resolveWorkflowProfile("bigLove_pony2.safetensors").id).toBe("sdxl-pony-controlnet");
    expect(resolveWorkflowProfile("realvisxlV50_v50LightningBakedvae.safetensors").id).toBe("realistic-dna-photo");
  });
});
