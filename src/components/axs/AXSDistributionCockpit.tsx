import {
  Archive,
  ArrowUpRight,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clapperboard,
  Copy,
  Dna,
  Eye,
  FileText,
  Film,
  Filter,
  Flag,
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
  Package,
  PenLine,
  Plus,
  Radio,
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
  TrendingUp,
  Truck,
  UserRound,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";

/* ── Data ─────────────────────────────────────────────────────────────── */

const distStats = [
  { label: "Channels", value: "8", icon: RadioTower, tone: "cyan" },
  { label: "Queued", value: "14", icon: Package, tone: "violet" },
  { label: "Published", value: "42", icon: CheckCircle2, tone: "green" },
  { label: "Success", value: "96%", icon: TrendingUp, tone: "gold" },
] as const;

const publishLanes = [
  { lane: "YouTube", status: "Active", queued: "3", published: "12", tone: "cyan" },
  { lane: "TikTok", status: "Active", queued: "5", published: "18", tone: "violet" },
  { lane: "Instagram", status: "Active", queued: "2", published: "8", tone: "gold" },
  { lane: "LinkedIn", status: "Scheduled", queued: "4", published: "4", tone: "green" },
] as const;

const schedule = [
  { time: "09:00", content: "YouTube Trailer", platform: "YouTube", tone: "cyan" },
  { time: "12:00", content: "TikTok Hook", platform: "TikTok", tone: "violet" },
  { time: "15:00", content: "LinkedIn Article", platform: "LinkedIn", tone: "green" },
  { time: "18:00", content: "Instagram Carousel", platform: "Instagram", tone: "gold" },
] as const;

const queue = [
  { title: "VSL Final", platform: "YouTube", priority: "High", tone: "cyan" },
  { title: "Hook Pack B", platform: "TikTok", priority: "Medium", tone: "violet" },
  { title: "BTS Montage", platform: "Instagram", priority: "Low", tone: "gold" },
] as const;

const repurpose = [
  { source: "Launch Trailer", targets: ["YouTube Shorts", "TikTok", "Reels"], tone: "cyan" },
  { source: "Product Demo", targets: ["LinkedIn", "Twitter", "Blog"], tone: "violet" },
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

/* ── Cockpit Primitives ──────────────────────────────────────────── */

function CockpitCard({ children, className = "", accent = "cyan" }: { children: React.ReactNode; className?: string; accent?: string }) {
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

/* ── Sections ─────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_33rem]">
      <CockpitCard className="border-cyan-300/20" accent="cyan">
        <div className="absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(circle at 50% 100%, rgba(0,229,255,.1), transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,.05), transparent 40%)" }}
        />
        <div className="relative p-7 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="grid size-8 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-400/10">
              <RadioTower className="size-4 text-cyan-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-[.22em] text-cyan-300">Distribution Control</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[.65rem] font-bold uppercase tracking-[.12em] text-emerald-300">Broadcasting</span>
            </div>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,4.5rem)] font-black leading-[.92] tracking-[-.04em] text-white">
            Distribution Cockpit
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Route content to every platform, monitor publish queues, manage repurpose pipelines, and track distribution health from a single control center.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-white/[.06] transition">
              <Plus className="size-4" /> New Route
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-violet-300/35 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-200 hover:bg-white/[.06] transition">
              <Send className="size-4" /> Publish All
            </button>
          </div>
        </div>
      </CockpitCard>

      <div className="grid grid-cols-2 gap-4">
        {distStats.map((stat) => {
          const Icon = stat.icon;
          const t = toneClasses(stat.tone);
          return (
            <CockpitCard key={stat.label} className={`p-5 ${t.softBorder}`} accent={stat.tone}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-3xl font-black ${stat.value.includes("%") ? t.text : "text-white"}`}>{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-zinc-600">{stat.label}</div>
                </div>
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Icon className={`size-4 ${t.text}`} />
                </div>
              </div>
            </CockpitCard>
          );
        })}
      </div>
    </div>
  );
}

function PublishLanes() {
  return (
    <CockpitCard className="p-6" accent="cyan">
      <SectionTitle title="Publish Lanes" sub="Active distribution channels and their status." />
      <div className="space-y-3">
        {publishLanes.map((lane) => {
          const t = toneClasses(lane.tone);
          return (
            <div key={lane.lane} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className={`grid size-10 place-items-center rounded-lg border ${t.border} ${t.bg}`}>
                <RadioTower className={`size-4 ${t.text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{lane.lane}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{lane.status}</span>
                </div>
                <div className="text-xs text-zinc-600">{lane.queued} queued · {lane.published} published</div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-white/[0.06] bg-white/[.03] px-3 py-1.5 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">Queue</button>
                <button className="rounded-lg border border-white/[0.06] bg-white/[.03] px-3 py-1.5 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">Stats</button>
              </div>
            </div>
          );
        })}
      </div>
    </CockpitCard>
  );
}

function PlatformSchedule() {
  return (
    <CockpitCard className="p-6" accent="violet">
      <SectionTitle title="Platform Schedule" sub="Today's publishing timeline." />
      <div className="space-y-3">
        {schedule.map((slot) => {
          const t = toneClasses(slot.tone);
          return (
            <div key={slot.time} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className={`text-sm font-black ${t.text} w-12`}>{slot.time}</div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white">{slot.content}</div>
                <div className="text-xs text-zinc-600">{slot.platform}</div>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>Scheduled</span>
            </div>
          );
        })}
      </div>
    </CockpitCard>
  );
}

function ContentQueue() {
  return (
    <CockpitCard className="p-6" accent="gold">
      <SectionTitle title="Content Queue" sub="Pending publications by priority." />
      <div className="space-y-3">
        {queue.map((item) => {
          const t = toneClasses(item.tone);
          return (
            <div key={item.title} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className={`grid size-10 place-items-center rounded-lg border ${t.border} ${t.bg}`}>
                <Package className={`size-4 ${t.text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white">{item.title}</div>
                <div className="text-xs text-zinc-600">{item.platform}</div>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{item.priority}</span>
            </div>
          );
        })}
      </div>
    </CockpitCard>
  );
}

function RepurposeMatrix() {
  return (
    <CockpitCard className="p-6" accent="green">
      <SectionTitle title="Repurpose Matrix" sub="Source content and its derivative targets." />
      <div className="space-y-4">
        {repurpose.map((item) => {
          const t = toneClasses(item.tone);
          return (
            <div key={item.source} className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`grid size-10 place-items-center rounded-lg border ${t.border} ${t.bg}`}>
                  <Film className={`size-4 ${t.text}`} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{item.source}</div>
                  <div className="text-xs text-zinc-600">Source</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.targets.map((target) => (
                  <span key={target} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${t.border} ${t.bg} ${t.text}`}>{target}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </CockpitCard>
  );
}

function RightRail() {
  return (
    <aside className="space-y-4">
      <CockpitCard className="border-cyan-400/20 p-5" accent="cyan">
        <SectionTitle title="Distribution Health" />
        <div className="flex flex-col items-center py-4">
          <div className="relative grid size-28 place-items-center rounded-full border-[8px] border-cyan-300/30 bg-cyan-400/5">
            <div className="text-3xl font-black text-white">96%</div>
          </div>
          <div className="mt-3 text-sm font-bold text-white">Success Rate</div>
          <div className="text-xs text-zinc-600">All channels healthy</div>
        </div>
      </CockpitCard>

      <CockpitCard className="p-5" accent="violet">
        <SectionTitle title="Quick Actions" />
        <div className="space-y-2">
          {["New Route", "Import Content", "Export Report", "Run Audit"].map((action) => (
            <button key={action} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[.03] p-3 text-left text-sm font-bold text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-300 transition">
              <Zap className="size-4 text-[#ffd36f]" /> {action}
            </button>
          ))}
        </div>
      </CockpitCard>

      <CockpitCard className="p-5" accent="gold">
        <SectionTitle title="Recent Publishes" />
        <div className="space-y-2">
          {["YouTube Trailer", "TikTok Hook #5", "LinkedIn Article", "Instagram BTS"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-xs font-bold text-zinc-400">
              <Send className="size-3 text-cyan-300" /> {item}
            </div>
          ))}
        </div>
      </CockpitCard>
    </aside>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function AXSDistributionCockpit() {
  return (
    <div className="relative min-w-0 space-y-5">
      <Hero />
      <PublishLanes />
      <PlatformSchedule />
      <ContentQueue />
      <RepurposeMatrix />
      <RightRail />
    </div>
  );
}
