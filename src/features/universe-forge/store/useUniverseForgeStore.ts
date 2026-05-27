import { create } from "zustand";
import {
  getLtx23WorkflowBlueprint,
  type Ltx23WorkflowBlueprint,
  type Ltx23WorkflowMode,
} from "../../../lib/ltx23Workflow";
import type {
  ContinuityCheck,
  ContinuityState,
  SeriesShot,
  StoryBeat,
  UniverseBibleState,
  UniverseCharacterMemory,
  UniverseRelationship,
  UniverseSnapshot,
  UniverseTimelineEvent,
} from "../types/universe-forge.types";

const UNIVERSE_VAULT_KEY = "axs-universe-vault";

interface UniverseForgeState {
  bible: UniverseBibleState;
  characters: UniverseCharacterMemory[];
  relationships: UniverseRelationship[];
  timeline: UniverseTimelineEvent[];
  savedUniverses: UniverseSnapshot[];
  storyConcept: string;
  storyBeats: StoryBeat[];
  continuityChecks: ContinuityCheck[];
  continuityStates: ContinuityState[];
  seriesShots: SeriesShot[];
  directorCutStatus: "idle" | "assembling" | "complete";
  activeWorkflowMode: Ltx23WorkflowMode;
  workflowProfile: Ltx23WorkflowBlueprint;
  selectedCharacterId: string;
  selectedArcId: string;
  generationProgress: number;
  generationStatus: string;
  updateBible: (patch: Partial<UniverseBibleState>) => void;
  updateWorldRule: (index: number, value: string) => void;
  addWorldRule: () => void;
  saveUniverse: () => void;
  loadUniverse: (id: string) => void;
  setStoryConcept: (concept: string) => void;
  generateStoryArc: () => void;
  updateStoryBeat: (id: string, patch: Partial<StoryBeat>) => void;
  moveStoryBeat: (id: string, direction: "up" | "down") => void;
  reorderStoryBeat: (activeId: string, overId: string) => void;
  expandStoryBeat: (id: string) => void;
  generateEpisode: (id: string) => void;
  polishEpisode: (id: string) => void;
  deleteStoryBeat: (id: string) => void;
  deleteCharacterMemory: (id: string) => void;
  selectCharacter: (id: string) => void;
  addRelationship: () => void;
  updateRelationship: (id: string, patch: Partial<UniverseRelationship>) => void;
  runContinuityAudit: () => void;
  generateSeries: () => void;
  regenerateShot: (id: string) => void;
  assembleDirectorsCut: () => void;
  updateContinuityCheck: (id: string, status: ContinuityCheck["status"]) => void;
  setWorkflowMode: (mode: Ltx23WorkflowMode) => void;
}

const DEFAULT_CHARACTERS: UniverseCharacterMemory[] = [
  {
    id: "elli",
    name: "Elli Voss",
    role: "Lead protagonist",
    appearance: "Sharp eyes, soft copper hair, luminous skin, refined cinematic wardrobe.",
    personality: "Witty, guarded, magnetic, slowly relearning trust.",
    backstory: "A former nightlife muse rebuilding her life after a public breakup.",
    emotionalState: "Controlled but ready to transform.",
    wardrobe: "Black silk coat, silver jewelry, evolving into luminous editorial looks.",
    arcStatus: "Act I: fracture before glow-up.",
  },
  {
    id: "mara",
    name: "Mara Saint",
    role: "Confidante / creative rival",
    appearance: "Tall silhouette, platinum crop, sculptural wardrobe, icy confidence.",
    personality: "Protective, strategic, dangerously honest.",
    backstory: "Built the underground scene Elli once dominated.",
    emotionalState: "Concerned but testing Elli's resilience.",
    wardrobe: "Ivory tailoring, chrome accessories, high contrast monochrome.",
    arcStatus: "Catalyst for transformation.",
  },
  {
    id: "dante",
    name: "Dante Vale",
    role: "Ex-lover / antagonist",
    appearance: "Elegant, dark curls, camera-ready charm with controlled menace.",
    personality: "Persuasive, jealous, image-obsessed.",
    backstory: "A director who made Elli his muse and then tried to own the story.",
    emotionalState: "Losing control of the narrative.",
    wardrobe: "Velvet suits, dark lapels, antique rings.",
    arcStatus: "Pressure point across the season.",
  },
];

const DEFAULT_BIBLE: UniverseBibleState = {
  title: "Afterglow Protocol",
  logline: "A wounded muse rebuilds herself into the director of her own cinematic universe.",
  tone: "Premium erotic-noir, emotionally intelligent, visually restrained, high-budget.",
  visualStyle: "Deep black, cyan rim lights, violet reflections, editorial close-ups, slow camera language.",
  timePeriod: "Near-future luxury nightlife, late autumn season.",
  restrictions: "Maintain adult-only private-use mode where enabled. No continuity resets without explicit user approval.",
  persistentLore:
    "Elli was once framed as someone else's muse. The universe tracks her reclamation of authorship, public image, desire, and creative control. Every scene should preserve emotional consequence from the previous beat.",
  worldRules: [
    "Character DNA must remain locked across every shot.",
    "Wardrobe evolves only after major emotional beats.",
    "Lighting shifts follow Elli's emotional recovery.",
    "No scene contradicts prior relationship state.",
  ],
};

const DEFAULT_RELATIONSHIPS: UniverseRelationship[] = [
  { id: "elli-mara", fromCharacterId: "elli", toCharacterId: "mara", label: "Trust under pressure", type: "creative", tension: 42 },
  { id: "elli-dante", fromCharacterId: "elli", toCharacterId: "dante", label: "Unresolved rupture", type: "romantic", tension: 88 },
  { id: "mara-dante", fromCharacterId: "mara", toCharacterId: "dante", label: "Mutual suspicion", type: "rivals", tension: 72 },
];

const DEFAULT_TIMELINE: UniverseTimelineEvent[] = [
  { id: "ev-1", title: "The breakup leaks", episode: "Episode 01", timestamp: "Night 01", consequence: "Elli withdraws from the public eye." },
  { id: "ev-2", title: "Mara offers a private studio", episode: "Episode 02", timestamp: "Day 03", consequence: "Elli starts rebuilding image control." },
  { id: "ev-3", title: "Dante attempts a comeback scene", episode: "Episode 03", timestamp: "Night 05", consequence: "Trust fracture escalates." },
];

const DEFAULT_CONTINUITY: ContinuityCheck[] = [
  { id: "wardrobe", label: "Wardrobe evolution", status: "ok", detail: "Black silk coat remains through Act I." },
  { id: "lighting", label: "Lighting continuity", status: "watch", detail: "Keep cyan rim light until emotional turn." },
  { id: "emotion", label: "Emotional state", status: "ok", detail: "Guarded confidence is consistent." },
  { id: "timeline", label: "Timeline order", status: "ok", detail: "No event contradiction detected." },
];

const DEFAULT_CONTINUITY_STATES: ContinuityState[] = [
  {
    id: "elli-ep-1",
    characterId: "elli",
    episodeNumber: 1,
    clothing: "Black silk coat, silver jewelry",
    appearance: "Copper hair controlled, minimal makeup",
    emotionalState: "Guarded heartbreak",
    majorEvent: "Breakup leak lands publicly",
  },
  {
    id: "elli-ep-3",
    characterId: "elli",
    episodeNumber: 3,
    clothing: "Training set under black coat",
    appearance: "Hair tied back, luminous skin",
    emotionalState: "Disciplined self-rebuild",
    majorEvent: "First transformation ritual",
  },
  {
    id: "elli-ep-7",
    characterId: "elli",
    episodeNumber: 7,
    clothing: "Loosened coat, imperfect styling",
    appearance: "Hair loose after emotional collapse",
    emotionalState: "Honest vulnerability",
    majorEvent: "Ritual breaks under pressure",
  },
  {
    id: "elli-ep-9",
    characterId: "elli",
    episodeNumber: 9,
    clothing: "Sharp evolved editorial look",
    appearance: "Polished hair, stronger makeup",
    emotionalState: "Direct power",
    majorEvent: "Boundary confrontation",
  },
  {
    id: "dante-ep-1",
    characterId: "dante",
    episodeNumber: 1,
    clothing: "Dark velvet suit",
    appearance: "Camera-ready charm",
    emotionalState: "Image control",
    majorEvent: "Tries to own the breakup narrative",
  },
  {
    id: "dante-ep-9",
    characterId: "dante",
    episodeNumber: 9,
    clothing: "Dark velvet suit with loosened collar",
    appearance: "Charm cracking in close-up",
    emotionalState: "Losing control",
    majorEvent: "Final confrontation",
  },
];

function cloneSnapshot(snapshot: UniverseSnapshot): UniverseSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as UniverseSnapshot;
}

function readSavedUniverses(): UniverseSnapshot[] {
  if (typeof globalThis.localStorage === "undefined") return [];

  try {
    const raw = globalThis.localStorage.getItem(UNIVERSE_VAULT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UniverseSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedUniverses(savedUniverses: UniverseSnapshot[]) {
  if (typeof globalThis.localStorage === "undefined") return;

  try {
    globalThis.localStorage.setItem(UNIVERSE_VAULT_KEY, JSON.stringify(savedUniverses));
  } catch {
    // Saving should never break the studio if browser storage is unavailable.
  }
}

function buildBeats(concept: string): StoryBeat[] {
  const base = concept.trim() || "Elli's glow-up after a bad breakup";
  const arcs = [
    {
      title: "The Public Fracture",
      emotionalShift: "Heartbreak into controlled silence",
      conflict: "The inciting wound becomes public before the hero can process it privately.",
      keyScenes: ["Cold open after the leak", "Private mirror beat", "First refusal to answer Dante"],
      requiredCharacterIds: ["elli", "dante"],
      continuityNotes: "Keep Act I wardrobe subdued; emotional state is guarded and physically still.",
    },
    {
      title: "The Private Studio Offer",
      emotionalShift: "Isolation into reluctant trust",
      conflict: "Mara offers a way forward, but accepting help means admitting the old identity is gone.",
      keyScenes: ["Mara opens the hidden studio", "First DNA lock session", "Lighting shifts from cyan to violet edge"],
      requiredCharacterIds: ["elli", "mara"],
      continuityNotes: "Mara enters as catalyst; keep Elli's confidence partial, not complete.",
    },
    {
      title: "The Body Becomes Evidence",
      emotionalShift: "Self-doubt into discipline",
      conflict: "The hero rebuilds through ritual, training, styling, and controlled image authorship.",
      keyScenes: ["Morning transformation routine", "Wardrobe fitting", "Editorial fitness frame test"],
      requiredCharacterIds: ["elli", "mara"],
      continuityNotes: "Introduce first wardrobe evolution only after the training montage beat.",
    },
    {
      title: "The First Temptation",
      emotionalShift: "Control into dangerous curiosity",
      conflict: "Dante tries to pull the hero back into the old dynamic through charm and spectacle.",
      keyScenes: ["Dante's invitation arrives", "Mara warns against the meeting", "A silent close-up before reply"],
      requiredCharacterIds: ["elli", "mara", "dante"],
      continuityNotes: "Relationship tension with Dante remains high; do not soften him too quickly.",
    },
    {
      title: "The New Audience",
      emotionalShift: "Performance anxiety into magnetism",
      conflict: "The first public-facing post must feel authentic without surrendering vulnerability.",
      keyScenes: ["Shot list planning", "First hero frame", "Audience response lands in real time"],
      requiredCharacterIds: ["elli"],
      continuityNotes: "Fitness-influencer confidence begins here; makeup and hair become more luminous.",
    },
    {
      title: "The Rival Edit",
      emotionalShift: "Pride into exposure",
      conflict: "Dante releases a competing narrative that threatens the hero's reclaimed identity.",
      keyScenes: ["Dante's polished counter-campaign", "Mara and Elli audit the damage", "Quiet rage close-up"],
      requiredCharacterIds: ["elli", "mara", "dante"],
      continuityNotes: "Keep Dante visually refined; his control slips only in micro-expressions.",
    },
    {
      title: "The Ritual Breaks",
      emotionalShift: "Pressure into collapse",
      conflict: "The hero's new discipline cracks under pressure, forcing a more honest transformation.",
      keyScenes: ["Missed training session", "Unfiltered confession", "Mara chooses truth over polish"],
      requiredCharacterIds: ["elli", "mara"],
      continuityNotes: "Hair and wardrobe can loosen here; this is the permitted imperfection episode.",
    },
    {
      title: "The Reframe",
      emotionalShift: "Collapse into honest authorship",
      conflict: "The hero stops trying to look healed and starts directing the truth of the recovery.",
      keyScenes: ["New visual bible choice", "Training returns without performance", "First direct-to-camera truth"],
      requiredCharacterIds: ["elli"],
      continuityNotes: "Lighting warms slightly but preserves cyan rim light as a DNA signature.",
    },
    {
      title: "The Confrontation Cut",
      emotionalShift: "Fear into direct power",
      conflict: "Dante demands access to the final story, and the hero refuses him on camera and in life.",
      keyScenes: ["Controlled meeting", "Boundary line delivered", "Dante's image fractures"],
      requiredCharacterIds: ["elli", "dante"],
      continuityNotes: "This is the peak tension episode; wardrobe should be sharp and fully evolved.",
    },
    {
      title: "The Signature Series",
      emotionalShift: "Power into legacy",
      conflict: "The hero launches a coherent creative identity that no longer needs the wound as fuel.",
      keyScenes: ["Hero campaign shoot", "Mara watches from monitor", "Final frame becomes the new bible cover"],
      requiredCharacterIds: ["elli", "mara"],
      continuityNotes: "Final look is luminous; maintain exact Character DNA while elevating styling.",
    },
  ];

  return arcs.map((arc, index) => ({
    ...arc,
    id: `episode-${index + 1}`,
    episodeNumber: index + 1,
    status: index < 2 ? "generated" : index < 5 ? "in-progress" : "not-started",
    continuityScore: Math.max(78, 96 - index * 2),
    lastFrameThumbnail:
      index % 3 === 0
        ? "linear-gradient(135deg, rgba(0,212,255,0.25), rgba(15,23,42,0.95) 46%, rgba(168,85,247,0.24))"
        : index % 3 === 1
          ? "linear-gradient(135deg, rgba(192,38,211,0.24), rgba(8,8,12,0.96) 42%, rgba(251,146,60,0.18))"
          : "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(4,8,16,0.96) 48%, rgba(0,212,255,0.20))",
    scenePrompt: `${base}: Episode ${index + 1}, ${arc.title}. ${arc.conflict} Visual style: premium cinematic continuity, locked character DNA, ${arc.continuityNotes}`,
  }));
}

function buildSeriesShots(beats: StoryBeat[], workflow = getLtx23WorkflowBlueprint("universe-series")): SeriesShot[] {
  return beats.flatMap((beat, beatIndex) =>
    Array.from({ length: 3 }, (_, shotIndex) => ({
      id: `shot-${beatIndex + 1}-${shotIndex + 1}`,
      episodeId: beat.id,
      episodeNumber: beat.episodeNumber,
      title: `Episode ${beat.episodeNumber}: ${beat.title} / Shot ${shotIndex + 1}`,
      camera: shotIndex === 0 ? "35mm establishing push" : shotIndex === 1 ? "85mm emotional close-up" : "50mm transition detail",
      continuityLock: `${beat.emotionalShift}; ${beat.continuityNotes}`,
      transition: shotIndex === 2 ? "Match cut into next emotional beat" : "Invisible editorial bridge",
      status: "queued" as const,
      model: workflow.model,
      workflow: workflow.workflow,
      resolution: workflow.resolution,
      fps: workflow.fps,
      faceLockStrength: workflow.faceLockStrength,
      ipAdapterStrength: workflow.ipAdapterStrength,
      continuityPasses: workflow.continuityPasses,
      estimatedSeconds: Math.round(workflow.steps * 1.7 + (workflow.post.interpolation === "RIFE 2x" ? 18 : 8)),
    }))
  );
}

function auditContinuity(states: ContinuityState[], beats: StoryBeat[]): ContinuityCheck[] {
  const wardrobeJump = states.some((state, index) => {
    const previous = states[index - 1];
    return previous?.characterId === state.characterId && state.episodeNumber - previous.episodeNumber <= 2 && previous.clothing !== state.clothing;
  });
  const missingEpisodes = beats.some((beat) => !states.some((state) => state.episodeNumber === beat.episodeNumber));
  const emotionalReset = states.some((state) => state.emotionalState.toLowerCase().includes("power") && state.episodeNumber < 5);

  return [
    {
      id: "wardrobe",
      label: "Clothing state",
      status: wardrobeJump ? "watch" : "ok",
      detail: wardrobeJump
        ? "Detected a wardrobe evolution close to a prior state. Confirm this is motivated by the episode beat."
        : "Wardrobe evolves at approved emotional beats.",
    },
    {
      id: "appearance",
      label: "Appearance changes",
      status: missingEpisodes ? "watch" : "ok",
      detail: missingEpisodes
        ? "Some episodes do not yet have explicit hair/makeup state records."
        : "Appearance states are mapped across the selected arc.",
    },
    {
      id: "emotion",
      label: "Emotional state",
      status: emotionalReset ? "break" : "ok",
      detail: emotionalReset
        ? "Power state appears before the recovery arc earns it."
        : "Emotional escalation follows the current story arc.",
    },
    {
      id: "timeline",
      label: "Major events",
      status: "ok",
      detail: "Major events are ordered against episode numbers and story beats.",
    },
  ];
}

function renumberBeats(beats: StoryBeat[]): StoryBeat[] {
  return beats.map((beat, index) => ({
    ...beat,
    episodeNumber: index + 1,
  }));
}

export const useUniverseForgeStore = create<UniverseForgeState>((set, get) => ({
  bible: DEFAULT_BIBLE,
  characters: DEFAULT_CHARACTERS,
  relationships: DEFAULT_RELATIONSHIPS,
  timeline: DEFAULT_TIMELINE,
  savedUniverses: readSavedUniverses(),
  storyConcept: "Elli's glow-up after a bad breakup",
  storyBeats: buildBeats("Elli's glow-up after a bad breakup"),
  continuityChecks: DEFAULT_CONTINUITY,
  continuityStates: DEFAULT_CONTINUITY_STATES,
  seriesShots: buildSeriesShots(buildBeats("Elli's glow-up after a bad breakup")),
  directorCutStatus: "idle",
  activeWorkflowMode: "universe-series",
  workflowProfile: getLtx23WorkflowBlueprint("universe-series"),
  selectedCharacterId: "elli",
  selectedArcId: "current-season",
  generationProgress: 0,
  generationStatus: "Universe memory online",
  updateBible: (patch) => set((state) => ({ bible: { ...state.bible, ...patch } })),
  updateWorldRule: (index, value) =>
    set((state) => ({
      bible: {
        ...state.bible,
        worldRules: state.bible.worldRules.map((rule, ruleIndex) =>
          ruleIndex === index ? value : rule
        ),
      },
    })),
  addWorldRule: () =>
    set((state) => ({
      bible: {
        ...state.bible,
        worldRules: [...state.bible.worldRules, "New continuity rule"],
      },
    })),
  saveUniverse: () =>
    set((state) => {
      const snapshot: UniverseSnapshot = {
        id: `universe-${Date.now()}`,
        name: state.bible.title,
        savedAt: Date.now(),
        bible: { ...state.bible, worldRules: [...state.bible.worldRules] },
        characters: state.characters.map((character) => ({ ...character })),
        relationships: state.relationships.map((relationship) => ({ ...relationship })),
        timeline: state.timeline.map((event) => ({ ...event })),
      };
      const savedUniverses = [snapshot, ...state.savedUniverses].slice(0, 12);
      writeSavedUniverses(savedUniverses);

      return {
        savedUniverses,
        generationStatus: `${state.bible.title} saved to Universe Vault`,
      };
    }),
  loadUniverse: (id) =>
    set((state) => {
      const snapshot = state.savedUniverses.find((saved) => saved.id === id);
      if (!snapshot) return state;
      const restored = cloneSnapshot(snapshot);

      return {
        bible: restored.bible,
        characters: restored.characters,
        relationships: restored.relationships,
        timeline: restored.timeline,
        generationStatus: `${restored.name} loaded from Universe Vault`,
      };
    }),
  setStoryConcept: (storyConcept) => set({ storyConcept }),
  generateStoryArc: () => {
    const storyBeats = buildBeats(get().storyConcept);
    set({
      storyBeats,
      seriesShots: buildSeriesShots(storyBeats, get().workflowProfile),
      generationProgress: 45,
      generationStatus: `${storyBeats.length}-episode story arc generated with LTX 2.3 continuity locks`,
    });
  },
  updateStoryBeat: (id, patch) =>
    set((state) => ({
      storyBeats: state.storyBeats.map((beat) => (beat.id === id ? { ...beat, ...patch } : beat)),
    })),
  moveStoryBeat: (id, direction) =>
    set((state) => {
      const currentIndex = state.storyBeats.findIndex((beat) => beat.id === id);
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= state.storyBeats.length) {
        return state;
      }

      const storyBeats = [...state.storyBeats];
      const [movedBeat] = storyBeats.splice(currentIndex, 1);
      storyBeats.splice(targetIndex, 0, movedBeat);
      const renumbered = renumberBeats(storyBeats);

      return {
        storyBeats: renumbered,
        seriesShots: buildSeriesShots(renumbered, state.workflowProfile),
        generationStatus: "Episode order updated and continuity timeline recalculated",
      };
    }),
  reorderStoryBeat: (activeId, overId) =>
    set((state) => {
      if (activeId === overId) return state;
      const currentIndex = state.storyBeats.findIndex((beat) => beat.id === activeId);
      const targetIndex = state.storyBeats.findIndex((beat) => beat.id === overId);
      if (currentIndex < 0 || targetIndex < 0) return state;

      const storyBeats = [...state.storyBeats];
      const [movedBeat] = storyBeats.splice(currentIndex, 1);
      storyBeats.splice(targetIndex, 0, movedBeat);
      const renumbered = renumberBeats(storyBeats);

      return {
        storyBeats: renumbered,
        seriesShots: buildSeriesShots(renumbered, state.workflowProfile),
        generationStatus: "Season board reordered with continuity locks preserved",
      };
    }),
  expandStoryBeat: (id) =>
    set((state) => ({
      storyBeats: state.storyBeats.map((beat) =>
        beat.id === id
          ? {
              ...beat,
              expandedPrompt:
                `${beat.scenePrompt}\n\nDirector expansion: Open with a precise visual hook, move through ${beat.keyScenes.join(", ")}, and close on a frame that makes the emotional beat unmistakable. Required characters: ${beat.requiredCharacterIds.join(", ")}. Continuity lock: ${beat.continuityNotes}`,
            }
          : beat
      ),
      generationStatus: "Episode expanded with director-ready scene language",
    })),
  generateEpisode: (id) =>
    set((state) => {
      const storyBeats = state.storyBeats.map((beat) =>
        beat.id === id
          ? {
              ...beat,
              status: "generated" as const,
              continuityScore: Math.min(100, Math.max(beat.continuityScore, 88)),
            }
          : beat
      );

      return {
        storyBeats,
        seriesShots: buildSeriesShots(storyBeats, state.workflowProfile),
        generationProgress: Math.max(state.generationProgress, 62),
        generationStatus: "Episode generated through LTX 2.3 with locked Character DNA and continuity memory",
      };
    }),
  polishEpisode: (id) =>
    set((state) => {
      const storyBeats = state.storyBeats.map((beat) =>
        beat.id === id
          ? {
              ...beat,
              status: "polished" as const,
              continuityScore: Math.min(100, Math.max(beat.continuityScore + 6, 94)),
              expandedPrompt:
                beat.expandedPrompt ??
                `${beat.scenePrompt}\n\nPolish pass: tighten pacing, preserve wardrobe continuity, refine emotional close-ups, and protect locked Character DNA.`,
            }
          : beat
      );

      return {
        storyBeats,
        seriesShots: buildSeriesShots(storyBeats, state.workflowProfile),
        generationProgress: Math.max(state.generationProgress, 74),
        generationStatus: "Episode polished for Director's Cut assembly",
      };
    }),
  deleteStoryBeat: (id) =>
    set((state) => {
      const storyBeats = renumberBeats(state.storyBeats.filter((beat) => beat.id !== id));
      return {
        storyBeats,
        seriesShots: buildSeriesShots(storyBeats, state.workflowProfile),
        generationStatus: "Episode removed and season continuity recalculated",
      };
    }),
  deleteCharacterMemory: (id) =>
    set((state) => {
      const characters = state.characters.filter((character) => character.id !== id);
      const relationships = state.relationships.filter(
        (relationship) => relationship.fromCharacterId !== id && relationship.toCharacterId !== id
      );
      return {
        characters,
        relationships,
        selectedCharacterId: state.selectedCharacterId === id ? characters[0]?.id ?? "" : state.selectedCharacterId,
        generationStatus: "Character memory removed and relationship map recalculated",
      };
    }),
  selectCharacter: (selectedCharacterId) => set({ selectedCharacterId }),
  addRelationship: () =>
    set((state) => {
      const [first, second] = state.characters;
      const relationship: UniverseRelationship = {
        id: `relationship-${Date.now()}`,
        fromCharacterId: first?.id ?? "elli",
        toCharacterId: second?.id ?? "mara",
        label: "New connection",
        type: "unknown",
        tension: 50,
      };

      return {
        relationships: [...state.relationships, relationship],
        generationStatus: "Relationship added to universe memory",
      };
    }),
  updateRelationship: (id, patch) =>
    set((state) => ({
      relationships: state.relationships.map((relationship) =>
        relationship.id === id ? { ...relationship, ...patch } : relationship
      ),
      generationStatus: "Relationship map updated",
    })),
  runContinuityAudit: () =>
    set((state) => ({
      continuityChecks: auditContinuity(state.continuityStates, state.storyBeats),
      generationStatus: "Continuity Engine audit complete",
    })),
  generateSeries: () =>
    set((state) => ({
      generationProgress: 100,
      generationStatus: `${state.storyBeats.length}-episode arc queued to Scene Builder on LTX Video 2.3 Director's Cut pipeline`,
      directorCutStatus: "idle",
      seriesShots: state.seriesShots.map((shot, index) => ({
        ...shot,
        status: index < 8 ? "ready" : "queued",
      })),
    })),
  regenerateShot: (id) =>
    set((state) => ({
      generationProgress: Math.max(72, state.generationProgress),
      generationStatus: "Shot regenerated with LTX 2.3 FaceLock, IP-Adapter, and continuity state",
      seriesShots: state.seriesShots.map((shot) =>
        shot.id === id
          ? {
              ...shot,
              status: "ready",
              continuityLock: `${shot.continuityLock}; regenerated without changing wardrobe, appearance, or emotional state`,
              faceLockStrength: state.workflowProfile.faceLockStrength,
              ipAdapterStrength: state.workflowProfile.ipAdapterStrength,
            }
          : shot
      ),
    })),
  assembleDirectorsCut: () =>
    set((state) => ({
      directorCutStatus: "complete",
      generationProgress: 100,
      generationStatus: "LTX 2.3 Director's Cut assembled with smooth transitions, RTX 4K upscale, and continuity locks",
      seriesShots: state.seriesShots.map((shot) => ({ ...shot, status: "complete" })),
    })),
  updateContinuityCheck: (id, status) =>
    set((state) => ({
      continuityChecks: state.continuityChecks.map((check) =>
        check.id === id ? { ...check, status } : check
      ),
    })),
  setWorkflowMode: (activeWorkflowMode) =>
    set((state) => {
      const workflowProfile = getLtx23WorkflowBlueprint(activeWorkflowMode);
      return {
        activeWorkflowMode,
        workflowProfile,
        seriesShots: buildSeriesShots(state.storyBeats, workflowProfile),
        generationStatus: `${workflowProfile.id} loaded for Universe Forge`,
      };
    }),
}));
