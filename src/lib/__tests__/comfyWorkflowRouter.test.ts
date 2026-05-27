import { describe, expect, it } from "vitest";
import { fingerprintComfyModel, resolveComfyWorkflowRoute } from "../comfyWorkflowRouter";

describe("ComfyUI model-aware workflow router", () => {
  it("fingerprints RealVisXL Lightning filenames as fast realistic SDXL", () => {
    const route = resolveComfyWorkflowRoute("realvisxlV50_v50LightningBakedvae.safetensors");

    expect(route.kind).toBe("sdxl-lightning");
    expect(route.profileId).toBe("realistic-dna-photo");
    expect(route.defaults.steps).toBe(6);
    expect(route.defaults.cfg).toBe(2);
    expect(route.defaults.hires).toBe(false);
    expect(route.gpuFit).toBe("3080-10gb-safe");
  });

  it("fingerprints bigLove Pony checkpoints as Pony SDXL workflow", () => {
    const route = resolveComfyWorkflowRoute("bigLove_pony2.safetensors");

    expect(route.kind).toBe("sdxl-pony");
    expect(route.profileId).toBe("sdxl-pony-controlnet");
    expect(route.defaults.sampler).toBe("dpmpp_2m");
    expect(route.reasons.join(" ")).toMatch(/Pony/i);
  });

  it("routes FaceLock requests by request context while preserving model family", () => {
    const route = resolveComfyWorkflowRoute("juggernautXL_v9.safetensors", {
      faceRefImage: "face.png",
    });

    expect(route.useCase).toBe("face-lock");
    expect(route.family).toBe("realistic-sdxl");
    expect(route.kind).toBe("sdxl-realistic");
  });

  it("blocks LoRA files selected as active checkpoint with a useful requirement", () => {
    const route = resolveComfyWorkflowRoute("myCharacterLora-123456.safetensors");

    expect(route.kind).toBe("lora-checkpoint-blocked");
    expect(route.status).toBe("blocked");
    expect(route.requiredConfig).toContain("Base checkpoint");
  });

  it("routes LTX universe requests to Director's Cut profile", () => {
    const route = resolveComfyWorkflowRoute("ltx-video-2.3.safetensors", {}, "universe-series");

    expect(route.kind).toBe("ltx-2.3-universe");
    expect(route.profileId).toBe("ltx-2.3-universe-directors-cut");
    expect(route.gpuFit).toBe("cloud-recommended");
  });

  it("keeps model fingerprinting filename based and path safe", () => {
    const fingerprint = fingerprintComfyModel("models/checkpoints/FLUX.1-schnell-fp8.safetensors");

    expect(fingerprint.family).toBe("flux");
    expect(fingerprint.isLightning).toBe(true);
    expect(fingerprint.normalized).toBe("flux-1-schnell-fp8");
  });
});
