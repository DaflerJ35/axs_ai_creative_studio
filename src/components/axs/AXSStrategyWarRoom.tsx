import {
  Archive,
  ArrowUpRight,
  BarChart3,
  Bell,
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

const strategyStats = [
  { label: "Active Offers", value: "6", icon: Target, tone: "gold" },
  { label: "Funnels", value: "4", icon: GitBranch, tone: "violet" },
  { label: "Angles", value: "18", icon: Flag, tone: "cyan" },
  { label: "Conversion", value: "12%", icon: TrendingUp, tone: "green" },
] as const;

const offerLadder = [
  { tier: "Free", name: "Starter Toolkit", price: "$0", conversion: "45%", users: "2,400", tone: "cyan" },
  { tier: "Core", name: "Creator Suite", price: "$49/mo", conversion: "28%", users: "840", tone: "violet" },
  { tier: "Pro", name: "Studio Engine", price: "$149/mo", conversion: "12%", users: "180", tone: "gold" },
  { tier: "Enterprise", name: "Agency Stack", price: "Custom", conversion: "4%", users: "24", tone: "green" },
] as const;

const angleBoard = [
  { angle: "Pain-First Hook", score: 94, status: "Winning", tone: "green" },
  { angle: "Demo-First", score: 87, status: "Strong", tone: "cyan" },
  { angle: "Founder Story", score: 82, status: "Testing", tone: "gold" },
  { angle: "Social Proof", score: 76, status: "Testing", tone: "violet" },
  { angle: "FOMO Urgency", score: 71, status: "Weak", tone: "slate" },
] as const;

const objections = [
  { objection: "Too expensive", rebuttal: "ROI calculator + payment plan", tone: "cyan" },
  { objection: "Not enough time", rebuttal: "5-min setup promise + templates", tone: "violet" },
  { objection: "Too complex", rebuttal: "Simplified onboarding + walkthrough", tone: "gold" },
  { objection: "Need team buy-in", rebuttal: "Team demo + shared workspace", tone: "green" },
] as const;

const funnelStages = [
  { stage: "Awareness", visitors: "12,400", drop: "—", tone: "cyan" },
  { stage: "Interest", visitors: "8,200", drop: "34%", tone: "violet" },
  { stage: "Consideration", visitors: "3,100", drop: "62%", tone: "gold" },
  { stage: "Conversion", visitors: "840", drop: "73%", tone: "green" },
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

/* ── War Room Primitives ──────────────────────────────────────────── */

function WarCard({ children, className = "", accent = "gold" }: { children: React.ReactNode; className?: string; accent?: string }) {
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
      <WarCard className="border-[#b8892e]/25" accent="gold">
        <div className="absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(circle at 20% 50%, rgba(214,158,55,.1), transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,.06), transparent 40%)" }}
        />
        <div className="relative p-7 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="grid size-8 place-items-center rounded-lg border border-[#b8892e]/40 bg-[#1b1205]/50">
              <Target className="size-4 text-[#ffd36f]" />
            </div>
            <span className="text-xs font-black uppercase tracking-[.22em] text-[#ffd36f]">War Room</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[.65rem] font-bold uppercase tracking-[.12em] text-emerald-300">Live Intel</span>
            </div>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,4.5rem)] font-black leading-[.92] tracking-[-.04em] text-white">
            Strategy War Room
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Build offer ladders, test angles, map funnels, and manage objections. Every decision is backed by live performance data.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#ffe08a]/50 bg-gradient-to-r from-[#ffd36f] to-[#b98025] px-4 py-2.5 text-sm font-black text-black hover:brightness-110 transition">
              <Plus className="size-4" /> New Campaign
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/8 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-white/[.06] transition">
              <Flag className="size-4" /> New Angle
            </button>
          </div>
        </div>
      </WarCard>

      <div className="grid grid-cols-2 gap-4">
        {strategyStats.map((stat) => {
          const Icon = stat.icon;
          const t = toneClasses(stat.tone);
          return (
            <WarCard key={stat.label} className={`p-5 ${t.softBorder}`} accent={stat.tone}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-3xl font-black ${stat.value.includes("%") ? t.text : "text-white"}`}>{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-zinc-600">{stat.label}</div>
                </div>
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Icon className={`size-4 ${t.text}`} />
                </div>
              </div>
            </WarCard>
          );
        })}
      </div>
    </div>
  );
}

function OfferLadder() {
  return (
    <WarCard className="p-6" accent="gold">
      <SectionTitle title="Offer Ladder" sub="Revenue tiers and conversion metrics." />
      <div className="space-y-3">
        {offerLadder.map((offer, index) => {
          const t = toneClasses(offer.tone);
          return (
            <div key={offer.name} className={`flex items-center gap-4 rounded-xl border p-4 ${t.softBorder} ${index === 1 ? t.bg : 'bg-[#04080e]/60'}`}>
              <div className={`grid size-10 place-items-center rounded-lg border ${t.border} ${t.bg} text-sm font-black ${t.text}`}>{offer.tier[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{offer.name}</span>
                  <span className={`text-xs font-bold ${t.text}`}>{offer.price}</span>
                </div>
                <div className="text-xs text-zinc-600">{offer.users} users · {offer.conversion} conversion</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24"><ProgressBar value={parseInt(offer.conversion) * 2} tone={offer.tone} /></div>
                <span className={`text-sm font-black ${t.text}`}>{offer.conversion}</span>
              </div>
            </div>
          );
        })}
      </div>
    </WarCard>
  );
}

function AngleBoard() {
  return (
    <WarCard className="p-6" accent="cyan">
      <SectionTitle title="Angle Board" sub="Hook angles ranked by performance." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {angleBoard.map((angle) => {
          const t = toneClasses(angle.tone);
          return (
            <div key={angle.angle} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{angle.status}</span>
                <span className={`text-lg font-black ${t.text}`}>{angle.score}%</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-3">{angle.angle}</h3>
              <ProgressBar value={angle.score} tone={angle.tone} />
            </div>
          );
        })}
      </div>
    </WarCard>
  );
}

function FunnelMap() {
  return (
    <WarCard className="p-6" accent="violet">
      <SectionTitle title="Funnel Map" sub="Conversion flow and drop-off analysis." />
      <div className="grid gap-4 xl:grid-cols-4">
        {funnelStages.map((stage, index) => {
          const t = toneClasses(stage.tone);
          return (
            <div key={stage.stage} className={`relative rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              {index < funnelStages.length - 1 && (
                <div className="hidden xl:block absolute -right-4 top-1/2 z-10">
                  <ArrowUpRight className="size-4 text-zinc-700 rotate-45" />
                </div>
              )}
              <div className={`text-xs font-black uppercase tracking-[.14em] ${t.text} mb-2`}>{stage.stage}</div>
              <div className="text-2xl font-black text-white mb-1">{stage.visitors}</div>
              <div className="text-xs text-zinc-600">{stage.drop !== "—" ? `${stage.drop} drop-off` : "Entry point"}</div>
            </div>
          );
        })}
      </div>
    </WarCard>
  );
}

function ObjectionBank() {
  return (
    <WarCard className="p-6" accent="green">
      <SectionTitle title="Objection Bank" sub="Common objections and winning rebuttals." />
      <div className="space-y-3">
        {objections.map((obj) => {
          const t = toneClasses(obj.tone);
          return (
            <div key={obj.objection} className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className={`grid size-10 place-items-center rounded-full border ${t.border} ${t.bg} shrink-0`}>
                <ShieldCheck className={`size-4 ${t.text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white mb-1">"{obj.objection}"</div>
                <div className={`text-sm ${t.text}`}>{obj.rebuttal}</div>
              </div>
            </div>
          );
        })}
      </div>
    </WarCard>
  );
}

function RightRail() {
  return (
    <aside className="space-y-4">
      <WarCard className="border-gold-400/20 p-5" accent="gold">
        <SectionTitle title="Strategy Score" />
        <div className="flex flex-col items-center py-4">
          <div className="relative grid size-28 place-items-center rounded-full border-[8px] border-[#b8892e]/30 bg-[#1b1205]/40">
            <div className="text-3xl font-black text-white">87%</div>
          </div>
          <div className="mt-3 text-sm font-bold text-white">Funnel Health</div>
          <div className="text-xs text-zinc-600">All systems optimal</div>
        </div>
      </WarCard>

      <WarCard className="p-5" accent="cyan">
        <SectionTitle title="Quick Actions" />
        <div className="space-y-2">
          {["New Offer", "Test Angle", "Export Report", "Run Audit"].map((action) => (
            <button key={action} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[.03] p-3 text-left text-sm font-bold text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-300 transition">
              <Zap className="size-4 text-[#ffd36f]" /> {action}
            </button>
          ))}
        </div>
      </WarCard>

      <WarCard className="p-5" accent="violet">
        <SectionTitle title="Active Tests" />
        <div className="space-y-2">
          {["Pain-First vs Demo-First", "$49 vs $99 pricing", "Video vs carousel", "Long vs short form"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-xs font-bold text-zinc-400">
              <Target className="size-3 text-[#ffd36f]" /> {item}
            </div>
          ))}
        </div>
      </WarCard>
    </aside>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function AXSStrategyWarRoom() {
  return (
    <div className="relative min-w-0 space-y-5">
      <Hero />
      <OfferLadder />
      <AngleBoard />
      <FunnelMap />
      <ObjectionBank />
      <RightRail />
    </div>
  );
}
