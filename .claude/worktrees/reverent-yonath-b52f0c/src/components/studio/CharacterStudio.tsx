import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Dice5, Sparkles, Trash2, Check, Plus, User,
  Shuffle, Image as ImageIcon, Copy, Dna, Lock,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { GlassCard } from "../ui/glass-card";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "../ui/select";
import { useNyxStore } from "../../store/useNyxStore";
import { forgeImage } from "../../lib/workflows";
import type { Character, StylePreset } from "../../lib/types";
import { Zap } from "lucide-react";

const HERITAGE_OPTIONS = [
  "Afro-Caribbean", "East Asian", "South Asian", "Latin American",
  "Middle Eastern", "Mediterranean", "Northern European", "Slavic",
  "Pacific Islander", "Mixed heritage",
];

const BODY_TYPES = [
  "Slim & athletic", "Curvy hourglass", "Tall & lean",
  "Toned & muscular", "Petite", "Plus size elegant",
];

const PERSONALITY_TAGS = [
  "confident", "mysterious", "playful", "intellectual", "sultry",
  "cheerful", "reserved", "adventurous", "elegant", "rebellious",
  "warm", "cold", "artistic", "athletic", "commanding",
];

const STYLE_KEYWORDS = [
  "editorial fashion", "street style", "cinematic moody", "natural beauty",
  "high glamour", "minimalist chic", "vintage film", "sci-fi futurist",
  "noir", "golden hour", "neon urban", "soft pastel",
];

const PRESETS: { id: StylePreset; label: string; color: string }[] = [
  { id: "portrait",    label: "Portrait",   color: "from-cyan-400 to-blue-500" },
  { id: "editorial",   label: "Editorial",  color: "from-pink-400 to-rose-500" },
  { id: "cinematic",   label: "Cinematic",  color: "from-orange-400 to-red-500" },
  { id: "concept_art", label: "Concept",    color: "from-violet-400 to-purple-500" },
  { id: "anime",       label: "Anime",      color: "from-fuchsia-400 to-pink-500" },
];

const randomSeed = () => Math.floor(Math.random() * 2 ** 32);

const BLANK: Omit<Character, "id" | "createdAt"> = {
  name: "",
  age: "25",
  heritage: "Mixed heritage",
  bodyType: "Slim & athletic",
  description: "",
  personality: [],
  styleKeywords: [],
  stylePreset: "portrait",
  seed: randomSeed(),
};

function seedToHex(seed: number): string {
  return `#${(seed & 0xFFFFFF).toString(16).padStart(6, "0")}`;
}

function seedToDnaColors(seed: number): string[] {
  return [
    `hsl(${seed % 360}, 70%, 55%)`,
    `hsl(${(seed >> 8) % 360}, 65%, 50%)`,
    `hsl(${(seed >> 16) % 360}, 75%, 60%)`,
    `hsl(${(seed >> 4) % 360}, 60%, 45%)`,
    `hsl(${(seed >> 12) % 360}, 80%, 65%)`,
  ];
}

export const CharacterStudio = () => {
  const {
    characters, addCharacter, deleteCharacter,
    activeCharacterId, setActiveCharacter, updateCharacter, settings, setActiveTab,
  } = useNyxStore();

  const [form, setForm] = useState({ ...BLANK });
  const [generating, setGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<"identity" | "style" | "seed">("identity");

  const dnaColors = useMemo(() => seedToDnaColors(form.seed), [form.seed]);
  const seedHex = useMemo(() => seedToHex(form.seed), [form.seed]);

  const togglePersonality = (t: string) =>
    setForm((f) => ({
      ...f,
      personality: f.personality.includes(t)
        ? f.personality.filter((x) => x !== t)
        : [...f.personality, t],
    }));

  const toggleStyle = (t: string) =>
    setForm((f) => ({
      ...f,
      styleKeywords: f.styleKeywords.includes(t)
        ? f.styleKeywords.filter((x) => x !== t)
        : [...f.styleKeywords, t],
    }));

  const generatePortrait = async (character: Character, shouldSave = false) => {
    setGenerating(true);
    try {
      const styleTerms = [
        ...character.styleKeywords,
        ...character.personality.slice(0, 3),
      ].join(", ");
      const out = await forgeImage({
        prompt: `clean centered portrait headshot, neutral background, ${character.description}${styleTerms ? `, ${styleTerms}` : ""}`,
        character: { ...character, portraitDataUrl: undefined },
        stylePreset: character.stylePreset,
        settings: { ...settings, batchSize: 1, width: 832, height: 1216 },
        lora: character.loraName,
        loraWeight: character.loraWeight,
      });
      if (out.status !== "success" || !out.images?.length) throw new Error(out.message || "No image");
      const dataUrl = `data:image/png;base64,${out.images[0].image}`;
      if (shouldSave) updateCharacter(character.id, { portraitDataUrl: dataUrl });
      return dataUrl;
    } catch (e: any) {
      toast.error("Portrait generation failed", { description: e?.message });
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const lockCharacter = async () => {
    if (!form.name.trim()) return toast.error("Give your character a name.");
    if (!form.description.trim()) return toast.error("Add a physical description — this is their DNA.");
    const character: Character = { ...form, id: crypto.randomUUID(), createdAt: Date.now() };
    addCharacter(character);
    setActiveCharacter(character.id);
    toast.success(`${character.name} locked in`, { description: "Generating portrait…" });
    const portrait = await generatePortrait(character, true);
    if (portrait) {
      toast.success(`${character.name} is ready to forge`, {
        description: "DNA locked · Seed set · Portrait generated",
        action: {
          label: "Forge Images →",
          onClick: () => setActiveTab("images"),
        },
        duration: 8000,
      });
    }
    setForm({ ...BLANK, seed: randomSeed() });
  };

  const handleCopyPrompt = (character: Character) => {
    const prompt = [
      character.name && `${character.name}`,
      character.age && `${character.age} years old`,
      character.heritage,
      character.bodyType,
      character.description,
      character.styleKeywords.join(", "),
    ].filter(Boolean).join(", ");
    navigator.clipboard.writeText(prompt);
    toast.success("Character prompt copied");
  };

  const activeCharacter = characters.find((c) => c.id === activeCharacterId) || null;

  const SECTIONS = [
    { id: "identity" as const, label: "Identity" },
    { id: "style" as const, label: "Style & Personality" },
    { id: "seed" as const, label: "DNA & Seed" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">Character Studio</div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
          Build your{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            AI cast.
          </span>
        </h1>
        <p className="text-white/50 mt-3 max-w-2xl">
          100% synthetic. Deterministic seed-locked consistency across every image and video.
          No uploaded photos. No model releases. Fully yours.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <GlassCard className="lg:col-span-3 overflow-hidden">
          {/* Section tabs */}
          <div className="flex border-b border-white/[0.07] bg-white/[0.02]">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all relative ${
                  activeSection === s.id
                    ? "text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {activeSection === s.id && (
                  <motion.div
                    layoutId="studio-section"
                    className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400"
                  />
                )}
                {s.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeSection === "identity" && (
                <motion.div
                  key="identity"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Character name</Label>
                      <Input
                        placeholder="Ada Rivers"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input
                        type="text"
                        placeholder="25"
                        value={form.age}
                        onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Heritage</Label>
                      <Select value={form.heritage} onValueChange={(v) => setForm((f) => ({ ...f, heritage: v }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {HERITAGE_OPTIONS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Body type</Label>
                      <Select value={form.bodyType} onValueChange={(v) => setForm((f) => ({ ...f, bodyType: v }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {BODY_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Physical description</Label>
                    <Textarea
                      rows={5}
                      placeholder="warm olive skin, shoulder-length auburn hair, bright hazel eyes, soft symmetrical features, a slight dimple on the left cheek, naturally full lips…"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      className="mt-1"
                    />
                    <p className="text-xs text-white/30 mt-1.5">
                      Be specific. Every word is part of the character's permanent memory.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeSection === "style" && (
                <motion.div
                  key="style"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <Label>Personality traits</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {PERSONALITY_TAGS.map((t) => {
                        const on = form.personality.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => togglePersonality(t)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              on
                                ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                                : "border-white/10 text-white/50 hover:border-white/25"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label>Visual style keywords</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {STYLE_KEYWORDS.map((t) => {
                        const on = form.styleKeywords.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleStyle(t)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              on
                                ? "border-violet-400/60 bg-violet-400/15 text-violet-200 shadow-[0_0_12px_rgba(192,38,211,0.25)]"
                                : "border-white/10 text-white/50 hover:border-white/25"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label>Default style preset</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {PRESETS.map((p) => {
                        const on = form.stylePreset === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, stylePreset: p.id as StylePreset }))}
                            className={`relative px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                              on ? "border-white/30 text-white" : "border-white/10 text-white/50 hover:border-white/20"
                            }`}
                          >
                            {on && (
                              <motion.div
                                layoutId="active-preset"
                                className={`absolute inset-0 rounded-full bg-gradient-to-r ${p.color} opacity-25`}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                            <span className="relative">{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === "seed" && (
                <motion.div
                  key="seed"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                    <div className="flex items-center gap-2 mb-4">
                      <Dna className="w-4 h-4 text-violet-400" />
                      <div className="text-sm font-bold">Character DNA</div>
                    </div>
                    <div className="flex gap-2 mb-4">
                      {dnaColors.map((color, i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                          className="flex-1 h-10 rounded-lg"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span>Fingerprint: <span className="font-mono text-white/60">{seedHex}</span></span>
                      <span>Seed: <span className="font-mono text-white/60">{form.seed}</span></span>
                    </div>
                    <p className="text-xs text-white/30 mt-3 leading-relaxed">
                      The seed is your character's genetic fingerprint — it determines exactly how they look across every generation.
                      Same seed + same prompt = same face, every time.
                    </p>
                  </div>
                  <div>
                    <Label>Consistency seed</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        value={form.seed}
                        onChange={(e) => setForm((f) => ({ ...f, seed: Number(e.target.value) || 0 }))}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setForm((f) => ({ ...f, seed: randomSeed() }))}
                        title="New random seed"
                      >
                        <Shuffle className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-white/30 mt-1.5">
                      Share this seed to hand off the character to collaborators.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Section nav + Lock */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.07]">
              <div className="flex gap-2">
                {SECTIONS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeSection === s.id ? "bg-violet-400 w-5" : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
              <Button
                onClick={activeSection === "seed" ? lockCharacter : () => {
                  const idx = SECTIONS.findIndex((s) => s.id === activeSection);
                  if (idx < SECTIONS.length - 1) setActiveSection(SECTIONS[idx + 1].id);
                  else lockCharacter();
                }}
                disabled={generating}
                className="h-12 px-6 text-sm font-black bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-black hover:brightness-110 shadow-[0_0_24px_rgba(192,38,211,0.4)]"
              >
                {generating ? (
                  <><Sparkles className="w-4 h-4 mr-2 animate-pulse" /> Forging…</>
                ) : activeSection === "seed" ? (
                  <><Lock className="w-4 h-4 mr-2" /> Lock Character</>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Active character panel */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">Active</div>
            {activeCharacter && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyPrompt(activeCharacter)}
                  className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3" /> Copy prompt
                </button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {activeCharacter ? (
              <motion.div
                key={activeCharacter.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-black relative">
                  {activeCharacter.portraitDataUrl ? (
                    <img
                      src={activeCharacter.portraitDataUrl}
                      alt={activeCharacter.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs gap-2">
                      <ImageIcon className="w-7 h-7" /> No portrait
                    </div>
                  )}
                  {generating && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent"
                      />
                    </div>
                  )}
                  {/* DNA fingerprint overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                    {seedToDnaColors(activeCharacter.seed).map((color, i) => (
                      <div key={i} className="flex-1 h-full opacity-80" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-2xl font-black">{activeCharacter.name}</div>
                  <div className="text-sm text-white/50 mt-0.5">
                    {activeCharacter.age} · {activeCharacter.heritage}
                  </div>
                  {activeCharacter.personality.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {activeCharacter.personality.slice(0, 4).map((p) => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setActiveTab("images")}
                  className="w-full h-11 font-black bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400 text-white hover:brightness-110 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                >
                  <Zap className="w-4 h-4 mr-2" /> Forge Images Now
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => generatePortrait(activeCharacter, true)}
                    disabled={generating}
                  >
                    <Shuffle className="w-4 h-4 mr-2" /> Re-forge Portrait
                  </Button>
                  <Button
                    variant="outline"
                    className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 border-rose-500/20"
                    onClick={() => { deleteCharacter(activeCharacter.id); toast.info(`${activeCharacter.name} deleted`); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-[3/4] rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 gap-3"
              >
                <User className="w-12 h-12" />
                <div className="text-sm font-medium">No character locked</div>
                <div className="text-xs text-center max-w-[150px] leading-relaxed">
                  Fill the form and lock to create your first AI character
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>

      {/* Character roster */}
      {characters.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black">Your cast</h2>
            <div className="text-xs text-white/30">{characters.length} character{characters.length !== 1 ? "s" : ""}</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {characters.map((c) => {
              const active = c.id === activeCharacterId;
              return (
                <motion.button
                  key={c.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCharacter(c.id)}
                  className={`relative rounded-2xl overflow-hidden border text-left transition-all duration-200 ${
                    active
                      ? "border-cyan-400/60 shadow-[0_0_24px_rgba(34,211,238,0.35)]"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <div className="aspect-[3/4] bg-black">
                    {c.portraitDataUrl ? (
                      <img src={c.portraitDataUrl} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-8">
                    <div className="font-bold text-sm truncate">{c.name}</div>
                    <div className="text-[10px] text-white/40 truncate">{c.heritage}</div>
                  </div>
                  {/* DNA strip */}
                  <div className="absolute top-0 left-0 right-0 h-1 flex">
                    {seedToDnaColors(c.seed).map((color, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  {active && (
                    <div className="absolute top-3 right-2 w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center shadow-lg">
                      <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                    </div>
                  )}
                </motion.button>
              );
            })}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="aspect-[3/4] rounded-2xl border border-dashed border-white/15 flex flex-col items-center justify-center text-white/30 hover:text-white/60 hover:border-white/30 transition-all gap-2"
            >
              <Plus className="w-7 h-7" />
              <span className="text-xs font-semibold">New</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
