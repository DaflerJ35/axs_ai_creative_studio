import { describe, it, expect } from "vitest";
import {
  lockStateReducer,
  INITIAL_LOCK_STATE,
  type LockState,
} from "../lockState";

describe("lockStateReducer", () => {
  it("LOCK sets locked=true", () => {
    const s = lockStateReducer(INITIAL_LOCK_STATE, { type: "LOCK" });
    expect(s.locked).toBe(true);
  });

  it("UNLOCK clears locked and lockedSeed", () => {
    let s = lockStateReducer(INITIAL_LOCK_STATE, { type: "LOCK" });
    s = lockStateReducer(s, { type: "SET_SEED", seed: 12345 });
    s = lockStateReducer(s, { type: "UNLOCK" });
    expect(s.locked).toBe(false);
    expect(s.lockedSeed).toBeNull();
  });

  it("SET_SEED stores the seed", () => {
    const s = lockStateReducer(INITIAL_LOCK_STATE, { type: "SET_SEED", seed: 99999 });
    expect(s.lockedSeed).toBe(99999);
  });

  it("RANDOMIZE_SEED sets a non-null integer seed", () => {
    const s = lockStateReducer(INITIAL_LOCK_STATE, { type: "RANDOMIZE_SEED" });
    expect(s.lockedSeed).not.toBeNull();
    expect(Number.isInteger(s.lockedSeed)).toBe(true);
    expect(s.lockedSeed!).toBeGreaterThanOrEqual(0);
  });

  it("CHARACTER_SWITCH performs a complete hard reset", () => {
    let s = lockStateReducer(INITIAL_LOCK_STATE, { type: "LOCK" });
    s = lockStateReducer(s, { type: "SET_SEED", seed: 99999 });
    s = lockStateReducer(s, { type: "TOGGLE_FACE_ID" }); // true → false
    s = lockStateReducer(s, { type: "GENERATION_COMPLETE", seed: 12345 });
    s = lockStateReducer(s, { type: "CHARACTER_SWITCH" });

    expect(s.locked).toBe(false);
    expect(s.lockedSeed).toBeNull();
    expect(s.faceIdEnabled).toBe(true);
    expect(s.bodyRefEnabled).toBe(false);
    expect(s.consistencyStrength).toBe(0.85);
    expect(s.seedHistory).toEqual([]);
  });

  it("GENERATION_COMPLETE when locked records seed in history", () => {
    let s = lockStateReducer(INITIAL_LOCK_STATE, { type: "LOCK" });
    s = lockStateReducer(s, { type: "GENERATION_COMPLETE", seed: 111 });
    s = lockStateReducer(s, { type: "GENERATION_COMPLETE", seed: 222 });
    expect(s.seedHistory).toContain(111);
    expect(s.seedHistory).toContain(222);
    expect(s.seedHistory.length).toBeLessThanOrEqual(5);
  });

  it("GENERATION_COMPLETE when unlocked is a no-op", () => {
    const before = { ...INITIAL_LOCK_STATE };
    const after = lockStateReducer(before, { type: "GENERATION_COMPLETE", seed: 42 });
    expect(after).toEqual(before);
  });

  it("GENERATION_COMPLETE auto-sets lockedSeed on first generation", () => {
    let s = lockStateReducer(INITIAL_LOCK_STATE, { type: "LOCK" });
    expect(s.lockedSeed).toBeNull();
    s = lockStateReducer(s, { type: "GENERATION_COMPLETE", seed: 555555 });
    expect(s.lockedSeed).toBe(555555);
  });

  it("seed history capped at 5 entries", () => {
    let s = lockStateReducer(INITIAL_LOCK_STATE, { type: "LOCK" });
    for (let i = 1; i <= 7; i++) {
      s = lockStateReducer(s, { type: "GENERATION_COMPLETE", seed: i * 1000 });
    }
    expect(s.seedHistory.length).toBe(5);
  });

  it("seed history deduplicates", () => {
    let s = lockStateReducer(INITIAL_LOCK_STATE, { type: "LOCK" });
    s = lockStateReducer(s, { type: "GENERATION_COMPLETE", seed: 100 });
    s = lockStateReducer(s, { type: "GENERATION_COMPLETE", seed: 100 });
    expect(s.seedHistory.filter((x) => x === 100).length).toBe(1);
  });

  it("TOGGLE_FACE_ID flips faceIdEnabled", () => {
    expect(INITIAL_LOCK_STATE.faceIdEnabled).toBe(true);
    const s = lockStateReducer(INITIAL_LOCK_STATE, { type: "TOGGLE_FACE_ID" });
    expect(s.faceIdEnabled).toBe(false);
  });

  it("TOGGLE_BODY_REF flips bodyRefEnabled", () => {
    expect(INITIAL_LOCK_STATE.bodyRefEnabled).toBe(false);
    const s = lockStateReducer(INITIAL_LOCK_STATE, { type: "TOGGLE_BODY_REF" });
    expect(s.bodyRefEnabled).toBe(true);
  });

  it("SET_CONSISTENCY_STRENGTH updates the value", () => {
    const s = lockStateReducer(INITIAL_LOCK_STATE, {
      type: "SET_CONSISTENCY_STRENGTH",
      value: 0.65,
    });
    expect(s.consistencyStrength).toBe(0.65);
  });

  it("LOAD_PERSISTED merges into existing state without clobbering defaults", () => {
    const s = lockStateReducer(INITIAL_LOCK_STATE, {
      type: "LOAD_PERSISTED",
      state: { locked: true, lockedSeed: 54321, seedHistory: [54321] },
    });
    expect(s.locked).toBe(true);
    expect(s.lockedSeed).toBe(54321);
    expect(s.faceIdEnabled).toBe(true); // from INITIAL_LOCK_STATE
  });
});

// ── Integration: full session cycle ───────────────────────────────────────

describe("lock state integration — character switch clears all stale state", () => {
  it("load A → lock → generate → toggle bodyRef → switch to B → clean slate", () => {
    let state: LockState = { ...INITIAL_LOCK_STATE };

    // Lock character A's DNA
    state = lockStateReducer(state, { type: "LOCK" });
    expect(state.locked).toBe(true);

    // First generation — seed is recorded
    state = lockStateReducer(state, { type: "GENERATION_COMPLETE", seed: 888888 });
    expect(state.lockedSeed).toBe(888888);
    expect(state.seedHistory).toContain(888888);

    // User enables body reference
    state = lockStateReducer(state, { type: "TOGGLE_BODY_REF" });
    expect(state.bodyRefEnabled).toBe(true);

    // Switch to character B — must be a complete clean slate
    state = lockStateReducer(state, { type: "CHARACTER_SWITCH" });

    expect(state.locked).toBe(false);
    expect(state.lockedSeed).toBeNull();
    expect(state.faceIdEnabled).toBe(INITIAL_LOCK_STATE.faceIdEnabled);
    expect(state.bodyRefEnabled).toBe(false);
    expect(state.consistencyStrength).toBe(0.85);
    expect(state.seedHistory).toEqual([]);
  });
});
