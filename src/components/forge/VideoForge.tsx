import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  CircleDot,
  Clock,
  Copy,
  Download,
  Eye,
  Film,
  Focus,
  Lock,
  Orbit,
  Play,
  RefreshCw,
  Route,
  Sparkles,
  SwitchCamera,
  User as UserIcon,
  Video,
  WandSparkles,
  Wind,
  Zap,
} from "lucide-react";
import { Button } from "../ui/button";
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
import { getSliderNumber } from "../../lib/sliderValue";
import { copyToClipboard } from "../../lib/safeClipboard";
import { resolveVideoWorkflowProfile } from "../../lib/workflowRegistry";
import { useAxsProofSummary } from "../../lib/useAxsProofSummary";
import { useActiveCharacter, useAxsStore } from "../../store/useAxsStore";
import { forgeVideoAsync, pollVideo } from "../../lib/workflows";
import { ProofBadge } from "../platform/ProofBadge";
import { CommandMetric } from "../command/CommandDeck";

const MOTION_PRESETS = [
  {
    id: "slow_push",
    label: "Slow Push-In",
    sublabel: "Intimate dolly toward subject",
    Icon: ArrowRight,
    recommended: true,
    prompt: "slow cinematic dolly push-in toward subject, shallow depth of field, smooth and intentional camera movement",
    accent: "from-[#F6D57A] to-[#8B6F2F]",
  },
  {
    id: "orbit_rise",
    label: "Orbit + Rise",
    sublabel: "Elegant reveal arc",
    Icon: ArrowUpRight,
    prompt: "smooth orbital camera arcing upward while circling the subject, rising reveal, elegant ascending arc motion",
    accent: "from-[#F6D57A] to-violet-200/60",
  },
  {
    id: "dolly_zoom",
    label: "Dolly Zoom",
    sublabel: "Perspective tension",
    Icon: SwitchCamera,
    prompt: "hitchcock dolly zoom effect, background perspective shifts while subject stays same size in frame, vertigo effect",
    accent: "from-[#F6D57A] to-rose-200/55",
  },
  {
    id: "low_hero",
    label: "Low Hero",
    sublabel: "Power angle tilt",
    Icon: ArrowUp,
    prompt: "low angle hero shot looking up at subject, dramatic upward tilt, empowering perspective, wide lens",
    accent: "from-amber-200 to-orange-300",
  },
  {
    id: "over_shoulder",
    label: "Over Shoulder",
    sublabel: "Intimate foreground frame",
    Icon: CircleDot,
    prompt: "over-the-shoulder shot framing subject from behind and to the side, intimate perspective, foreground blur",
    accent: "from-emerald-200 to-teal-300",
  },
  {
    id: "orbit",
    label: "Orbit 360",
    sublabel: "Controlled circular move",
    Icon: Orbit,
    prompt: "smooth orbital camera movement circling the subject 90 degrees, maintaining focus, elegant arc motion",
    accent: "from-[#F6D57A] to-cyan-200/55",
  },
  {
    id: "handheld",
    label: "Handheld",
    sublabel: "Natural kinetic energy",
    Icon: Route,
    prompt: "authentic handheld camera movement, slight natural shake, documentary-style immediacy, intimate and real",
    accent: "from-yellow-200 to-amber-300",
  },
  {
    id: "drone",
    label: "Drone Descent",
    sublabel: "Scale to subject reveal",
    Icon: ArrowDown,
    prompt: "aerial drone slowly descending and tilting down to reveal subject, sweeping wide-to-close movement, cinematic scale",
    accent: "from-[#F6D57A] to-cyan-200/55",
  },
  {
    id: "tracking",
    label: "Tracking Shot",
    sublabel: "Parallel motion",
    Icon: ArrowDownRight,
    prompt: "side-tracking camera following subject movement, steady glide, parallel motion, cinematic production",
    accent: "from-[#F6D57A] to-fuchsia-200/55",
  },
  {
    id: "static",
    label: "Locked Frame",
    sublabel: "Tripod precision",
    Icon: Focus,
    prompt: "locked-off static camera, tripod-mounted, no camera movement, all motion from subject, clean and focused",
    accent: "from-zinc-200 to-slate-300",
  },
];

const SHOT_STYLES = [
  { id: "cinematic", label: "Cinematic", suffix: "anamorphic lens, 24fps, film grain, cinematic color grade" },
  { id: "ugc", label: "UGC / Real", suffix: "handheld iPhone-style, natural lighting, authentic feel, no color grade" },
  { id: "commercial", label: "Commercial", suffix: "professional commercial production, clean lighting, brand-safe aesthetic" },
  { id: "editorial", label: "Editorial", suffix: "fashion editorial motion, dramatic lighting, high-contrast aesthetic" },
];

const FRAME_RATES = [
  { value: "24", label: "24fps Cinematic" },
  { value: "30", label: "30fps Broadcast" },
  { value: "60", label: "60fps Smooth / HFR" },
];

const PHYSICS_PROMPTS: Record<string, string> = {
  hair_cloth: "natural hair and cloth physics, realistic fabric draping and movement",
  body_movement: "subtle natural body bounce and sway, realistic weight and motion",
  wind: "gentle wind interaction with hair and clothes, flowing natural movement",
  breath: "subtle breathing micro-movements, natural chest rise and fall, lifelike stillness",
};

function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "axs-panel axs-panel-corners relative overflow-hidden rounded-2xl border-[var(--axs-gold-border)] bg-[#080808]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_26px_90px_rgba(0,0,0,0.48),0_0_42px_rgba(212,175,55,0.08)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[rgba(246,213,122,0.72)] before:to-transparent",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-32 top-8 size-[30rem] rounded-full bg-[#D4AF37]/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute -left-36 bottom-4 size-[32rem] rounded-full bg-[#8B6F2F]/[0.055] blur-3xl" />
      <div className="relative">{children}</div>
    </section>
  );
}

export const VideoForge = () => {
  const { settings, updateSettings, addToGallery, setActiveTab } = useAxsStore();
  const character = useActiveCharacter();
  const proof = useAxsProofSummary();
  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [generating, setGenerating] = useState(false);
  const [progressNote, setProgressNote] = useState("");
  const [lastResultUrl, setLastResultUrl] = useState<string | null>(null);
  const [motionPreset, setMotionPreset] = useState("slow_push");
  const [shotStyle, setShotStyle] = useState("cinematic");
  const [frameRate, setFrameRate] = useState("24");
  const [faceLocked, setFaceLocked] = useState(Boolean(character));
  const [faceLockStrength, setFaceLockStrength] = useState(0.9);
  const [motionConsistency, setMotionConsistency] = useState(0.75);
  const [maintainExactFace, setMaintainExactFace] = useState(Boolean(character));
  const [useLockedCharacter, setUseLockedCharacter] = useState(true);
  const [motionBlur, setMotionBlur] = useState(true);
  const [physics, setPhysics] = useState({
    hair_cloth: true,
    body_movement: true,
    wind: false,
    breath: true,
  });

  const hasVideoEndpoint = Boolean(settings.runpodVideoEndpointId);
  const workflowProfile = resolveVideoWorkflowProfile(settings.videoModel);
  const selectedMotion = MOTION_PRESETS.find((preset) => preset.id === motionPreset) ?? MOTION_PRESETS[0];
  const selectedStyle = SHOT_STYLES.find((style) => style.id === shotStyle) ?? SHOT_STYLES[0];
  const activePhysics = Object.entries(physics).filter(([, enabled]) => enabled).length;
  const workflowDetail = proof.categories.workflow.signals.find((signal) => signal.id === "workflow-video-profile")?.detail ?? proof.categories.workflow.signals[0]?.detail;

  const buildFullPrompt = () => {
    const physicsTerms = Object.entries(physics)
      .filter(([, enabled]) => enabled)
      .map(([key]) => PHYSICS_PROMPTS[key])
      .filter(Boolean);

    return [
      prompt.trim(),
      selectedMotion.prompt,
      selectedStyle.suffix,
      faceLocked && maintainExactFace ? `exact face consistency, identity preservation, face lock strength ${faceLockStrength.toFixed(2)}` : null,
      useLockedCharacter && character ? `locked Character DNA: ${character.name}` : null,
      `motion consistency ${motionConsistency.toFixed(2)}`,
      motionBlur ? "natural motion blur on movement, cinematic shutter" : "sharp crisp motion, minimal motion blur",
      frameRate === "60" ? "60fps smooth high frame rate" : null,
      ...physicsTerms,
    ]
      .filter(Boolean)
      .join(". ");
  };

  const fullPrompt = useMemo(
    buildFullPrompt,
    [prompt, selectedMotion, selectedStyle, faceLocked, maintainExactFace, faceLockStrength, useLockedCharacter, character, motionConsistency, motionBlur, frameRate, physics]
  );

  const togglePhysics = (key: keyof typeof physics) => setPhysics((current) => ({ ...current, [key]: !current[key] }));

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error("Describe the shot.");
    if (!hasVideoEndpoint) {
      toast.error("Video endpoint not set", {
        description: "Add your RunPod video endpoint ID in Settings.",
      });
      return;
    }

    setGenerating(true);
    setProgressNote(`Submitting ${workflowProfile.title} direction package...`);
    setLastResultUrl(null);
    try {
      const { id } = await forgeVideoAsync({
        prompt: fullPrompt,
        negativePrompt: negative,
        character: useLockedCharacter ? character : null,
        settings,
      });
      setProgressNote(`Job ${id.slice(0, 8)} queued`);
      interface RunPodVideoResult { video?: string; url?: string; output?: { video?: string } }
      const out = await pollVideo(id, (status, attempt) => {
        setProgressNote(`${status} · ${Math.min(98, attempt * 7)}% estimated`);
      }) as RunPodVideoResult;
      const videoUrl = out?.video || out?.url || out?.output?.video;
      if (!videoUrl) throw new Error("No video URL in response");
      setLastResultUrl(videoUrl);
      addToGallery({
        id: crypto.randomUUID(),
        type: "video",
        url: videoUrl,
        prompt: fullPrompt,
        characterId: character?.id,
        stylePreset: settings.stylePreset,
        createdAt: Date.now(),
        favorite: false,
      });
      toast.success("Video ready");
    } catch (error) {
      toast.error("Video forge failed", {
        description: error instanceof Error ? error.message : "Unknown generation error",
      });
    } finally {
      setGenerating(false);
      setProgressNote("");
    }
  };

  return (
    <div className="axs-module-page text-white">
      <div className="hidden" />
      <div className="hidden" />
      <svg className="hidden" viewBox="0 0 1400 1200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="videoForgeEnergyLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="35%" stopColor="#F6D57A" stopOpacity=".70" />
            <stop offset="70%" stopColor="#D4AF37" stopOpacity=".58" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          <filter id="videoForgeGlowLine"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path d="M-80 260 C 280 160, 470 360, 730 300 S 1080 150, 1510 230" stroke="url(#videoForgeEnergyLine)" strokeWidth="3" fill="none" filter="url(#videoForgeGlowLine)" />
        <path d="M-90 760 C 260 620, 470 790, 760 705 S 1120 540, 1510 620" stroke="url(#videoForgeEnergyLine)" strokeWidth="2.5" fill="none" filter="url(#videoForgeGlowLine)" />
      </svg>

      <div className="relative z-10 w-full min-w-0">
        <section className="mb-5 w-full rounded-[28px] border border-amber-300/20 bg-slate-950/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-200/70">AI Innovation Studio</p>
              <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">Cinematic motion studio</h1>
              <p className="mt-3 max-w-3xl text-slate-300">Generate polished scenes, trailers, ads, and story-driven clips with complete creative control.</p>
            </div>
          <div className="flex flex-wrap gap-2">
            {["Quick Start", "Storyboard", "Shot Builder", "Motion Lab", "Character Lock"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    if (item === "Quick Start") setPrompt("A premium black and gold cinematic studio shot with controlled camera motion, elegant lighting, and strong character continuity.");
                    if (item === "Storyboard") setActiveTab("scene");
                    if (item === "Character Lock") setActiveTab("dna");
                    if (item === "Motion Lab") setMotionPreset("dolly-in");
                    toast.success(`${item} selected`, { description: "Video Forge updated the local motion workspace." });
                  }}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-200"
                >
                  {item}
                </button>
            ))}
            </div>
          </div>
        </section>
        <section className="mx-auto mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CommandMetric label="Active projects" value="12" delta="+3 this week" Icon={Film} accent="cyan" />
          <CommandMetric label="Workflow" value={workflowProfile.title.replace(" Workflow", "")} delta={workflowProfile.gpuFit} Icon={Video} accent="violet" />
          <CommandMetric label="Motion preset" value={MOTION_PRESETS.find((preset) => preset.id === motionPreset)?.label ?? "Custom"} delta={`${frameRate} fps`} Icon={SwitchCamera} accent="gold" />
          <CommandMetric label="Proof score" value={`${proof.overallScore}%`} delta={proof.status} Icon={Lock} accent="cyan" />
        </section>
        <main className="mx-auto grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(28rem,1fr)] 2xl:grid-cols-[minmax(0,0.94fr)_minmax(32rem,1.06fr)]">
          <div className="min-w-0 space-y-5">
            <GlassPanel className="rounded-[34px] p-6 lg:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200/14 bg-fuchsia-300/[0.07] px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-fuchsia-100/64 shadow-[0_0_34px_rgba(192,38,211,0.12)]">
                <Video className="size-4" />
                Motion Studio
              </div>
              <h1 className="mt-7 text-[clamp(2.5rem,4.4vw,4.9rem)] font-black leading-[.94] tracking-tight text-white">
                Director motion studio.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/58">
                Compose character-consistent video with {workflowProfile.title}, cinematic camera language, physics cues, motion pacing, and locked DNA continuity.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <ProofBadge label="Workflow Fit" score={proof.categories.workflow.score} status={proof.categories.workflow.status} />
                <ProofBadge label="DNA Proof" score={proof.categories.identity.score} status={proof.categories.identity.status} />
                <ProofBadge label="Continuity" score={proof.categories.continuity.score} status={proof.categories.continuity.status} />
              </div>
              <div className="mt-4 max-w-2xl">
                <ProofBadge
                  label="Video Workflow Proof"
                  score={proof.categories.workflow.score}
                  status={proof.categories.workflow.status}
                  detail={workflowDetail}
                  variant="full"
                />
              </div>

              {character ? (
                <div className="mt-9 rounded-[38px] border border-white/[0.13] bg-black/32 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_28px_90px_rgba(0,0,0,0.30)]">
                  <div className="flex flex-wrap items-center gap-5">
                    <div className="size-20 overflow-hidden rounded-[28px] border border-cyan-200/20 bg-black/40 shadow-[0_0_34px_rgba(0,212,255,0.14)]">
                      {character.portraitDataUrl ? (
                        <img src={character.portraitDataUrl} alt={character.name} className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-white/30">
                          <UserIcon className="size-7" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/44">Locked Character DNA</div>
                      <div className="mt-1 truncate text-3xl font-black text-white">{character.name}</div>
                      <div className="mt-1 truncate text-sm font-semibold text-white/42">{character.heritage} · seed {character.seed}</div>
                    </div>
                    <ToggleButton label="Use in video" enabled={useLockedCharacter} onClick={() => setUseLockedCharacter(!useLockedCharacter)} />
                    <Button
                      type="button"
                      onClick={() => {
                        setFaceLocked(!faceLocked);
                        setMaintainExactFace(!faceLocked);
                      }}
                      className={cn(
                        "h-12 rounded-full px-5 text-sm font-black",
                        faceLocked ? "bg-cyan-100 text-black hover:bg-white" : "border border-white/12 bg-white/[0.06] text-white hover:bg-white hover:text-black"
                      )}
                    >
                      <Lock className="size-4" />
                      {faceLocked ? "Face Locked" : "Lock Face"}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {faceLocked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 grid gap-5 border-t border-white/[0.10] pt-6 md:grid-cols-2">
                          <ControlSlider label="Face Lock Strength" value={faceLockStrength} min={0.8} max={1} step={0.01} onChange={setFaceLockStrength} />
                          <ControlSlider label="Motion Consistency" value={motionConsistency} min={0.5} max={1} step={0.05} onChange={setMotionConsistency} />
                          <button
                            type="button"
                            onClick={() => setMaintainExactFace(!maintainExactFace)}
                            className="col-span-full rounded-[28px] border border-white/[0.10] bg-white/[0.035] p-4 text-left transition hover:border-white/22"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="text-sm font-black text-white">Maintain Exact Face</div>
                                <div className="mt-1 text-xs font-semibold text-white/40">Inject identity-preserving face lock language into the video prompt.</div>
                              </div>
                              <TogglePill enabled={maintainExactFace} />
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="mt-9 rounded-[34px] border border-amber-300/18 bg-amber-300/[0.055] p-5 text-sm font-semibold leading-6 text-amber-50/76">
                  No locked character selected. Open Character Studio to lock Character DNA, or direct a video without identity binding.
                </div>
              )}
            </GlassPanel>

            {!hasVideoEndpoint && (
              <div className="rounded-[28px] border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-6 text-amber-50/80">
                <AlertTriangle className="mr-2 inline size-4" />
                No video endpoint is set. Add your RunPod video endpoint ID in Settings before rendering.
                <button type="button" onClick={() => setActiveTab("config")} className="ml-3 rounded-full border border-[#F6D57A]/24 bg-[#D4AF37]/10 px-3 py-1 text-xs font-black text-[#F6D57A]">
                  Open Config
                </button>
              </div>
            )}

            <GlassPanel className="p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100/50">
                    <WandSparkles className="size-4" />
                    Direction Controls
                  </div>
                  <h2 className="mt-3 text-4xl font-black tracking-tight text-white">Shot command deck</h2>
                </div>
                <div className="rounded-full border border-white/[0.10] bg-black/28 px-4 py-2 text-xs font-black text-white/44">
                  {workflowProfile.gpuFit === "3080-10gb-safe" ? "RTX 3080 Safe" : settings.videoModel || "ltx-video-2.3"}
                </div>
              </div>

              <div className="mt-8 space-y-8">
                <Field label="Shot description">
                  <Textarea
                    rows={6}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Character turns toward camera with a slow smile, rain-lit neon street, shallow depth of field..."
                    className="mt-3 min-h-48 resize-none rounded-[30px] border-white/[0.12] bg-black/28 px-5 py-5 text-base text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  />
                </Field>

                <div>
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/44">Camera Movement</Label>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {MOTION_PRESETS.map(({ id, label, sublabel, Icon, recommended, accent }) => {
                      const active = motionPreset === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setMotionPreset(id)}
                          className={cn(
                            "group relative overflow-hidden rounded-[30px] border p-4 text-left transition",
                            active ? "border-cyan-200/36 bg-cyan-300/[0.08] shadow-[0_0_40px_rgba(0,212,255,0.14)]" : "border-white/[0.11] bg-black/26 hover:border-white/24"
                          )}
                        >
                          <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80", accent)} />
                          <div className="flex items-center gap-4">
                            <div className={cn("flex size-13 items-center justify-center rounded-[22px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]", active ? "border-cyan-200/24 bg-cyan-200 text-black" : "border-white/10 bg-white/[0.05] text-white")}>
                              <Icon className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <div className="truncate text-base font-black text-white">{label}</div>
                                {recommended && <span className="rounded-full bg-cyan-200 px-2 py-0.5 text-[9px] font-black text-black">BEST</span>}
                              </div>
                              <div className="mt-1 text-xs font-semibold text-white/40">{sublabel}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/44">Shot Style</Label>
                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    {SHOT_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setShotStyle(style.id)}
                        className={cn(
                          "rounded-[24px] border px-4 py-4 text-left text-sm font-black transition",
                          shotStyle === style.id ? "border-violet-200/38 bg-violet-300/[0.10] text-white shadow-[0_0_30px_rgba(168,85,247,0.14)]" : "border-white/[0.11] bg-black/24 text-white/54 hover:border-white/24 hover:text-white"
                        )}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <ControlSlider label="Duration" value={settings.videoDuration} min={2} max={10} step={1} suffix="s" onChange={(value) => updateSettings({ videoDuration: value })} />
                  <ControlSlider label="Motion Intensity" value={settings.videoFluidity} min={0.2} max={1} step={0.05} onChange={(value) => updateSettings({ videoFluidity: value })} />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Frame rate">
                    <Select value={frameRate} onValueChange={(value) => value && setFrameRate(value)}>
                      <SelectTrigger className="mt-3 h-14 rounded-[24px] border-white/[0.12] bg-black/28 px-5 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FRAME_RATES.map((rate) => <SelectItem key={rate.value} value={rate.value}>{rate.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Output format">
                    <Select value={settings.videoFormat} onValueChange={(value) => updateSettings({ videoFormat: value as "mp4" | "webm" })}>
                      <SelectTrigger className="mt-3 h-14 rounded-[24px] border-white/[0.12] bg-black/28 px-5 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4</SelectItem>
                        <SelectItem value="webm">WebM</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <button
                  type="button"
                  onClick={() => setMotionBlur(!motionBlur)}
                  className="w-full rounded-[28px] border border-white/[0.10] bg-black/24 p-4 text-left transition hover:border-white/22"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-black text-white">Motion Blur</div>
                      <div className="mt-1 text-xs font-semibold text-white/40">Cinematic shutter and natural movement smear.</div>
                    </div>
                    <TogglePill enabled={motionBlur} />
                  </div>
                </button>

                <Field label="Negative prompt">
                  <Textarea
                    rows={3}
                    value={negative}
                    onChange={(event) => setNegative(event.target.value)}
                    placeholder="choppy motion, warped faces, flickering, low quality..."
                    className="mt-3 resize-none rounded-[26px] border-white/[0.12] bg-black/28 px-5 py-4 text-white"
                  />
                </Field>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <button
                type="button"
                onClick={() => toast.info("Physics controls are already live in the prompt preview.")}
                className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/44"
              >
                <Wind className="size-4 text-cyan-100/60" />
                Physics & Realism
              </button>
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  { key: "hair_cloth", label: "Hair & Cloth", desc: "Fabric and hair flow" },
                  { key: "body_movement", label: "Body Weight", desc: "Natural bounce and sway" },
                  { key: "wind", label: "Wind", desc: "Environmental force" },
                  { key: "breath", label: "Breath", desc: "Micro-movement realism" },
                ] as const).map(({ key, label, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => togglePhysics(key)}
                    className={cn(
                      "rounded-[24px] border p-4 text-left transition",
                      physics[key] ? "border-cyan-200/32 bg-cyan-300/[0.08]" : "border-white/[0.10] bg-black/24 hover:border-white/22"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-white">{label}</div>
                        <div className="mt-1 text-xs font-semibold text-white/40">{desc}</div>
                      </div>
                      <TogglePill enabled={physics[key]} />
                    </div>
                  </button>
                ))}
              </div>
            </GlassPanel>
          </div>

          <div className="min-w-0 space-y-5">
            <GlassPanel className="xl:sticky xl:top-24 rounded-[34px] p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100/52">
                    <Eye className="size-4" />
                    Video Preview
                  </div>
                  <h2 className="mt-3 text-[clamp(2rem,3.4vw,4rem)] font-black tracking-tight text-white">{selectedMotion.label}</h2>
                </div>
                <Button
                  type="button"
                  onClick={async () => {
                    const copied = await copyToClipboard(fullPrompt);
                    if (copied) toast.success("Direction prompt copied");
                    else toast.error("Clipboard unavailable");
                  }}
                  className="rounded-full border border-white/12 bg-white/[0.08] px-4 text-sm font-black text-white hover:bg-white hover:text-black"
                >
                  <Copy className="size-4" />
                  Copy Direction
                </Button>
              </div>

              <div className="mt-9 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_72px_rgba(0,0,0,0.40)]">
                  <div className="aspect-video">
                    {lastResultUrl ? (
                      <motion.video
                        key={lastResultUrl}
                        initial={{ opacity: 0, scale: 1.01 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={lastResultUrl}
                        controls
                        loop
                        autoPlay
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_50%_24%,rgba(0,212,255,0.10),transparent_26%),radial-gradient(circle_at_50%_62%,rgba(168,85,247,0.14),transparent_38%),linear-gradient(145deg,#070B14,#030406)]">
                        <div className="max-w-md text-center px-4">
                          <motion.div
                            animate={{ boxShadow: `0 0 ${40 + settings.videoFluidity * 30}px rgba(0,212,255,${0.08 + settings.videoFluidity * 0.08})` }}
                            className="mx-auto flex size-24 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.04] backdrop-blur-2xl"
                          >
                            <Play className="ml-1 size-10 text-white/60" />
                          </motion.div>
                          <div className="mt-5 text-xl font-semibold text-white">Ready to render the shot</div>
                          <div className="mt-2 text-sm leading-6 text-white/50">
                            {prompt || "Describe a shot, choose a camera move, and forge a cinematic video preview here."}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {generating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/72 backdrop-blur-md">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                          className="mx-auto size-14 rounded-full border-2 border-cyan-200 border-t-transparent"
                        />
                        <div className="mt-3 text-sm font-semibold text-white">{progressNote || "Rendering motion..."}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 min-w-0">
                  <PreviewMetric label="Camera" value={selectedMotion.label} />
                  <PreviewMetric label="Style" value={selectedStyle.label} />
                  <PreviewMetric label="Duration" value={`${settings.videoDuration}s`} />
                  <PreviewMetric label="Fluidity" value={settings.videoFluidity.toFixed(2)} />
                  <PreviewMetric label="Physics" value={`${activePhysics}/4 active`} />
                  <PreviewMetric label="DNA" value={useLockedCharacter && character ? character.name : "Unlocked"} />
                </div>
              </div>

              <div className="mt-9 grid gap-4 md:grid-cols-[1fr_240px]">
                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="h-20 rounded-full bg-gradient-to-r from-[#F6D57A] via-[#D4AF37] to-[#8B6F2F] text-lg font-black text-black shadow-[0_0_70px_rgba(212,175,55,0.30)] hover:brightness-110"
                >
                  {generating ? <Sparkles className="size-5 animate-pulse" /> : <Zap className="size-5" />}
                  Forge Video
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!lastResultUrl}
                  title={!lastResultUrl ? "Render a video before downloading." : "Download the latest render."}
                  onClick={() => {
                    if (!lastResultUrl) return;
                    const link = document.createElement("a");
                    link.href = lastResultUrl;
                    link.download = `axs-${Date.now()}.${settings.videoFormat}`;
                    link.click();
                  }}
                  className="h-24 rounded-full border-white/12 bg-white/[0.065] px-6 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white hover:text-black"
                >
                  <Download className="size-4" />
                  Download
                </Button>
              </div>

              <div className="mt-6 rounded-[30px] border border-white/[0.10] bg-black/26 p-5">
                <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/34">Prompt Preview</div>
                <p className="line-clamp-4 text-sm leading-7 text-white/54">{fullPrompt || "Direction prompt will build here in real time."}</p>
              </div>
            </GlassPanel>
          </div>
        </main>
      </div>
    </div>
  );
};

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const safeValue = getSliderNumber(value, min, min, max);
  return (
    <div className="rounded-[28px] border border-white/[0.10] bg-black/24 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <Label className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">{label}</Label>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-cyan-50/76">
          {safeValue.toFixed(step >= 1 ? 0 : 2)}{suffix}
        </span>
      </div>
      <Slider value={[safeValue]} min={min} max={max} step={step} onValueChange={(next) => onChange(getSliderNumber(next, safeValue, min, max))} />
    </div>
  );
}

function ToggleButton({ label, enabled, onClick }: { label: string; enabled: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-full border border-white/[0.10] bg-white/[0.045] px-4 py-2">
      <span className="text-xs font-black text-white/58">{label}</span>
      <TogglePill enabled={enabled} />
    </button>
  );
}

function TogglePill({ enabled }: { enabled: boolean }) {
  return (
    <span className={cn("relative block h-6 w-12 rounded-full border transition", enabled ? "border-cyan-200/30 bg-cyan-300/30" : "border-white/12 bg-white/[0.06]")}>
      <span className={cn("absolute top-1 size-4 rounded-full bg-white shadow transition", enabled ? "left-7" : "left-1")} />
    </span>
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

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/[0.11] bg-black/26 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30">{label}</div>
      <div className="mt-1 truncate text-sm font-black text-white/72">{value}</div>
    </div>
  );
}
