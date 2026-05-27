# Known Limitations & Deferred Items

> Previously-tracked bugs that have since been fixed are noted below with their resolution.
> Open items describe intentional gaps requiring deeper infrastructure work.

---

## ✅ FIXED — Multi-LoRA stacking now works end-to-end

**Was:** UI showed a stacking chip but silently dropped the picker LoRA; only the
character LoRA was forwarded to inference.

**Fix applied:**
- `comfyui.ts` → `buildDualLoRAWorkflow()` chains two `LoraLoader` nodes:
  checkpoint → lora1 → lora2 → KSampler. Both LoRAs actually fire.
- `ComfyParams` + `ImageJobInput` extended with `loras: Array<{ name, weight }>`.
- `workflows.ts` → `forgeImage()` resolves a `loras[]` array and passes it through.
- `ImageForge.tsx` → `resolveLoRAs()` returns both entries; picker LoRA is capped
  at 0.40 weight when stacking to avoid overwhelming the character DNA.
- Stacking chip tooltip updated to reflect the actual capped weight.

---

## ✅ FIXED — FaceID/BodyRef now route face references separately

**Was:** All reference images used the same `img2img` pass at `denoise: 0.75`
regardless of type. FaceID toggle only injected prompt text — it had no effect
on how the reference image was processed.

**Fix applied:**
- `buildImg2ImgWorkflow()` now accepts a `denoiseOverride` parameter.
- Face-typed references (`ref.type === "face"`) are passed via `faceRefImageDataUrl`
  and reach ComfyUI with `denoise: 0.88` — higher fidelity preserves face structure.
- Body/style references continue at `denoise: 0.75` via `referenceImageDataUrl`.
- Both are uploaded in parallel before the generation call.

> **Note:** True InstantID / IP-Adapter-FaceID (separate ComfyUI extension nodes)
> is still a future upgrade. This fix makes face refs meaningfully different from
> style refs without requiring external extensions.

---

## ✅ FIXED — `consistencyStrength` slider NaN guard

**Was:** `Number(e.target.value)` could produce `NaN` on empty string in some
browser implementations, storing `NaN` in `lockState.consistencyStrength`.

**Fix applied:** `parseFloat` with an explicit `isNaN` guard before dispatch:
```ts
const v = parseFloat(e.target.value);
if (!isNaN(v)) dispatch({ type: "SET_CONSISTENCY_STRENGTH", value: v });
```

---

## ✅ FIXED — Seed history now persists in no-character (prompt-only) mode

**Was:** `savePersistedLockState` was gated on `character?.id` — with no character,
lock state was never written to localStorage and was lost on refresh.

**Fix applied:**
- `lockState.ts` exports `NO_CHARACTER_KEY = "__global__"` and all three helpers
  (`lockStateKey`, `loadPersistedLockState`, `savePersistedLockState`) now accept
  `string | null` — passing `null` uses the sentinel key.
- `ImageForge.tsx` persist effect now always saves:
  ```ts
  savePersistedLockState(character?.id ?? null, lockState);
  ```
- Character-switch effect loads using the new id (or null), removing the `if (newId)`
  guard that previously skipped loading in no-character mode.

---

## ✅ FIXED — Live composed-prompt preview added

**Was:** The user typed a raw prompt and had no visibility into what FLUX actually
received after DNA segments (physical traits, personality, style phases, lighting)
were injected.

**Fix applied:**
- `composedPreview` is computed via `useMemo` from `composeFromCharacter()` —
  reacts instantly to any draft text, tag toggle, or personality toggle change.
- A collapsible "Composed prompt preview" link appears below the prompt textarea,
  showing the full expanded string + approximate token count + a compression warning
  when the prompt exceeds ~250 tokens.

---

## Open — True InstantID / IP-Adapter-FaceID nodes

The face-ref routing above improves fidelity but still uses img2img, not a
dedicated face-locking pipeline. True identity preservation (same face across all
generations, not just soft preservation via high denoise) requires:

1. `IPAdapterModelLoader` + `IPAdapterApply` nodes (ComfyUI-IPAdapter-plus extension)
2. `InsightFaceLoader` for face embedding extraction
3. `FaceDetailer` from ComfyUI-Impact-Pack for post-pass face fix

**Detect availability** by hitting `/object_info/IPAdapterModelLoader` at startup —
fall back to the current img2img path if not installed.
