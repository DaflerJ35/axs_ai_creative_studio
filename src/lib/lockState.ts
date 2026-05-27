/**
 * lockState.ts — Pure state machine for the ImageForge DNA lock panel.
 *
 * Extracted from the React component so the state transitions are independently
 * testable. No React, no Zustand, no side effects here — just plain data.
 *
 * Persistence contract (handled by the component, not this module):
 *   Load: on CHARACTER_SWITCH, read localStorage.getItem(`axs.lock.${id}`) → LOAD_PERSISTED
 *   Save: after every state change, write the full LockState back to localStorage
 */

// ── State shape ────────────────────────────────────────────────────────────

export interface LockState {
  locked: boolean;
  lockedSeed: number | null;
  faceIdEnabled: boolean;
  bodyRefEnabled: boolean;
  consistencyStrength: number;
  /** Last 5 seeds used for this character, newest first. */
  seedHistory: number[];
}

export const INITIAL_LOCK_STATE: LockState = {
  locked:              false,
  lockedSeed:          null,
  faceIdEnabled:       true,
  bodyRefEnabled:      false,
  consistencyStrength: 0.85,
  seedHistory:         [],
};

// ── Actions ────────────────────────────────────────────────────────────────

export type LockAction =
  | { type: "LOCK" }
  | { type: "UNLOCK" }
  | { type: "SET_SEED"; seed: number }
  | { type: "RESET_TO_CHARACTER_SEED"; characterSeed: number | undefined }
  | { type: "RANDOMIZE_SEED" }
  /**
   * Hard reset — must be dispatched whenever the active character changes.
   * Clears ALL state so stale lock/seed from character A cannot bleed into B.
   */
  | { type: "CHARACTER_SWITCH" }
  /**
   * Dispatched after a successful generation. When locked, records the seed
   * in history and sets it as the active lockedSeed if none was set yet.
   * When unlocked, is a no-op (random seeds are not recorded).
   */
  | { type: "GENERATION_COMPLETE"; seed: number }
  | { type: "TOGGLE_FACE_ID" }
  | { type: "TOGGLE_BODY_REF" }
  | { type: "SET_CONSISTENCY_STRENGTH"; value: number }
  /** Restore a previously persisted state (from localStorage on character load). */
  | { type: "LOAD_PERSISTED"; state: Partial<LockState> };

// ── Reducer ────────────────────────────────────────────────────────────────

export function lockStateReducer(state: LockState, action: LockAction): LockState {
  switch (action.type) {
    case "LOCK":
      return { ...state, locked: true };

    case "UNLOCK":
      return { ...state, locked: false, lockedSeed: null };

    case "SET_SEED":
      return { ...state, lockedSeed: action.seed };

    case "RESET_TO_CHARACTER_SEED":
      return { ...state, lockedSeed: action.characterSeed ?? null };

    case "RANDOMIZE_SEED":
      return { ...state, lockedSeed: Math.floor(Math.random() * 2 ** 32) };

    case "CHARACTER_SWITCH":
      // Hard reset — no state from the previous character survives.
      return { ...INITIAL_LOCK_STATE };

    case "GENERATION_COMPLETE": {
      if (!state.locked) return state;
      // First generation with no seed set: adopt the generated seed.
      const seed = state.lockedSeed ?? action.seed;
      // Deduplicate and cap history at 5.
      const history = [
        action.seed,
        ...state.seedHistory.filter((s) => s !== action.seed),
      ].slice(0, 5);
      return { ...state, lockedSeed: seed, seedHistory: history };
    }

    case "TOGGLE_FACE_ID":
      return { ...state, faceIdEnabled: !state.faceIdEnabled };

    case "TOGGLE_BODY_REF":
      return { ...state, bodyRefEnabled: !state.bodyRefEnabled };

    case "SET_CONSISTENCY_STRENGTH":
      return { ...state, consistencyStrength: action.value };

    case "LOAD_PERSISTED":
      return { ...state, ...action.state };
  }
}

// ── localStorage helpers ───────────────────────────────────────────────────

/**
 * Sentinel used as the localStorage key when no character is active (prompt-only mode).
 * Allows seed history to survive page refreshes even without a character loaded.
 */
export const NO_CHARACTER_KEY = "__global__";

/**
 * Returns the localStorage key for a character's lock state.
 * Accepts null for prompt-only (no character) mode — uses the global sentinel.
 */
export function lockStateKey(characterId: string | null): string {
  return `axs.lock.${characterId ?? NO_CHARACTER_KEY}`;
}

export function loadPersistedLockState(characterId: string | null): Partial<LockState> {
  try {
    const raw = localStorage.getItem(lockStateKey(characterId));
    if (!raw) return {};
    return JSON.parse(raw) as Partial<LockState>;
  } catch {
    return {};
  }
}

export function savePersistedLockState(characterId: string | null, state: LockState): void {
  try {
    localStorage.setItem(lockStateKey(characterId), JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — fail silently, state is still live in memory
  }
}
