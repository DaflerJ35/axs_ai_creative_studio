import { describe, expect, it } from "vitest";
import { buildWorkflow } from "../comfyui";

describe("comfyui workflow builder", () => {
  it("fails early for FLUX checkpoints without split text encoders", () => {
    expect(() =>
      buildWorkflow({
        model: "flux1-dev-fp8.safetensors",
        prompt: "cinematic portrait",
      })
    ).toThrow("no valid FLUX text encoders");
  });

  it("uses DualCLIPLoader for configured FLUX split text encoders", () => {
    const workflow = buildWorkflow({
      model: "flux1-dev-fp8.safetensors",
      prompt: "cinematic portrait",
      fluxClipL: "clip_l.safetensors",
      fluxT5xxl: "t5xxl_fp8_e4m3fn.safetensors",
      fluxVae: "ae.safetensors",
    }) as Record<string, { class_type: string; inputs: Record<string, unknown> }>;

    expect(workflow["40"].class_type).toBe("DualCLIPLoader");
    expect(workflow["6"].inputs.clip).toEqual(["40", 0]);
    expect(workflow["7"].inputs.clip).toEqual(["40", 0]);
    expect(workflow["8"].inputs.vae).toEqual(["41", 0]);
  });

  it("uses the lightning-safe workflow for RealVisXL Lightning filenames", () => {
    const workflow = buildWorkflow({
      model: "realvisxlV50_v50LightningBakedvae.safetensors",
      prompt: "cinematic portrait",
    }) as Record<string, { class_type: string; inputs: Record<string, unknown> }>;

    expect(workflow["3"].inputs.steps).toBe(6);
    expect(workflow["3"].inputs.cfg).toBe(2);
    expect(workflow["3"].inputs.scheduler).toBe("sgm_uniform");
    expect(workflow["11"]).toBeUndefined();
  });

  it("injects Pony score tags for real Pony checkpoint filenames", () => {
    const workflow = buildWorkflow({
      model: "bigLove_pony2.safetensors",
      prompt: "cinematic portrait",
    }) as Record<string, { class_type: string; inputs: Record<string, unknown> }>;

    expect(workflow["6"].inputs.text).toContain("score_9");
    expect(workflow["7"].inputs.text).toContain("score_1");
  });
});
