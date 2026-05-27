# Proof Layer V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade AXS Proof Layer into a live cross-app trust cockpit with richer fix actions, stronger scoring, studio badges, and deterministic test coverage.

**Architecture:** Keep scoring pure in `src/lib/proofLayer.ts`, collect Zustand state in `src/lib/useAxsProofSummary.ts`, and render shared UI through reusable proof components. The Production Memory rail owns proof navigation actions, while individual studios consume category summaries through `ProofBadge` and local proof panels.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind, motion/react, Vitest.

---

## File Structure

- Modify: `src/lib/proofLayer.ts`
  - Owns proof types, scoring helpers, category summaries, typed action intents, and pure `buildAxsProofSummary`.
- Modify: `src/lib/useAxsProofSummary.ts`
  - Reads existing app stores and maps them into `AxsProofInput`.
- Modify: `src/lib/__tests__/proofLayer.test.ts`
  - Covers scoring, action intents, fallback safety, and blocked/watch states.
- Create: `src/components/platform/ProofDetailsDrawer.tsx`
  - Extracts the proof drawer out of `AXSContextRail` for testable, focused UI.
- Modify: `src/components/platform/ProofBadge.tsx`
  - Adds optional detail text and compact/full variants.
- Modify: `src/components/platform/AXSContextRail.tsx`
  - Uses extracted drawer, richer issue preview, and typed action handler.
- Modify: `src/features/universe-forge/UniverseForge.tsx`
  - Adds Universe proof strip and Director's Cut readiness proof.
- Modify: `src/components/studio/CharacterStudio.tsx`
  - Adds stronger DNA/reference proof badges in the FaceLock area.
- Modify: `src/components/dna/DNALibrary.tsx`
  - Adds DNA lock state and anchor proof to locked character cards.
- Modify: `src/features/scene-builder/components/SceneControls.tsx`
  - Keeps generation proof panel and wires richer workflow/continuity details.
- Modify: `src/components/forge/ImageForge.tsx`
  - Adds model/workflow/identity proof near generation controls.
- Modify: `src/components/forge/VideoForge.tsx`
  - Adds video workflow/endpoint/Director's Cut readiness proof.
- Modify: `src/components/forge/VoiceStudio.tsx`
  - Adds voice engine/brand voice proof.
- Modify: `src/components/forge/ScriptForge.tsx`
  - Adds brand voice and universe memory proof.
- Modify: `src/components/forge/MarketingStudio.tsx`
  - Adds campaign/distribution proof.
- Modify: `src/components/platform/CreatorHub.tsx`
  - Adds brand voice proof summary.
- Modify: `src/components/platform/DistributeStudio.tsx`
  - Adds platform readiness and content rating proof.

---

### Task 1: Extend Proof Types and Action Intents

**Files:**
- Modify: `src/lib/proofLayer.ts`
- Test: `src/lib/__tests__/proofLayer.test.ts`

- [ ] **Step 1: Write failing tests for v2 action intents**

Add these tests to `src/lib/__tests__/proofLayer.test.ts` inside the existing `describe`.

```ts
  it("exposes typed fix intents for actionable watch and blocked signals", () => {
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm run test -- src/lib/__tests__/proofLayer.test.ts
```

Expected: tests fail because `open-dna-lock`, `open-settings`, and `open-brand-training` are not valid action intents yet.

- [ ] **Step 3: Extend `AxsProofAction.intent`**

In `src/lib/proofLayer.ts`, replace the current `AxsProofAction` interface with:

```ts
export type AxsProofActionIntent =
  | "navigate"
  | "run-continuity-audit"
  | "open-settings"
  | "open-dna-lock"
  | "open-brand-training"
  | "prepare-distribution";

export interface AxsProofAction {
  label: string;
  targetTab?: ForgeTab;
  intent?: AxsProofActionIntent;
}
```

- [ ] **Step 4: Update existing action intents**

In `buildAxsProofSummary`, change these action objects:

```ts
{ label: input.activeCharacter ? "View DNA" : "Lock DNA", targetTab: "dna", intent: "open-dna-lock" }
{ label: "Character Studio", targetTab: "dna", intent: "open-dna-lock" }
{ label: "Settings", targetTab: "config", intent: "open-settings" }
{ label: "Creator Hub", targetTab: "creator", intent: "open-brand-training" }
{ label: "Distribution", targetTab: "distribute", intent: "prepare-distribution" }
{ label: "Distribute", targetTab: "distribute", intent: "prepare-distribution" }
```

Keep regular navigation actions for Image Forge, Motion Studio, Voice Studio, and Universe Forge.

- [ ] **Step 5: Run test to verify it passes**

Run:

```powershell
npm run test -- src/lib/__tests__/proofLayer.test.ts
```

Expected: all proof layer tests pass.

---

### Task 2: Add Stronger Category Detail and Safe Scoring

**Files:**
- Modify: `src/lib/proofLayer.ts`
- Test: `src/lib/__tests__/proofLayer.test.ts`

- [ ] **Step 1: Write failing tests for category signal counts and distribution watch state**

Add:

```ts
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
```

- [ ] **Step 2: Run test to verify current behavior**

Run:

```powershell
npm run test -- src/lib/__tests__/proofLayer.test.ts
```

Expected: the distribution watch test may fail if `distribution-assets` scores as blocked.

- [ ] **Step 3: Adjust launch asset scoring**

In `src/lib/proofLayer.ts`, change the `distribution-assets` score line to:

```ts
input.universe.seriesShotCount > 0 ? 82 : input.scene.canvasItemCount > 0 || input.scene.referenceImageCount > 0 ? 68 : 52,
```

This keeps missing assets in `watch` instead of `blocked`, because it is not a setup failure.

- [ ] **Step 4: Add Director's Cut readiness signal**

After `continuity-audit`, add:

```ts
    buildSignal(
      "continuity-directors-cut",
      "continuity",
      "Director's Cut Readiness",
      input.universe.seriesShotCount >= 8 || input.scene.directorsCutActive ? 88 : input.universe.storyBeatCount >= 4 ? 70 : 50,
      input.universe.seriesShotCount >= 8
        ? `${input.universe.seriesShotCount} shots are available for Director's Cut assembly.`
        : input.universe.storyBeatCount >= 4
          ? "Story memory is strong, but more generated shots are needed before stitching."
          : "Build an arc or generate more shots before Director's Cut can prove pacing.",
      { label: "Director's Cut", targetTab: "universe", intent: "navigate" }
    ),
```

- [ ] **Step 5: Run proof tests**

Run:

```powershell
npm run test -- src/lib/__tests__/proofLayer.test.ts
```

Expected: all proof tests pass.

---

### Task 3: Extract the Proof Details Drawer

**Files:**
- Create: `src/components/platform/ProofDetailsDrawer.tsx`
- Modify: `src/components/platform/AXSContextRail.tsx`

- [ ] **Step 1: Create `ProofDetailsDrawer.tsx`**

Create `src/components/platform/ProofDetailsDrawer.tsx` with:

```tsx
import { X } from "lucide-react";
import { motion } from "motion/react";
import type { AxsProofSignal, AxsProofStatus } from "../../lib/proofLayer";

interface ProofDetailsDrawerProps {
  signals: AxsProofSignal[];
  onClose: () => void;
  onAction: (signal: AxsProofSignal) => void;
}

export function ProofDetailsDrawer({ signals, onClose, onAction }: ProofDetailsDrawerProps) {
  const sortedSignals = [...signals].sort((a, b) => statusWeight(a.status) - statusWeight(b.status));

  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      role="dialog"
      aria-modal="false"
      aria-label="AXS proof report"
      className="fixed right-4 top-[88px] z-50 w-[430px] rounded-[34px] border border-white/[0.14] bg-[#070a11]/92 p-5 shadow-[0_34px_130px_rgba(0,0,0,0.60),0_0_80px_rgba(0,212,255,0.10),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-3xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-100/42">Proof Report</p>
          <h3 className="mt-1 text-xl font-black text-white">Why AXS trusts this project</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/42">
            Live deterministic checks for identity, continuity, workflow fit, voice memory, and launch readiness.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/52 transition hover:bg-white hover:text-black"
          aria-label="Close proof report"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-5 max-h-[70vh] space-y-3 overflow-y-auto pr-1">
        {sortedSignals.map((signal) => (
          <div key={signal.id} className={`rounded-[24px] border p-4 ${proofTone(signal.status, "card")}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] opacity-70">{signal.category}</div>
                <div className="mt-1 text-sm font-black text-white">{signal.label}</div>
              </div>
              <div className="rounded-full border border-white/10 bg-black/28 px-3 py-1 text-xs font-black text-white/76">{signal.score}%</div>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/52">{signal.detail}</p>
            {signal.action ? (
              <button
                type="button"
                onClick={() => onAction(signal)}
                className="mt-3 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-black text-white/68 transition hover:bg-white hover:text-black"
              >
                {signal.action.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function statusWeight(status: AxsProofStatus) {
  return status === "blocked" ? 0 : status === "watch" ? 1 : 2;
}

function proofTone(status: AxsProofStatus, surface: "score" | "chip" | "card") {
  if (status === "ready") {
    return surface === "score"
      ? "border-cyan-200/30 bg-cyan-200 text-black shadow-[0_0_28px_rgba(0,212,255,0.26)]"
      : "border-cyan-200/18 bg-cyan-200/[0.08] text-cyan-50";
  }
  if (status === "watch") {
    return surface === "score"
      ? "border-amber-200/34 bg-amber-200 text-black shadow-[0_0_28px_rgba(251,191,36,0.22)]"
      : "border-amber-200/18 bg-amber-300/[0.08] text-amber-50";
  }
  return surface === "score"
    ? "border-rose-200/34 bg-rose-200 text-black shadow-[0_0_28px_rgba(244,63,94,0.22)]"
    : "border-rose-200/18 bg-rose-300/[0.08] text-rose-50";
}
```

- [ ] **Step 2: Import drawer into `AXSContextRail.tsx`**

Add:

```ts
import { ProofDetailsDrawer } from "./ProofDetailsDrawer";
```

Remove `X` from the lucide import and remove local `ProofDetailsDrawer`, `statusWeight`, and duplicated `proofTone` definitions from `AXSContextRail.tsx`.

- [ ] **Step 3: Run TypeScript**

Run:

```powershell
npm run lint
```

Expected: pass.

---

### Task 4: Add Typed Action Handling in the Rail

**Files:**
- Modify: `src/components/platform/AXSContextRail.tsx`

- [ ] **Step 1: Replace inline action handler with a helper**

Inside `AXSContextRail`, before `return`, add:

```tsx
  const handleProofAction = (signal: AxsProofSignal) => {
    switch (signal.action?.intent) {
      case "run-continuity-audit":
        runContinuityAudit();
        setActiveTab("universe");
        toast.success("Continuity audit complete", {
          description: "Production Memory recalculated wardrobe, emotion, timeline, and event proof.",
        });
        break;
      case "open-settings":
        setActiveTab("config");
        break;
      case "open-dna-lock":
        setActiveTab("dna");
        break;
      case "open-brand-training":
        setActiveTab("creator");
        break;
      case "prepare-distribution":
        setActiveTab("distribute");
        break;
      case "navigate":
      default:
        if (signal.action?.targetTab) setActiveTab(signal.action.targetTab);
        break;
    }
    setProofOpen(false);
  };
```

- [ ] **Step 2: Use the helper**

Replace the current inline `onAction` prop with:

```tsx
onAction={handleProofAction}
```

- [ ] **Step 3: Run TypeScript**

Run:

```powershell
npm run lint
```

Expected: pass.

---

### Task 5: Upgrade Shared Proof Badge

**Files:**
- Modify: `src/components/platform/ProofBadge.tsx`

- [ ] **Step 1: Replace component with variant-aware version**

Use this implementation:

```tsx
import type { AxsProofStatus } from "../../lib/proofLayer";

interface ProofBadgeProps {
  label: string;
  score: number;
  status: AxsProofStatus;
  detail?: string;
  variant?: "compact" | "full";
}

export function ProofBadge({ label, score, status, detail, variant = "compact" }: ProofBadgeProps) {
  const full = variant === "full";

  return (
    <div className={`rounded-2xl border ${tone(status)} ${full ? "p-4" : "px-3 py-2"}`} title={detail ?? `${label}: ${score}%`}>
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-[10px] font-black uppercase tracking-[0.16em]">{label}</span>
        <span className="shrink-0 text-xs font-black">{score}%</span>
      </div>
      {full && detail ? <p className="mt-2 text-xs font-semibold leading-5 text-white/48">{detail}</p> : null}
    </div>
  );
}

function tone(status: AxsProofStatus) {
  if (status === "ready") return "border-cyan-200/18 bg-cyan-200/[0.08] text-cyan-50";
  if (status === "watch") return "border-amber-200/18 bg-amber-300/[0.08] text-amber-50";
  return "border-rose-200/18 bg-rose-300/[0.08] text-rose-50";
}
```

- [ ] **Step 2: Run TypeScript**

Run:

```powershell
npm run lint
```

Expected: pass.

---

### Task 6: Strengthen Studio Integrations

**Files:**
- Modify: `src/features/universe-forge/UniverseForge.tsx`
- Modify: `src/components/studio/CharacterStudio.tsx`
- Modify: `src/components/dna/DNALibrary.tsx`
- Modify: `src/features/scene-builder/components/SceneControls.tsx`
- Modify: `src/components/forge/ImageForge.tsx`
- Modify: `src/components/forge/VideoForge.tsx`
- Modify: `src/components/forge/VoiceStudio.tsx`
- Modify: `src/components/forge/ScriptForge.tsx`
- Modify: `src/components/forge/MarketingStudio.tsx`
- Modify: `src/components/platform/CreatorHub.tsx`
- Modify: `src/components/platform/DistributeStudio.tsx`

- [ ] **Step 1: Add the same import pattern to each screen**

At the top of each screen that lacks proof data, add:

```ts
import { ProofBadge } from "../platform/ProofBadge";
import { useAxsProofSummary } from "../../lib/useAxsProofSummary";
```

Adjust relative paths based on file location:

```ts
// for src/features/universe-forge/UniverseForge.tsx
import { ProofBadge } from "../../components/platform/ProofBadge";
import { useAxsProofSummary } from "../../lib/useAxsProofSummary";

// for src/features/scene-builder/components/SceneControls.tsx
import { ProofBadge } from "@/components/platform/ProofBadge";
import { useAxsProofSummary } from "@/lib/useAxsProofSummary";
```

- [ ] **Step 2: Add `const proof = useAxsProofSummary();` inside each component**

Place it near existing store selectors:

```ts
const proof = useAxsProofSummary();
```

- [ ] **Step 3: Add proof badge groups using local categories**

Use the matching category group per screen:

```tsx
<div className="flex flex-wrap gap-2">
  <ProofBadge label="Identity" score={proof.categories.identity.score} status={proof.categories.identity.status} />
  <ProofBadge label="Continuity" score={proof.categories.continuity.score} status={proof.categories.continuity.status} />
</div>
```

For generation screens use:

```tsx
<div className="flex flex-wrap gap-2">
  <ProofBadge label="Workflow" score={proof.categories.workflow.score} status={proof.categories.workflow.status} />
  <ProofBadge label="Identity" score={proof.categories.identity.score} status={proof.categories.identity.status} />
  <ProofBadge label="Continuity" score={proof.categories.continuity.score} status={proof.categories.continuity.status} />
</div>
```

For business/launch screens use:

```tsx
<div className="flex flex-wrap gap-2">
  <ProofBadge label="Brand Voice" score={proof.categories.brandVoice.score} status={proof.categories.brandVoice.status} />
  <ProofBadge label="Distribution" score={proof.categories.distribution.score} status={proof.categories.distribution.status} />
</div>
```

- [ ] **Step 4: Avoid layout churn**

Place proof groups in existing header, inspector, or side-panel areas. Do not create new full-page sections.

- [ ] **Step 5: Run TypeScript after every two screens**

Run:

```powershell
npm run lint
```

Expected: pass after each pair of integrations.

---

### Task 7: Final Verification and Security Pass

**Files:**
- All files touched by Tasks 1-6

- [ ] **Step 1: Run proof tests**

Run:

```powershell
npm run test -- src/lib/__tests__/proofLayer.test.ts
```

Expected: pass.

- [ ] **Step 2: Run full tests**

Run:

```powershell
npm run test
```

Expected: all tests pass.

- [ ] **Step 3: Run TypeScript**

Run:

```powershell
npm run lint
```

Expected: pass.

- [ ] **Step 4: Run dependency audit**

Run:

```powershell
npm audit --json
```

Expected: `"total": 0` vulnerabilities in metadata.

- [ ] **Step 5: Run production build**

Run:

```powershell
npm run build
```

Expected: build succeeds. The existing Vite large chunk warning is acceptable for this task.

- [ ] **Step 6: Manual UI check**

Open the app and check:

```text
http://127.0.0.1:3000/
```

Confirm:

- Production Memory opens and closes.
- Minimized rail still shows score.
- Why drawer shows all signals.
- Run Audit routes to Universe and shows toast.
- Settings action routes to Config.
- Lock DNA routes to DNA.
- Creator Hub action routes to Creator Hub.
- Distribute action routes to Distribute.
- No page turns white except Universe reading mode when deliberately enabled.

