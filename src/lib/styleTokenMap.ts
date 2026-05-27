/**
 * styleTokenMap.ts
 *
 * Maps short style tags (the ones users tap in the DNA panel) to dense,
 * FLUX-tuned photographic direction phrases.
 *
 * Why this matters:
 *   FLUX is a flow-matching model trained on natural language captions, not
 *   Danbooru tags. Feeding it raw tags like "moody, cinematic, golden hour"
 *   gets you average results. Feeding it real photographic direction —
 *   "shot during golden hour, warm directional sunlight, long shadows" —
 *   gets you results that look art-directed.
 *
 * Design rules for entries:
 *   1. Use camera/lighting/composition vocabulary, not aesthetic words.
 *   2. Prefer concrete physical descriptions over emotional ones.
 *   3. Keep each phrase under ~15 words so stacked tags don't blow the prompt budget.
 *   4. Don't repeat tokens across mappings — the prompt compressor folds them later.
 *   5. weightsEarly = true for anything that sets the entire scene (lighting, lens).
 */

export interface StyleToken {
  tag: string;
  phrase: string;
  category:
    | "lighting"
    | "mood"
    | "genre"
    | "composition"
    | "color"
    | "subject_treatment";
  /**
   * Early-weighted tokens appear before the user's prompt in the final string.
   * Flow-matching models (FLUX, SD3) give more attention to earlier tokens.
   * Lighting and lens choice change the meaning of every other token — so they
   * go early.
   */
  weightsEarly?: boolean;
}

export const STYLE_TOKEN_MAP: Record<string, StyleToken> = {
  // ── Lighting ──────────────────────────────────────────────────────────────
  "golden hour": {
    tag: "golden hour",
    phrase: "shot during golden hour, warm directional sunlight, long soft shadows",
    category: "lighting",
    weightsEarly: true,
  },
  "blue hour": {
    tag: "blue hour",
    phrase: "shot at blue hour, deep cyan ambient sky, cool ambient light, practical warm lights in frame",
    category: "lighting",
    weightsEarly: true,
  },
  "harsh sunlight": {
    tag: "harsh sunlight",
    phrase: "midday sun, hard shadows, high contrast, sharp specular highlights",
    category: "lighting",
    weightsEarly: true,
  },
  "soft daylight": {
    tag: "soft daylight",
    phrase: "diffused overcast daylight, even soft shadows, natural skin tones",
    category: "lighting",
    weightsEarly: true,
  },
  "studio strobe": {
    tag: "studio strobe",
    phrase: "studio lighting with softbox key and rim light, controlled falloff, seamless backdrop",
    category: "lighting",
    weightsEarly: true,
  },
  "neon night": {
    tag: "neon night",
    phrase: "nighttime exterior, neon signage casting saturated color on subject, wet pavement reflections",
    category: "lighting",
    weightsEarly: true,
  },
  "candlelight": {
    tag: "candlelight",
    phrase: "warm candlelight, low key, flickering highlights on skin, deep shadow detail",
    category: "lighting",
    weightsEarly: true,
  },
  "window light": {
    tag: "window light",
    phrase: "soft window light from camera left, gentle falloff, intimate domestic interior",
    category: "lighting",
    weightsEarly: true,
  },
  "rim light": {
    tag: "rim light",
    phrase: "dramatic rim lighting, dark background, hair backlit, studio setup",
    category: "lighting",
    weightsEarly: true,
  },
  "dappled light": {
    tag: "dappled light",
    phrase: "dappled light through tree canopy, natural shadow patterns, organic bokeh",
    category: "lighting",
    weightsEarly: true,
  },

  // ── Mood / atmosphere ─────────────────────────────────────────────────────
  "cinematic moody": {
    tag: "cinematic moody",
    phrase: "cinematic lighting, deep shadows, shallow depth of field, color graded contrast",
    category: "mood",
  },
  "dreamy ethereal": {
    tag: "dreamy ethereal",
    phrase: "soft hazy glow, lifted blacks, gentle bloom on highlights, pastel palette",
    category: "mood",
  },
  "gritty realism": {
    tag: "gritty realism",
    phrase: "documentary realism, natural skin texture, no retouching, available light only",
    category: "mood",
  },
  "noir dramatic": {
    tag: "noir dramatic",
    phrase: "low key chiaroscuro lighting, hard side light, deep blacks, single light source",
    category: "mood",
  },
  "romantic": {
    tag: "romantic",
    phrase: "warm intimate atmosphere, soft focus, glowing highlights, tender expression",
    category: "mood",
  },

  // ── Genre / treatment ─────────────────────────────────────────────────────
  "editorial fashion": {
    tag: "editorial fashion",
    // NOTE: phrase intentionally avoids "confident" — that word is used as a
    // personality trait and the two token spaces must not collide in tests.
    phrase: "editorial fashion photography, magazine cover composition, professional styling, commanding pose",
    category: "genre",
  },
  "street photography": {
    tag: "street photography",
    phrase: "candid street photography, 35mm lens, natural environment, unposed moment",
    category: "genre",
  },
  "fine art portrait": {
    tag: "fine art portrait",
    phrase: "fine art portraiture, painterly composition, considered negative space, museum-quality print",
    category: "genre",
  },
  "lookbook": {
    tag: "lookbook",
    phrase: "lookbook photography, full outfit visible, clean background, relaxed natural pose",
    category: "genre",
  },
  "boudoir intimate": {
    tag: "boudoir intimate",
    phrase: "intimate boudoir photography, soft window light, tasteful styling, vulnerable expression",
    category: "genre",
  },
  "ugc authentic": {
    tag: "ugc authentic",
    phrase: "shot on smartphone, authentic UGC aesthetic, natural lighting, slightly imperfect framing",
    category: "genre",
  },

  // ── Composition ───────────────────────────────────────────────────────────
  "tight portrait": {
    tag: "tight portrait",
    phrase: "tight headshot framing, 85mm lens, eyes sharp, background blurred",
    category: "composition",
  },
  "wide environmental": {
    tag: "wide environmental",
    phrase: "environmental portrait, 35mm lens, subject in context, full setting visible",
    category: "composition",
  },
  "shallow depth": {
    tag: "shallow depth",
    phrase: "shallow depth of field, f/1.4, creamy bokeh, subject isolation",
    category: "composition",
  },
  "symmetrical centered": {
    tag: "symmetrical centered",
    phrase: "symmetrical composition, subject centered, formal balance",
    category: "composition",
  },
  "rule of thirds": {
    tag: "rule of thirds",
    phrase: "rule of thirds composition, subject offset, dynamic framing",
    category: "composition",
  },

  // ── Color treatment ───────────────────────────────────────────────────────
  "muted earth tones": {
    tag: "muted earth tones",
    phrase: "muted earth tone palette, desaturated color grade, warm browns and creams",
    category: "color",
  },
  "high saturation": {
    tag: "high saturation",
    phrase: "vibrant saturated color, punchy contrast, bold palette",
    category: "color",
  },
  "monochrome": {
    tag: "monochrome",
    phrase: "black and white photography, full tonal range, classic film stock",
    category: "color",
  },
  "film stock": {
    tag: "film stock",
    phrase: "shot on 35mm film, natural grain, organic color rendition, slight halation",
    category: "color",
  },
  "cool tones": {
    tag: "cool tones",
    phrase: "cool color grade, desaturated highlights, blue-teal shadow tones",
    category: "color",
  },

  // ── Subject treatment ─────────────────────────────────────────────────────
  "natural beauty": {
    tag: "natural beauty",
    phrase: "natural makeup, soft daylight, candid expression, minimal retouching, real skin texture",
    category: "subject_treatment",
  },
  "glamour polish": {
    tag: "glamour polish",
    phrase: "polished glamour styling, professional makeup, refined hair, magazine-grade retouching",
    category: "subject_treatment",
  },
  "candid moment": {
    tag: "candid moment",
    phrase: "candid unposed expression, mid-laugh or mid-thought, authentic emotion",
    category: "subject_treatment",
  },
  "power pose": {
    tag: "power pose",
    phrase: "commanding stance, direct eye contact, deliberate posture",
    category: "subject_treatment",
  },
};

// ── Lookups ────────────────────────────────────────────────────────────────

/** Expand tag strings to their full photographic direction phrases. */
export function expandStyleTags(tags: string[]): string[] {
  return tags
    .map((t) => STYLE_TOKEN_MAP[t.toLowerCase()])
    .filter((s): s is StyleToken => s !== undefined)
    .map((s) => s.phrase);
}

/**
 * Partition tags into early-weighted (lighting, lens) and late-weighted
 * (mood, color, treatment) buckets. Unknown tags are dropped silently — use
 * unknownTags() to surface them in a debug overlay.
 */
export function partitionByWeight(tags: string[]): {
  early: string[];
  late: string[];
} {
  const early: string[] = [];
  const late: string[] = [];
  for (const t of tags) {
    const tok = STYLE_TOKEN_MAP[t.toLowerCase()];
    if (!tok) continue;
    if (tok.weightsEarly) early.push(tok.phrase);
    else late.push(tok.phrase);
  }
  return { early, late };
}

export function tagsByCategory(): Record<StyleToken["category"], StyleToken[]> {
  const out: Record<string, StyleToken[]> = {};
  for (const tok of Object.values(STYLE_TOKEN_MAP)) {
    (out[tok.category] ||= []).push(tok);
  }
  return out as Record<StyleToken["category"], StyleToken[]>;
}

export function isKnownTag(tag: string): boolean {
  return tag.toLowerCase() in STYLE_TOKEN_MAP;
}

export function unknownTags(tags: string[]): string[] {
  return tags.filter((t) => !isKnownTag(t));
}
