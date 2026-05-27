import { beforeEach, describe, expect, it } from "vitest";
import { useAxsStore } from "../../../../store/useAxsStore";
import { buildUniversePrompt } from "../../utils/buildUniversePrompt";
import { useUniverseForgeStore } from "../useUniverseForgeStore";
import { buildVideoInput } from "../../../../lib/workflows";

describe("useUniverseForgeStore", () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    if (typeof globalThis.localStorage === "undefined") {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: {
          clear: () => storage.clear(),
          getItem: (key: string) => storage.get(key) ?? null,
          removeItem: (key: string) => storage.delete(key),
          setItem: (key: string, value: string) => storage.set(key, value),
        },
      });
    }
    globalThis.localStorage?.clear();
    useUniverseForgeStore.setState(useUniverseForgeStore.getInitialState(), true);
    useUniverseForgeStore.setState({
      storyConcept: "Elli's glow-up after a bad breakup",
      generationProgress: 0,
      generationStatus: "Universe memory online",
    });
    useAxsStore.getState().activeTab = "studio";
    useAxsStore.getState().activeCharacterId = null;
    useAxsStore.getState().characters = [];
  });

  it("generates story beats from the current concept", () => {
    useUniverseForgeStore.getState().setStoryConcept("A royal android learns desire and rebellion");
    useUniverseForgeStore.getState().generateStoryArc();

    expect(useUniverseForgeStore.getState().storyBeats).toHaveLength(10);
    expect(useUniverseForgeStore.getState().storyBeats[0].scenePrompt).toContain("royal android");
    expect(useUniverseForgeStore.getState().storyBeats[0].keyScenes.length).toBeGreaterThanOrEqual(3);
    expect(useUniverseForgeStore.getState().generationProgress).toBe(45);
  });

  it("queues a coherent series from generated beats", () => {
    useUniverseForgeStore.getState().generateStoryArc();
    useUniverseForgeStore.getState().generateSeries();

    expect(useUniverseForgeStore.getState().seriesShots.length).toBe(30);
    expect(useUniverseForgeStore.getState().seriesShots[0].status).toBe("ready");
    expect(useUniverseForgeStore.getState().generationStatus).toContain("Scene Builder");
  });

  it("regenerates specific shots and assembles the Director's Cut", () => {
    useUniverseForgeStore.getState().generateStoryArc();
    useUniverseForgeStore.getState().generateSeries();
    const targetShot = useUniverseForgeStore.getState().seriesShots[10];

    useUniverseForgeStore.getState().regenerateShot(targetShot.id);
    const regenerated = useUniverseForgeStore.getState().seriesShots.find((shot) => shot.id === targetShot.id);
    expect(regenerated?.status).toBe("ready");
    expect(regenerated?.continuityLock).toContain("regenerated without changing wardrobe");

    useUniverseForgeStore.getState().assembleDirectorsCut();
    expect(useUniverseForgeStore.getState().directorCutStatus).toBe("complete");
    expect(useUniverseForgeStore.getState().seriesShots.every((shot) => shot.status === "complete")).toBe(true);
  });

  it("edits, reorders, and expands generated episodes", () => {
    useUniverseForgeStore.getState().generateStoryArc();
    const firstEpisode = useUniverseForgeStore.getState().storyBeats[0];
    const secondEpisode = useUniverseForgeStore.getState().storyBeats[1];

    useUniverseForgeStore.getState().updateStoryBeat(firstEpisode.id, {
      title: "Custom Pilot",
      keyScenes: ["Opening frame", "Training reveal"],
    });
    expect(useUniverseForgeStore.getState().storyBeats[0].title).toBe("Custom Pilot");
    expect(useUniverseForgeStore.getState().storyBeats[0].keyScenes).toContain("Training reveal");

    useUniverseForgeStore.getState().moveStoryBeat(secondEpisode.id, "up");
    expect(useUniverseForgeStore.getState().storyBeats[0].id).toBe(secondEpisode.id);
    expect(useUniverseForgeStore.getState().storyBeats[0].episodeNumber).toBe(1);

    useUniverseForgeStore.getState().expandStoryBeat(secondEpisode.id);
    expect(useUniverseForgeStore.getState().storyBeats[0].expandedPrompt).toContain("Director expansion");
  });

  it("drag-reorders episodes by active and target ids", () => {
    useUniverseForgeStore.getState().generateStoryArc();
    const firstEpisode = useUniverseForgeStore.getState().storyBeats[0];
    const thirdEpisode = useUniverseForgeStore.getState().storyBeats[2];

    useUniverseForgeStore.getState().reorderStoryBeat(thirdEpisode.id, firstEpisode.id);

    expect(useUniverseForgeStore.getState().storyBeats[0].id).toBe(thirdEpisode.id);
    expect(useUniverseForgeStore.getState().storyBeats[0].episodeNumber).toBe(1);
    expect(useUniverseForgeStore.getState().generationStatus).toContain("Season board reordered");
  });

  it("generates, polishes, and deletes individual episodes", () => {
    useUniverseForgeStore.getState().generateStoryArc();
    const target = useUniverseForgeStore.getState().storyBeats[4];

    useUniverseForgeStore.getState().generateEpisode(target.id);
    expect(useUniverseForgeStore.getState().storyBeats[4].status).toBe("generated");
    expect(useUniverseForgeStore.getState().storyBeats[4].continuityScore).toBeGreaterThanOrEqual(88);

    useUniverseForgeStore.getState().polishEpisode(target.id);
    expect(useUniverseForgeStore.getState().storyBeats[4].status).toBe("polished");
    expect(useUniverseForgeStore.getState().storyBeats[4].expandedPrompt).toContain("Polish pass");

    useUniverseForgeStore.getState().deleteStoryBeat(target.id);
    expect(useUniverseForgeStore.getState().storyBeats).toHaveLength(9);
    expect(useUniverseForgeStore.getState().storyBeats[4].episodeNumber).toBe(5);
  });

  it("updates continuity check severity", () => {
    useUniverseForgeStore.getState().updateContinuityCheck("lighting", "break");

    const lighting = useUniverseForgeStore
      .getState()
      .continuityChecks.find((check) => check.id === "lighting");

    expect(lighting?.status).toBe("break");
  });

  it("adds and edits relationships while selecting character graph nodes", () => {
    useUniverseForgeStore.getState().selectCharacter("mara");
    useUniverseForgeStore.getState().addRelationship();
    const added = useUniverseForgeStore.getState().relationships.at(-1);

    expect(useUniverseForgeStore.getState().selectedCharacterId).toBe("mara");
    expect(added?.label).toBe("New connection");

    useUniverseForgeStore.getState().updateRelationship(added?.id ?? "", {
      label: "Found family alliance",
      type: "family",
      tension: 18,
    });

    const updated = useUniverseForgeStore.getState().relationships.find((relationship) => relationship.id === added?.id);
    expect(updated?.label).toBe("Found family alliance");
    expect(updated?.type).toBe("family");
    expect(updated?.tension).toBe(18);
  });

  it("runs continuity audits from tracked clothing, appearance, emotion, and events", () => {
    useUniverseForgeStore.getState().runContinuityAudit();

    expect(useUniverseForgeStore.getState().continuityChecks).toHaveLength(4);
    expect(useUniverseForgeStore.getState().continuityChecks.map((check) => check.id)).toEqual([
      "wardrobe",
      "appearance",
      "emotion",
      "timeline",
    ]);
    expect(useUniverseForgeStore.getState().generationStatus).toContain("Continuity Engine");
  });

  it("edits Universe Bible rules and adds new continuity rules", () => {
    useUniverseForgeStore.getState().updateBible({
      tone: "Prestige showrunner thriller",
      timePeriod: "2099 neon winter",
    });
    useUniverseForgeStore.getState().updateWorldRule(0, "Never change locked DNA without approval.");
    useUniverseForgeStore.getState().addWorldRule();

    const bible = useUniverseForgeStore.getState().bible;
    expect(bible.tone).toBe("Prestige showrunner thriller");
    expect(bible.timePeriod).toBe("2099 neon winter");
    expect(bible.worldRules[0]).toBe("Never change locked DNA without approval.");
    expect(bible.worldRules.at(-1)).toBe("New continuity rule");
  });

  it("saves and loads a Universe Bible snapshot from the vault", () => {
    useUniverseForgeStore.getState().updateBible({
      title: "The Chrome Saint",
      persistentLore: "Mara carries the hidden origin event.",
    });
    useUniverseForgeStore.getState().saveUniverse();

    const saved = useUniverseForgeStore.getState().savedUniverses[0];
    expect(saved.name).toBe("The Chrome Saint");
    expect(globalThis.localStorage?.getItem("axs-universe-vault")).toContain("The Chrome Saint");

    useUniverseForgeStore.getState().updateBible({
      title: "Temporary Draft",
      persistentLore: "This should be replaced.",
    });
    useUniverseForgeStore.getState().loadUniverse(saved.id);

    expect(useUniverseForgeStore.getState().bible.title).toBe("The Chrome Saint");
    expect(useUniverseForgeStore.getState().bible.persistentLore).toBe("Mara carries the hidden origin event.");
    expect(useUniverseForgeStore.getState().generationStatus).toContain("loaded from Universe Vault");
  });

  it("builds Scene Builder handoff prompts with existing Character DNA", () => {
    useAxsStore.getState().characters = [
      {
        id: "dna-elli",
        name: "Elli Voss",
        age: "28",
        heritage: "Synthetic cinematic character",
        bodyType: "Athletic editorial",
        description: "Locked DNA profile with copper hair and luminous skin.",
        personality: ["guarded", "magnetic"],
        styleKeywords: ["cinematic", "fitness", "premium"],
        stylePreset: "cinematic",
        seed: 4242,
        loraName: "elli-voss.safetensors",
        loraWeight: 0.92,
        createdAt: 1,
      },
    ];
    useUniverseForgeStore.getState().selectCharacter("elli");

    const prompt = buildUniversePrompt();

    expect(prompt).toContain("Existing Character DNA profile");
    expect(prompt).toContain("elli-voss.safetensors");
    expect(prompt).toContain("Continuity warnings to resolve");
  });

  it("pairs video workflow payloads with LTX 2.3", () => {
    const input = buildVideoInput({
      prompt: "A cinematic recovery arc",
      settings: useAxsStore.getState().settings,
    });

    expect(input.model).toBe("ltx-video-2.3");
    expect(input.workflow).toBe("ltx-2.3-character-consistent-directors-cut");
  });
});
