import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  BadgeCheck,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Dna,
  Eye,
  Image as ImageIcon,
  Layers3,
  Lock,
  Plus,
  RefreshCw,
  ScanFace,
  Search,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Trash2,
  Upload,
  User,
  WandSparkles,
  Zap,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";
import { getSliderNumber, getSliderTuple } from "../../lib/sliderValue";
import { copyToClipboard } from "../../lib/safeClipboard";
import { forgeImage } from "../../lib/workflows";
import { useAxsProofSummary } from "../../lib/useAxsProofSummary";
import { useAxsStore } from "../../store/useAxsStore";
import { LegalGateModal } from "../../features/scene-builder/components/LegalGateModal";
import { useSceneBuilderStore } from "../../features/scene-builder/store/useSceneBuilderStore";
import type { Character, StylePreset } from "../../lib/types";
import { ProofBadge } from "../platform/ProofBadge";

const HERITAGE_OPTIONS = [
  "Russian",
  "Caucasian",
  "Scandinavian",
  "Mediterranean",
  "Latin American",
  "East Asian",
  "South Asian",
  "Middle Eastern",
  "African",
  "Brazilian",
  "Afro-Caribbean",
  "Pacific Islander",
  "Northern European",
  "Slavic",
  "Western European",
  "Eastern European",
  "Central Asian",
  "Southeast Asian",
  "Indigenous American",
  "Mixed Heritage",
  "Custom Heritage",
];

const BODY_TYPES = [
  "Slim & athletic",
  "Curvy hourglass",
  "Tall & lean",
  "Toned & muscular",
  "Petite",
  "Plus size elegant",
  "Editorial runway",
  "Soft natural",
];

const PERSONALITY_TAGS = [
  "confident",
  "mysterious",
  "playful",
  "intellectual",
  "sultry",
  "cheerful",
  "reserved",
  "adventurous",
  "elegant",
  "rebellious",
  "warm",
  "cold",
  "artistic",
  "athletic",
  "commanding",
];

const STYLE_KEYWORDS = [
  "editorial fashion",
  "street style",
  "cinematic moody",
  "natural beauty",
  "high glamour",
  "minimalist chic",
  "vintage film",
  "sci-fi futurist",
  "noir",
  "golden hour",
  "neon urban",
  "soft pastel",
  "luxury studio lighting",
  "Hollywood portrait",
];

const PRESETS: { id: StylePreset; label: string; accent: string }[] = [
  { id: "portrait", label: "Portrait", accent: "from-cyan-300 to-blue-400" },
  { id: "editorial", label: "Editorial", accent: "from-pink-300 to-rose-400" },
  { id: "cinematic", label: "Cinematic", accent: "from-amber-300 to-red-400" },
  { id: "concept_art", label: "Concept", accent: "from-violet-300 to-purple-400" },
  { id: "anime", label: "Anime", accent: "from-fuchsia-300 to-pink-400" },
];

const SECTIONS = [
  { id: "identity", label: "Identity", Icon: User },
  { id: "style", label: "Style & Personality", Icon: WandSparkles },
  { id: "seed", label: "DNA & Seed", Icon: Dna },
] as const;

type StudioSection = (typeof SECTIONS)[number]["id"];
type ReferenceSlot = "face" | "body" | "style";
type ReferenceState = Record<ReferenceSlot, string | null>;

const EMPTY_REFERENCES: ReferenceState = { face: null, body: null, style: null };
const DEFAULT_FACE_LOCK = 0.82;

const BLANK: Omit<Character, "id" | "createdAt"> = {
  name: "",
  age: "25",
  heritage: "Mixed Heritage",
  bodyType: "Slim & athletic",
  description: "",
  personality: [],
  styleKeywords: [],
  stylePreset: "portrait",
  seed: Math.floor(Math.random() * 2 ** 32),
};

function randomSeed() {
  return Math.floor(Math.random() * 2 ** 32);
}

function normalizeFaceLockValue(value: unknown): number {
  return getSliderNumber(value, DEFAULT_FACE_LOCK, 0, 1);
}

function faceLockArray(value: unknown): [number] {
  return getSliderTuple(value, DEFAULT_FACE_LOCK, 0, 1);
}

function seedToHex(seed: number): string {
  return `#${(seed & 0xffffff).toString(16).padStart(6, "0")}`;
}

function seedToDnaColors(seed: number): string[] {
  return [
    `hsl(${seed % 360}, 74%, 58%)`,
    `hsl(${(seed >> 8) % 360}, 72%, 54%)`,
    `hsl(${(seed >> 16) % 360}, 78%, 62%)`,
    `hsl(${(seed >> 4) % 360}, 66%, 48%)`,
    `hsl(${(seed >> 12) % 360}, 84%, 66%)`,
  ];
}

function characterPrompt(character: Omit<Character, "id" | "createdAt"> | Character) {
  return [
    character.name,
    character.age && `${character.age} years old`,
    character.heritage,
    character.bodyType,
    character.description,
    character.personality.length ? `personality: ${character.personality.join(", ")}` : "",
    character.styleKeywords.length ? `visual style: ${character.styleKeywords.join(", ")}` : "",
    `locked seed ${character.seed}`,
  ]
    .filter(Boolean)
    .join(", ");
}

function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[44px] border border-white/[0.16] bg-white/[0.062] shadow-[inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-1px_0_rgba(255,255,255,0.045),0_46px_150px_rgba(0,0,0,0.52),0_0_120px_rgba(168,85,247,0.08)] backdrop-blur-3xl before:pointer-events-none before:absolute before:inset-x-14 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/75 before:to-transparent after:pointer-events-none after:absolute after:inset-y-8 after:left-0 after:w-px after:bg-gradient-to-b after:from-transparent after:via-cyan-100/20 after:to-transparent",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-32 top-8 size-[30rem] rounded-full bg-cyan-300/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -left-36 bottom-4 size-[32rem] rounded-full bg-fuchsia-400/[0.07] blur-3xl" />
      <div className="relative">{children}</div>
    </section>
  );
}

function readReference(file: File, onReady: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => onReady(String(reader.result));
  reader.onerror = () => toast.error("Reference upload failed");
  reader.readAsDataURL(file);
}

export const CharacterStudio = () => {
  const {
    characters,
    addCharacter,
    deleteCharacter,
    activeCharacterId,
    setActiveCharacter,
    updateCharacter,
    settings,
    setActiveTab,
    contentRating,
    setContentRating,
  } = useAxsStore();
  const studioMode = useSceneBuilderStore((state) => state.studioMode);
  const setStudioMode = useSceneBuilderStore((state) => state.setStudioMode);
  const nsfwGateAccepted = useSceneBuilderStore((state) => state.nsfwGateAccepted);
  const confirmNsfwGate = useSceneBuilderStore((state) => state.confirmNsfwGate);
  const proof = useAxsProofSummary();

  const [form, setForm] = useState({ ...BLANK, seed: randomSeed() });
  const [draftIsDirty, setDraftIsDirty] = useState(false);
  const [activeSection, setActiveSection] = useState<StudioSection>("identity");
  const [generating, setGenerating] = useState(false);
  const [faceLockStrength, setFaceLockStrength] = useState([DEFAULT_FACE_LOCK]);
  const [bodyReferenceLock, setBodyReferenceLock] = useState(true);
  const [references, setReferences] = useState<ReferenceState>(EMPTY_REFERENCES);
  const [previewImageReady, setPreviewImageReady] = useState(false);
  const [previewResetKey, setPreviewResetKey] = useState("new-character");
  const [nsfwGateOpen, setNsfwGateOpen] = useState(false);

  const activeCharacter = characters.find((character) => character.id === activeCharacterId) ?? null;
  const previewCharacter = draftIsDirty || !activeCharacter ? form : activeCharacter;
  const dnaColors = useMemo(() => seedToDnaColors(previewCharacter.seed), [previewCharacter.seed]);
  const seedHex = useMemo(() => seedToHex(previewCharacter.seed), [previewCharacter.seed]);
  const prompt = useMemo(() => characterPrompt(previewCharacter), [previewCharacter]);
  const referenceCount = Object.values(references).filter(Boolean).length;
  const faceLockValue = normalizeFaceLockValue(faceLockStrength);
  const lockLabel = faceLockValue >= 0.86 ? "Exact identity lock" : faceLockValue >= 0.55 ? "Balanced character lock" : "Creative reference blend";
  const lockGlow = `${Math.round(faceLockValue * 100)}%`;
  const identityDetail = proof.categories.identity.signals[0]?.detail;
  const continuityDetail = proof.categories.continuity.signals[0]?.detail;
  const nsfwEnabled = studioMode === "nsfw" || contentRating === "X" || contentRating === "XXX";

  const enableNsfwCharacterMode = () => {
    if (nsfwEnabled) {
      setStudioMode("sfw");
      setContentRating("PG-13");
      toast.success("SFW Character DNA mode enabled");
      return;
    }
    if (!nsfwGateAccepted) {
      setNsfwGateOpen(true);
      return;
    }
    setStudioMode("nsfw");
    setContentRating("X");
    toast.success("NSFW Character DNA mode enabled", {
      description: "Adult-only private character generation is now available.",
    });
  };

  useEffect(() => {
    if (!activeCharacter) {
      setPreviewResetKey("new-character");
      setPreviewImageReady(false);
      return;
    }

    setForm({
      name: activeCharacter.name,
      age: activeCharacter.age,
      heritage: activeCharacter.heritage,
      bodyType: activeCharacter.bodyType,
      description: activeCharacter.description,
      personality: [...activeCharacter.personality],
      styleKeywords: [...activeCharacter.styleKeywords],
      stylePreset: activeCharacter.stylePreset,
      seed: activeCharacter.seed,
      portraitDataUrl: undefined,
      loraName: activeCharacter.loraName,
      loraWeight: activeCharacter.loraWeight,
    });
    setDraftIsDirty(false);
    setReferences(EMPTY_REFERENCES);
    setFaceLockStrength([DEFAULT_FACE_LOCK]);
    setBodyReferenceLock(true);
    setPreviewImageReady(false);
    setPreviewResetKey(activeCharacter.id);

    if (activeCharacter.portraitDataUrl) {
      const timer = window.setTimeout(() => setPreviewImageReady(true), 280);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [activeCharacterId, activeCharacter?.portraitDataUrl]);

  const updateForm = (patch: Partial<typeof form>) => {
    setDraftIsDirty(true);
    setPreviewImageReady(false);
    setForm((current) => ({ ...current, ...patch }));
  };

  const togglePersonality = (tag: string) => {
    setDraftIsDirty(true);
    setPreviewImageReady(false);
    setForm((current) => ({
      ...current,
      personality: current.personality.includes(tag)
        ? current.personality.filter((item) => item !== tag)
        : [...current.personality, tag],
    }));
  };

  const toggleStyle = (tag: string) => {
    setDraftIsDirty(true);
    setPreviewImageReady(false);
    setForm((current) => ({
      ...current,
      styleKeywords: current.styleKeywords.includes(tag)
        ? current.styleKeywords.filter((item) => item !== tag)
        : [...current.styleKeywords, tag],
    }));
  };

  const handleReferenceUpload = (slot: ReferenceSlot, file?: File) => {
    if (!file) return;
    readReference(file, (dataUrl) => {
      setDraftIsDirty(true);
      setPreviewImageReady(false);
      setReferences((current) => ({ ...current, [slot]: dataUrl }));
      toast.success(`${slot === "face" ? "Face" : slot === "body" ? "Full body" : "Style"} reference locked`);
    });
  };

  const imageOutputToUrl = (image: string, mime = "image/png") => {
    if (/^(data:|https?:|blob:)/i.test(image)) return image;
    return `data:${mime};base64,${image}`;
  };

  const generatePortrait = async (character: Character, shouldSave = false) => {
    setGenerating(true);
    try {
      const styleTerms = [...character.styleKeywords, ...character.personality.slice(0, 3)].join(", ");
      const referenceNotes = [
        references.face ? `FaceLock reference strength ${faceLockValue.toFixed(2)}` : "",
        references.body && bodyReferenceLock ? "body reference lock enabled" : "",
        references.style ? "style reference image enabled" : "",
      ]
        .filter(Boolean)
        .join(", ");

      const ratingNotes = nsfwEnabled
        ? "adult-only private character generation, mature cinematic styling enabled when explicitly requested, all subjects must be clearly 18+, no minors, no underage cues"
        : "safe-for-work character portrait, no nudity, no explicit sexual content";

      const out = await forgeImage({
        prompt: `premium cinematic character portrait, luxury studio lighting, ${ratingNotes}, ${character.description}${styleTerms ? `, ${styleTerms}` : ""}${referenceNotes ? `, ${referenceNotes}` : ""}`,
        character: { ...character, portraitDataUrl: undefined },
        stylePreset: character.stylePreset,
        settings: { ...settings, batchSize: 1, width: 832, height: 1216 },
        lora: character.loraName,
        loraWeight: character.loraWeight,
      });

      if (out.status !== "success" || !out.images?.length) throw new Error(out.message || "No image returned");

      const dataUrl = imageOutputToUrl(out.images[0].image, out.images[0].mime);
      if (shouldSave) updateCharacter(character.id, { portraitDataUrl: dataUrl });
      setPreviewImageReady(true);
      return dataUrl;
    } catch (error) {
      toast.error("Portrait generation failed", {
        description: error instanceof Error ? error.message : "Unknown generation error",
      });
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const lockCharacter = async () => {
    if (!form.name.trim()) {
      toast.error("Give your character a name.");
      setActiveSection("identity");
      return null;
    }

    if (!form.description.trim()) {
      toast.error("Add a physical description. This is their Character DNA.");
      setActiveSection("identity");
      return null;
    }

    const character: Character = { ...form, id: crypto.randomUUID(), createdAt: Date.now() };
    addCharacter(character);
    setActiveCharacter(character.id);
    toast.success(`${character.name} matched and locked`, {
      description: `FaceLock ${faceLockValue.toFixed(2)} · Seed ${character.seed}`,
    });

    await generatePortrait(character, true);
    setForm({ ...BLANK, seed: randomSeed() });
    setDraftIsDirty(false);
    return character;
  };

  const handleForgeImages = async () => {
    if (activeCharacter && !draftIsDirty) {
      setActiveTab("images");
      return;
    }

    const character = await lockCharacter();
    if (character) setActiveTab("images");
  };

  const handleCopyPrompt = async () => {
    const copied = await copyToClipboard(prompt);
    if (copied) toast.success("Character prompt copied");
    else toast.error("Clipboard unavailable");
  };

  const nextSection = () => {
    const index = SECTIONS.findIndex((section) => section.id === activeSection);
    const next = SECTIONS[index + 1];
    if (next) setActiveSection(next.id);
  };

  const selectLockedCharacter = (character: Character) => {
    setPreviewImageReady(false);
    setPreviewResetKey(character.id);
    setDraftIsDirty(false);
    setReferences(EMPTY_REFERENCES);
    setFaceLockStrength([DEFAULT_FACE_LOCK]);
    setBodyReferenceLock(true);
    setActiveCharacter(character.id);
  };

  const startNewCharacter = () => {
    setActiveCharacter(null);
    setForm({ ...BLANK, seed: randomSeed() });
    setDraftIsDirty(false);
    setReferences(EMPTY_REFERENCES);
    setFaceLockStrength([DEFAULT_FACE_LOCK]);
    setBodyReferenceLock(true);
    setPreviewImageReady(false);
    setPreviewResetKey("new-character");
    setActiveSection("identity");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex-1 overflow-hidden bg-[#070914] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_7%,rgba(0,212,255,0.20),transparent_31%),radial-gradient(circle_at_84%_9%,rgba(168,85,247,0.30),transparent_30%),radial-gradient(circle_at_54%_96%,rgba(192,38,211,0.20),transparent_36%),radial-gradient(circle_at_48%_38%,rgba(255,255,255,0.035),transparent_28%),linear-gradient(180deg,#0B1224,#05060B)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:92px_92px] opacity-28" />

      <div className="relative z-10 px-6 py-12 lg:px-14 2xl:px-16">
        <main className="mx-auto grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
          <div className="min-w-0 space-y-10">
            <FaceLockHero
              references={references}
              faceLockStrength={faceLockArray(faceLockStrength)}
              bodyReferenceLock={bodyReferenceLock}
              lockLabel={lockLabel}
              lockGlow={lockGlow}
              generating={generating}
              onUpload={handleReferenceUpload}
              onStrengthChange={(value) => {
                setDraftIsDirty(true);
                setPreviewImageReady(false);
                setFaceLockStrength(faceLockArray(value));
              }}
              onToggleBodyLock={() => {
                setDraftIsDirty(true);
                setPreviewImageReady(false);
                setBodyReferenceLock((value) => !value);
              }}
              onLock={lockCharacter}
            />

            <GlassPanel className="p-8">
              <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100/50">
                    <Dna className="size-4" />
                    Character DNA Builder
                  </div>
                  <h2 className="mt-3 text-4xl font-black tracking-tight text-white lg:text-5xl">Identity control deck</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ProofBadge label="DNA Proof" score={proof.categories.identity.score} status={proof.categories.identity.status} />
                    <ProofBadge label="Continuity" score={proof.categories.continuity.score} status={proof.categories.continuity.status} />
                    <button
                      type="button"
                      onClick={enableNsfwCharacterMode}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] transition",
                        nsfwEnabled
                          ? "border-fuchsia-300/45 bg-fuchsia-400/15 text-fuchsia-100 shadow-[0_0_22px_rgba(217,70,239,0.18)]"
                          : "border-white/10 bg-white/[0.035] text-white/45 hover:border-fuchsia-300/30 hover:text-fuchsia-100"
                      )}
                    >
                      {nsfwEnabled ? "NSFW DNA Enabled" : "Enable NSFW DNA"}
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <ProofBadge
                      label="Identity Lock"
                      score={proof.categories.identity.score}
                      status={proof.categories.identity.status}
                      detail={identityDetail}
                      variant="full"
                    />
                    <ProofBadge
                      label="Continuity Memory"
                      score={proof.categories.continuity.score}
                      status={proof.categories.continuity.status}
                      detail={continuityDetail}
                      variant="full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-[26px] border border-white/[0.10] bg-black/24 p-2">
                  {SECTIONS.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveSection(id)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-[20px] px-3 py-2.5 text-[11px] font-black transition",
                        activeSection === id
                          ? "bg-cyan-100 text-black shadow-[0_0_32px_rgba(0,212,255,0.18)]"
                          : "text-white/48 hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      <Icon className="size-3.5" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeSection === "identity" && (
                  <motion.div
                    key="identity"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="space-y-6"
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <Field label="Character name">
                        <Input
                          value={form.name}
                          onChange={(event) => updateForm({ name: event.target.value })}
                          placeholder="Elli Vale"
                          className="mt-3 h-14 rounded-[24px] border-white/[0.12] bg-black/28 px-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        />
                      </Field>
                      <Field label="Age">
                        <Input
                          value={form.age}
                          onChange={(event) => updateForm({ age: event.target.value })}
                          placeholder="25"
                          className="mt-3 h-14 rounded-[24px] border-white/[0.12] bg-black/28 px-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        />
                      </Field>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <Field label="Heritage">
                        <HeritagePicker
                          value={form.heritage}
                          onChange={(heritage) => updateForm({ heritage })}
                        />
                      </Field>
                      <Field label="Body type">
                        <Select value={form.bodyType} onValueChange={(bodyType) => bodyType && updateForm({ bodyType })}>
                          <SelectTrigger className="mt-3 h-14 rounded-[24px] border-white/[0.12] bg-black/28 px-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BODY_TYPES.map((bodyType) => (
                              <SelectItem key={bodyType} value={bodyType}>
                                {bodyType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <Field label="Physical description">
                      <Textarea
                        value={form.description}
                        onChange={(event) => updateForm({ description: event.target.value })}
                        rows={7}
                        placeholder="Precise face structure, skin tone, hair, eyes, posture, signature details, wardrobe anchors, camera-readable traits..."
                        className="mt-3 min-h-52 resize-none rounded-[30px] border-white/[0.12] bg-black/28 px-5 py-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                      />
                    </Field>
                  </motion.div>
                )}

                {activeSection === "style" && (
                  <motion.div
                    key="style"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="space-y-8"
                  >
                    <TagCloud title="Personality traits" tags={PERSONALITY_TAGS} active={form.personality} onToggle={togglePersonality} accent="cyan" />
                    <TagCloud title="Visual style keywords" tags={STYLE_KEYWORDS} active={form.styleKeywords} onToggle={toggleStyle} accent="violet" />
                    <Field label="Default style preset">
                      <div className="mt-4 grid gap-4 sm:grid-cols-5">
                        {PRESETS.map((preset) => {
                          const active = form.stylePreset === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => updateForm({ stylePreset: preset.id })}
                              className={cn(
                                "relative overflow-hidden rounded-[26px] border px-4 py-5 text-left transition",
                                active ? "border-white/30 bg-white/[0.09] shadow-[0_0_30px_rgba(168,85,247,0.12)]" : "border-white/[0.11] bg-black/26 hover:border-white/24"
                              )}
                            >
                              {active && <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", preset.accent)} />}
                              <div className="text-sm font-black text-white">{preset.label}</div>
                              <div className="mt-1 text-[11px] font-semibold text-white/34">Preset</div>
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                  </motion.div>
                )}

                {activeSection === "seed" && (
                  <motion.div
                    key="seed"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    className="space-y-5"
                  >
                      <div className="rounded-[34px] border border-white/[0.12] bg-black/28 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-black text-white">
                          <Dna className="size-4 text-violet-200" />
                          Character DNA Fingerprint
                        </div>
                        <div className="font-mono text-xs font-bold text-white/42">{seedHex}</div>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {seedToDnaColors(form.seed).map((color, index) => (
                          <motion.div
                            key={`${color}-${index}`}
                            animate={{ opacity: [0.72, 1, 0.72] }}
                            transition={{ duration: 2 + index * 0.32, repeat: Infinity, ease: "easeInOut" }}
                            className="h-20 rounded-[24px]"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <Field label="Consistency seed">
                      <div className="mt-2 flex gap-2">
                        <Input
                          type="number"
                          value={form.seed}
                          onChange={(event) => updateForm({ seed: Number(event.target.value) || 0 })}
                            className="h-14 rounded-[24px] border-white/[0.12] bg-black/28 px-5 font-mono text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => updateForm({ seed: randomSeed() })}
                            className="h-14 rounded-[24px] border-white/12 bg-white/[0.05] px-5 text-white hover:bg-white hover:text-black"
                        >
                          <Shuffle className="size-4" />
                        </Button>
                      </div>
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-between border-t border-white/[0.08] pt-5">
                <div className="flex gap-2">
                  {SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={cn("h-2 rounded-full transition", activeSection === section.id ? "w-7 bg-cyan-200" : "w-2 bg-white/20 hover:bg-white/40")}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={activeSection === "seed" ? lockCharacter : nextSection}
                  disabled={generating}
                  className="h-14 rounded-full bg-white px-7 text-sm font-black text-black shadow-[0_0_28px_rgba(255,255,255,0.10)] hover:bg-cyan-100"
                >
                  {activeSection === "seed" ? (
                    <>
                      <Lock className="size-4" />
                      Lock Character
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </GlassPanel>
          </div>

          <div className="space-y-16">
            <LivePreview
              character={previewCharacter}
              activeCharacter={draftIsDirty ? null : activeCharacter}
              previewImageReady={previewImageReady}
              previewResetKey={previewResetKey}
              prompt={prompt}
              dnaColors={dnaColors}
              faceLockStrength={faceLockValue}
              bodyReferenceLock={bodyReferenceLock}
              lockLabel={lockLabel}
              referenceCount={referenceCount}
              generating={generating}
              onCopyPrompt={handleCopyPrompt}
              onForgeImages={handleForgeImages}
              onRegenerate={() => activeCharacter && generatePortrait(activeCharacter, true)}
            />

            <CharacterContinuityLab
              character={previewCharacter}
              dnaColors={dnaColors}
              faceLockStrength={faceLockValue}
              bodyReferenceLock={bodyReferenceLock}
              referenceCount={referenceCount}
            />

            {characters.length > 0 && (
              <GlassPanel className="mt-10 p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-white/34">Your Cast</div>
                    <h3 className="mt-2 text-3xl font-black text-white">Locked character vault</h3>
                    <div className="mt-1 text-sm font-semibold text-white/42">{characters.length} production-ready DNA profile{characters.length === 1 ? "" : "s"}</div>
                  </div>
                  <BadgeCheck className="size-5 text-cyan-100/58" />
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {characters.map((character) => {
                    const active = character.id === activeCharacterId && !draftIsDirty;
                    return (
                      <motion.button
                        key={character.id}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => selectLockedCharacter(character)}
                        className={cn(
                          "group relative overflow-hidden rounded-[30px] border text-left transition",
                          active ? "border-cyan-200/55 shadow-[0_0_46px_rgba(0,212,255,0.20)]" : "border-white/[0.11] hover:border-white/26"
                        )}
                      >
                        <div className="aspect-[3/4] bg-black">
                          {character.portraitDataUrl ? (
                            <img src={character.portraitDataUrl} alt={character.name} className="size-full object-cover" />
                          ) : (
                            <div className="flex size-full items-center justify-center bg-white/[0.035] text-white/22">
                              <User className="size-9" />
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/84 to-transparent p-3 pt-10">
                          <div className="truncate text-sm font-black text-white">{character.name}</div>
                          <div className="truncate text-[10px] font-semibold text-white/42">{character.heritage}</div>
                        </div>
                        <div className="absolute inset-x-0 top-0 flex h-1">
                          {seedToDnaColors(character.seed).map((color, index) => (
                            <div key={`${character.id}-${index}`} className="h-full flex-1" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        {active && (
                          <div className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-cyan-200 text-black">
                            <Check className="size-4" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteCharacter(character.id);
                            toast.info(`${character.name} deleted`);
                          }}
                          className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full border border-rose-200/16 bg-black/54 text-rose-100/0 opacity-0 backdrop-blur-xl transition group-hover:text-rose-100/82 group-hover:opacity-100"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </motion.button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={startNewCharacter}
                    className="aspect-[3/4] rounded-[30px] border border-dashed border-white/[0.18] bg-white/[0.03] text-white/36 transition hover:border-white/32 hover:bg-white/[0.05] hover:text-white"
                  >
                    <Plus className="mx-auto size-8" />
                    <span className="mt-2 block text-xs font-black">New</span>
                  </button>
                </div>
              </GlassPanel>
            )}
          </div>
        </main>
      </div>
      {nsfwGateOpen && (
        <LegalGateModal
          onCancel={() => setNsfwGateOpen(false)}
          onConfirm={() => {
            confirmNsfwGate();
            setStudioMode("nsfw");
            setContentRating("X");
            setNsfwGateOpen(false);
            toast.success("NSFW Character DNA mode enabled", {
              description: "Adult-only private character generation is now available.",
            });
          }}
        />
      )}
    </div>
  );
};

function FaceLockHero({
  references,
  faceLockStrength,
  bodyReferenceLock,
  lockLabel,
  lockGlow,
  generating,
  onUpload,
  onStrengthChange,
  onToggleBodyLock,
  onLock,
}: {
  references: ReferenceState;
  faceLockStrength: number[];
  bodyReferenceLock: boolean;
  lockLabel: string;
  lockGlow: string;
  generating: boolean;
  onUpload: (slot: ReferenceSlot, file?: File) => void;
  onStrengthChange: (value: number[]) => void;
  onToggleBodyLock: () => void;
  onLock: () => void;
}) {
  const faceLockValue = normalizeFaceLockValue(faceLockStrength);
  const sliderValue = faceLockArray(faceLockValue);

  return (
    <GlassPanel className="rounded-[52px] p-8 lg:p-9">
      <div className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200/14 bg-fuchsia-300/[0.07] px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-fuchsia-100/64 shadow-[0_0_34px_rgba(192,38,211,0.12)]">
            <ScanFace className="size-4" />
            IP-Adapter / FaceLock
          </div>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-white lg:text-6xl">
            Lock the face. Keep the magic.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/58">
            Upload reference frames, tune identity strength, preserve body silhouette, and lock a reusable Character DNA profile for every scene, image, and universe.
          </p>

          <div className="mt-7 rounded-[34px] border border-white/[0.13] bg-black/32 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-black text-white">FaceLock strength</div>
                <div className="mt-1 text-xs font-semibold text-white/44">{lockLabel}</div>
              </div>
              <motion.div
                key={lockGlow}
                initial={{ scale: 0.92, opacity: 0.55 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-full border border-cyan-200/24 bg-cyan-300/[0.12] px-4 py-2 text-sm font-black text-cyan-50 shadow-[0_0_34px_rgba(0,212,255,0.18)]"
              >
                {faceLockValue.toFixed(2)}
              </motion.div>
            </div>
            <Slider value={sliderValue} onValueChange={(value) => onStrengthChange(faceLockArray(value))} min={0} max={1} step={0.01} className="mt-6" />
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-violet-300 to-fuchsia-300 shadow-[0_0_24px_rgba(168,85,247,0.35)]"
                animate={{ width: lockGlow }}
                transition={{ type: "spring", stiffness: 180, damping: 24 }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {([
              ["face", "Face", "Primary identity", ScanFace],
              ["body", "Full Body", "Silhouette lock", User],
              ["style", "Style", "Lighting memory", ImageIcon],
            ] as const).map(([slot, label, hint, Icon]) => (
              <label
                key={slot}
                className={cn(
                  "group relative flex min-h-56 cursor-pointer flex-col justify-between overflow-hidden rounded-[34px] border p-5 transition duration-300",
                  references[slot]
                    ? "border-cyan-200/32 bg-cyan-300/[0.075] shadow-[0_0_42px_rgba(0,212,255,0.16)]"
                    : "border-dashed border-white/[0.16] bg-black/30 hover:border-white/30 hover:bg-white/[0.055]"
                )}
              >
                {references[slot] ? (
                  <img src={references[slot] ?? ""} alt={`${label} reference`} className="absolute inset-0 size-full object-cover opacity-58 transition group-hover:scale-105" />
                ) : (
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.10),transparent_34%)]" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => onUpload(slot, event.target.files?.[0])}
                />
                <div className="relative flex size-12 items-center justify-center rounded-[22px] border border-white/12 bg-black/46 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_18px_44px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                  <Icon className="size-5" />
                </div>
                <div className="relative">
                  <div className="text-base font-black text-white">{label}</div>
                  <div className="mt-1 text-xs font-semibold text-white/46">{references[slot] ? "Reference active" : hint}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_230px]">
            <button
              type="button"
              onClick={onToggleBodyLock}
              className={cn(
                "flex items-center justify-between gap-4 rounded-[30px] border p-5 text-left transition",
                bodyReferenceLock ? "border-cyan-200/24 bg-cyan-300/[0.08]" : "border-white/[0.10] bg-black/26"
              )}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className={cn("size-5", bodyReferenceLock ? "text-cyan-100" : "text-white/40")} />
                <div>
                  <div className="text-sm font-black text-white">Body Reference Lock</div>
                  <div className="text-xs text-white/40">Preserve silhouette, posture, wardrobe proportions.</div>
                </div>
              </div>
              <span className={cn("relative h-8 w-16 rounded-full border transition", bodyReferenceLock ? "border-cyan-200/30 bg-cyan-300/30" : "border-white/12 bg-white/[0.06]")}>
                <span className={cn("absolute top-1 size-6 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.32)] transition", bodyReferenceLock ? "left-9" : "left-1")} />
              </span>
            </button>

            <Button
              type="button"
              onClick={onLock}
              disabled={generating}
              className="h-full min-h-24 rounded-[30px] bg-gradient-to-r from-cyan-200 via-violet-300 to-fuchsia-300 text-base font-black text-black shadow-[0_0_64px_rgba(168,85,247,0.44)] hover:brightness-110"
            >
              {generating ? <Sparkles className="size-4 animate-pulse" /> : <Lock className="size-4" />}
              Match & Lock
            </Button>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

function LivePreview({
  character,
  activeCharacter,
  previewImageReady,
  previewResetKey,
  prompt,
  dnaColors,
  faceLockStrength,
  bodyReferenceLock,
  lockLabel,
  referenceCount,
  generating,
  onCopyPrompt,
  onForgeImages,
  onRegenerate,
}: {
  character: Omit<Character, "id" | "createdAt"> | Character;
  activeCharacter: Character | null;
  previewImageReady: boolean;
  previewResetKey: string;
  prompt: string;
  dnaColors: string[];
  faceLockStrength: number;
  bodyReferenceLock: boolean;
  lockLabel: string;
  referenceCount: number;
  generating: boolean;
  onCopyPrompt: () => void;
  onForgeImages: () => void;
  onRegenerate: () => void;
}) {
  const safeFaceLockStrength = normalizeFaceLockValue(faceLockStrength);

  return (
    <GlassPanel className="sticky top-24 rounded-[56px] p-9 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100/52">
            <Eye className="size-4" />
            Live Preview
          </div>
          <h2 className="mt-3 text-5xl font-black tracking-tight text-white lg:text-6xl">
            {character.name || (activeCharacter ? activeCharacter.name : "New Character Preview")}
          </h2>
        </div>
        <Button
          type="button"
          onClick={onCopyPrompt}
          className="rounded-full border border-white/12 bg-white/[0.08] px-4 text-sm font-black text-white hover:bg-white hover:text-black"
        >
          <Copy className="size-4" />
          Copy Prompt
        </Button>
      </div>

      <div className="mt-9 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_72px_rgba(0,0,0,0.40)]">
          <div className="aspect-[6/7]">
            {activeCharacter?.portraitDataUrl && previewImageReady ? (
              <motion.img
                key={previewResetKey}
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                src={activeCharacter.portraitDataUrl}
                alt={activeCharacter.name}
                className="size-full object-cover"
              />
            ) : (
              <motion.div
                key={`${previewResetKey}-${character.name}-${character.heritage}-${safeFaceLockStrength}-${bodyReferenceLock}`}
                initial={{ opacity: 0.84 }}
                animate={{ opacity: 1 }}
                className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_50%_22%,rgba(0,212,255,0.18),transparent_26%),radial-gradient(circle_at_50%_58%,rgba(168,85,247,0.24),transparent_36%),linear-gradient(145deg,#070B14,#030406)]"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ boxShadow: `0 0 ${38 + safeFaceLockStrength * 52}px rgba(0,212,255,${0.10 + safeFaceLockStrength * 0.18})` }}
                    className="mx-auto flex size-32 items-center justify-center rounded-[38px] border border-white/[0.14] bg-white/[0.065] backdrop-blur-2xl"
                  >
                    <Camera className="size-12 text-white/58" />
                  </motion.div>
                  <div className="mt-7 text-2xl font-black text-white">
                    {activeCharacter?.portraitDataUrl && !previewImageReady
                      ? "Loading selected character"
                      : character.name
                        ? lockLabel
                        : "Ready for Character DNA"}
                  </div>
                  <div className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/44">
                    {activeCharacter?.portraitDataUrl && !previewImageReady
                      ? "Clearing the previous preview and preparing this character's portrait."
                      : character.description || "Start with a name, description, or reference image and this preview will respond instantly."}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          {generating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  className="mx-auto size-14 rounded-full border-2 border-cyan-200 border-t-transparent"
                />
                <div className="mt-4 text-sm font-black text-white">Forging portrait...</div>
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex h-1.5">
            {dnaColors.map((color, index) => (
              <div key={`${color}-${index}`} className="h-full flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[34px] border border-white/[0.12] bg-black/28 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-white/34">Prompt Memory</div>
            <p className="mt-3 max-h-56 overflow-y-auto text-sm leading-7 text-white/58">
              {prompt || "Start typing identity details to build the character prompt."}
            </p>
          </div>
          <div className="grid gap-3">
            <Metric label="Heritage" value={character.heritage} />
            <Metric label="Body" value={character.bodyType} />
            <Metric label="FaceLock" value={safeFaceLockStrength.toFixed(2)} />
            <Metric label="References" value={`${referenceCount}/3 active`} />
            <Metric label="Body Lock" value={bodyReferenceLock ? "Enabled" : "Off"} />
          </div>
        </div>
      </div>

      <div className="mt-9 grid gap-4 md:grid-cols-[1fr_260px]">
        <Button
          type="button"
          onClick={onForgeImages}
          disabled={generating}
          className="h-24 rounded-full bg-gradient-to-r from-cyan-200 via-violet-300 to-fuchsia-300 text-xl font-black text-black shadow-[0_0_90px_rgba(168,85,247,0.54)] hover:brightness-110"
        >
          <Zap className="size-5" />
          Forge Images Now
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!activeCharacter || generating}
          onClick={onRegenerate}
          className="h-24 rounded-full border-white/12 bg-white/[0.065] px-6 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white hover:text-black"
        >
          <RefreshCw className="size-4" />
          Re-forge Portrait
        </Button>
      </div>
    </GlassPanel>
  );
}

function CharacterContinuityLab({
  character,
  dnaColors,
  faceLockStrength,
  bodyReferenceLock,
  referenceCount,
}: {
  character: Omit<Character, "id" | "createdAt"> | Character;
  dnaColors: string[];
  faceLockStrength: number;
  bodyReferenceLock: boolean;
  referenceCount: number;
}) {
  const poses = ["Stand", "Walk", "Sit", "Action", "Interact"];
  const expressions = ["Neutral", "Happy", "Sad", "Angry", "Surprised", "Worried"];
  const audit = [
    ["Face geometry", faceLockStrength >= 0.78 ? "Locked" : "Needs stronger lock"],
    ["Body silhouette", bodyReferenceLock ? "Preserved" : "Optional"],
    ["Reference slots", `${referenceCount}/3 active`],
    ["Seed memory", String(character.seed)],
  ];

  return (
    <GlassPanel className="p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/46">Identity Workspace</div>
          <h3 className="mt-2 text-3xl font-black text-white">Anchor sheet + continuity audit</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/48">
            This turns a character from a prompt into a production asset: anchor pose, expression range, FaceLock strength, body lock, and reusable DNA memory.
          </p>
        </div>
        <div className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-xs font-black text-cyan-50">
          {faceLockStrength >= 0.78 ? "Production ready" : "Draft DNA"}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-3">
          <div className="grid grid-cols-5 gap-2">
            {poses.map((pose, index) => (
              <div key={pose} className="min-h-28 rounded-[24px] border border-white/[0.10] bg-black/26 p-3">
                <div className="h-12 rounded-2xl" style={{ background: `linear-gradient(135deg, ${dnaColors[index % dnaColors.length]}, rgba(255,255,255,0.08))` }} />
                <div className="mt-3 text-xs font-black text-white">{pose}</div>
                <div className="mt-1 text-[10px] font-semibold text-white/34">pose slot</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {expressions.map((expression, index) => (
              <div key={expression} className="rounded-[20px] border border-white/[0.10] bg-white/[0.035] px-3 py-3 text-center">
                <div className="mx-auto size-7 rounded-full" style={{ backgroundColor: dnaColors[index % dnaColors.length] }} />
                <div className="mt-2 text-[11px] font-black text-white/72">{expression}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/[0.10] bg-black/24 p-5">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-white/34">Continuity Checklist</div>
          <div className="mt-4 space-y-3">
            {audit.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.035] px-4 py-3">
                <span className="text-xs font-bold text-white/45">{label}</span>
                <span className="max-w-[160px] truncate text-xs font-black text-cyan-50/78">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

function HeritagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = HERITAGE_OPTIONS.filter((heritage) => heritage.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative mt-2">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-full items-center justify-between rounded-[24px] border border-white/[0.12] bg-black/28 px-5 text-left text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-white/24"
      >
        {value}
        <ChevronDown className={cn("size-4 text-white/42 transition", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute left-0 right-0 top-[calc(100%+10px)] z-40 overflow-hidden rounded-[24px] border border-white/[0.14] bg-[#070A12]/96 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_28px_90px_rgba(0,0,0,0.54)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-2 rounded-[18px] border border-white/[0.10] bg-black/34 px-3">
              <Search className="size-4 text-white/34" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search heritage..."
                className="h-11 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/28"
              />
            </div>
            <div className="mt-3 max-h-72 overflow-y-auto pr-1">
              {filtered.map((heritage) => (
                <button
                  key={heritage}
                  type="button"
                  onClick={() => {
                    onChange(heritage);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[16px] px-3 py-2.5 text-left text-sm font-bold transition",
                    heritage === value ? "bg-cyan-200 text-black" : "text-white/62 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  {heritage}
                  {heritage === value && <Check className="size-4" />}
                </button>
              ))}
              {filtered.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(query);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full rounded-[16px] border border-dashed border-white/[0.12] px-3 py-3 text-left text-sm font-bold text-white/48 hover:text-white"
                >
                  Use "{query}"
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/44">{label}</Label>
      {children}
    </label>
  );
}

function TagCloud({
  title,
  tags,
  active,
  onToggle,
  accent,
}: {
  title: string;
  tags: string[];
  active: string[];
  onToggle: (tag: string) => void;
  accent: "cyan" | "violet";
}) {
  return (
    <div>
      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/44">{title}</Label>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {tags.map((tag) => {
          const selected = active.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-xs font-bold transition",
                selected
                  ? accent === "cyan"
                    ? "border-cyan-200/44 bg-cyan-300/[0.13] text-cyan-50 shadow-[0_0_18px_rgba(0,212,255,0.16)]"
                    : "border-violet-200/44 bg-violet-300/[0.13] text-violet-50 shadow-[0_0_18px_rgba(168,85,247,0.16)]"
                  : "border-white/10 bg-white/[0.025] text-white/46 hover:border-white/24 hover:text-white"
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-[24px] border border-white/[0.11] bg-black/26 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30">{label}</div>
      <div className={cn("mt-1 truncate text-sm font-black text-white/72", mono && "font-mono")}>{value}</div>
    </div>
  );
}
