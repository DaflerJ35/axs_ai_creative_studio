import type { SceneLibraryItem } from "../types/scene-builder.types";

export const CHARACTER_ITEMS: SceneLibraryItem[] = [
  {
    id: "char-aria",
    type: "character",
    name: "Aria Vale",
    subtitle: "Lead actor DNA - noir elegance",
    dnaPrompt:
      "Aria Vale, consistent facial identity, sleek black bob, almond eyes, poised noir elegance, confident cinematic lead",
    thumbnail: "AV",
    accent: "from-cyan-300 to-indigo-400",
  },
  {
    id: "char-kael",
    type: "character",
    name: "Kael Monroe",
    subtitle: "Action DNA - sharp profile",
    dnaPrompt:
      "Kael Monroe, consistent facial identity, angular jaw, short silver hair, intense gaze, tactical modern wardrobe",
    thumbnail: "KM",
    accent: "from-sky-300 to-violet-500",
  },
  {
    id: "char-selene",
    type: "character",
    name: "Selene Cross",
    subtitle: "Editorial DNA - high fashion",
    dnaPrompt:
      "Selene Cross, consistent facial identity, luminous skin, platinum waves, editorial fashion silhouette, refined expression",
    thumbnail: "SC",
    accent: "from-teal-300 to-fuchsia-400",
  },
];

export const ENVIRONMENT_ITEMS: SceneLibraryItem[] = [
  {
    id: "env-penthouse",
    type: "environment",
    name: "Glass Penthouse",
    subtitle: "Rain-lit city skyline",
    dnaPrompt: "luxury glass penthouse, rainy midnight skyline, reflective floors, cinematic depth",
    thumbnail: "PH",
    accent: "from-cyan-400 to-slate-500",
  },
  {
    id: "env-soundstage",
    type: "environment",
    name: "Black Soundstage",
    subtitle: "Controlled film lighting",
    dnaPrompt: "premium black soundstage, visible haze, controlled studio lighting, professional set",
    thumbnail: "ST",
    accent: "from-indigo-300 to-zinc-500",
  },
];

export const ASSET_ITEMS: SceneLibraryItem[] = [
  {
    id: "asset-keylight",
    type: "asset",
    name: "Cyan Key Light",
    subtitle: "Soft rim glow",
    dnaPrompt: "cyan key light, soft rim glow, subtle lens bloom",
    thumbnail: "KL",
    accent: "from-cyan-300 to-teal-400",
  },
  {
    id: "asset-car",
    type: "asset",
    name: "Neo GT Coupe",
    subtitle: "Luxury hero prop",
    dnaPrompt: "black luxury GT coupe, wet reflective paint, cinematic hero prop",
    thumbnail: "GT",
    accent: "from-slate-300 to-cyan-500",
  },
];
