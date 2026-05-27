import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  AudioLines,
  Bot,
  Check,
  Clapperboard,
  Copy,
  Crown,
  Download,
  Dna,
  FileAudio,
  FileText,
  Gauge,
  Headphones,
  KeyRound,
  Layers3,
  Mic2,
  Music2,
  Pause,
  Play,
  Plus,
  Radio,
  RadioTower,
  Send,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Volume2,
  Wand2,
  Waves,
  Zap,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { CommandMetric, CommandPanel } from "../command/CommandDeck";
import { useActiveCharacter, useAxsStore } from "../../store/useAxsStore";
import { createWaveform, generateVoiceOver, type VoiceEngine } from "../../lib/voiceEngines";
import { useUniverseForgeStore } from "../../features/universe-forge/store/useUniverseForgeStore";
import { getSliderNumber, getSliderTuple } from "../../lib/sliderValue";
import { copyToClipboard } from "../../lib/safeClipboard";
import { useAxsProofSummary } from "../../lib/useAxsProofSummary";

const VOICES = [
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    openai: "nova",
    google: "en-US-Neural2-F",
    name: "Cyberpunk 2077 Announcer",
    shortName: "C77",
    type: "Trailer authority",
    accent: "Warm US",
    tone: "commanding, cinematic, premium",
    match: 96,
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    openai: "shimmer",
    google: "en-US-Neural2-C",
    name: "Nova Vale",
    shortName: "NV",
    type: "Luxury narrator",
    accent: "Polished global",
    tone: "intimate, seductive, precise",
    match: 92,
  },
  {
    id: "29vD33N1CtxCmqQRPOHJ",
    openai: "onyx",
    google: "en-US-Neural2-D",
    name: "Dante Cross",
    shortName: "DC",
    type: "Deep cinematic",
    accent: "Deep US",
    tone: "dangerous, controlled, iconic",
    match: 89,
  },
  {
    id: "AZnzlk1XvdvUeBnXmlld",
    openai: "alloy",
    google: "en-US-Neural2-J",
    name: "Ari Pulse",
    shortName: "AP",
    type: "Creator energy",
    accent: "Bright US",
    tone: "excited, clean, conversion-ready",
    match: 84,
  },
];

const EMOTIONS = ["confident", "authoritative", "cinematic", "seductive", "energetic", "dramatic"] as const;

const defaultEmotions: Record<(typeof EMOTIONS)[number], number> = {
  confident: 74,
  authoritative: 70,
  cinematic: 82,
  seductive: 36,
  energetic: 48,
  dramatic: 62,
};

const MUSIC_BEDS = ["Cinematic Pulse", "Luxury Ambient", "Dark Trailer", "Clean Podcast"];
const SFX_BEDS = ["None", "Soft Risers", "Interface Hits", "Impact Trailer"];

function engineVoiceId(engine: VoiceEngine, voice: (typeof VOICES)[number]) {
  if (engine === "local") return voice.id;
  if (engine === "openai") return voice.openai;
  if (engine === "google") return voice.google;
  return voice.id;
}

function engineLabel(engine: VoiceEngine) {
  if (engine === "local") return "Local";
  if (engine === "elevenlabs") return "ElevenLabs";
  if (engine === "openai") return "OpenAI";
  return "Google";
}

function estimateDuration(script: string, pace: number) {
  const words = script.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 145 * Math.max(0.65, pace / 100);
  return Math.max(3, Math.round((words / wordsPerMinute) * 60));
}

function Waveform({ values, active, compact = false }: { values: number[]; active: boolean; compact?: boolean }) {
  return (
    <div
      className={`flex items-center gap-1 rounded-2xl border border-amber-200/15 bg-black/45 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_34px_rgba(0,212,255,0.08)] ${
        compact ? "h-12" : "h-28"
      }`}
    >
      {values.map((value, index) => (
        <motion.div
          key={index}
          animate={{
            height: active
              ? [`${value * 0.42}%`, `${Math.min(100, value + 22)}%`, `${value * 0.58}%`]
              : `${value}%`,
          }}
          transition={{ duration: 0.8 + (index % 8) * 0.035, repeat: active ? Infinity : 0, ease: "easeInOut" }}
          className="flex-1 rounded-full bg-gradient-to-t from-cyan-300 via-violet-300 to-fuchsia-300 opacity-90 shadow-[0_0_16px_rgba(0,212,255,0.3)]"
        />
      ))}
    </div>
  );
}

function CompactSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number[];
  onChange: (value: number[]) => void;
}) {
  const safeValue = getSliderNumber(value, 50, 0, 120);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] font-semibold text-white/58">{label}</Label>
        <span className="text-[11px] font-black text-cyan-100">{safeValue}%</span>
      </div>
      <Slider
        value={getSliderTuple(value, 50, 0, 120)}
        min={0}
        max={120}
        step={1}
        onValueChange={(nextValue) => onChange(getSliderTuple(nextValue, safeValue, 0, 120))}
      />
    </div>
  );
}

function GaugeRing({ label, value, tone }: { label: string; value: number; tone: "cyan" | "violet" | "gold" }) {
  const color = tone === "cyan" ? "#00D4FF" : tone === "violet" ? "#A855F7" : "#FFC857";
  return (
    <div className="text-center">
      <div
        className="mx-auto grid size-16 place-items-center rounded-full border border-white/10 shadow-[0_0_28px_rgba(168,85,247,0.18)]"
        style={{ background: `conic-gradient(${color} ${value * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
      >
        <div className="grid size-12 place-items-center rounded-full bg-[#05080d] text-sm font-black text-white">{value}%</div>
      </div>
      <p className="mt-2 text-[11px] font-semibold text-white/58">{label}</p>
    </div>
  );
}

function VoiceSectionTitle({ icon: Icon, label }: { icon: typeof Mic2; label: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg border border-amber-200/20 bg-amber-300/8 text-amber-100">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-100/80">{label}</p>
      </div>
      <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(0,212,255,0.9)]" />
    </div>
  );
}

export function VoiceStudio() {
  const {
    draftPrompt,
    setDraftPrompt,
    settings,
    updateSettings,
    brandVoice,
    voiceOvers,
    addVoiceOver,
    removeVoiceOver,
    setActiveTab,
  } = useAxsStore();
  const character = useActiveCharacter();
  const proof = useAxsProofSummary();
  const { bible, storyBeats, characters: universeCharacters, selectedCharacterId } = useUniverseForgeStore();
  const selectedUniverseCharacter = universeCharacters.find((item) => item.id === selectedCharacterId);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [script, setScript] = useState(
    draftPrompt ||
      "Welcome to Night City. Power is survival. Style is armor. And tonight, the universe remembers who built it."
  );
  const [activeVoiceId, setActiveVoiceId] = useState(VOICES[0].id);
  const [previewVoiceId, setPreviewVoiceId] = useState<string | null>(null);
  const [engine, setEngine] = useState<VoiceEngine>(settings.voiceEngine);
  const [pace, setPace] = useState([104]);
  const [pitch, setPitch] = useState([48]);
  const [stability, setStability] = useState([82]);
  const [clarity, setClarity] = useState([91]);
  const [warmth, setWarmth] = useState([84]);
  const [variation, setVariation] = useState([42]);
  const [musicLayer, setMusicLayer] = useState(true);
  const [sfxLayer, setSfxLayer] = useState(false);
  const [musicBed, setMusicBed] = useState(MUSIC_BEDS[0]);
  const [sfxBed, setSfxBed] = useState(SFX_BEDS[0]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [emotions, setEmotions] = useState<Record<string, number>>(defaultEmotions);
  const [emphasisWords, setEmphasisWords] = useState<string[]>(["power", "survival", "universe"]);
  const [cloneSlots, setCloneSlots] = useState<string[]>([]);

  const activeVoice = VOICES.find((voice) => voice.id === activeVoiceId) ?? VOICES[0];
  const previewVoice = VOICES.find((voice) => voice.id === previewVoiceId);
  const paceValue = getSliderNumber(pace, 104, 0, 120);
  const pitchValue = getSliderNumber(pitch, 48, 0, 120);
  const stabilityValue = getSliderNumber(stability, 82, 0, 120);
  const clarityValue = getSliderNumber(clarity, 91, 0, 120);
  const warmthValue = getSliderNumber(warmth, 84, 0, 120);
  const waveform = useMemo(() => createWaveform(`${script}-${activeVoice.name}-${paceValue}`, 64), [script, activeVoice.name, paceValue]);
  const previewWaveform = useMemo(
    () => createWaveform(`${previewVoice?.name ?? activeVoice.name}-preview`, 32),
    [activeVoice.name, previewVoice?.name]
  );
  const duration = estimateDuration(script, paceValue);
  const dominantEmotion = Object.entries(emotions).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] ?? "cinematic";
  const brandVoiceScore = proof.categories.brandVoice.score;
  const distributionScore = proof.categories.distribution.score;

  const highlightedScript = useMemo(() => {
    const words = script.split(/(\s+)/);
    return words.map((word, index) => {
      const clean = word.toLowerCase().replace(/[^a-z0-9']/g, "");
      if (!emphasisWords.includes(clean)) return <span key={`${word}-${index}`}>{word}</span>;
      return (
        <mark key={`${word}-${index}`} className="rounded bg-cyan-300/16 px-1 text-cyan-100">
          {word}
        </mark>
      );
    });
  }, [script, emphasisWords]);

  const engineOptions: Array<{ id: VoiceEngine; label: string; desc: string }> = [
    { id: "local", label: "Local Open Source", desc: "XTTS / OpenVoice / Piper" },
    { id: "elevenlabs", label: "ElevenLabs", desc: "Optional realism engine" },
    { id: "openai", label: "OpenAI", desc: "Fast fallback" },
    { id: "google", label: "Google", desc: "Neural TTS fallback" },
  ];

  const magicMatch = () => {
    const lower = script.toLowerCase();
    const selected =
      lower.includes("power") || lower.includes("dominate")
        ? VOICES[0]
        : lower.includes("intimate") || lower.includes("desire") || lower.includes("luxury")
          ? VOICES[1]
          : VOICES[2];
    const extractedWords = Array.from(
      new Set(
        script
          .toLowerCase()
          .split(/\W+/)
          .filter((word) => word.length > 5)
          .slice(0, 5)
      )
    );

    setActiveVoiceId(selected.id);
    setEmphasisWords(extractedWords.length ? extractedWords : ["power", "survival", "universe"]);
    setEmotions({
      confident: lower.includes("power") || lower.includes("win") ? 90 : 74,
      authoritative: lower.includes("strategy") || lower.includes("dominate") ? 88 : 70,
      cinematic: lower.includes("city") || lower.includes("universe") ? 94 : 82,
      seductive: lower.includes("desire") || lower.includes("luxury") ? 78 : 36,
      energetic: lower.includes("launch") || lower.includes("fast") ? 78 : 48,
      dramatic: lower.includes("war") || lower.includes("survival") ? 84 : 62,
    });
    toast.success("Magic Match complete", {
      description: `${selected.name} selected with tone, emphasis, and emotion mapped to the script.`,
    });
  };

  const generate = async () => {
    if (!script.trim()) return toast.error("Add a script before generating voice over.");
    setGenerating(true);
    setProgress(8);
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(94, current + 7));
    }, 180);

    try {
      const response = await generateVoiceOver({
        script,
        engine,
        voiceId: engineVoiceId(engine, activeVoice),
        voiceName: activeVoice.name,
        settings: { ...settings, voiceEngine: engine },
        stability: stabilityValue,
        clarity: clarityValue,
        pace: paceValue,
        pitch: pitchValue,
        emotions,
      });

      setProgress(100);
      addVoiceOver({
        id: crypto.randomUUID(),
        title: `${activeVoice.name} - ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        script,
        engine,
        voiceId: engineVoiceId(engine, activeVoice),
        voiceName: activeVoice.name,
        audioUrl: response.audioUrl,
        durationSeconds: duration,
        waveform,
        emotions,
        createdAt: Date.now(),
        status: response.status,
      });

      if (response.status === "ready") {
        toast.success("Voice over rendered", { description: `${activeVoice.name} is ready for preview and video sync.` });
      } else if (response.status === "mock") {
        toast.info("Studio preview created", { description: response.message });
      } else {
        toast.error("Voice generation failed", { description: response.message });
      }
    } catch (error) {
      toast.error("Voice generation failed", {
        description: error instanceof Error ? error.message : "Unknown voice engine error",
      });
    } finally {
      window.clearInterval(timer);
      setGenerating(false);
      window.setTimeout(() => setProgress(0), 700);
    }
  };

  const pullScript = () => {
    setScript(draftPrompt || "Paste a Script Forge output here. Voice Studio will match tone, character, and pacing.");
    toast.success("Current script pulled into Voice Studio");
  };

  const pullUniverseScript = () => {
    const beat = storyBeats[0];
    const next = beat
      ? `${bible.title}: ${beat.title}\n\n${beat.scenePrompt}\n\nPerformance note: ${beat.emotionalShift}. Required characters: ${beat.requiredCharacterIds.join(", ")}. Continuity: ${beat.continuityNotes}`
      : `${bible.title}\n\n${bible.logline}\n\nTone: ${bible.tone}. Visual style: ${bible.visualStyle}. Narrate this universe with premium cinematic restraint.`;
    setScript(next);
    toast.success("Universe Forge scene pulled into Voice Studio");
  };

  const sendToMotion = () => {
    setDraftPrompt(
      `${script}\n\nVoice sync: ${activeVoice.name}, ${activeVoice.tone}, ${duration}s. Emotion: ${dominantEmotion}. Music bed: ${musicLayer ? musicBed : "none"}. Match video pacing to narration.`
    );
    setActiveTab("videos");
    toast.success("Voice direction sent to Video Studio");
  };

  const addToCampaign = () => {
    setDraftPrompt(`${script}\n\nUse this voice over as the campaign narration. Voice: ${activeVoice.name}. Emotion: ${dominantEmotion}.`);
    setActiveTab("campaign");
    toast.success("Voice over brief added to Campaign");
  };

  const handleCloneUpload = (files: FileList | null) => {
    if (!files?.length) return;
    setCloneSlots((slots) => [files[0].name, ...slots].slice(0, 4));
    toast.success("Voice clone reference added", { description: files[0].name });
  };

  return (
    <div className="space-y-4 pb-10">
      <section className="grid gap-4 xl:grid-cols-[minmax(260px,0.85fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Voice</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-white">Voice</h1>
          <p className="mt-1 text-sm text-white/60">Design. Refine. Perform. Your voice is your signature.</p>
        </div>
        <CommandPanel className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-4">
          <CommandMetric label="Voice Profiles" value="7" detail="Active" tone="cyan" />
          <CommandMetric label="Voice Overs" value="1.24B" detail="This Month" tone="violet" />
          <CommandMetric label="Avg. Quality" value="92%" detail="High Consistency" tone="gold" />
          <CommandMetric label="Latency" value="210ms" detail="Real-time" tone="cyan" />
        </CommandPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <CommandPanel className="p-4">
          <VoiceSectionTitle icon={Mic2} label="Voice Profile" />
          <div className="flex gap-4">
            <div className="grid size-24 shrink-0 place-items-center rounded-full bg-[conic-gradient(from_180deg,rgba(0,212,255,0.9),rgba(168,85,247,0.9),rgba(255,200,87,0.8),rgba(0,212,255,0.9))] p-[2px] shadow-[0_0_42px_rgba(168,85,247,0.45)]">
              <div className="grid size-full place-items-center rounded-full bg-[#05080d]">
                <Headphones className="h-9 w-9 text-cyan-200" />
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-white">{activeVoice.name}</h2>
              <p className="mt-1 text-sm text-white/50">Powerful, confident, immersive. Deep male tone with futuristic grit and clarity.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-lg border border-cyan-200/20 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-bold text-cyan-100">{engineLabel(engine)}</span>
                <span className="rounded-lg border border-amber-200/20 bg-amber-300/10 px-2.5 py-1 text-[11px] font-bold text-amber-100">{activeVoice.match}% match</span>
              </div>
            </div>
          </div>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mt-5 h-10 w-full rounded-xl border-amber-200/25 bg-black/30 text-amber-100 hover:bg-amber-200/10">
            Edit Profile <Upload className="h-4 w-4" />
          </Button>
          <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={(event) => handleCloneUpload(event.target.files)} />
        </CommandPanel>

        <CommandPanel className="p-4">
          <VoiceSectionTitle icon={SlidersHorizontal} label="Tone & Emotion" />
          <div className="grid grid-cols-2 gap-2">
            {EMOTIONS.map((emotion) => (
              <button
                key={emotion}
                onClick={() =>
                  setEmotions((current) => ({
                    ...current,
                    [emotion]: Math.min(100, Math.max(0, current[emotion] + (emotion === dominantEmotion ? -12 : 12))),
                  }))
                }
                className={`rounded-xl border px-3 py-2 text-xs font-bold capitalize transition ${
                  emotion === dominantEmotion
                    ? "border-cyan-200/40 bg-cyan-300/15 text-cyan-100 shadow-[0_0_22px_rgba(0,212,255,0.2)]"
                    : "border-white/10 bg-black/30 text-white/58 hover:border-amber-200/25 hover:text-white"
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold text-white/58">Emotional intensity</Label>
              <span className="text-[11px] font-black text-cyan-100">{emotions[dominantEmotion]}%</span>
            </div>
            <Slider
              value={[emotions[dominantEmotion]]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) =>
                setEmotions((current) => ({ ...current, [dominantEmotion]: getSliderNumber(value, current[dominantEmotion], 0, 100) }))
              }
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button onClick={magicMatch} variant="outline" className="h-10 rounded-xl border-violet-200/25 bg-violet-300/10 text-violet-100 hover:bg-violet-300/15">
              Magic Match <Wand2 className="h-4 w-4" />
            </Button>
            <Button onClick={pullUniverseScript} variant="outline" className="h-10 rounded-xl border-amber-200/25 bg-amber-300/10 text-amber-100 hover:bg-amber-300/15">
              Universe <Crown className="h-4 w-4" />
            </Button>
          </div>
        </CommandPanel>

        <CommandPanel className="p-4">
          <VoiceSectionTitle icon={Gauge} label="Rhythm & Pacing" />
          <div className="space-y-4">
            <CompactSlider label="Speaking Rate" value={pace} onChange={setPace} />
            <CompactSlider label="Pause Strength" value={pitch} onChange={setPitch} />
            <CompactSlider label="Variation" value={variation} onChange={setVariation} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={() => setMusicLayer((value) => !value)}
              className={`rounded-xl border p-3 text-left transition ${musicLayer ? "border-cyan-200/35 bg-cyan-300/12" : "border-white/10 bg-black/30"}`}
            >
              <Music2 className="h-4 w-4 text-cyan-200" />
              <p className="mt-2 text-xs font-black text-white">Music</p>
              <p className="truncate text-[11px] text-white/42">{musicLayer ? musicBed : "Off"}</p>
            </button>
            <button
              onClick={() => setSfxLayer((value) => !value)}
              className={`rounded-xl border p-3 text-left transition ${sfxLayer ? "border-violet-200/35 bg-violet-300/12" : "border-white/10 bg-black/30"}`}
            >
              <Layers3 className="h-4 w-4 text-violet-200" />
              <p className="mt-2 text-xs font-black text-white">SFX</p>
              <p className="truncate text-[11px] text-white/42">{sfxLayer ? sfxBed : "Off"}</p>
            </button>
          </div>
        </CommandPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <CommandPanel className="p-4">
          <VoiceSectionTitle icon={AudioLines} label="Voice Samples" />
          <div className="rounded-2xl border border-cyan-200/15 bg-black/35 p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewVoiceId((current) => (current ? null : activeVoice.id))}
                className="grid size-11 place-items-center rounded-full border border-cyan-200/25 bg-cyan-300/12 text-cyan-100 shadow-[0_0_24px_rgba(0,212,255,0.18)]"
              >
                {previewVoiceId ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <div className="min-w-0 flex-1">
                <Waveform values={previewWaveform} active={Boolean(previewVoiceId)} compact />
              </div>
              <span className="text-xs font-bold text-white/42">00:16</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">{activeVoice.shortName}_voiceover_01</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-10 rounded-xl border-amber-200/25 bg-black/30 text-amber-100 hover:bg-amber-300/10">
              Upload Sample <Plus className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-10 rounded-xl border-white/10 bg-black/30 text-white/70 hover:bg-white/10">
              Clone Slots {cloneSlots.length}
            </Button>
          </div>
        </CommandPanel>

        <CommandPanel className="p-4">
          <VoiceSectionTitle icon={FileText} label="Script-to-Voice" />
          <Textarea
            value={script}
            onChange={(event) => setScript(event.target.value)}
            className="min-h-[142px] resize-none rounded-2xl border-amber-200/15 bg-black/45 text-sm leading-6 text-white placeholder:text-white/24 focus-visible:ring-cyan-300/25"
          />
          <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-5 text-white/50">
            {highlightedScript}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setDraftPrompt(script)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold text-white/62"
            >
              <Check className="h-3.5 w-3.5 text-cyan-200" />
              Auto Captions
            </button>
            <Button onClick={generate} disabled={generating} className="h-10 rounded-xl bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 px-4 font-black text-black">
              {generating ? `${progress}%` : "Generate Voice"} <AudioLines className="h-4 w-4" />
            </Button>
          </div>
        </CommandPanel>

        <CommandPanel className="p-4">
          <VoiceSectionTitle icon={Bot} label="Performance Controls" />
          <div className="grid grid-cols-3 gap-3">
            <GaugeRing label="Stability" value={stabilityValue} tone="cyan" />
            <GaugeRing label="Clarity" value={clarityValue} tone="violet" />
            <GaugeRing label="Warmth" value={warmthValue} tone="gold" />
          </div>
          <div className="mt-5 space-y-3">
            <CompactSlider label="Stability" value={stability} onChange={setStability} />
            <CompactSlider label="Clarity" value={clarity} onChange={setClarity} />
            <CompactSlider label="Warmth" value={warmth} onChange={setWarmth} />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {engineOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setEngine(option.id);
                  updateSettings({ voiceEngine: option.id });
                }}
                className={`rounded-xl border px-2 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition ${
                  engine === option.id ? "border-cyan-200/40 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-black/30 text-white/44"
                }`}
                title={option.desc}
              >
                {option.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </CommandPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,28%)]">
        <CommandPanel className="p-4 min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <VoiceSectionTitle icon={FileAudio} label="Generated Voiceovers" />
            <span className="text-xs font-bold text-white/50">{voiceOvers.length} saved</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {voiceOvers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-200/18 bg-black/30 p-5 text-sm text-white/44 lg:col-span-3">
                No renders yet. Generate a sample and the history appears here for reuse, download, campaign, and video sync.
              </div>
            ) : (
              voiceOvers.slice(0, 6).map((voiceOver) => (
                <div key={voiceOver.id} className="rounded-2xl border border-amber-200/14 bg-black/35 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{voiceOver.title}</p>
                      <p className="mt-1 text-[11px] text-white/38">
                        {voiceOver.voiceName} - {voiceOver.durationSeconds}s
                      </p>
                    </div>
                    <button onClick={() => setPlayingId((current) => (current === voiceOver.id ? null : voiceOver.id))} className="grid size-8 shrink-0 place-items-center rounded-full border border-cyan-200/20 bg-cyan-300/10">
                      {playingId === voiceOver.id ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="mt-3 flex h-9 items-end gap-0.5">
                    {voiceOver.waveform.slice(0, 28).map((value, index) => (
                      <div key={index} className="flex-1 rounded-full bg-cyan-200/55" style={{ height: `${value}%` }} />
                    ))}
                  </div>
                  {voiceOver.audioUrl && playingId === voiceOver.id ? (
                    <audio src={voiceOver.audioUrl} autoPlay controls className="mt-3 w-full" onEnded={() => setPlayingId(null)} />
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setScript(voiceOver.script)} className="h-7 rounded-lg border-white/10 bg-black/30 text-xs text-white/70">
                      Reuse
                    </Button>
                    {voiceOver.audioUrl ? (
                      <a
                        href={voiceOver.audioUrl}
                        download={`${voiceOver.title}.mp3`}
                        className="inline-flex h-7 items-center justify-center rounded-lg border border-white/10 bg-black/30 px-2 text-xs font-medium text-white/70"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                    <Button size="sm" variant="outline" onClick={() => removeVoiceOver(voiceOver.id)} className="h-7 rounded-lg border-white/10 bg-black/30 text-xs text-white/70">
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CommandPanel>

        <CommandPanel className="p-4">
          <VoiceSectionTitle icon={RadioTower} label="Engine + Routing" />
          <div className="space-y-3">
            <Input value={settings.localVoiceUrl} onChange={(event) => updateSettings({ localVoiceUrl: event.target.value })} placeholder="Local XTTS/OpenVoice URL" className="h-10 rounded-xl border-amber-200/15 bg-black/40 text-white" />
            <Input type="password" value={settings.elevenLabsApiKey} onChange={(event) => updateSettings({ elevenLabsApiKey: event.target.value })} placeholder="Optional ElevenLabs key" className="h-10 rounded-xl border-amber-200/15 bg-black/40 text-white" />
            <Input type="password" value={settings.openaiApiKey} onChange={(event) => updateSettings({ openaiApiKey: event.target.value })} placeholder="Optional OpenAI key" className="h-10 rounded-xl border-amber-200/15 bg-black/40 text-white" />
            <Input type="password" value={settings.googleTtsApiKey} onChange={(event) => updateSettings({ googleTtsApiKey: event.target.value })} placeholder="Optional Google key" className="h-10 rounded-xl border-amber-200/15 bg-black/40 text-white" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button onClick={pullScript} variant="outline" className="h-10 rounded-xl border-white/10 bg-black/30 text-white/70">
              Pull Script <FileText className="h-4 w-4" />
            </Button>
            <Button
              onClick={async () => {
                const copied = await copyToClipboard(script);
                if (copied) toast.success("Script copied");
                else toast.error("Clipboard unavailable");
              }}
              variant="outline"
              className="h-10 rounded-xl border-white/10 bg-black/30 text-white/70"
            >
              Copy <Copy className="h-4 w-4" />
            </Button>
            <Button onClick={sendToMotion} variant="outline" className="h-10 rounded-xl border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
              Video <Clapperboard className="h-4 w-4" />
            </Button>
            <Button onClick={addToCampaign} variant="outline" className="h-10 rounded-xl border-violet-200/20 bg-violet-300/10 text-violet-100">
              Campaign <Send className="h-4 w-4" />
            </Button>
          </div>
        </CommandPanel>
      </section>

      <div className="sticky bottom-3 z-20 mx-auto flex w-fit items-center gap-2 rounded-2xl border border-amber-200/20 bg-black/70 p-2 shadow-[0_0_42px_rgba(168,85,247,0.26),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl">
        <Button size="sm" variant="outline" className="rounded-xl border-white/10 bg-black/30 text-white/70">
          <Volume2 className="h-4 w-4" /> Overview
        </Button>
        <Button size="sm" onClick={generate} disabled={generating} className="rounded-xl bg-gradient-to-r from-cyan-300 to-violet-300 font-black text-black">
          {generating ? `${progress}%` : "Generate"}
        </Button>
        <Button size="sm" variant="outline" onClick={addToCampaign} className="rounded-xl border-white/10 bg-black/30 text-white/70">
          Add to Script
        </Button>
        <span className="rounded-xl border border-cyan-200/15 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100">
          Brand {brandVoiceScore}% - Dist {distributionScore}%
        </span>
      </div>
    </div>
  );
}

export default VoiceStudio;
