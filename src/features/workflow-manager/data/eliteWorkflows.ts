import type { EliteWorkflowTemplate, WorkflowModelId } from "../types/workflow-manager.types";

const characterDnaSection = {
  id: "character-dna-lock",
  title: "Character DNA Lock",
  description: "Face, body, seed, LoRA, and prompt DNA stay prominent in every workflow.",
  color: "#00D4FF",
  nodes: ["Load Character DNA", "Face Reference Upload", "IP-Adapter FaceID", "Body Reference Lock", "DNA Strength Mixer"],
  controls: [
    { id: "faceLockStrength", label: "FaceLock strength", value: 0.88, min: 0, max: 1, step: 0.01 },
    { id: "bodyLockStrength", label: "Body lock", value: 0.74, min: 0, max: 1, step: 0.01 },
    { id: "dnaPromptWeight", label: "DNA prompt weight", value: 0.92, min: 0, max: 1, step: 0.01 },
  ],
};

export const ELITE_WORKFLOW_TEMPLATES: EliteWorkflowTemplate[] = [
  {
    id: "flux-fp8-character-lock-v1",
    modelIds: ["flux1-dev-fp8", "flux1-schnell-fp8", "flux-2-flash"],
    family: "flux",
    title: "FLUX FP8 Character Lock",
    shortLabel: "Flux DNA",
    description: "Prompt-faithful FLUX workflow with FaceID/IP-Adapter identity lock and RTX 3080-friendly FP8 defaults.",
    badge: "Prompt Adherence",
    defaultPrompt:
      "premium cinematic portrait of @character, locked Character DNA, expressive eyes, editorial lighting, high-end production still, detailed skin, 35mm lens",
    negativePrompt: "bad anatomy, extra fingers, warped face, identity drift, low detail, text, watermark, plastic skin",
    resolution: "1024x1344",
    steps: 24,
    cfg: 3.5,
    sampler: "euler",
    scheduler: "simple",
    vramProfile: "RTX 3080 10GB",
    output: "image",
    sections: [
      characterDnaSection,
      {
        id: "flux-core",
        title: "FLUX Core",
        description: "FP8 UNET, CLIP-L, T5XXL, and AE loader kept clean and grouped.",
        color: "#A855F7",
        nodes: ["DualCLIPLoader", "UNETLoader FP8", "VAELoader AE", "FluxGuidance", "KSampler"],
        controls: [
          { id: "steps", label: "Steps", value: 24, min: 16, max: 32, step: 1 },
          { id: "guidance", label: "Guidance", value: 3.5, min: 2, max: 6, step: 0.1 },
          { id: "maxSequenceLength", label: "Max sequence", value: 512, min: 256, max: 768, step: 64 },
        ],
      },
      {
        id: "finish",
        title: "Save & Upscale",
        description: "Clean save path with optional high-quality latent/detail upscale.",
        color: "#22D3EE",
        nodes: ["VAE Decode", "Image Saver", "Ultimate SD Upscale Optional"],
        controls: [{ id: "upscale", label: "Upscale", value: true }],
      },
    ],
    comfy: {
      groups: [
        { title: "01 Character DNA Lock", color: "#00D4FF", bounds: [0, 0, 520, 360] },
        { title: "02 FLUX FP8 Core", color: "#A855F7", bounds: [560, 0, 720, 420] },
        { title: "03 Save / Upscale", color: "#22D3EE", bounds: [1320, 0, 420, 320] },
      ],
      nodePlan: ["DNA memory -> IP-Adapter FaceID -> Flux conditioning -> KSampler -> VAE Decode -> Save"],
      postProcess: ["Optional detail upscale", "metadata save", "DNA seed writeback"],
    },
  },
  {
    id: "pony-sdxl-controlnet-v1",
    modelIds: ["biglove-pony2", "dreamshaper-xl", "sdxl-pony"],
    family: "sdxl-pony",
    title: "Pony / SDXL ControlNet Studio",
    shortLabel: "Pony XL",
    description: "High-quality SDXL/Pony workflow with ControlNet pose/depth branches and strong character reference controls.",
    badge: "ControlNet Ready",
    defaultPrompt:
      "score_9, score_8_up, premium cinematic character frame of @character, consistent face, elegant composition, controlled pose, studio lighting",
    negativePrompt: "score_4, score_5, low quality, deformed, bad hands, duplicate body, off-model face, text, watermark",
    resolution: "1024x1024",
    steps: 30,
    cfg: 6.5,
    sampler: "dpmpp_2m",
    scheduler: "karras",
    vramProfile: "RTX 3080 10GB",
    output: "image",
    sections: [
      { ...characterDnaSection, controls: characterDnaSection.controls.map((control) => control.id === "faceLockStrength" ? { ...control, value: 0.82 } : control) },
      {
        id: "controlnet",
        title: "ControlNet Composition",
        description: "OpenPose and depth can be blended without wrecking the character lock.",
        color: "#F472B6",
        nodes: ["OpenPose Preprocessor", "Depth Preprocessor", "ControlNet Apply", "SDXL Positive/Negative Conditioning"],
        controls: [
          { id: "openPoseStrength", label: "OpenPose", value: 0.62, min: 0, max: 1, step: 0.01 },
          { id: "depthStrength", label: "Depth", value: 0.48, min: 0, max: 1, step: 0.01 },
        ],
      },
      {
        id: "sdxl-core",
        title: "SDXL / Pony Core",
        description: "Checkpoint, refiner-ready conditioning, sampler, decode, and save.",
        color: "#818CF8",
        nodes: ["CheckpointLoaderSimple", "CLIP Text Encode", "KSampler", "VAE Decode", "Save Image"],
        controls: [
          { id: "steps", label: "Steps", value: 30, min: 20, max: 40, step: 1 },
          { id: "cfg", label: "CFG", value: 6.5, min: 4, max: 9, step: 0.1 },
        ],
      },
    ],
    comfy: {
      groups: [
        { title: "01 Character DNA Lock", color: "#00D4FF", bounds: [0, 0, 520, 360] },
        { title: "02 ControlNet Pose + Depth", color: "#F472B6", bounds: [560, 0, 620, 420] },
        { title: "03 SDXL Pony Core", color: "#818CF8", bounds: [1220, 0, 620, 420] },
      ],
      nodePlan: ["Reference images -> ControlNet pose/depth -> SDXL/Pony sampler -> VAE Decode -> Save"],
      postProcess: ["Optional refiner", "optional 1.5x upscale", "metadata save"],
    },
  },
  {
    id: "ltx23-i2v-directors-cut-v1",
    modelIds: ["ltx-video-2.3"],
    family: "ltx-video",
    title: "LTX 2.3 Director's Cut I2V",
    shortLabel: "LTX 2.3",
    description: "First-frame locked image-to-video workflow with IP-Adapter, OpenPose, Depth, motion presets, and RTX VSR finish.",
    badge: "Video Engine",
    defaultPrompt:
      "cinematic motion shot of @character, first-frame identity locked, controlled camera move, natural motion, consistent wardrobe and lighting",
    negativePrompt: "identity drift, face morph, flicker, warped hands, jitter, smeared details, inconsistent clothing, broken motion",
    resolution: "832x1216",
    steps: 28,
    cfg: 4.1,
    sampler: "ltx-native",
    scheduler: "ltx-cinematic",
    vramProfile: "RTX 3080 10GB",
    output: "video",
    sections: [
      {
        ...characterDnaSection,
        nodes: ["Start Frame Upload", "End Frame Optional", "IP-Adapter First Frame", "FaceLock Mixer", "Body Silhouette Lock"],
      },
      {
        id: "motion-control",
        title: "Motion Control",
        description: "Camera presets, OpenPose, and depth stabilize motion while preserving story intent.",
        color: "#C026D3",
        nodes: ["Motion Preset Router", "OpenPose ControlNet", "Depth ControlNet", "LTX I2V Sampler"],
        controls: [
          { id: "motionPreset", label: "Motion preset", value: "slow push-in" },
          { id: "openPoseStrength", label: "OpenPose", value: 0.62, min: 0, max: 1, step: 0.01 },
          { id: "depthStrength", label: "Depth", value: 0.56, min: 0, max: 1, step: 0.01 },
          { id: "fps", label: "FPS", value: 16, min: 12, max: 24, step: 1 },
        ],
      },
      {
        id: "rtx-finish",
        title: "RTX Video Finish",
        description: "Video combine, audio preserve, RTX Video Super Resolution, and clean MP4 output.",
        color: "#38BDF8",
        nodes: ["VHS Video Combine", "RTXVideoSuperResolution", "RIFE Optional", "Final MP4 Save"],
        controls: [
          { id: "targetWidth", label: "Upscale width", value: 3840, unit: "px" },
          { id: "targetHeight", label: "Upscale height", value: 2160, unit: "px" },
          { id: "crf", label: "CRF", value: 19, min: 16, max: 24, step: 1 },
        ],
      },
    ],
    comfy: {
      groups: [
        { title: "01 Character DNA / First Frame Lock", color: "#00D4FF", bounds: [0, 0, 560, 420] },
        { title: "02 LTX Motion + ControlNet", color: "#C026D3", bounds: [610, 0, 720, 460] },
        { title: "03 RTX VSR 4K Finish", color: "#38BDF8", bounds: [1380, 0, 560, 420] },
      ],
      nodePlan: ["Start frame -> FaceLock/IP-Adapter -> OpenPose/Depth -> LTX 2.3 I2V -> Video Combine -> RTX VSR"],
      postProcess: ["H264 MP4", "RTX 3840x2160 ULTRA", "optional RIFE interpolation"],
    },
  },
  {
    id: "ltx11-3080-i2v-rtx-vsr-v1",
    modelIds: ["ltx-video-1.1"],
    family: "ltx-video",
    title: "LTX 1.1 3080 I2V + RTX VSR",
    shortLabel: "LTX 1.1",
    description: "RTX 3080 10GB-safe image-to-video workflow: first-frame DNA lock, short controlled clips, then RTX Video Super Resolution finish.",
    badge: "3080 Safe",
    defaultPrompt:
      "cinematic short motion shot of @character, first-frame identity locked, subtle controlled camera move, natural motion, consistent wardrobe and lighting",
    negativePrompt: "identity drift, flicker, face morph, warped hands, smeared motion, inconsistent wardrobe, jitter, low quality",
    resolution: "768x1280",
    steps: 22,
    cfg: 3.5,
    sampler: "ltx-native",
    scheduler: "ltx-1.1-stable",
    vramProfile: "RTX 3080 10GB",
    output: "video",
    sections: [
      {
        ...characterDnaSection,
        controls: [
          { id: "faceLockStrength", label: "FaceLock strength", value: 0.86, min: 0, max: 1, step: 0.01 },
          { id: "bodyLockStrength", label: "Body lock", value: 0.72, min: 0, max: 1, step: 0.01 },
          { id: "ipAdapterStrength", label: "IP-Adapter", value: 0.8, min: 0, max: 1, step: 0.01 },
        ],
        nodes: ["Start Frame Upload", "Character DNA Prompt", "IP-Adapter First Frame", "FaceLock Mixer", "Body Silhouette Lock"],
      },
      {
        id: "ltx11-core",
        title: "LTX 1.1 3080 Core",
        description: "Short 12-16fps image-to-video clips tuned for 10GB VRAM stability.",
        color: "#A855F7",
        nodes: ["LTX 1.1 Loader", "I2V Conditioning", "Motion Preset Router", "LTX Sampler", "Video Decode"],
        controls: [
          { id: "fps", label: "FPS", value: 12, min: 12, max: 16, step: 1 },
          { id: "duration", label: "Duration", value: 4, min: 2, max: 5, step: 1, unit: "s" },
          { id: "denoise", label: "Denoise", value: 0.88, min: 0.72, max: 1, step: 0.01 },
        ],
      },
      {
        id: "rtx-vsr-finish",
        title: "RTX VSR Finish",
        description: "Your supplied VHS Load Video -> RTXVideoSuperResolution -> VHS Combine post workflow.",
        color: "#38BDF8",
        nodes: ["VHS_LoadVideo", "RTXVideoSuperResolution", "VHS_VideoCombine", "Audio Passthrough"],
        controls: [
          { id: "targetWidth", label: "Upscale width", value: 3840, unit: "px" },
          { id: "targetHeight", label: "Upscale height", value: 2160, unit: "px" },
          { id: "crf", label: "CRF", value: 19, min: 16, max: 24, step: 1 },
        ],
      },
    ],
    comfy: {
      groups: [
        { title: "01 Character DNA / Start Frame", color: "#00D4FF", bounds: [0, 0, 560, 400] },
        { title: "02 LTX 1.1 3080 I2V", color: "#A855F7", bounds: [610, 0, 680, 420] },
        { title: "03 RTX VSR 4K Finish", color: "#38BDF8", bounds: [1340, 0, 560, 420] },
      ],
      nodePlan: ["Start frame -> IP-Adapter/FaceLock -> LTX 1.1 I2V -> VHS combine -> RTX VSR 3840x2160"],
      postProcess: ["RTXVideoSuperResolution ULTRA", "H264 MP4", "audio passthrough"],
    },
  },
  {
    id: "realistic-photo-dna-v1",
    modelIds: ["realvis-xl", "juggernaut-xl", "custom-realistic", "nano-banana-2", "nano-banana-pro", "gpt-image-2"],
    family: "realistic",
    title: "Realistic DNA Photo Studio",
    shortLabel: "Realistic",
    description: "Premium realistic still-image workflow for portraits, editorial frames, and brand-safe cinematic images.",
    badge: "Realism",
    defaultPrompt:
      "high-end realistic cinematic photograph of @character, natural skin texture, luxury editorial lighting, coherent anatomy, premium production still",
    negativePrompt: "uncanny, waxy skin, deformed anatomy, extra limbs, bad hands, low quality, overprocessed, watermark",
    resolution: "1024x1536",
    steps: 28,
    cfg: 5.5,
    sampler: "dpmpp_2m_sde",
    scheduler: "karras",
    vramProfile: "RTX 3080 10GB",
    output: "image",
    sections: [
      characterDnaSection,
      {
        id: "realism-core",
        title: "Realistic Core",
        description: "Balanced sampling for face quality, skin texture, and clean professional composition.",
        color: "#14B8A6",
        nodes: ["Model Loader", "Prompt Styler", "KSampler", "Face Detailer Optional", "Save Image"],
        controls: [
          { id: "steps", label: "Steps", value: 28, min: 20, max: 40, step: 1 },
          { id: "cfg", label: "CFG", value: 5.5, min: 3, max: 8, step: 0.1 },
          { id: "faceDetailer", label: "Face detailer", value: true },
        ],
      },
    ],
    comfy: {
      groups: [
        { title: "01 Character DNA Lock", color: "#00D4FF", bounds: [0, 0, 520, 360] },
        { title: "02 Realistic Model Core", color: "#14B8A6", bounds: [560, 0, 660, 420] },
        { title: "03 Detail / Save", color: "#A7F3D0", bounds: [1260, 0, 420, 320] },
      ],
      nodePlan: ["Character DNA -> realistic checkpoint -> sampler -> optional face detailer -> save"],
      postProcess: ["metadata save", "optional 2x upscale"],
    },
  },
];

export const DEFAULT_WORKFLOW =
  ELITE_WORKFLOW_TEMPLATES.find((workflow) => workflow.id === "realistic-photo-dna-v1") ?? ELITE_WORKFLOW_TEMPLATES[0];

export function resolveWorkflowForModel(model: WorkflowModelId): EliteWorkflowTemplate {
  return ELITE_WORKFLOW_TEMPLATES.find((workflow) => workflow.modelIds.includes(model)) ?? DEFAULT_WORKFLOW;
}

export function getWorkflowModelOptions() {
  return ELITE_WORKFLOW_TEMPLATES.flatMap((workflow) =>
    workflow.modelIds.map((model) => ({
      value: model,
      label: model,
      workflow: workflow.title,
      family: workflow.family,
    }))
  );
}
