/**
 * AXS AI Creative Studios — global store
 * Persisted via IndexedDB so large base64 galleries don't trip the 5MB cap.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import type {
  AxsContentRating,
  AxsWorkflowMode,
  BrandVoiceProfile,
  Character,
  ForgeResult,
  ForgeSettings,
  ForgeTab,
  Subscription,
  VoiceOverResult,
} from "../lib/types";

const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const v = await get(name);
      return v === undefined || v === null ? null : JSON.stringify(v);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await idbSet(name, JSON.parse(value));
    } catch {
      // Persist failures should not take down the creative workspace.
    }
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface AxsStudioStore {
  // tabs
  activeTab: ForgeTab;
  setActiveTab: (tab: ForgeTab) => void;

  // AXS operating context
  workflowMode: AxsWorkflowMode;
  setWorkflowMode: (mode: AxsWorkflowMode) => void;
  contentRating: AxsContentRating;
  setContentRating: (rating: AxsContentRating) => void;
  readingMode: boolean;
  toggleReadingMode: () => void;

  // characters
  characters: Character[];
  addCharacter: (c: Character) => void;
  updateCharacter: (id: string, patch: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  activeCharacterId: string | null;
  setActiveCharacter: (id: string | null) => void;

  // gallery
  gallery: ForgeResult[];
  addToGallery: (r: ForgeResult) => void;
  removeFromGallery: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearGallery: () => void;

  // voice overs
  voiceOvers: VoiceOverResult[];
  addVoiceOver: (voiceOver: VoiceOverResult) => void;
  removeVoiceOver: (id: string) => void;

  // settings
  settings: ForgeSettings;
  updateSettings: (patch: Partial<ForgeSettings>) => void;

  // Creator Hub
  brandVoice: BrandVoiceProfile;
  updateBrandVoice: (patch: Partial<BrandVoiceProfile>) => void;

  // drafts
  draftPrompt: string;
  setDraftPrompt: (p: string) => void;
  draftNegative: string;
  setDraftNegative: (p: string) => void;

  // billing
  subscription: Subscription;
  setSubscription: (patch: Partial<Subscription>) => void;
}

const DEFAULT_SETTINGS: ForgeSettings = {
  useLocalGpu: true,
  comfyuiUrl: "http://127.0.0.1:8188",
  comfyuiModel: "",
  comfyuiLoraBase: "",
  runpodApiKey: "",
  runpodEndpointId: "",
  runpodVideoEndpointId: "",
  elevenLabsApiKey: "",
  openaiApiKey: "",
  googleTtsApiKey: "",
  localVoiceUrl: "http://127.0.0.1:8020/tts",
  voiceEngine: "local",
  stylePreset: "portrait",
  steps: 24,
  guidance: 3.5,
  width: 1024,
  height: 1024,
  batchSize: 1,
  scheduler: "euler",
  enhancePrompt: true,
  upscaleFactor: 1.0,
  characterLoraWeight: 0.85,
  defaultNegative:
    "blurry, distorted, low quality, bad anatomy, deformed hands, extra fingers, extra limbs, watermark, text, signature, jpeg artifacts",
  videoDuration: 5,
  videoFluidity: 0.65,
  videoFormat: "mp4",
  videoResolution: "1080x1920",
  videoModel: "ltx-video-2.3",
  videoWorkflow: "ltx-2.3-character-consistent-directors-cut",
  fluxClipL: "",
  fluxT5xxl: "",
  fluxVae: "",
};

const DEFAULT_BRAND_VOICE: BrandVoiceProfile = {
  name: "AXS Signature Voice",
  trained: false,
  confidence: 0.34,
  tone: "cinematic, confident, emotionally direct",
  cadence: "short hooks, premium phrasing, strong creator energy",
  audience: "creators building cinematic AI content brands",
  signaturePhrases: ["high-end creator energy", "cinematic production", "built to convert"],
  forbiddenPhrases: ["generic AI content", "just another post"],
  sampleCount: 0,
};

function setLocalStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private browsing, blocked storage, or quota failures should not crash the app.
  }
}

export const useAxsStore = create<AxsStudioStore>()(
  persist(
    (set) => ({
      activeTab: "landing",
      setActiveTab: (activeTab) => set({ activeTab }),
      workflowMode: "worldbuilding",
      setWorkflowMode: (workflowMode) => set({ workflowMode }),
      contentRating: "PG-13",
      setContentRating: (contentRating) => set({ contentRating }),
      readingMode: false,
      toggleReadingMode: () => set((s) => ({ readingMode: !s.readingMode })),

      characters: [],
      addCharacter: (c) => set((s) => ({ characters: [c, ...s.characters] })),
      updateCharacter: (id, patch) =>
        set((s) => ({
          characters: s.characters.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),
      deleteCharacter: (id) =>
        set((s) => ({
          characters: s.characters.filter((c) => c.id !== id),
          activeCharacterId:
            s.activeCharacterId === id ? null : s.activeCharacterId,
        })),
      activeCharacterId: null,
      setActiveCharacter: (activeCharacterId) => set({ activeCharacterId }),

      gallery: [],
      addToGallery: (r) => set((s) => ({ gallery: [r, ...s.gallery] })),
      removeFromGallery: (id) =>
        set((s) => ({ gallery: s.gallery.filter((g) => g.id !== id) })),
      toggleFavorite: (id) =>
        set((s) => ({
          gallery: s.gallery.map((g) =>
            g.id === id ? { ...g, favorite: !g.favorite } : g
          ),
        })),
      clearGallery: () => set({ gallery: [] }),

      voiceOvers: [],
      addVoiceOver: (voiceOver) => set((s) => ({ voiceOvers: [voiceOver, ...s.voiceOvers] })),
      removeVoiceOver: (id) =>
        set((s) => ({ voiceOvers: s.voiceOvers.filter((voiceOver) => voiceOver.id !== id) })),

      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) =>
        set((s) => {
          // Mirror all client-readable settings to localStorage
          if (patch.useLocalGpu !== undefined)
            setLocalStorageItem("axs.useLocal", String(patch.useLocalGpu));
          if (patch.comfyuiUrl !== undefined)
            setLocalStorageItem("axs.comfyuiUrl", patch.comfyuiUrl);
          if (patch.comfyuiModel !== undefined)
            setLocalStorageItem("axs.comfyuiModel", patch.comfyuiModel);
          if (patch.comfyuiLoraBase !== undefined)
            setLocalStorageItem("axs.comfyuiLoraBase", patch.comfyuiLoraBase);
          if (patch.fluxClipL !== undefined)
            setLocalStorageItem("axs.fluxClipL", patch.fluxClipL);
          if (patch.fluxT5xxl !== undefined)
            setLocalStorageItem("axs.fluxT5xxl", patch.fluxT5xxl);
          if (patch.fluxVae !== undefined)
            setLocalStorageItem("axs.fluxVae", patch.fluxVae);
          if (patch.runpodApiKey !== undefined)
            setLocalStorageItem("axs.apiKey", patch.runpodApiKey);
          if (patch.runpodEndpointId !== undefined)
            setLocalStorageItem("axs.endpointId", patch.runpodEndpointId);
          if (patch.runpodVideoEndpointId !== undefined)
            setLocalStorageItem("axs.videoEndpointId", patch.runpodVideoEndpointId);
          if (patch.elevenLabsApiKey !== undefined)
            setLocalStorageItem("axs.elevenLabsApiKey", patch.elevenLabsApiKey);
          if (patch.openaiApiKey !== undefined)
            setLocalStorageItem("axs.openaiApiKey", patch.openaiApiKey);
          if (patch.googleTtsApiKey !== undefined)
            setLocalStorageItem("axs.googleTtsApiKey", patch.googleTtsApiKey);
          if (patch.localVoiceUrl !== undefined)
            setLocalStorageItem("axs.localVoiceUrl", patch.localVoiceUrl);
          if (patch.voiceEngine !== undefined)
            setLocalStorageItem("axs.voiceEngine", patch.voiceEngine);
          if (patch.videoModel !== undefined)
            setLocalStorageItem("axs.videoModel", patch.videoModel);
          if (patch.videoWorkflow !== undefined)
            setLocalStorageItem("axs.videoWorkflow", patch.videoWorkflow);
          return { settings: { ...s.settings, ...patch } };
        }),

      brandVoice: DEFAULT_BRAND_VOICE,
      updateBrandVoice: (patch) =>
        set((s) => ({
          brandVoice: {
            ...s.brandVoice,
            ...patch,
          },
        })),

      draftPrompt: "",
      setDraftPrompt: (draftPrompt) => set({ draftPrompt }),
      draftNegative: "",
      setDraftNegative: (draftNegative) => set({ draftNegative }),

      subscription: {
        status: "inactive",
        planId: null,
        customerId: null,
        subscriptionId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
      setSubscription: (patch) =>
        set((s) => ({
          subscription: { ...s.subscription, ...patch },
        })),
    }),
    {
      name: "axs-vault-v1",
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.activeTab) {
          const legacyTabs: Record<string, ForgeTab> = {
            marketing: "campaign",
            gallery: "vault",
            settings: "config",
          };
          state.activeTab = legacyTabs[state.activeTab] ?? state.activeTab;
        }
        if (state?.settings) {
          state.settings = { ...DEFAULT_SETTINGS, ...state.settings };
          const s = state.settings;
          setLocalStorageItem("axs.useLocal", String(s.useLocalGpu ?? true));
          setLocalStorageItem("axs.comfyuiUrl", s.comfyuiUrl || "http://127.0.0.1:8188");
          setLocalStorageItem("axs.comfyuiModel", s.comfyuiModel || "");
          setLocalStorageItem("axs.comfyuiLoraBase", s.comfyuiLoraBase || "");
          setLocalStorageItem("axs.fluxClipL", s.fluxClipL || "");
          setLocalStorageItem("axs.fluxT5xxl", s.fluxT5xxl || "");
          setLocalStorageItem("axs.fluxVae", s.fluxVae || "");
          setLocalStorageItem("axs.apiKey", s.runpodApiKey);
          setLocalStorageItem("axs.endpointId", s.runpodEndpointId);
          setLocalStorageItem("axs.videoEndpointId", s.runpodVideoEndpointId);
          setLocalStorageItem("axs.elevenLabsApiKey", s.elevenLabsApiKey || "");
          setLocalStorageItem("axs.openaiApiKey", s.openaiApiKey || "");
          setLocalStorageItem("axs.googleTtsApiKey", s.googleTtsApiKey || "");
          setLocalStorageItem("axs.localVoiceUrl", s.localVoiceUrl || "http://127.0.0.1:8020/tts");
          setLocalStorageItem("axs.voiceEngine", s.voiceEngine || "local");
          setLocalStorageItem("axs.videoModel", s.videoModel || "ltx-video-2.3");
          setLocalStorageItem("axs.videoWorkflow", s.videoWorkflow || "ltx-2.3-character-consistent-directors-cut");
        }
        if (state?.brandVoice) {
          state.brandVoice = { ...DEFAULT_BRAND_VOICE, ...state.brandVoice };
        }
        if (state?.characters && state.activeCharacterId && !state.characters.some((character) => character.id === state.activeCharacterId)) {
          state.activeCharacterId = null;
        }
      },
    }
  )
);

/** Helper: get the currently-selected character (or null). */
export function useActiveCharacter(): Character | null {
  return useAxsStore((s) =>
    s.characters.find((c) => c.id === s.activeCharacterId) ?? null
  );
}
