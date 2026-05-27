import { useAxsStore } from "../../../store/useAxsStore";
import { useUniverseForgeStore } from "../store/useUniverseForgeStore";

export function buildUniversePrompt() {
  const state = useUniverseForgeStore.getState();
  const dnaCharacters = useAxsStore.getState().characters;
  const firstEpisode = state.storyBeats[0];
  const selectedCharacter = state.characters.find((character) => character.id === state.selectedCharacterId) ?? state.characters[0];
  const dnaMatch = selectedCharacter
    ? dnaCharacters.find((dna) => dna.name.toLowerCase() === selectedCharacter.name.toLowerCase())
    : undefined;
  const continuityWarnings = state.continuityChecks
    .filter((check) => check.status !== "ok")
    .map((check) => `${check.label}: ${check.detail}`)
    .join(" ");

  return [
    `${state.bible.title}: ${state.bible.logline}`,
    firstEpisode
      ? `Episode ${firstEpisode.episodeNumber}, ${firstEpisode.title}: ${firstEpisode.scenePrompt}`
      : "No episode selected yet. Build the opening scene from the Universe Bible, preserving character memory and visual style.",
    selectedCharacter
      ? `Character DNA lock: ${selectedCharacter.name}, ${selectedCharacter.appearance}, ${selectedCharacter.personality}, ${selectedCharacter.wardrobe}, current emotion ${selectedCharacter.emotionalState}.`
      : "",
    dnaMatch
      ? `Existing Character DNA profile: ${dnaMatch.description}. Style keywords: ${dnaMatch.styleKeywords.join(", ")}. Personality tags: ${dnaMatch.personality.join(", ")}. Seed: ${dnaMatch.seed}. LoRA: ${dnaMatch.loraName ?? "none"} at ${dnaMatch.loraWeight ?? 0.85}.`
      : "No matching saved Character DNA profile found yet; use Universe Forge memory as the temporary DNA source.",
    `Universe style bible: ${state.bible.tone}. ${state.bible.visualStyle}.`,
    `Continuity rules: ${state.bible.worldRules.join(" ")}`,
    continuityWarnings ? `Continuity warnings to resolve: ${continuityWarnings}` : "Continuity Engine: no active break warnings.",
  ].filter(Boolean).join("\n\n");
}
