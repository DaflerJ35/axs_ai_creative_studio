/**
 * Momentum AI Creator — global store
 * Persisted via IndexedDB so large base64 galleries don't trip the 5MB cap.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import type {
  Character,
  ForgeResult,
  ForgeSettings,
  ForgeTab,
} from "../lib/types";

const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const v = await get(name);
    return v ? JSON.stringify(v) : null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await idbSet(name, JSON.parse(value));
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface MomentumStore {
  // tabs
  activeTab: ForgeTab;
  setActiveTab: (tab: ForgeTab) => void;

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

  // settings
  settings: ForgeSettings;
  updateSettings: (patch: Partial<ForgeSettings>) => void;

  // drafts
  draftPrompt: string;
  setDraftPrompt: (p: string) => void;
  draftNegative: string;
  setDraftNegative: (p: string) => void;
}

const DEFAULT_SETTINGS: ForgeSettings = {
  useLocalGpu: true,
  comfyuiUrl: "http://127.0.0.1:8188",
  comfyuiModel: "",
  comfyuiLoraBase: "",
  runpodApiKey: "",
  runpodEndpointId: "",
  runpodVideoEndpointId: "",
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
};

export const useNyxStore = create<MomentumStore>()(
  persist(
    (set) => ({
      activeTab: "studio",
      setActiveTab: (activeTab) => set({ activeTab }),

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

      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) =>
        set((s) => {
          // Mirror all client-readable settings to localStorage
          if (patch.useLocalGpu !== undefined)
            localStorage.setItem("momentum.useLocal", String(patch.useLocalGpu));
          if (patch.comfyuiUrl !== undefined)
            localStorage.setItem("momentum.comfyuiUrl", patch.comfyuiUrl);
          if (patch.comfyuiModel !== undefined)
            localStorage.setItem("momentum.comfyuiModel", patch.comfyuiModel);
          if (patch.comfyuiLoraBase !== undefined)
            localStorage.setItem("momentum.comfyuiLoraBase", patch.comfyuiLoraBase);
          if (patch.runpodApiKey !== undefined)
            localStorage.setItem("momentum.apiKey", patch.runpodApiKey);
          if (patch.runpodEndpointId !== undefined)
            localStorage.setItem("momentum.endpointId", patch.runpodEndpointId);
          if (patch.runpodVideoEndpointId !== undefined)
            localStorage.setItem("momentum.videoEndpointId", patch.runpodVideoEndpointId);
          return { settings: { ...s.settings, ...patch } };
        }),

      draftPrompt: "",
      setDraftPrompt: (draftPrompt) => set({ draftPrompt }),
      draftNegative: "",
      setDraftNegative: (draftNegative) => set({ draftNegative }),
    }),
    {
      name: "momentum-vault-v1",
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.settings) {
          const s = state.settings;
          localStorage.setItem("momentum.useLocal", String(s.useLocalGpu ?? true));
          localStorage.setItem("momentum.comfyuiUrl", s.comfyuiUrl || "http://127.0.0.1:8188");
          localStorage.setItem("momentum.comfyuiModel", s.comfyuiModel || "");
          localStorage.setItem("momentum.comfyuiLoraBase", s.comfyuiLoraBase || "");
          localStorage.setItem("momentum.apiKey", s.runpodApiKey);
          localStorage.setItem("momentum.endpointId", s.runpodEndpointId);
          localStorage.setItem("momentum.videoEndpointId", s.runpodVideoEndpointId);
        }
      },
    }
  )
);

/** Helper: get the currently-selected character (or null). */
export function useActiveCharacter(): Character | null {
  return useNyxStore((s) =>
    s.characters.find((c) => c.id === s.activeCharacterId) ?? null
  );
}
