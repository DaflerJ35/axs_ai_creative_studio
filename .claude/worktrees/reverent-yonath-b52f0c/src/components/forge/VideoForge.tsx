import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Video, Clock, Sparkles, Film, Download, AlertTriangle,
  User as UserIcon, CheckCircle, Zap, Lock, Unlock,
  ChevronDown, ChevronUp, Wind, Eye, Layers,
} from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { GlassCard } from "../ui/glass-card";
import { useNyxStore, useActiveCharacter } from "../../store/useNyxStore";
import { forgeVideoAsync, pollVideo } from "../../lib/workflows";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// ─── Camera Presets ────────────────────────────────────────────────────────

const MOTION_PRESETS = [
  {
    id: "slow_push",
    label: "Slow Cinematic Push-In",
    icon: "→",
    recommended: true,
    prompt: "slow cinematic dolly push-in toward subject, shallow depth of field, smooth and intentional camera movement",
    color: "from-cyan-400/20 to-blue-500/10",
    border: "border-cyan-500/50",
  },
  {
    id: "orbit_rise",
    label: "Circle Orbit + Rise",
    icon: "↗",
    prompt: "smooth orbital camera arcing upward while circling the subject, rising reveal, elegant ascending arc motion",
    color: "from-violet-400/20 to-purple-500/10",
    border: "border-violet-500/30",
  },
  {
    id: "dolly_zoom",
    label: "Dolly Zoom",
    icon: "⇔",
    prompt: "hitchcock dolly zoom effect, background perspective shifts while subject stays same size in frame, vertigo effect",
    color: "from-pink-400/20 to-rose-500/10",
    border: "border-pink-500/30",
  },
  {
    id: "low_hero",
    label: "Low Angle Hero",
    icon: "↑",
    prompt: "low angle hero shot looking up at subject, dramatic upward tilt, empowering perspective, wide lens",
    color: "from-orange-400/20 to-amber-500/10",
    border: "border-orange-500/30",
  },
  {
    id: "over_shoulder",
    label: "Over-the-Shoulder",
    icon: "◎",
    prompt: "over-the-shoulder shot framing subject from behind and to the side, intimate perspective, foreground blur",
    color: "from-emerald-400/20 to-teal-500/10",
    border: "border-emerald-500/30",
  },
  {
    id: "orbit",
    label: "Orbit 360",
    icon: "↻",
    prompt: "smooth orbital camera movement circling the subject 90 degrees, maintaining focus, elegant arc motion",
    color: "from-indigo-400/20 to-blue-500/10",
    border: "border-indigo-500/30",
  },
  {
    id: "handheld",
    label: "Handheld",
    icon: "⟲",
    prompt: "authentic handheld camera movement, slight natural shake, documentary-style immediacy, intimate and real",
    color: "from-yellow-400/20 to-amber-500/10",
    border: "border-yellow-500/30",
  },
  {
    id: "drone",
    label: "Drone Descent",
    icon: "↓",
    prompt: "aerial drone slowly descending and tilting down to reveal subject, sweeping wide-to-close movement, cinematic scale",
    color: "from-sky-400/20 to-cyan-500/10",
    border: "border-sky-500/30",
  },
  {
    id: "tracking",
    label: "Tracking Shot",
    icon: "⟶",
    prompt: "side-tracking camera following subject movement, steady glide, parallel motion, cinematic momentum",
    color: "from-fuchsia-400/20 to-pink-500/10",
    border: "border-fuchsia-500/30",
  },
  {
    id: "static",
    label: "Static / Locked",
    icon: "■",
    prompt: "locked-off static camera, tripod-mounted, no camera movement, all motion from subject, clean and focused",
    color: "from-zinc-400/20 to-zinc-500/10",
    border: "border-zinc-500/30",
  },
];

const SHOT_STYLES = [
  { id: "cinematic", label: "Cinematic", suffix: "anamorphic lens, 24fps, film grain, cinematic color grade" },
  { id: "ugc", label: "UGC / Real", suffix: "handheld iPhone-style, natural lighting, authentic feel, no color grade" },
  { id: "commercial", label: "Commercial", suffix: "professional commercial production, clean lighting, brand-safe aesthetic" },
  { id: "editorial", label: "Editorial", suffix: "fashion editorial motion, dramatic lighting, high-contrast aesthetic" },
];

const FRAME_RATES = [
  { value: "24", label: "24fps — Cinematic" },
  { value: "30", label: "30fps — Broadcast" },
  { value: "60", label: "60fps — Smooth / HFR" },
];

// Physics prompt fragments
const PHYSICS_PROMPTS: Record<string, string> = {
  hair_cloth: "natural hair and cloth physics, realistic fabric draping and movement",
  body_movement: "subtle natural body bounce and sway, realistic weight and momentum",
  wind: "gentle wind interaction with hair and clothes, flowing natural movement",
  breath: "subtle breathing micro-movements, natural chest rise and fall, lifelike stillness",
};

export const VideoForge = () => {
  const { settings, updateSettings, addToGallery } = useNyxStore();
  const character = useActiveCharacter();

  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [generating, setGenerating] = useState(false);
  const [progressNote, setProgressNote] = useState("");
  const [lastResultUrl, setLastResultUrl] = useState<string | null>(null);
  const [motionPreset, setMotionPreset] = useState("slow_push");
  const [shotStyle, setShotStyle] = useState("cinematic");
  const [frameRate, setFrameRate] = useState("24");

  // Character consistency
  const [faceLocked, setFaceLocked] = useState(false);
  const [faceLockStrength, setFaceLockStrength] = useState(0.9);
  const [motionConsistency, setMotionConsistency] = useState(0.75);
  const [maintainExactFace, setMaintainExactFace] = useState(false);
  const [useLockedCharacter, setUseLockedCharacter] = useState(true);

  // Physics & Realism
  const [physicsOpen, setPhysicsOpen] = useState(false);
  const [physics, setPhysics] = useState({
    hair_cloth: true,
    body_movement: true,
    wind: false,
    breath: true,
  });

  // Motion controls
  const [motionBlur, setMotionBlur] = useState(true);

  const hasVideoEndpoint = !!settings.runpodVideoEndpointId;

  const togglePhysics = (key: keyof typeof physics) =>
    setPhysics((p) => ({ ...p, [key]: !p[key] }));

  const buildFullPrompt = () => {
    const preset = MOTION_PRESETS.find((m) => m.id === motionPreset);
    const style = SHOT_STYLES.find((s) => s.id === shotStyle);
    const physicsTerms = Object.entries(physics)
      .filter(([, enabled]) => enabled)
      .map(([k]) => PHYSICS_PROMPTS[k])
      .filter(Boolean);
    const parts = [
      prompt.trim(),
      preset?.prompt,
      style?.suffix,
      faceLocked && maintainExactFace ? "exact face consistency, identity preservation, photorealistic face lock" : null,
      motionBlur ? "natural motion blur on movement, cinematic shutter" : "sharp crisp motion, minimal motion blur",
      frameRate === "60" ? "60fps smooth high frame rate" : null,
      ...physicsTerms,
    ].filter(Boolean);
    return parts.join(". ");
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error("Describe the shot.");
    if (!hasVideoEndpoint) {
      toast.error("Video endpoint not set", {
        description: "Add your RunPod video endpoint ID in Settings.",
      });
      return;
    }

    const fullPrompt = buildFullPrompt();
    setGenerating(true);
    setProgressNote("Submitting to RunPod…");
    setLastResultUrl(null);
    try {
      const { id } = await forgeVideoAsync({
        prompt: fullPrompt,
        negativePrompt: negative,
        character: useLockedCharacter ? character : null,
        settings,
      });
      setProgressNote(`Job ${id.slice(0, 8)} queued…`);
      const out: any = await pollVideo(id, (status, attempt) => {
        setProgressNote(`${status} · ~${attempt * 3}s elapsed`);
      });
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
    } catch (e: any) {
      toast.error("Video forge failed", { description: e?.message });
    } finally {
      setGenerating(false);
      setProgressNote("");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">Motion Studio</div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
          Bring them to{" "}
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            life.
          </span>
        </h1>
        <p className="text-white/50 mt-3 max-w-xl">
          Cinematic motion presets. Professional shot styles. Character-consistent video.
        </p>
      </div>

      {/* Character chip + consistency panel */}
      {character ? (
        <GlassCard className={`p-5 transition-all duration-300 ${faceLocked ? "border-violet-500/50 shadow-[0_0_24px_rgba(139,92,246,0.25)]" : ""}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0">
              {character.portraitDataUrl ? (
                <img src={character.portraitDataUrl} alt={character.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white/30" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-xs text-white/40 uppercase tracking-wider">Featuring</div>
              <div className="font-bold">{character.name}</div>
            </div>

            {/* Use Locked Character toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-white/60">
              <span>Use in video</span>
              <button
                onClick={() => setUseLockedCharacter(!useLockedCharacter)}
                className={`relative w-9 h-5 rounded-full transition-colors ${useLockedCharacter ? "bg-violet-500" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useLockedCharacter ? "translate-x-4" : ""}`} />
              </button>
            </label>

            {/* Face lock button */}
            <button
              onClick={() => setFaceLocked(!faceLocked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                faceLocked
                  ? "bg-violet-500/20 border border-violet-500/60 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                  : "border border-white/15 text-white/50 hover:border-white/30 hover:text-white/80"
              }`}
            >
              {faceLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              {faceLocked ? "Face Locked" : "Lock Face"}
            </button>
          </div>

          <AnimatePresence>
            {faceLocked && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t border-white/10 grid md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-white/60 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Face Lock Strength
                      </Label>
                      <span className="text-xs font-bold text-violet-300">{faceLockStrength.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[faceLockStrength]}
                      min={0.8}
                      max={1.0}
                      step={0.01}
                      onValueChange={(v) => setFaceLockStrength(Array.isArray(v) ? v[0] : v)}
                    />
                    <div className="flex justify-between text-[10px] text-white/30 mt-1">
                      <span>0.8 natural</span><span>1.0 rigid</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-white/60 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Motion Consistency
                      </Label>
                      <span className="text-xs font-bold text-violet-300">{motionConsistency.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[motionConsistency]}
                      min={0.5}
                      max={1.0}
                      step={0.05}
                      onValueChange={(v) => setMotionConsistency(Array.isArray(v) ? v[0] : v)}
                    />
                    <div className="flex justify-between text-[10px] text-white/30 mt-1">
                      <span>0.5 free</span><span>1.0 rigid</span>
                    </div>
                  </div>
                  <div className="col-span-full">
                    <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                      <div>
                        <div className="text-sm font-semibold">Maintain Exact Face</div>
                        <div className="text-xs text-white/40">Identity-preserving — injects face lock tokens into video prompt</div>
                      </div>
                      <button
                        onClick={() => setMaintainExactFace(!maintainExactFace)}
                        className={`relative w-10 h-5.5 rounded-full transition-colors ${maintainExactFace ? "bg-violet-500" : "bg-white/10"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${maintainExactFace ? "translate-x-5" : ""}`} />
                      </button>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      ) : (
        <div className="text-xs text-white/40 p-3 rounded-xl border border-white/10 bg-white/[0.03] w-fit">
          No character — open Studio to select one.
        </div>
      )}

      {!hasVideoEndpoint && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-400/25 bg-amber-400/5">
          <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-100/80">
            <b>No video endpoint.</b> Deploy Wan 2.1 or LTX-Video on RunPod Serverless and paste the endpoint ID in Settings.
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <GlassCard className="p-7 space-y-7">
            {/* Prompt */}
            <div>
              <Label>Shot description</Label>
              <Textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Character turns to camera with a slow smile, golden hour rooftop, city skyline behind them…"
                className="mt-1 text-base"
              />
            </div>

            {/* Camera Movement — expanded grid */}
            <div>
              <Label className="mb-3 block">Camera Movement</Label>
              <div className="grid grid-cols-2 gap-2">
                {MOTION_PRESETS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMotionPreset(m.id)}
                    className={`relative flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                      motionPreset === m.id
                        ? `bg-gradient-to-br ${m.color} ${m.border} text-white`
                        : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                    }`}
                  >
                    <span className="text-base leading-none flex-shrink-0 w-5 text-center">{m.icon}</span>
                    <span>{m.label}</span>
                    {m.recommended && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold flex-shrink-0">
                        BEST
                      </span>
                    )}
                    {motionPreset === m.id && (
                      <motion.div
                        layoutId="motion-active"
                        className="absolute inset-0 rounded-xl bg-white/5 pointer-events-none"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Shot style */}
            <div>
              <Label className="mb-2 block">Shot Style</Label>
              <div className="grid grid-cols-2 gap-2">
                {SHOT_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setShotStyle(s.id)}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                      shotStyle === s.id
                        ? "border-violet-500/50 bg-violet-500/10 text-white"
                        : "border-white/10 text-white/50 hover:border-white/20"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration + motion intensity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Duration
                  </Label>
                  <span className="text-sm text-white/60 tabular-nums font-bold">{settings.videoDuration}s</span>
                </div>
                <Slider
                  value={[settings.videoDuration]}
                  min={2}
                  max={10}
                  step={1}
                  onValueChange={(v) => updateSettings({ videoDuration: Array.isArray(v) ? v[0] : v })}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <Film className="w-4 h-4" /> Motion Intensity
                  </Label>
                  <span className="text-sm text-white/60 tabular-nums font-bold">
                    {settings.videoFluidity.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[settings.videoFluidity]}
                  min={0.2}
                  max={1}
                  step={0.05}
                  onValueChange={(v) => updateSettings({ videoFluidity: Array.isArray(v) ? v[0] : v })}
                />
              </div>
            </div>

            {/* Frame Rate + Motion Blur row */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Frame Rate</Label>
                <Select value={frameRate} onValueChange={setFrameRate}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FRAME_RATES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="w-full flex items-center justify-between cursor-pointer p-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                  <div>
                    <div className="text-sm font-semibold">Motion Blur</div>
                    <div className="text-xs text-white/40">Cinematic shutter motion</div>
                  </div>
                  <button
                    onClick={() => setMotionBlur(!motionBlur)}
                    className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${motionBlur ? "bg-violet-500" : "bg-white/10"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${motionBlur ? "translate-x-4" : ""}`} />
                  </button>
                </label>
              </div>
            </div>

            <div>
              <Label>Negative prompt</Label>
              <Textarea
                rows={2}
                value={negative}
                onChange={(e) => setNegative(e.target.value)}
                placeholder="choppy motion, warped faces, low quality, flickering…"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Output format</Label>
              <Select value={settings.videoFormat} onValueChange={(v) => updateSettings({ videoFormat: v as any })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full h-14 text-base font-black bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400 text-white hover:brightness-110 shadow-[0_0_32px_rgba(139,92,246,0.5)]"
            >
              {generating ? (
                <><Sparkles className="w-5 h-5 mr-2 animate-pulse" /> Rendering…</>
              ) : (
                <><Zap className="w-5 h-5 mr-2" /> FORGE VIDEO</>
              )}
            </Button>

            {generating && (
              <div className="space-y-2">
                <div className="relative h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-violet-400 to-transparent"
                  />
                </div>
                <div className="text-xs text-white/50">{progressNote}</div>
              </div>
            )}
          </GlassCard>

          {/* Physics & Realism panel */}
          <GlassCard className="overflow-hidden">
            <button
              onClick={() => setPhysicsOpen(!physicsOpen)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm">Physics &amp; Realism</span>
                <span className="text-xs text-white/40">Natural movement simulation</span>
              </div>
              {physicsOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>
            <AnimatePresence>
              {physicsOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                    {([
                      { key: "hair_cloth", label: "Hair & Cloth Physics", desc: "Fabric draping and hair flow" },
                      { key: "body_movement", label: "Body Movement", desc: "Natural weight and bounce" },
                      { key: "wind", label: "Wind Interaction", desc: "Flowing wind-driven motion" },
                      { key: "breath", label: "Breath / Micro Movements", desc: "Subtle breathing and stillness" },
                    ] as const).map(({ key, label, desc }) => (
                      <label
                        key={key}
                        className={`flex items-center justify-between cursor-pointer p-3 rounded-xl border transition-all ${
                          physics[key] ? "border-cyan-500/40 bg-cyan-500/5" : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{label}</div>
                          <div className="text-[10px] text-white/40">{desc}</div>
                        </div>
                        <button
                          onClick={() => togglePhysics(key)}
                          className={`relative w-8 h-4.5 rounded-full transition-colors flex-shrink-0 ml-3 ${physics[key] ? "bg-cyan-500" : "bg-white/10"}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${physics[key] ? "translate-x-3.5" : ""}`} />
                        </button>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Prompt preview */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs text-white/40 leading-relaxed">
            <span className="text-white/60 font-medium">Full prompt preview: </span>
            {buildFullPrompt().slice(0, 120)}…
          </div>
        </div>

        {/* Preview panel */}
        <GlassCard className="lg:col-span-2 p-6 space-y-4 min-h-[500px]">
          <div className="text-xs uppercase tracking-[0.3em] text-white/40">Preview</div>
          <AnimatePresence>
            {lastResultUrl ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <video
                  src={lastResultUrl}
                  controls
                  loop
                  autoPlay
                  className="w-full rounded-2xl border border-white/10"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = lastResultUrl;
                      a.download = `momentum-${Date.now()}.${settings.videoFormat}`;
                      a.click();
                    }}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.info("Send to Image Forge — coming soon")}
                    className="w-full text-xs"
                  >
                    Use as Reference
                  </Button>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/50 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/30">Frame rate</span>
                    <span className="font-medium">{frameRate}fps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/30">Duration</span>
                    <span className="font-medium">{settings.videoDuration}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/30">Motion blur</span>
                    <span className="font-medium">{motionBlur ? "On" : "Off"}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[400px] rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-white/30 gap-3">
                <Video className="w-10 h-10" />
                <div className="text-sm">Shot appears here</div>
              </div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
};
