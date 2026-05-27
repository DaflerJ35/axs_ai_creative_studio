import {
  AudioLines,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clapperboard,
  Copy,
  Dna,
  Eye,
  FileText,
  Filter,
  FolderOpen,
  GitBranch,
  Globe2,
  Image,
  Layers3,
  Lock,
  MapPin,
  Megaphone,
  Mic,
  Music,
  Network,
  Orbit,
  PenLine,
  Play,
  Plus,
  RadioTower,
  Rocket,
  Save,
  Scissors,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TerminalSquare,
  TimerReset,
  UserRound,
  Users,
  Volume2,
  WandSparkles,
  Waves,
  Zap,
} from "lucide-react";
import { useState } from "react";

/* ── Data ─────────────────────────────────────────────────────────────── */

const voiceStats = [
  { label: "Voice Models", value: "8", icon: Mic, tone: "violet" },
  { label: "Samples", value: "64", icon: AudioLines, tone: "cyan" },
  { label: "Projects", value: "12", icon: FolderOpen, tone: "gold" },
  { label: "Quality", value: "98%", icon: CheckCircle2, tone: "green" },
] as const;

const voiceModels = [
  { id: "V-01", name: "Mara Narrator", type: "Deep / Cinematic", status: "Active", tone: "cyan", waveform: [0.3, 0.7, 0.5, 0.9, 0.4, 0.8, 0.6, 0.3, 0.7, 0.5, 0.8, 0.4] },
  { id: "V-02", name: "Eli Voice", type: "Cold / Precise", status: "Ready", tone: "violet", waveform: [0.5, 0.4, 0.6, 0.3, 0.7, 0.5, 0.4, 0.6, 0.3, 0.5, 0.4, 0.7] },
  { id: "V-03", name: "Dante Edge", type: "Raspy / Urban", status: "Draft", tone: "gold", waveform: [0.7, 0.5, 0.8, 0.6, 0.4, 0.9, 0.7, 0.5, 0.8, 0.6, 0.4, 0.7] },
  { id: "V-04", name: "Ari Smooth", type: "Warm / Broker", status: "Active", tone: "green", waveform: [0.4, 0.6, 0.5, 0.7, 0.4, 0.6, 0.5, 0.8, 0.4, 0.6, 0.5, 0.7] },
] as const;

const soundBanks = [
  { title: "Cinematic FX", count: "24 clips", tone: "cyan" },
  { title: "Voice Overlays", count: "18 layers", tone: "violet" },
  { title: "Ambient Beds", count: "32 loops", tone: "gold" },
  { title: "Transition Stings", count: "12 stings", tone: "green" },
] as const;

const scriptQueue = [
  { title: "Opening Monologue", status: "Recorded", duration: "0:45", tone: "cyan" },
  { title: "Product Walkthrough", status: "Ready", duration: "2:30", tone: "green" },
  { title: "Call to Action", status: "Needs Edit", duration: "0:15", tone: "gold" },
  { title: "Outro Tag", status: "Draft", duration: "0:10", tone: "violet" },
] as const;

/* ── Helpers ──────────────────────────────────────────────────────── */

function toneClasses(tone?: string) {
  switch (tone) {
    case "gold":
      return { text: "text-[#ffd36f]", border: "border-[#b8892e]/55", softBorder: "border-[#b8892e]/25", bg: "bg-[#1b1205]/58", glow: "shadow-[0_0_30px_rgba(214,158,55,.14)]", gradient: "from-[#ffd36f] to-[#b98025]" };
    case "violet":
      return { text: "text-violet-300", border: "border-violet-400/45", softBorder: "border-violet-400/22", bg: "bg-violet-500/11", glow: "shadow-[0_0_30px_rgba(139,92,246,.16)]", gradient: "from-violet-400 to-fuchsia-300" };
    case "green":
      return { text: "text-emerald-300", border: "border-emerald-400/45", softBorder: "border-emerald-400/22", bg: "bg-emerald-400/10", glow: "shadow-[0_0_30px_rgba(52,211,153,.13)]", gradient: "from-emerald-400 to-teal-300" };
    default:
      return { text: "text-cyan-300", border: "border-cyan-300/45", softBorder: "border-cyan-300/22", bg: "bg-cyan-400/10", glow: "shadow-[0_0_30px_rgba(0,229,255,.14)]", gradient: "from-cyan-300 to-sky-400" };
  }
}

/* ── Studio Primitives ──────────────────────────────────────────────── */

function StudioCard({ children, className = "", accent = "cyan" }: { children: React.ReactNode; className?: string; accent?: string }) {
  const t = toneClasses(accent);
  return (
    <section className={`relative overflow-hidden rounded-2xl border ${t.softBorder} bg-[#050a14]/90 ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${accent === "gold" ? "rgba(214,158,55,.06)" : accent === "violet" ? "rgba(139,92,246,.06)" : "rgba(0,229,255,.06)"}, transparent 60%)` }}
      />
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative">{children}</div>
    </section>
  );
}

function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-xs font-black uppercase tracking-[.22em] text-white/80">{title}</h2>
        {sub ? <p className="mt-1 text-sm text-zinc-500">{sub}</p> : null}
      </div>
      {action ? <button className="shrink-0 rounded-lg border border-white/10 bg-white/[.04] px-3 py-1.5 text-xs font-bold text-zinc-400 hover:border-cyan-300/35 hover:text-cyan-300 transition">{action}</button> : null}
    </div>
  );
}

function Waveform({ bars, tone = "cyan", active = false }: { bars: readonly number[]; tone?: string; active?: boolean }) {
  const color = tone === "gold" ? "#ffd36f" : tone === "violet" ? "#a78bfa" : tone === "green" ? "#34d399" : "#22d3ee";
  return (
    <div className="flex items-end gap-[2px] h-8">
      {bars.map((h, i) => (
        <div key={i} className={`w-1 rounded-full transition-all duration-500 ${active ? 'animate-pulse' : ''}`}
          style={{ height: `${h * 100}%`, backgroundColor: color, opacity: active ? 0.9 : 0.4, animationDelay: `${i * 50}ms` }} />
      ))}
    </div>
  );
}

/* ── Sections ─────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_33rem]">
      <StudioCard className="border-cyan-300/20" accent="cyan">
        <div className="absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(circle at 50% 100%, rgba(0,229,255,.1), transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,.06), transparent 40%)" }}
        />
        <div className="relative p-7 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="grid size-8 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-400/10">
              <Waves className="size-4 text-cyan-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-[.22em] text-cyan-300">Sound Studio</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[.65rem] font-bold uppercase tracking-[.12em] text-emerald-300">Recording</span>
            </div>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,4.5rem)] font-black leading-[.92] tracking-[-.04em] text-white">
            Voice Studio
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Design voice models, record samples, mix audio layers, and build sonic identity systems that lock into every production.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-white/[.06] transition">
              <Mic className="size-4" /> New Recording
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-violet-300/35 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-200 hover:bg-white/[.06] transition">
              <WandSparkles className="size-4" /> Generate Voice
            </button>
          </div>
        </div>
      </StudioCard>

      <div className="grid grid-cols-2 gap-4">
        {voiceStats.map((stat) => {
          const Icon = stat.icon;
          const t = toneClasses(stat.tone);
          return (
            <StudioCard key={stat.label} className={`p-5 ${t.softBorder}`} accent={stat.tone}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-3xl font-black ${stat.value.includes("%") ? t.text : "text-white"}`}>{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-zinc-600">{stat.label}</div>
                </div>
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Icon className={`size-4 ${t.text}`} />
                </div>
              </div>
            </StudioCard>
          );
        })}
      </div>
    </div>
  );
}

function SoundBooth() {
  const [selected, setSelected] = useState<(typeof voiceModels)[number]>(voiceModels[0]);
  return (
    <StudioCard className="p-6" accent="violet">
      <SectionTitle title="Voice Models" sub="Active voice profiles and waveform signatures." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="space-y-3">
          {voiceModels.map((model) => {
            const t = toneClasses(model.tone);
            const isSelected = selected.id === model.id;
            return (
              <button key={model.id} onClick={() => setSelected(model)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${isSelected ? `${t.softBorder} ${t.bg}` : 'border-white/[0.06] bg-[#04080e]/60 hover:border-white/10'}`}>
                <div className={`grid size-12 shrink-0 place-items-center rounded-full border ${t.border} ${t.bg} text-sm font-black ${t.text}`}>{model.id}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white">{model.name}</div>
                  <div className="text-xs text-zinc-500">{model.type}</div>
                </div>
                <Waveform bars={model.waveform} tone={model.tone} active={isSelected} />
                <span className={`rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{model.status}</span>
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`grid size-12 place-items-center rounded-full border ${toneClasses(selected.tone).border} ${toneClasses(selected.tone).bg}`}>
                <Mic className={`size-5 ${toneClasses(selected.tone).text}`} />
              </div>
              <div>
                <div className="text-lg font-black text-white">{selected.name}</div>
                <div className="text-xs text-zinc-500">{selected.type}</div>
              </div>
            </div>
            <button className="grid size-10 place-items-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-300">
              <Play className="size-4 fill-current" />
            </button>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#02060a]/80 p-4">
            <Waveform bars={selected.waveform} tone={selected.tone} active />
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
              <span>0:00</span>
              <span>0:45</span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-center">
              <div className="text-xs text-zinc-600">Pitch</div>
              <div className="text-sm font-black text-white">-2.4</div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-center">
              <div className="text-xs text-zinc-600">Speed</div>
              <div className="text-sm font-black text-white">1.0x</div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-center">
              <div className="text-xs text-zinc-600">Clarity</div>
              <div className="text-sm font-black text-white">98%</div>
            </div>
          </div>
        </div>
      </div>
    </StudioCard>
  );
}

function MixingConsole() {
  return (
    <StudioCard className="p-6" accent="gold">
      <SectionTitle title="Sound Banks" sub="Layered audio assets and FX libraries." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {soundBanks.map((bank) => {
          const t = toneClasses(bank.tone);
          return (
            <div key={bank.title} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Volume2 className={`size-4 ${t.text}`} />
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{bank.title}</h3>
              <p className="text-xs text-zinc-600">{bank.count}</p>
              <button className="mt-4 w-full rounded-lg border border-white/[0.06] bg-white/[.03] py-2 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">Browse</button>
            </div>
          );
        })}
      </div>
    </StudioCard>
  );
}

function ScriptQueue() {
  return (
    <StudioCard className="p-6" accent="cyan">
      <SectionTitle title="Script Queue" sub="Voice-ready scripts and recording queue." />
      <div className="space-y-3">
        {scriptQueue.map((script) => {
          const t = toneClasses(script.tone);
          return (
            <div key={script.title} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className={`grid size-10 place-items-center rounded-full border ${t.border} ${t.bg}`}>
                <FileText className={`size-4 ${t.text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white">{script.title}</div>
                <div className="text-xs text-zinc-600">{script.duration}</div>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{script.status}</span>
              <button className="grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[.03] text-zinc-400 hover:border-cyan-300/30 hover:text-cyan-300 transition">
                <Play className="size-3 fill-current" />
              </button>
            </div>
          );
        })}
      </div>
    </StudioCard>
  );
}

function RightRail() {
  return (
    <aside className="space-y-4">
      <StudioCard className="border-cyan-400/20 p-5" accent="cyan">
        <SectionTitle title="Audio Health" />
        <div className="flex flex-col items-center py-4">
          <div className="relative grid size-28 place-items-center rounded-full border-[8px] border-cyan-300/30 bg-cyan-400/5">
            <div className="text-3xl font-black text-white">98%</div>
          </div>
          <div className="mt-3 text-sm font-bold text-white">Signal Quality</div>
          <div className="text-xs text-zinc-600">All channels clear</div>
        </div>
      </StudioCard>

      <StudioCard className="p-5" accent="violet">
        <SectionTitle title="Quick Actions" />
        <div className="space-y-2">
          {["New Recording", "Import Sample", "Export Mix", "Run Analysis"].map((action) => (
            <button key={action} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[.03] p-3 text-left text-sm font-bold text-zinc-300 hover:border-violet-300/30 hover:text-violet-300 transition">
              <Zap className="size-4 text-[#ffd36f]" /> {action}
            </button>
          ))}
        </div>
      </StudioCard>

      <StudioCard className="p-5" accent="gold">
        <SectionTitle title="Recent Recordings" />
        <div className="space-y-2">
          {["Mara intro v3", "Eli cold open", "Dante bridge", "Ari closer"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-xs font-bold text-zinc-400">
              <Mic className="size-3 text-cyan-300" /> {item}
            </div>
          ))}
        </div>
      </StudioCard>
    </aside>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function AXSVoiceStudio() {
  return (
    <div className="relative min-w-0 space-y-5">
      <Hero />
      <SoundBooth />
      <MixingConsole />
      <ScriptQueue />
      <RightRail />
    </div>
  );
}
