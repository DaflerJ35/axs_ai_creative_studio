# Workflow Engine v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add model-aware workflow routing for realistic image/video generation, with a 3080-safe LTX 1.1 path and free local/open-source voice support.

**Architecture:** Add a focused workflow registry that profiles model families, GPU fit, continuity features, and post-processing. Keep LTX 1.1 RTX VSR JSON as a post-processing workflow, expose a separate 3080-safe generation profile, and route Universe Forge/Scene Builder through profile metadata. Extend voice engines with a local endpoint option that does not require paid APIs.

**Tech Stack:** React, TypeScript, Zustand, ComfyUI workflow JSON, RunPod/local HTTP voice endpoints, Vitest.

---

### Task 1: Workflow Registry
- [ ] Create `src/lib/workflowRegistry.ts` with model-aware profile definitions.
- [ ] Add tests for model-to-workflow selection and 3080-safe LTX profiles.

### Task 2: LTX 1.1 Profiles
- [ ] Extend `src/lib/ltx11Workflow.ts` with a true 3080-safe generation profile plus RTX VSR post workflow metadata.
- [ ] Preserve the supplied RTX VSR ComfyUI JSON shape.

### Task 3: Routing Integration
- [ ] Update Scene Builder/Universe Forge workflow panels to read profile data from the registry.
- [ ] Ensure Universe Forge uses continuity-first workflows by default.

### Task 4: Local Voice Engine
- [ ] Add `local` voice engine type and settings for a local/open-source TTS endpoint.
- [ ] Implement local voice POST request with clean fallback messaging.
- [ ] Update Voice Studio UI copy/options away from ElevenLabs-only language.

### Task 5: Verification
- [ ] Run `npm run lint`.
- [ ] Run `npm run test`.
- [ ] Run `npm run build`.
