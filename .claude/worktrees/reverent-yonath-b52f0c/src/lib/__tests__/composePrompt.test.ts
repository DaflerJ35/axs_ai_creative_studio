import { describe, it, expect } from "vitest";
import {
  composePrompt,
  composeFromCharacter,
  characterToDNA,
  type CharacterDNA,
} from "../composePrompt";
import type { Character } from "../types";

// ── Fixtures ────────────────────────────────────────────────────────────────

const FULL_DNA: CharacterDNA = {
  id: "test-1",
  name: "Zara",
  physicalTraits: "25 years old, Mixed heritage, athletic build, auburn hair, green eyes",
  personality: ["confident", "playful", "intellectual"],
  style: ["golden hour", "editorial fashion", "shallow depth"],
};

const EMPTY_DNA: CharacterDNA = {
  id: "test-empty",
  name: "Unnamed",
  physicalTraits: "",
  personality: [],
  style: [],
};

const BASE_CHARACTER: Character = {
  id: "char-1",
  name: "Zara",
  age: "25",
  heritage: "Mixed heritage",
  bodyType: "athletic build",
  description: "auburn hair, green eyes",
  personality: ["confident", "playful"],
  styleKeywords: ["golden hour", "editorial fashion"],
  stylePreset: "editorial",
  seed: 42,
  createdAt: 0,
};

// ── composePrompt ─────────────────────────────────────────────────────────

describe("composePrompt", () => {
  it("empty personality produces no presence clause", () => {
    const result = composePrompt({ ...FULL_DNA, personality: [] });
    expect(result.prompt).not.toContain("presence");
    expect(result.used.personalityCount).toBe(0);
  });

  it("empty style injects no style phrases", () => {
    const result = composePrompt({ ...FULL_DNA, style: [] });
    expect(result.prompt).not.toContain("golden hour");
    expect(result.prompt).not.toContain("editorial");
    expect(result.used.styleCount).toBe(0);
  });

  it("all-empty DNA + empty prompt returns empty string", () => {
    const result = composePrompt(EMPTY_DNA);
    expect(result.prompt).toBe("");
    expect(result.used.physicalTraits).toBe(false);
    expect(result.used.personalityCount).toBe(0);
    expect(result.used.styleCount).toBe(0);
    expect(result.used.hasUserPrompt).toBe(false);
  });

  it("full DNA assembles in correct attention-priority order", () => {
    const result = composePrompt(FULL_DNA, { userPrompt: "walking through Tokyo" });
    const p = result.prompt;
    const physIdx = p.indexOf("25 years old");
    const persIdx = p.indexOf("with a confident");
    const userIdx = p.indexOf("walking through Tokyo");
    expect(physIdx).toBeGreaterThanOrEqual(0);
    expect(persIdx).toBeGreaterThanOrEqual(0);
    expect(userIdx).toBeGreaterThanOrEqual(0);
    expect(physIdx).toBeLessThan(persIdx);
    expect(persIdx).toBeLessThan(userIdx);
  });

  it("early-weight lighting tokens appear before user prompt", () => {
    const result = composePrompt(FULL_DNA, { userPrompt: "walking through Tokyo" });
    const p = result.prompt;
    // "golden hour" expands to a phrase that includes "golden hour"
    const lightingIdx = p.indexOf("golden hour");
    const userIdx = p.indexOf("walking through Tokyo");
    expect(lightingIdx).toBeGreaterThanOrEqual(0);
    expect(lightingIdx).toBeLessThan(userIdx);
  });

  it("user-prompt-only (empty DNA) returns just user text", () => {
    const result = composePrompt(EMPTY_DNA, { userPrompt: "a cat on a wall" });
    expect(result.prompt).toBe("a cat on a wall");
    expect(result.used.hasUserPrompt).toBe(true);
  });

  it("disabledStyleTags excludes tags without mutating DNA", () => {
    const styleBefore = [...FULL_DNA.style];
    const result = composePrompt(FULL_DNA, {
      userPrompt: "portrait",
      disabledStyleTags: ["golden hour"],
    });
    expect(result.prompt).not.toContain("golden hour");
    expect(FULL_DNA.style).toEqual(styleBefore); // not mutated
    expect(result.used.styleCount).toBe(FULL_DNA.style.length - 1);
  });

  it("disabledPersonality excludes traits without mutating DNA", () => {
    const persBefore = [...FULL_DNA.personality];
    const result = composePrompt(FULL_DNA, { disabledPersonality: ["confident"] });
    // "confident" as a personality trait renders as part of the presence clause.
    // The phrase should not contain the personality-rendered word.
    expect(result.prompt).not.toContain("with a confident");
    expect(FULL_DNA.personality).toEqual(persBefore); // not mutated
    expect(result.used.personalityCount).toBe(FULL_DNA.personality.length - 1);
  });

  it("disabledStyleTags is case-insensitive", () => {
    const result = composePrompt(FULL_DNA, { disabledStyleTags: ["GOLDEN HOUR"] });
    expect(result.prompt).not.toContain("golden hour");
  });

  it("approxTokens positive for non-empty output", () => {
    const result = composePrompt(FULL_DNA, { userPrompt: "test" });
    expect(result.approxTokens).toBeGreaterThan(0);
  });

  it("needsCompression false for short prompts", () => {
    const result = composePrompt(EMPTY_DNA, { userPrompt: "short" });
    expect(result.needsCompression).toBe(false);
  });

  it("single personality trait renders correctly", () => {
    const result = composePrompt({ ...EMPTY_DNA, personality: ["confident"] });
    expect(result.prompt).toBe("with a confident presence");
  });

  it("multiple personality traits form a natural list", () => {
    const result = composePrompt({ ...EMPTY_DNA, personality: ["confident", "playful"] });
    expect(result.prompt).toContain("with a confident, playful presence");
  });

  it("unknown style tags are silently skipped", () => {
    const result = composePrompt({ ...EMPTY_DNA, style: ["some-unknown-tag-xyz"] });
    expect(result.prompt).toBe("");
    // styleCount only counts tags that matched the map and produced phrases
    expect(result.used.styleCount).toBe(0);
  });

  it("output has no double-commas or leading/trailing whitespace", () => {
    const result = composePrompt(FULL_DNA, { userPrompt: "portrait" });
    expect(result.prompt).not.toMatch(/,,/);
    expect(result.prompt.trim()).toBe(result.prompt);
  });
});

// ── composeFromCharacter ───────────────────────────────────────────────────

describe("composeFromCharacter", () => {
  it("null character returns user prompt only", () => {
    expect(composeFromCharacter(null, { userPrompt: "hello" }).prompt).toBe("hello");
  });

  it("null character with no prompt returns empty string", () => {
    const result = composeFromCharacter(null);
    expect(result.prompt).toBe("");
    expect(result.used.hasUserPrompt).toBe(false);
  });

  it("includes character physical traits", () => {
    const result = composeFromCharacter(BASE_CHARACTER, { userPrompt: "dancing" });
    expect(result.prompt).toContain("25 years old");
    expect(result.prompt).toContain("Mixed heritage");
  });

  it("includes personality in natural language", () => {
    const result = composeFromCharacter(BASE_CHARACTER);
    expect(result.prompt).toContain("presence");
  });
});

// ── characterToDNA ─────────────────────────────────────────────────────────

describe("characterToDNA", () => {
  it("maps all fields correctly", () => {
    const dna = characterToDNA(BASE_CHARACTER);
    expect(dna.id).toBe("char-1");
    expect(dna.physicalTraits).toContain("25 years old");
    expect(dna.physicalTraits).toContain("Mixed heritage");
    expect(dna.physicalTraits).toContain("athletic build");
    expect(dna.physicalTraits).toContain("auburn hair");
    expect(dna.personality).toEqual(["confident", "playful"]);
    expect(dna.style).toEqual(["golden hour", "editorial fashion"]);
  });

  it("handles sparse character with empty optional fields", () => {
    const sparse: Character = {
      id: "sparse", name: "Ghost", age: "", heritage: "", bodyType: "",
      description: "", personality: [], styleKeywords: [], stylePreset: "raw",
      seed: 0, createdAt: 0,
    };
    const dna = characterToDNA(sparse);
    expect(dna.physicalTraits).toBe("");
    expect(dna.personality).toEqual([]);
  });

  it("loraPath maps from loraName", () => {
    const dna = characterToDNA({ ...BASE_CHARACTER, loraName: "zara_v2.safetensors" });
    expect(dna.loraPath).toBe("zara_v2.safetensors");
  });
});
