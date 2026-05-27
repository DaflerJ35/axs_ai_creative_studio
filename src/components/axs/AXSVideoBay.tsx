import {
  Archive,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clapperboard,
  Copy,
  Dna,
  Download,
  Eye,
  FileText,
  Film,
  Filter,
  FolderOpen,
  GitBranch,
  Globe2,
  Image,
  Layers3,
  Lock,
  MapPin,
  Maximize2,
  Megaphone,
  Mic,
  MonitorPlay,
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
  Square,
  Star,
  Target,
  TerminalSquare,
  TimerReset,
  UserRound,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";

/* ── Data ─────────────────────────────────────────────────────────────── */

const videoStats = [
  { label: "Scenes", value: "42", icon: Clapperboard, tone: "violet" },
  { label: "Trailers", value: "8", icon: MonitorPlay, tone: "cyan" },
  { label: "Timeline", value: "12m", icon: Film, tone: "gold" },
  { label: "Render", value: "78%", icon: CheckCircle2, tone: "green" },
] as const;

const projects = [
  { title: "Launch Trailer", type: "Trailer", duration: "0:45", progress: 92, status: "Render", tone: "violet" },
  { title: "Product Demo", type: "Demo", duration: "2:30", progress: 87, status: "Edit", tone: "cyan" },
  { title: "Social Cut", type: "Short", duration: "0:15", progress: 64, status: "Draft", tone: "gold" },
  { title: "Behind Scenes", type: "BTS", duration: "4:00", progress: 45, status: "Assembly", tone: "green" },
] as const;

const trailerBeats = [
  { title: "The Hook", seconds: "0:00-0:05", note: "Immediate visual impact, no logo fade-in", tone: "cyan" },
  { title: "The Fracture", seconds: "0:05-0:15", note: "Problem statement with kinetic typography", tone: "violet" },
  { title: "The Proof", seconds: "0:15-0:30", note: "Demo clips, social proof, traction build", tone: "gold" },
  { title: "The CTA", seconds: "0:30-0:45", note: "Clear next step with urgency trigger", tone: "green" },
] as const;

const motionPrompts = [
  { title: "Cinematic Push In", tool: "Kling", quality: 94, tone: "cyan" },
  { title: "Neon Rain Loop", tool: "Veo", quality: 91, tone: "violet" },
  { title: "Character Turn", tool: "Sora", quality: 88, tone: "gold" },
] as const;

const exportPackages = [
  { title: "YouTube 4K", ratio: "16:9", status: "Ready", tone: "cyan" },
  { title: "Instagram Reel", ratio: "9:16", status: "Ready", tone: "violet" },
  { title: "TikTok", ratio: "9:16", status: "Rendering", tone: "gold" },
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

function ProgressBar({ value, tone = "cyan" }: { value: number; tone?: string }) {
  const t = toneClasses(tone);
  return (
    <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
      <div className={`h-full rounded-full bg-gradient-to-r ${t.gradient}`} style={{ width: `${value}%` }} />
    </div>
  );
}

/* ── Monitor Primitives ──────────────────────────────────────────── */

function MonitorCard({ children, className = "", accent = "violet" }: { children: React.ReactNode; className?: string; accent?: string }) {
  const t = toneClasses(accent);
  return (
    <section className={`relative overflow-hidden rounded-2xl border ${t.softBorder} bg-[#050a14]/90 ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${accent === "gold" ? "rgba(214,158,55,.06)" : accent === "violet" ? "rgba(139,92,246,.06)" : "rgba(0,229,255,.06)"}, transparent 60%)` }}
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

/* ── Sections ─────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_33rem]">
      <MonitorCard className="border-violet-300/20" accent="violet">
        <div className="absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(circle at 50% 0%, rgba(139,92,246,.1), transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,229,255,.05), transparent 40%)" }}
        />
        <div className="relative p-7 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="grid size-8 place-items-center rounded-lg border border-violet-300/30 bg-violet-500/10">
              <MonitorPlay className="size-4 text-violet-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-[.22em] text-violet-300">Edit Bay</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[.65rem] font-bold uppercase tracking-[.12em] text-emerald-300">Rendering</span>
            </div>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,4.5rem)] font-black leading-[.92] tracking-[-.04em] text-white">
            Video Bay
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Build trailers, scene plans, shot lists, motion prompts, edit timelines, and platform export packages from one production-grade video bay.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-200 hover:bg-white/[.06] transition">
              <Plus className="size-4" /> New Project
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/8 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-white/[.06] transition">
              <Film className="size-4" /> Import
            </button>
          </div>
        </div>
      </MonitorCard>

      <div className="grid grid-cols-2 gap-4">
        {videoStats.map((stat) => {
          const Icon = stat.icon;
          const t = toneClasses(stat.tone);
          return (
            <MonitorCard key={stat.label} className={`p-5 ${t.softBorder}`} accent={stat.tone}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-3xl font-black ${stat.value.includes("%") || stat.value.includes("m") ? t.text : "text-white"}`}>{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-zinc-600">{stat.label}</div>
                </div>
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Icon className={`size-4 ${t.text}`} />
                </div>
              </div>
            </MonitorCard>
          );
        })}
      </div>
    </div>
  );
}

function ProjectBoard() {
  const [selected, setSelected] = useState<(typeof projects)[number]>(projects[0]);
  return (
    <MonitorCard className="p-6" accent="violet">
      <SectionTitle title="Project Board" sub="Active video productions and their status." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="space-y-3">
          {projects.map((project) => {
            const t = toneClasses(project.tone);
            const isSelected = selected.title === project.title;
            return (
              <button key={project.title} onClick={() => setSelected(project)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${isSelected ? `${t.softBorder} ${t.bg}` : 'border-white/[0.06] bg-[#04080e]/60 hover:border-white/10'}`}>
                <div className={`grid size-12 place-items-center rounded-lg border ${t.border} ${t.bg}`}>
                  <Film className={`size-5 ${t.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white">{project.title}</div>
                  <div className="text-xs text-zinc-600">{project.type} · {project.duration}</div>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{project.status}</span>
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-[.14em] text-zinc-600">Preview</div>
            <div className="flex gap-2">
              <button className="grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[.03] text-zinc-400 hover:border-cyan-300/30 hover:text-cyan-300 transition">
                <Play className="size-3 fill-current" />
              </button>
              <button className="grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[.03] text-zinc-400 hover:border-cyan-300/30 hover:text-cyan-300 transition">
                <Square className="size-3 fill-current" />
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#02060a]/80 aspect-video grid place-items-center">
            <div className="text-center">
              <MonitorPlay className="size-12 text-zinc-700 mx-auto mb-3" />
              <div className="text-sm font-bold text-zinc-600">{selected.title}</div>
              <div className="text-xs text-zinc-700">{selected.duration}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">Progress</span>
              <span className="text-xs font-black text-white">{selected.progress}%</span>
            </div>
            <ProgressBar value={selected.progress} tone={selected.tone} />
          </div>
        </div>
      </div>
    </MonitorCard>
  );
}

function TrailerTimeline() {
  return (
    <MonitorCard className="p-6" accent="cyan">
      <SectionTitle title="Trailer Timeline" sub="Beat structure for the flagship launch trailer." />
      <div className="relative">
        <div className="absolute left-0 right-0 top-8 h-px bg-gradient-to-r from-cyan-300/30 via-violet-300/30 to-emerald-300/30" />
        <div className="grid grid-cols-4 gap-4">
          {trailerBeats.map((beat, index) => {
            const t = toneClasses(beat.tone);
            return (
              <div key={beat.title} className="relative pt-6">
                <div className={`mx-auto mb-4 grid size-8 place-items-center rounded-full border ${t.border} ${t.bg} text-xs font-black ${t.text}`}>{index + 1}</div>
                <div className={`text-[.65rem] font-black uppercase tracking-[.12em] ${t.text} mb-1`}>{beat.seconds}</div>
                <h3 className="text-sm font-bold text-white mb-2">{beat.title}</h3>
                <p className="text-xs text-zinc-600 leading-5">{beat.note}</p>
              </div>
            );
          })}
        </div>
      </div>
    </MonitorCard>
  );
}

function MotionPromptLab() {
  return (
    <MonitorCard className="p-6" accent="gold">
      <SectionTitle title="Motion Prompt Lab" sub="Generator-ready motion systems for AI video tools." />
      <div className="grid gap-4 md:grid-cols-3">
        {motionPrompts.map((prompt) => {
          const t = toneClasses(prompt.tone);
          return (
            <div key={prompt.title} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <WandSparkles className={`size-4 ${t.text}`} />
                </div>
                <span className={`rounded-full border px-2 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{prompt.quality}%</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{prompt.title}</h3>
              <p className="text-xs text-zinc-600 mb-3">{prompt.tool}</p>
              <ProgressBar value={prompt.quality} tone={prompt.tone} />
              <button className="mt-4 w-full rounded-lg border border-white/[0.06] bg-white/[.03] py-2 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">Use Prompt</button>
            </div>
          );
        })}
      </div>
    </MonitorCard>
  );
}

function ExportPackages() {
  return (
    <MonitorCard className="p-6" accent="green">
      <SectionTitle title="Export Packages" sub="Platform-ready formats for launch distribution." />
      <div className="grid gap-4 md:grid-cols-3">
        {exportPackages.map((pack) => {
          const t = toneClasses(pack.tone);
          return (
            <div key={pack.title} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Download className={`size-4 ${t.text}`} />
                </div>
                <span className={`rounded-full border px-2 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{pack.status}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{pack.title}</h3>
              <p className="text-xs text-zinc-600 mb-3">{pack.ratio}</p>
              <button className="w-full rounded-lg border border-white/[0.06] bg-white/[.03] py-2 text-xs font-bold text-zinc-500 hover:border-emerald-300/30 hover:text-emerald-300 transition">Export</button>
            </div>
          );
        })}
      </div>
    </MonitorCard>
  );
}

function RightRail() {
  return (
    <aside className="space-y-4">
      <MonitorCard className="border-violet-400/20 p-5" accent="violet">
        <SectionTitle title="Render Status" />
        <div className="flex flex-col items-center py-4">
          <div className="relative grid size-28 place-items-center rounded-full border-[8px] border-violet-300/30 bg-violet-500/5">
            <div className="text-3xl font-black text-white">78%</div>
          </div>
          <div className="mt-3 text-sm font-bold text-white">Render Ready</div>
          <div className="text-xs text-zinc-600">2 jobs queued</div>
        </div>
      </MonitorCard>

      <MonitorCard className="p-5" accent="cyan">
        <SectionTitle title="Quick Actions" />
        <div className="space-y-2">
          {["New Project", "Import Footage", "Export All", "Run Render"].map((action) => (
            <button key={action} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[.03] p-3 text-left text-sm font-bold text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-300 transition">
              <Zap className="size-4 text-[#ffd36f]" /> {action}
            </button>
          ))}
        </div>
      </MonitorCard>

      <MonitorCard className="p-5" accent="gold">
        <SectionTitle title="Recent Renders" />
        <div className="space-y-2">
          {["Launch Trailer v3", "Social Cut #12", "BTS montage", "Demo reel"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-xs font-bold text-zinc-400">
              <Film className="size-3 text-violet-300" /> {item}
            </div>
          ))}
        </div>
      </MonitorCard>
    </aside>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function AXSVideoBay() {
  return (
    <div className="relative min-w-0 space-y-5">
      <Hero />
      <ProjectBoard />
      <TrailerTimeline />
      <MotionPromptLab />
      <ExportPackages />
      <RightRail />
    </div>
  );
}
