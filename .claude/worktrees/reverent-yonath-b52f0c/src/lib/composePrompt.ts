/**
 * composePrompt.ts — Character DNA → FLUX-ready prompt.
 *
 * Token order matters for flow-matching models — earlier tokens receive more
 * attention during the denoising trajectory. Build order:
 *
 *   1. Subject anchor   — physical traits (who is this person)
 *   2. Personality      — rendered as natural English, not a tag list
 *   3. Early-weight style — lighting + composition (set the whole image)
 *   4. User intent      — what the user actually typed
 *   5. Late-weight style — mood, color, treatment refinements
 *
 * Lighting and lens choice change the meaning of every other token.
 * If the user says "smiling" and lighting says "noir dramatic," the smile
 * becomes a smirk in shadow. Lighting wins, so it goes early.
 */

import { partitionByWeight } from "./styleTokenMap";
import type { Character } from "./types";

// ── Public interfaces ───────────────────────────────────────────────────────

/**
 * Normalized DNA shape — decoupled from the store's Character object so this
 * module can be tested without React or Zustand.
 */
export interface CharacterDNA {
  id: string;
  name: string;
  /** Free-text physical description: age, build, hair, eyes, distinguishing features. */
  physicalTraits: string;
  personality: string[];
  /** Keys into STYLE_TOKEN_MAP — expanded to photographic direction phrases. */
  style: string[];
  loraPath?: string;
}

export interface ComposeOptions {
  /** What the user typed in the prompt field. Inserted after lighting, before late style. */
  userPrompt?: string;
  /**
   * Style tags toggled OFF for this generation only.
   * Does NOT mutate saved DNA — changes are ephemeral to this render cycle.
   */
  disabledStyleTags?: string[];
  /**
   * Personality traits toggled OFF for this generation only.
   * Same ephemeral contract as disabledStyleTags.
   */
  disabledPersonality?: string[];
}

export interface ComposedPrompt {
  prompt: string;
  /** Approximate token count (chars / 4 — good enough for budget checks). */
  approxTokens: number;
  /**
   * True when the prompt likely exceeds ~250 tokens. The caller should run
   * Ollama compression before submitting to the model.
   */
  needsCompression: boolean;
  /** Which DNA segments contributed — useful for debug overlays. */
  used: {
    physicalTraits: boolean;
    /** Number of personality traits that actually produced phrases (after disabled filter). */
    personalityCount: number;
    /** Number of style tags that matched STYLE_TOKEN_MAP and produced phrases. */
    styleCount: number;
    hasUserPrompt: boolean;
  };
}

// ── Internal helpers ────────────────────────────────────────────────────────

const COMPRESSION_THRESHOLD_TOKENS = 250;

/**
 * Known trait → richer phrase mapping. Unknown traits pass through unchanged
 * so custom traits still contribute even if not in the map.
 */
const PERSONALITY_RICH: Record<string, string> = {
  intellectual:  "intellectually curious",
  playful:       "playful",
  confident:     "confident",
  adventurous:   "adventurous",
  artistic:      "artistically inclined",
  mysterious:    "quietly mysterious",
  warm:          "warm and approachable",
  fierce:        "fiercely self-possessed",
  vulnerable:    "openly vulnerable",
  ambitious:     "driven and ambitious",
  witty:         "quick-witted",
  sensual:       "sensuously present",
  rebellious:    "quietly rebellious",
  gentle:        "gently composed",
  bold:          "boldly expressive",
};

/**
 * Renders personality traits as natural English so FLUX reads them as
 * character direction rather than a comma-separated tag list.
 *
 * ["confident", "playful"] → "with a confident, playful presence"
 * []                       → "" (nothing injected)
 */
function renderPersonality(traits: string[]): string {
  const cleaned = traits.map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (cleaned.length === 0) return "";

  const phrased = cleaned.map((t) => PERSONALITY_RICH[t] ?? t);
  if (phrased.length === 1) return `with a ${phrased[0]} presence`;
  const last = phrased[phrased.length - 1];
  const rest = phrased.slice(0, -1).join(", ");
  return `with a ${rest}, ${last} presence`;
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Build a CharacterDNA from the store's Character object. */
export function characterToDNA(c: Character): CharacterDNA {
  const physicalParts = [
    c.age        && `${c.age} years old`,
    c.heritage,
    c.bodyType,
    c.description,
  ].filter(Boolean) as string[];

  return {
    id:             c.id,
    name:           c.name,
    physicalTraits: physicalParts.join(", "),
    personality:    c.personality,
    style:          c.styleKeywords,
    loraPath:       c.loraName,
  };
}

/**
 * Core composition function. Takes a normalized CharacterDNA and options,
 * returns a ComposedPrompt with the full string and debug metadata.
 */
export function composePrompt(
  dna: CharacterDNA,
  opts: ComposeOptions = {},
): ComposedPrompt {
  const userPrompt    = (opts.userPrompt ?? "").trim();
  const disabledStyle = new Set((opts.disabledStyleTags ?? []).map((t) => t.toLowerCase()));
  const disabledPers  = new Set((opts.disabledPersonality ?? []).map((t) => t.toLowerCase()));

  // 1. Subject anchor
  const physical = dna.physicalTraits.trim();

  // 2. Personality → natural language
  const activePersonality = dna.personality.filter(
    (p) => !disabledPers.has(p.toLowerCase()),
  );
  const personality = renderPersonality(activePersonality);

  // 3 + 5. Style partitioned by attention weight.
  // partitionByWeight() silently drops unknown tags — only phrases from
  // STYLE_TOKEN_MAP appear in early/late arrays.
  const activeStyle = dna.style.filter(
    (s) => !disabledStyle.has(s.toLowerCase()),
  );
  const { early, late } = partitionByWeight(activeStyle);
  // styleCount = number of tags that actually produced phrases (known tags only)
  const knownStyleCount = early.length + late.length;

  // Assemble in attention-priority order
  const segments: string[] = [];
  if (physical)     segments.push(physical);
  if (personality)  segments.push(personality);
  if (early.length) segments.push(early.join(", "));
  if (userPrompt)   segments.push(userPrompt);
  if (late.length)  segments.push(late.join(", "));

  const prompt = segments
    .join(", ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .trim();

  const approxTokens = Math.ceil(prompt.length / 4);

  return {
    prompt,
    approxTokens,
    needsCompression: approxTokens > COMPRESSION_THRESHOLD_TOKENS,
    used: {
      physicalTraits:   physical.length > 0,
      personalityCount: activePersonality.length,
      styleCount:       knownStyleCount,
      hasUserPrompt:    userPrompt.length > 0,
    },
  };
}

/**
 * Convenience wrapper: compose from a Character (or null for prompt-only mode).
 * Use this at all call sites — it handles the null-character case cleanly.
 */
export function composeFromCharacter(
  character: Character | null,
  opts: ComposeOptions = {},
): ComposedPrompt {
  if (!character) {
    const userPrompt = (opts.userPrompt ?? "").trim();
    return {
      prompt:          userPrompt,
      approxTokens:    Math.ceil(userPrompt.length / 4),
      needsCompression: false,
      used: {
        physicalTraits:   false,
        personalityCount: 0,
        styleCount:       0,
        hasUserPrompt:    userPrompt.length > 0,
      },
    };
  }
  return composePrompt(characterToDNA(character), opts);
}

/**
 * Debug overlay helper — shows what each segment contributed.
 * Renders the same segments that composePrompt() would build, in order.
 */
export function explainPrompt(
  dna: CharacterDNA,
  opts: ComposeOptions = {},
): Array<{ label: string; content: string }> {
  const userPrompt    = (opts.userPrompt ?? "").trim();
  const disabledStyle = new Set((opts.disabledStyleTags ?? []).map((t) => t.toLowerCase()));
  const disabledPers  = new Set((opts.disabledPersonality ?? []).map((t) => t.toLowerCase()));

  const activePersonality = dna.personality.filter((p) => !disabledPers.has(p.toLowerCase()));
  const activeStyle       = dna.style.filter((s) => !disabledStyle.has(s.toLowerCase()));
  const { early, late }   = partitionByWeight(activeStyle);

  return [
    { label: "1. Subject",                content: dna.physicalTraits },
    { label: "2. Personality",            content: renderPersonality(activePersonality) },
    { label: "3. Early style (lighting)", content: early.join(", ") },
    { label: "4. User prompt",            content: userPrompt },
    { label: "5. Late style (mood)",      content: late.join(", ") },
  ].filter((s) => s.content.length > 0);
}
