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
  PenLine,
  Plus,
  RadioTower,
  Rocket,
  Save,
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
  UserRound,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";

/* ── Data ─────────────────────────────────────────────────────────────── */

const campaignStats = [
  { label: "Active", value: "7", icon: Megaphone, tone: "gold" },
  { label: "Scheduled", value: "14", icon: CalendarDays, tone: "cyan" },
  { label: "Platforms", value: "6", icon: Globe2, tone: "violet" },
  { label: "Readiness", value: "74%", icon: CheckCircle2, tone: "green" },
] as const;

const campaignBoard = [
  { title: "Launch Week 1", platform: "Multi", date: "May 20", status: "Live", tone: "green" },
  { title: "Product Demo", platform: "YouTube", date: "May 22", status: "Scheduled", tone: "cyan" },
  { title: "Hook Test A", platform: "TikTok", date: "May 23", status: "Scheduled", tone: "violet" },
  { title: "Retargeting", platform: "Meta", date: "May 25", status: "Draft", tone: "gold" },
  { title: "Founder Story", platform: "LinkedIn", date: "May 27", status: "Draft", tone: "slate" },
] as const;

const contentBatch = [
  { title: "VSL Cut 1", type: "Video", status: "Ready", tone: "cyan" },
  { title: "Carousel Set A", type: "Images", status: "Ready", tone: "violet" },
  { title: "Email Sequence", type: "Text", status: "Review", tone: "gold" },
  { title: "Ad Hook Pack", type: "Ads", status: "Draft", tone: "green" },
] as const;

const platformMatrix = [
  { platform: "YouTube", status: "Active", reach: "12.4K", engagement: "8.2%", tone: "cyan" },
  { platform: "TikTok", status: "Active", reach: "8.1K", engagement: "12.4%", tone: "violet" },
  { platform: "Instagram", status: "Scheduled", reach: "6.3K", engagement: "6.8%", tone: "gold" },
  { platform: "LinkedIn", status: "Scheduled", reach: "4.2K", engagement: "4.1%", tone: "green" },
] as const;

const hookBank = [
  { hook: "I spent $40K on tools I never used.", angle: "Pain-First", score: 96, tone: "cyan" },
  { hook: "The system isn't broken. It was built this way.", angle: "Authority", score: 92, tone: "violet" },
  { hook: "Three lines. One decision. Zero regret.", angle: "Direct", score: 89, tone: "gold" },
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
    case "slate":
      return { text: "text-slate-300", border: "border-slate-500/35", softBorder: "border-slate-500/20", bg: "bg-slate-500/9", glow: "shadow-[0_0_24px_rgba(148,163,184,.08)]", gradient: "from-slate-400 to-slate-200" };
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

/* ── Board Primitives ──────────────────────────────────────────────── */

function BoardCard({ children, className = "", accent = "gold" }: { children: React.ReactNode; className?: string; accent?: string }) {
  const t = toneClasses(accent);
  return (
    <section className={`relative overflow-hidden rounded-2xl border ${t.softBorder} bg-[#050a14]/90 ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: `radial-gradient(circle at 50% 0%, ${accent === "gold" ? "rgba(214,158,55,.07)" : accent === "violet" ? "rgba(139,92,246,.07)" : "rgba(0,229,255,.07)"}, transparent 50%)` }}
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
      {action ? <button className="shrink-0 rounded-lg border border-white/10 bg-white/[.04] px-3 py-1.5 text-xs font-bold text-zinc-400 hover:border-[#b8892e]/40 hover:text-[#ffd36f] transition">{action}</button> : null}
    </div>
  );
}

/* ── Sections ─────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_33rem]">
      <BoardCard className="border-[#b8892e]/25" accent="gold">
        <div className="absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(circle at 20% 50%, rgba(214,158,55,.1), transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,.06), transparent 40%)" }}
        />
        <div className="relative p-7 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="grid size-8 place-items-center rounded-lg border border-[#b8892e]/40 bg-[#1b1205]/50">
              <Megaphone className="size-4 text-[#ffd36f]" />
            </div>
            <span className="text-xs font-black uppercase tracking-[.22em] text-[#ffd36f]">Campaign HQ</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[.65rem] font-bold uppercase tracking-[.12em] text-emerald-300">Active</span>
            </div>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,4.5rem)] font-black leading-[.92] tracking-[-.04em] text-white">
            Campaign Board
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Plan, schedule, and orchestrate multi-platform campaigns. Every piece of content mapped to the right channel at the right time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#ffe08a]/50 bg-gradient-to-r from-[#ffd36f] to-[#b98025] px-4 py-2.5 text-sm font-black text-black hover:brightness-110 transition">
              <Plus className="size-4" /> New Campaign
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/8 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-white/[.06] transition">
              <CalendarDays className="size-4" /> Schedule
            </button>
          </div>
        </div>
      </BoardCard>

      <div className="grid grid-cols-2 gap-4">
        {campaignStats.map((stat) => {
          const Icon = stat.icon;
          const t = toneClasses(stat.tone);
          return (
            <BoardCard key={stat.label} className={`p-5 ${t.softBorder}`} accent={stat.tone}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-3xl font-black ${stat.value.includes("%") ? t.text : "text-white"}`}>{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-zinc-600">{stat.label}</div>
                </div>
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Icon className={`size-4 ${t.text}`} />
                </div>
              </div>
            </BoardCard>
          );
        })}
      </div>
    </div>
  );
}

function CampaignBoardSection() {
  return (
    <BoardCard className="p-6" accent="gold">
      <SectionTitle title="Campaign Board" sub="Active and scheduled campaigns." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campaignBoard.map((campaign) => {
          const t = toneClasses(campaign.tone);
          return (
            <div key={campaign.title} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{campaign.status}</span>
                <span className="text-xs text-zinc-600">{campaign.date}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{campaign.title}</h3>
              <p className="text-xs text-zinc-600">{campaign.platform}</p>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-lg border border-white/[0.06] bg-white/[.03] py-2 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">Edit</button>
                <button className="flex-1 rounded-lg border border-white/[0.06] bg-white/[.03] py-2 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">Preview</button>
              </div>
            </div>
          );
        })}
      </div>
    </BoardCard>
  );
}

function LaunchCalendar() {
  return (
    <BoardCard className="p-6" accent="cyan">
      <SectionTitle title="Launch Calendar" sub="Content schedule for the next 30 days." />
      <div className="grid grid-cols-7 gap-2">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-bold uppercase tracking-[.1em] text-zinc-600 py-2">{d}</div>
        ))}
        {Array.from({ length: 31 }).map((_, i) => {
          const day = i + 1;
          const hasEvent = [5, 12, 15, 20, 22, 25, 28].includes(day);
          return (
            <div key={day} className={`aspect-square rounded-lg border p-2 text-center transition ${hasEvent ? 'border-cyan-300/20 bg-cyan-400/5' : 'border-white/[0.04] bg-white/[.02] hover:border-white/10'}`}>
              <span className={`text-sm font-bold ${hasEvent ? 'text-cyan-300' : 'text-zinc-600'}`}>{day}</span>
              {hasEvent && <div className="mx-auto mt-1 size-1.5 rounded-full bg-cyan-400" />}
            </div>
          );
        })}
      </div>
    </BoardCard>
  );
}

function ContentBatch() {
  return (
    <BoardCard className="p-6" accent="violet">
      <SectionTitle title="Content Batch" sub="Assets ready for deployment." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {contentBatch.map((item) => {
          const t = toneClasses(item.tone);
          return (
            <div key={item.title} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <FileText className={`size-4 ${t.text}`} />
                </div>
                <span className={`rounded-full border px-2 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{item.status}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
              <p className="text-xs text-zinc-600">{item.type}</p>
              <button className="mt-4 w-full rounded-lg border border-white/[0.06] bg-white/[.03] py-2 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">Deploy</button>
            </div>
          );
        })}
      </div>
    </BoardCard>
  );
}

function PlatformMatrix() {
  return (
    <BoardCard className="p-6" accent="green">
      <SectionTitle title="Platform Matrix" sub="Channel performance and allocation." />
      <div className="space-y-3">
        {platformMatrix.map((platform) => {
          const t = toneClasses(platform.tone);
          return (
            <div key={platform.platform} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className={`grid size-10 place-items-center rounded-lg border ${t.border} ${t.bg}`}>
                <Globe2 className={`size-4 ${t.text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{platform.platform}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{platform.status}</span>
                </div>
                <div className="text-xs text-zinc-600">Reach: {platform.reach} · Engagement: {platform.engagement}</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-black ${t.text}`}>{platform.engagement}</div>
                <div className="text-xs text-zinc-600">engagement</div>
              </div>
            </div>
          );
        })}
      </div>
    </BoardCard>
  );
}

function HookBank() {
  return (
    <BoardCard className="p-6" accent="cyan">
      <SectionTitle title="Campaign Hook Bank" sub="Highest leverage hooks attached to active launch plan." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {hookBank.map((hook) => {
          const t = toneClasses(hook.tone);
          return (
            <div key={hook.hook} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{hook.angle}</span>
                <span className={`text-lg font-black ${t.text}`}>{hook.score}%</span>
              </div>
              <p className="text-sm font-bold text-zinc-200 leading-6">"{hook.hook}"</p>
              <ProgressBar value={hook.score} tone={hook.tone} />
              <button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[.03] px-3 py-2 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">
                <Copy className="size-3" /> Copy
              </button>
            </div>
          );
        })}
      </div>
    </BoardCard>
  );
}

function RightRail() {
  return (
    <aside className="space-y-4">
      <BoardCard className="border-gold-400/20 p-5" accent="gold">
        <SectionTitle title="Launch Control" />
        <div className="flex flex-col items-center py-4">
          <div className="relative grid size-28 place-items-center rounded-full border-[8px] border-[#b8892e]/30 bg-[#1b1205]/40">
            <div className="text-3xl font-black text-white">74%</div>
          </div>
          <div className="mt-3 text-sm font-bold text-white">Launch Readiness</div>
          <div className="text-xs text-zinc-600">Assets + hooks + schedule</div>
        </div>
      </BoardCard>

      <BoardCard className="p-5" accent="cyan">
        <SectionTitle title="Quick Actions" />
        <div className="space-y-2">
          {["New Campaign", "Import Calendar", "Export Plan", "Run Audit"].map((action) => (
            <button key={action} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[.03] p-3 text-left text-sm font-bold text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-300 transition">
              <Zap className="size-4 text-[#ffd36f]" /> {action}
            </button>
          ))}
        </div>
      </BoardCard>

      <BoardCard className="p-5" accent="violet">
        <SectionTitle title="Upcoming Launches" />
        <div className="space-y-2">
          {["Launch Week 1", "Product Demo", "Hook Test A", "Retargeting"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-xs font-bold text-zinc-400">
              <Megaphone className="size-3 text-[#ffd36f]" /> {item}
            </div>
          ))}
        </div>
      </BoardCard>
    </aside>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function AXSCampaignBoard() {
  return (
    <div className="relative min-w-0 space-y-5">
      <Hero />
      <CampaignBoardSection />
      <LaunchCalendar />
      <ContentBatch />
      <PlatformMatrix />
      <HookBank />
      <RightRail />
    </div>
  );
}
