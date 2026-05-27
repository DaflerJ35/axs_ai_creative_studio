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

const analyticsStats = [
  { label: "Views", value: "42.1K", icon: Eye, tone: "cyan" },
  { label: "CTR", value: "8.2%", icon: Target, tone: "violet" },
  { label: "Winners", value: "6", icon: Star, tone: "gold" },
  { label: "Revenue", value: "$12.4K", icon: BarChart3, tone: "green" },
] as const;

const platformPerformance = [
  { platform: "YouTube", views: "18.2K", engagement: "12.4%", ctr: "4.2%", trend: "up", score: 94, tone: "cyan" },
  { platform: "TikTok", views: "14.1K", engagement: "18.7%", ctr: "6.8%", trend: "up", score: 91, tone: "violet" },
  { platform: "Instagram", views: "6.3K", engagement: "8.2%", ctr: "3.1%", trend: "flat", score: 82, tone: "gold" },
  { platform: "LinkedIn", views: "3.5K", engagement: "5.4%", ctr: "2.8%", trend: "down", score: 74, tone: "green" },
] as const;

const winningAssets = [
  { title: "Pain-First Hook", type: "Video", platform: "TikTok", score: 96, lift: "+34%", metric: "18.7% engagement", tone: "cyan" },
  { title: "Demo Split", type: "Carousel", platform: "Instagram", score: 92, lift: "+28%", metric: "8.2% engagement", tone: "violet" },
  { title: "Founder Story", type: "Video", platform: "LinkedIn", score: 88, lift: "+22%", metric: "5.4% engagement", tone: "gold" },
] as const;

const plainInsights = [
  { title: "TikTok is winning", plain: "Short-form pain-first hooks on TikTok are outperforming all other platforms by 2.3x.", action: "Double down on TikTok hook production", confidence: 94, tone: "cyan" },
  { title: "Carousel fatigue", plain: "Instagram carousel engagement dropped 18% this week. Video is replacing static.", action: "Shift 50% of carousel budget to Reels", confidence: 87, tone: "violet" },
  { title: "YouTube retention strong", plain: "First 30 seconds of VSL trailers have 94% retention. The hook is working.", action: "Extend trailer runtime to 45 seconds", confidence: 91, tone: "gold" },
] as const;

const funnelHealth = [
  { stage: "Awareness", value: 85, plain: "Strong top-of-funnel traffic from organic and paid", tone: "cyan" },
  { stage: "Interest", value: 72, plain: "Hook performance is above benchmark", tone: "violet" },
  { stage: "Consideration", value: 58, plain: "Demo page needs clearer value prop", tone: "gold" },
  { stage: "Conversion", value: 42, plain: "Checkout abandonment at 58%, payment friction suspected", tone: "slate" },
] as const;

const audienceSignals = [
  { signal: "How much does this cost?", type: "Price", count: 24, tone: "cyan" },
  { signal: "Is this for beginners?", type: "Fit", count: 18, tone: "violet" },
  { signal: "Can I try before buying?", type: "Trial", count: 15, tone: "gold" },
  { signal: "Does this work on Mac?", type: "Tech", count: 8, tone: "green" },
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

/* ── Dashboard Primitives ──────────────────────────────────────────── */

function DashboardCard({ children, className = "", accent = "cyan" }: { children: React.ReactNode; className?: string; accent?: string }) {
  const t = toneClasses(accent);
  return (
    <section className={`relative overflow-hidden rounded-2xl border ${t.softBorder} bg-[#050a14]/90 ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${accent === "gold" ? "rgba(214,158,55,.06)" : accent === "violet" ? "rgba(139,92,246,.06)" : "rgba(0,229,255,.06)"}, transparent 60%)` }}
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
      <DashboardCard className="border-cyan-300/20" accent="cyan">
        <div className="absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(circle at 20% 50%, rgba(0,229,255,.1), transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,.06), transparent 40%)" }}
        />
        <div className="relative p-7 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="grid size-8 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-400/10">
              <BarChart3 className="size-4 text-cyan-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-[.22em] text-cyan-300">Intelligence Center</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[.65rem] font-bold uppercase tracking-[.12em] text-emerald-300">Live Data</span>
            </div>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,4.5rem)] font-black leading-[.92] tracking-[-.04em] text-white">
            Analytics Center
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Turn views, clicks, watch time, comments, saves, and platform results into simple decisions: what is winning, why it won, what failed, and what to make next.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-white/[.06] transition">
              <Plus className="size-4" /> New Report
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-violet-300/35 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-200 hover:bg-white/[.06] transition">
              <Brain className="size-4" /> Generate Insight
            </button>
          </div>
        </div>
      </DashboardCard>

      <div className="grid grid-cols-2 gap-4">
        {analyticsStats.map((stat) => {
          const Icon = stat.icon;
          const t = toneClasses(stat.tone);
          return (
            <DashboardCard key={stat.label} className={`p-5 ${t.softBorder}`} accent={stat.tone}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-3xl font-black ${stat.value.includes("%") || stat.value.includes("$") ? t.text : "text-white"}`}>{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-zinc-600">{stat.label}</div>
                </div>
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Icon className={`size-4 ${t.text}`} />
                </div>
              </div>
            </DashboardCard>
          );
        })}
      </div>
    </div>
  );
}

function PlatformPerformance() {
  return (
    <DashboardCard className="p-6" accent="cyan">
      <SectionTitle title="Platform Performance" sub="Brand-colored lanes show where attention is strongest." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {platformPerformance.map((platform) => {
          const t = toneClasses(platform.tone);
          return (
            <div key={platform.platform} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe2 className={`size-4 ${t.text}`} />
                  <span className="font-bold text-white">{platform.platform}</span>
                </div>
                <TrendingUp className={`size-4 ${t.text}`} />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg border border-white/[0.06] bg-white/[.03] p-3">
                  <div className="text-xs text-zinc-600">Engagement</div>
                  <div className="text-sm font-black text-white">{platform.engagement}</div>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-white/[.03] p-3">
                  <div className="text-xs text-zinc-600">CTR</div>
                  <div className="text-sm font-black text-white">{platform.ctr}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1"><ProgressBar value={platform.score} tone={platform.tone} /></div>
                <span className={`text-sm font-black ${t.text}`}>{platform.score}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}

function WinnerFinder() {
  const [selected, setSelected] = useState<(typeof winningAssets)[number]>(winningAssets[0]);
  return (
    <DashboardCard className="p-6" accent="gold">
      <SectionTitle title="Winner Finder" sub="Assets worth copying, remixing, and sending back into production." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="space-y-3">
          {winningAssets.map((asset) => {
            const t = toneClasses(asset.tone);
            const isSelected = selected.title === asset.title;
            return (
              <button key={asset.title} onClick={() => setSelected(asset)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${isSelected ? `${t.softBorder} ${t.bg}` : 'border-white/[0.06] bg-[#04080e]/60 hover:border-white/10'}`}>
                <div className={`grid size-10 place-items-center rounded-full border ${t.border} ${t.bg}`}>
                  <Star className={`size-4 ${t.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white">{asset.title}</div>
                  <div className="text-xs text-zinc-600">{asset.type} · {asset.platform}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-black ${t.text}`}>{asset.score}%</div>
                  <div className="text-xs text-emerald-300">{asset.lift}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-5">
          <div className="text-xs font-black uppercase tracking-[.14em] text-zinc-600 mb-4">Selected Winner</div>
          <div className="mb-4">
            <div className="text-lg font-black text-white">{selected.title}</div>
            <div className="text-xs text-zinc-600">{selected.type} · {selected.platform}</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#02060a]/80 p-4 mb-4">
            <div className="text-sm text-zinc-300 font-bold">{selected.metric}</div>
            <div className="text-xs text-zinc-600 mt-1">{selected.lift} vs baseline</div>
          </div>
          <ProgressBar value={selected.score} tone={selected.tone} />
          <div className="mt-4 flex gap-3">
            <button className="flex-1 rounded-lg border border-cyan-300/25 bg-cyan-400/8 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400/12 transition">Copy</button>
            <button className="flex-1 rounded-lg border border-violet-300/25 bg-violet-500/8 py-2 text-xs font-bold text-violet-300 hover:bg-violet-500/12 transition">Remix</button>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

function PlainInsights() {
  return (
    <DashboardCard className="p-6" accent="violet">
      <SectionTitle title="Plain-English Intelligence" sub="What happened, what it means, and what to do next." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plainInsights.map((insight) => {
          const t = toneClasses(insight.tone);
          return (
            <div key={insight.title} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`grid size-8 place-items-center rounded-lg border ${t.border} ${t.bg}`}>
                  <Brain className={`size-4 ${t.text}`} />
                </div>
                <h3 className="text-sm font-bold text-white">{insight.title}</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-5 mb-3">{insight.plain}</p>
              <div className="rounded-xl border border-white/[0.06] bg-white/[.03] p-3 mb-3">
                <div className={`text-[.65rem] font-black uppercase tracking-[.1em] ${t.text} mb-1`}>Do Next</div>
                <p className="text-xs font-bold text-zinc-300">{insight.action}</p>
              </div>
              <ProgressBar value={insight.confidence} tone={insight.tone} />
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}

function FunnelHealth() {
  return (
    <DashboardCard className="p-6" accent="green">
      <SectionTitle title="Funnel Health" sub="Where the launch is strong and where people drop off." />
      <div className="grid gap-4 xl:grid-cols-4">
        {funnelHealth.map((stage) => {
          const t = toneClasses(stage.tone);
          return (
            <div key={stage.stage} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className={`text-xs font-black uppercase tracking-[.14em] ${t.text} mb-2`}>{stage.stage}</div>
              <div className="text-3xl font-black text-white mb-2">{stage.value}%</div>
              <p className="text-xs text-zinc-600 leading-5">{stage.plain}</p>
              <ProgressBar value={stage.value} tone={stage.tone} />
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}

function AudienceSignals() {
  return (
    <DashboardCard className="p-6" accent="cyan">
      <SectionTitle title="Audience Signal Decoder" sub="Comments and reactions translated into content ideas." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {audienceSignals.map((signal) => {
          const t = toneClasses(signal.tone);
          return (
            <div key={signal.signal} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`rounded-full border px-2 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{signal.type}</span>
                <span className="text-sm font-black text-white">{signal.count}x</span>
              </div>
              <p className="text-sm font-bold text-zinc-200 leading-5">"{signal.signal}"</p>
              <button className="mt-4 w-full rounded-lg border border-white/[0.06] bg-white/[.03] py-2 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">Turn Into Content</button>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}

function RightRail() {
  return (
    <aside className="space-y-4">
      <DashboardCard className="border-cyan-400/20 p-5" accent="cyan">
        <SectionTitle title="Signal Confidence" />
        <div className="flex flex-col items-center py-4">
          <div className="relative grid size-28 place-items-center rounded-full border-[8px] border-cyan-300/30 bg-cyan-400/5">
            <div className="text-3xl font-black text-white">88%</div>
          </div>
          <div className="mt-3 text-sm font-bold text-white">Confidence</div>
          <div className="text-xs text-zinc-600">Enough data to guide next batch</div>
        </div>
      </DashboardCard>

      <DashboardCard className="p-5" accent="gold">
        <SectionTitle title="Quick Actions" />
        <div className="space-y-2">
          {["New Report", "Pull Comments", "Export Data", "Run Analysis"].map((action) => (
            <button key={action} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[.03] p-3 text-left text-sm font-bold text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-300 transition">
              <Zap className="size-4 text-[#ffd36f]" /> {action}
            </button>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard className="p-5" accent="violet">
        <SectionTitle title="Learning Locks" />
        <div className="space-y-2">
          {["Pain-first hooks winning", "Demo clips beat abstract", "$49 needs proof examples", "LinkedIn wants founder logic"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-xs font-bold text-zinc-400">
              <Lock className="size-3 text-cyan-300" /> {item}
            </div>
          ))}
        </div>
      </DashboardCard>
    </aside>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function AXSAnalyticsCenter() {
  return (
    <div className="relative min-w-0 space-y-5">
      <Hero />
      <PlatformPerformance />
      <WinnerFinder />
      <PlainInsights />
      <FunnelHealth />
      <AudienceSignals />
      <RightRail />
    </div>
  );
}
