import { useMemo } from "react";
import { useSceneBuilderStore } from "../features/scene-builder/store/useSceneBuilderStore";
import { useUniverseForgeStore } from "../features/universe-forge/store/useUniverseForgeStore";
import { useActiveCharacter, useAxsStore } from "../store/useAxsStore";
import { buildAxsProofSummary, type AxsProofSummary } from "./proofLayer";

export function useAxsProofSummary(): AxsProofSummary {
  const activeTab = useAxsStore((state) => state.activeTab);
  const brandVoice = useAxsStore((state) => state.brandVoice);
  const contentRating = useAxsStore((state) => state.contentRating);
  const settings = useAxsStore((state) => state.settings);
  const activeCharacter = useActiveCharacter();
  const sceneAdvanced = useSceneBuilderStore((state) => state.advanced);
  const sceneCanvasItems = useSceneBuilderStore((state) => state.canvasItems);
  const sceneReferences = useSceneBuilderStore((state) => state.referenceImages);
  const sceneFrames = useSceneBuilderStore((state) => state.frameSlots);
  const aiDirectorActive = useSceneBuilderStore((state) => state.aiDirectorActive);
  const directorsCutActive = useSceneBuilderStore((state) => state.directorsCutActive);
  const studioMode = useSceneBuilderStore((state) => state.studioMode);
  const bible = useUniverseForgeStore((state) => state.bible);
  const universeCharacters = useUniverseForgeStore((state) => state.characters);
  const relationships = useUniverseForgeStore((state) => state.relationships);
  const timeline = useUniverseForgeStore((state) => state.timeline);
  const storyBeats = useUniverseForgeStore((state) => state.storyBeats);
  const seriesShots = useUniverseForgeStore((state) => state.seriesShots);
  const continuityChecks = useUniverseForgeStore((state) => state.continuityChecks);
  const directorCutStatus = useUniverseForgeStore((state) => state.directorCutStatus);

  return useMemo(
    () =>
      buildAxsProofSummary({
        activeTab,
        activeCharacter,
        brandVoice,
        contentRating,
        settings,
        scene: {
          model: sceneAdvanced.model,
          canvasItemCount: sceneCanvasItems.length,
          referenceImageCount: sceneReferences.length,
          startFrameReady: Boolean(sceneFrames.startFrame),
          endFrameReady: Boolean(sceneFrames.endFrame),
          aiDirectorActive,
          directorsCutActive,
          studioMode,
        },
        universe: {
          title: bible.title,
          characterCount: universeCharacters.length,
          relationshipCount: relationships.length,
          timelineCount: timeline.length,
          storyBeatCount: storyBeats.length,
          seriesShotCount: seriesShots.length,
          continuityChecks,
          directorCutStatus,
        },
      }),
    [
      activeTab,
      activeCharacter,
      brandVoice,
      contentRating,
      settings,
      sceneAdvanced.model,
      sceneCanvasItems.length,
      sceneReferences.length,
      sceneFrames.startFrame,
      sceneFrames.endFrame,
      aiDirectorActive,
      directorsCutActive,
      studioMode,
      bible.title,
      universeCharacters.length,
      relationships.length,
      timeline.length,
      storyBeats.length,
      seriesShots.length,
      continuityChecks,
      directorCutStatus,
    ]
  );
}
