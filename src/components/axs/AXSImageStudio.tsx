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
  Network,
  Orbit,
  PenLine,
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
  WandSparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";

/* ── Data ─────────────────────────────────────────────────────────────── */

const imageStats = [
  { label: "Gallery", value: "186", icon: Image, tone: "violet" },
  { label: "Prompts", value: "64", icon: Sparkles, tone: "cyan" },
  { label: "Boards", value: "12", icon: FolderOpen, tone: "gold" },
  { label: "Quality", value: "97%", icon: CheckCircle2, tone: "green" },
] as const;

const galleryItems = [
  { id: "IMG-01", title: "Neon Rain", type: "Concept", tone: "cyan", grid: "col-span-2 row-span-2" },
  { id: "IMG-02", title: "City Fracture", type: "Scene", tone: "violet", grid: "col-span-1 row-span-1" },
  { id: "IMG-03", title: "Signal Mask", type: "Prop", tone: "gold", grid: "col-span-1 row-span-1" },
  { id: "IMG-04", title: "Afterglow", type: "Mood", tone: "green", grid: "col-span-1 row-span-2" },
  { id: "IMG-05", title: "The Architects", type: "Character", tone: "cyan", grid: "col-span-1 row-span-1" },
  { id: "IMG-06", title: "Resonance", type: "Abstract", tone: "violet", grid: "col-span-2 row-span-1" },
] as const;

const promptForge = [
  { prompt: "Cinematic wide shot, neon-lit city street, rain, cyberpunk, high contrast, 8K", tool: "Midjourney", score: 96, tone: "cyan" },
  { prompt: "Portrait of female protagonist, dark hair, determined expression, studio lighting", tool: "DALL-E", score: 92, tone: "violet" },
  { prompt: "Abstract visualization of sound waves, gold and cyan gradients, motion blur", tool: "Stable Diffusion", score: 88, tone: "gold" },
] as const;

const styleCanons = [
  { title: "Neon Noir", description: "High contrast, neon accents, rain-slicked surfaces", tone: "cyan" },
  { title: "Gritty Realism", description: "Desaturated, film grain, handheld camera feel", tone: "violet" },
  { title: "Gold Standard", description: "Warm tones, premium textures, soft lighting", tone: "gold" },
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

/* ── Gallery Primitives ──────────────────────────────────────────── */

function GalleryCard({ children, className = "", accent = "violet" }: { children: React.ReactNode; className?: string; accent?: string }) {
  const t = toneClasses(accent);
  return (
    <section className={`relative overflow-hidden rounded-2xl border ${t.softBorder} bg-[#050a14]/90 ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: `radial-gradient(circle at 50% 50%, ${accent === "gold" ? "rgba(214,158,55,.06)" : accent === "violet" ? "rgba(139,92,246,.06)" : "rgba(0,229,255,.06)"}, transparent 60%)` }}
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
      {action ? <button className="shrink-0 rounded-lg border border-white/10 bg-white/[.04] px-3 py-1.5 text-xs font-bold text-zinc-400 hover:border-violet-300/35 hover:text-violet-300 transition">{action}</button> : null}
    </div>
  );
}

/* ── Sections ─────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_33rem]">
      <GalleryCard className="border-violet-300/20" accent="violet">
        <div className="absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,.1), transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,229,255,.05), transparent 40%)" }}
        />
        <div className="relative p-7 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="grid size-8 place-items-center rounded-lg border border-violet-300/30 bg-violet-500/10">
              <Image className="size-4 text-violet-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-[.22em] text-violet-300">Visual Studio</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[.65rem] font-bold uppercase tracking-[.12em] text-emerald-300">Rendering</span>
            </div>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,4.5rem)] font-black leading-[.92] tracking-[-.04em] text-white">
            Image Studio
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Generate images, curate galleries, build mood boards, and forge prompts that lock into every visual asset.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-200 hover:bg-white/[.06] transition">
              <Plus className="size-4" /> New Image
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/8 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-white/[.06] transition">
              <WandSparkles className="size-4" /> Generate
            </button>
          </div>
        </div>
      </GalleryCard>

      <div className="grid grid-cols-2 gap-4">
        {imageStats.map((stat) => {
          const Icon = stat.icon;
          const t = toneClasses(stat.tone);
          return (
            <GalleryCard key={stat.label} className={`p-5 ${t.softBorder}`} accent={stat.tone}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-3xl font-black ${stat.value.includes("%") ? t.text : "text-white"}`}>{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-zinc-600">{stat.label}</div>
                </div>
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Icon className={`size-4 ${t.text}`} />
                </div>
              </div>
            </GalleryCard>
          );
        })}
      </div>
    </div>
  );
}

function GalleryGrid() {
  const [selected, setSelected] = useState<(typeof galleryItems)[number] | null>(null);
  return (
    <GalleryCard className="p-6" accent="violet">
      <SectionTitle title="Gallery" sub="Curated visual assets and concept art." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[8rem]">
        {galleryItems.map((item) => {
          const t = toneClasses(item.tone);
          return (
            <button key={item.id} onClick={() => setSelected(item)}
              className={`relative overflow-hidden rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4 text-left transition hover:border-violet-300/25 ${item.grid} group`}>
              <div className="absolute inset-0 opacity-30"
                style={{ background: `radial-gradient(circle at 50% 50%, ${item.tone === "gold" ? "rgba(214,158,55,.15)" : item.tone === "violet" ? "rgba(139,92,246,.15)" : item.tone === "green" ? "rgba(52,211,153,.15)" : "rgba(0,229,255,.15)"}, transparent 60%)` }}
              />
              <div className="relative h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className={`rounded-full border px-2 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{item.type}</span>
                  <span className="text-xs text-zinc-600">{item.id}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </GalleryCard>
  );
}

function PromptForge() {
  const [selected, setSelected] = useState<(typeof promptForge)[number]>(promptForge[0]);
  return (
    <GalleryCard className="p-6" accent="cyan">
      <SectionTitle title="Prompt Forge" sub="AI-ready image generation prompts." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="space-y-3">
          {promptForge.map((prompt) => {
            const t = toneClasses(prompt.tone);
            const isSelected = selected.prompt === prompt.prompt;
            return (
              <button key={prompt.prompt} onClick={() => setSelected(prompt)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${isSelected ? `${t.softBorder} ${t.bg}` : 'border-white/[0.06] bg-[#04080e]/60 hover:border-white/10'}`}>
                <div className={`grid size-10 place-items-center rounded-full border ${t.border} ${t.bg}`}>
                  <Sparkles className={`size-4 ${t.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white truncate">{prompt.prompt.slice(0, 60)}...</div>
                  <div className="text-xs text-zinc-600">{prompt.tool}</div>
                </div>
                <span className={`text-sm font-black ${t.text}`}>{prompt.score}%</span>
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-5">
          <div className="text-xs font-black uppercase tracking-[.14em] text-zinc-600 mb-4">Selected Prompt</div>
          <div className="rounded-xl border border-white/[0.06] bg-[#02060a]/80 p-4">
            <p className="text-sm text-zinc-300 leading-6">{selected.prompt}</p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className={`text-sm font-bold ${toneClasses(selected.tone).text}`}>{selected.tool}</span>
            <span className="text-sm font-black text-white">{selected.score}%</span>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="flex-1 rounded-lg border border-cyan-300/25 bg-cyan-400/8 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400/12 transition">Copy</button>
            <button className="flex-1 rounded-lg border border-violet-300/25 bg-violet-500/8 py-2 text-xs font-bold text-violet-300 hover:bg-violet-500/12 transition">Generate</button>
          </div>
        </div>
      </div>
    </GalleryCard>
  );
}

function StyleCanon() {
  return (
    <GalleryCard className="p-6" accent="gold">
      <SectionTitle title="Style Canon" sub="Locked visual style guides." />
      <div className="grid gap-4 md:grid-cols-3">
        {styleCanons.map((style) => {
          const t = toneClasses(style.tone);
          return (
            <div key={style.title} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`grid size-8 place-items-center rounded-lg border ${t.border} ${t.bg}`}>
                  <Eye className={`size-4 ${t.text}`} />
                </div>
                <h3 className={`text-sm font-bold ${t.text}`}>{style.title}</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-5">{style.description}</p>
              <button className="mt-4 w-full rounded-lg border border-white/[0.06] bg-white/[.03] py-2 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">View Guide</button>
            </div>
          );
        })}
      </div>
    </GalleryCard>
  );
}

function RightRail() {
  return (
    <aside className="space-y-4">
      <GalleryCard className="border-violet-400/20 p-5" accent="violet">
        <SectionTitle title="Render Status" />
        <div className="flex flex-col items-center py-4">
          <div className="relative grid size-28 place-items-center rounded-full border-[8px] border-violet-300/30 bg-violet-500/5">
            <div className="text-3xl font-black text-white">97%</div>
          </div>
          <div className="mt-3 text-sm font-bold text-white">Quality Score</div>
          <div className="text-xs text-zinc-600">Gallery verified</div>
        </div>
      </GalleryCard>

      <GalleryCard className="p-5" accent="cyan">
        <SectionTitle title="Quick Actions" />
        <div className="space-y-2">
          {["New Image", "Import Asset", "Export Gallery", "Run Analysis"].map((action) => (
            <button key={action} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[.03] p-3 text-left text-sm font-bold text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-300 transition">
              <Zap className="size-4 text-[#ffd36f]" /> {action}
            </button>
          ))}
        </div>
      </GalleryCard>

      <GalleryCard className="p-5" accent="gold">
        <SectionTitle title="Recent Uploads" />
        <div className="space-y-2">
          {["Neon Rain v2", "City Fracture", "Signal Mask", "Afterglow"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-xs font-bold text-zinc-400">
              <Image className="size-3 text-violet-300" /> {item}
            </div>
          ))}
        </div>
      </GalleryCard>
    </aside>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function AXSImageStudio() {
  return (
    <div className="relative min-w-0 space-y-5">
      <Hero />
      <GalleryGrid />
      <PromptForge />
      <StyleCanon />
      <RightRail />
    </div>
  );
}
