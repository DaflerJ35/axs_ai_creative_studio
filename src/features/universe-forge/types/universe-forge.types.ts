export type ContinuitySeverity = "ok" | "watch" | "break";

export interface UniverseCharacterMemory {
  id: string;
  name: string;
  role: string;
  appearance: string;
  personality: string;
  backstory: string;
  emotionalState: string;
  wardrobe: string;
  arcStatus: string;
}

export interface UniverseRelationship {
  id: string;
  fromCharacterId: string;
  toCharacterId: string;
  label: string;
  type: "romantic" | "friends" | "rivals" | "family" | "creative" | "unknown";
  tension: number;
}

export interface ContinuityState {
  id: string;
  characterId: string;
  episodeNumber: number;
  clothing: string;
  appearance: string;
  emotionalState: string;
  majorEvent: string;
}

export interface UniverseTimelineEvent {
  id: string;
  title: string;
  episode: string;
  consequence: string;
  timestamp?: string;
}

export interface StoryBeat {
  id: string;
  episodeNumber: number;
  title: string;
  status: "not-started" | "in-progress" | "generated" | "polished";
  continuityScore: number;
  lastFrameThumbnail: string;
  emotionalShift: string;
  conflict: string;
  keyScenes: string[];
  requiredCharacterIds: string[];
  continuityNotes: string;
  scenePrompt: string;
  expandedPrompt?: string;
}

export interface ContinuityCheck {
  id: string;
  label: string;
  status: ContinuitySeverity;
  detail: string;
}

export interface SeriesShot {
  id: string;
  episodeId: string;
  episodeNumber: number;
  title: string;
  camera: string;
  continuityLock: string;
  transition: string;
  status: "queued" | "ready" | "rendering" | "complete" | "regenerating";
  model: "ltx-video-2.3";
  workflow: "ltx-2.3-character-consistent-directors-cut";
  resolution: string;
  fps: number;
  faceLockStrength: number;
  ipAdapterStrength: number;
  continuityPasses: string[];
  estimatedSeconds: number;
}

export interface UniverseBibleState {
  title: string;
  logline: string;
  tone: string;
  visualStyle: string;
  timePeriod: string;
  restrictions: string;
  persistentLore: string;
  worldRules: string[];
}

export interface UniverseSnapshot {
  id: string;
  name: string;
  savedAt: number;
  bible: UniverseBibleState;
  characters: UniverseCharacterMemory[];
  relationships: UniverseRelationship[];
  timeline: UniverseTimelineEvent[];
}
