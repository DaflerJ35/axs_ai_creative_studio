import {
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clapperboard,
  Clock3,
  Cpu,
  Database,
  Eye,
  Film,
  Filter,
  Flag,
  FolderOpen,
  GitBranch,
  Globe2,
  Layers3,
  Lock,
  MapPin,
  Network,
  Orbit,
  Plus,
  RadioTower,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Spline,
  Star,
  TimerReset,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useAxsStore } from "../../store/useAxsStore";

/* ── Data ─────────────────────────────────────────────────────────────── */

const universeStats = [
  { label: "Active Universes", value: "10", icon: Orbit, tone: "cyan" },
  { label: "Episodes", value: "38", icon: Clapperboard, tone: "gold" },
  { label: "Workflows", value: "7", icon: Layers3, tone: "violet" },
  { label: "Continuity", value: "93%", icon: ShieldCheck, tone: "green" },
] as const;

const episodes = [
  { number: "01", title: "The Public Fracture", status: "Locked", date: "May 20, 2026", arc: "Opening crisis exposes the city fracture and forces the hero into motion.", progress: 98, tone: "green" },
  { number: "02", title: "The Private Studio Offer", status: "Locked", date: "May 21, 2026", arc: "A hidden production deal reveals who controls the creative machine.", progress: 94, tone: "green" },
  { number: "03", title: "The Body Becomes Evidence", status: "In Review", date: "May 22, 2026", arc: "The hero realizes the signal, scars, styling, and control map are connected.", progress: 92, tone: "gold" },
  { number: "04", title: "The First Temptation", status: "In Review", date: "May 23, 2026", arc: "A false shortcut offers fame while threatening the continuity rules.", progress: 90, tone: "gold" },
  { number: "05", title: "The New Audience", status: "In Review", date: "May 24, 2026", arc: "The universe finds a first real crowd and must choose what to become.", progress: 88, tone: "gold" },
  { number: "06", title: "The Rival Edit", status: "Outline", date: "May 25, 2026", arc: "A competing narrative threatens to overwrite the original signal.", progress: 86, tone: "slate" },
  { number: "07", title: "The Ritual Breaks", status: "Outline", date: "May 26, 2026", arc: "The old pattern cracks and exposes the system behind the campaign.", progress: 84, tone: "slate" },
  { number: "08", title: "The Reframe", status: "Outline", date: "May 27, 2026", arc: "The universe pivots from survival mode into controlled expansion.", progress: 82, tone: "slate" },
] as const;

const healthMetrics = [
  { label: "Continuity Integrity", value: 93, tone: "cyan" },
  { label: "Character Consistency", value: 94, tone: "green" },
  { label: "Timeline Accuracy", value: 89, tone: "gold" },
  { label: "Tone Adherence", value: 92, tone: "violet" },
  { label: "World Rule Compliance", value: 87, tone: "cyan" },
] as const;

const activity = [
  { title: "Wardrobe evolution", sub: "Black silk coat remixed through Act I", icon: Sparkles, time: "1h ago" },
  { title: "Lighting continuity", sub: "Neon rain palette preserved across scenes", icon: Eye, time: "2h ago" },
  { title: "Emotional state", sub: "Guarded confidence remains consistent", icon: Brain, time: "2h ago" },
  { title: "Timeline order", sub: "No conflicting chronology detected", icon: Clock3, time: "4h ago" },
] as const;

const commandStats = [
  { label: "World Rules", value: "142", sub: "Active Rules", icon: Globe2, tone: "cyan" },
  { label: "Characters", value: "112", sub: "Tracked", icon: Users, tone: "violet" },
  { label: "Locations", value: "24", sub: "Key Locations", icon: MapPin, tone: "gold" },
  { label: "Timelines", value: "7", sub: "Active Threads", icon: GitBranch, tone: "green" },
] as const;

const graphNodes = [
  { id: "MS", name: "Mara Sain", role: "Creator / narrative lead", x: 18, y: 35, tone: "cyan" },
  { id: "EV", name: "Eli Voss", role: "Editor / antagonist", x: 48, y: 58, tone: "cyan" },
  { id: "DV", name: "Dante Vale", role: "Fixer / rival agent", x: 78, y: 32, tone: "violet" },
  { id: "AR", name: "Ari Rune", role: "Signal broker", x: 67, y: 78, tone: "gold" },
] as const;

const bibleSections = [
  { title: "Core Lore", icon: BookOpen, tone: "gold", entries: ["The Viral", "The First Convergence", "The Architects"] },
  { title: "World Rules", icon: ShieldCheck, tone: "cyan", entries: ["Character DNA must remain locked across every shell.", "Wardrobe evolves only after major emotional beats.", "Lighting shifts follow Eli's emotional recovery."] },
  { title: "Factions", icon: Flag, tone: "violet", entries: ["The Signal Collective", "The Independent Voices", "The Editorial Council"] },
  { title: "Technology", icon: Cpu, tone: "violet", entries: ["Chrono Analyzer", "Signal Mask", "Resonance Core"] },
  { title: "Recently Updated", icon: TimerReset, tone: "green", entries: ["Will Resonance", "Detective Cole", "Crossover Event"] },
] as const;

const memoryProof = [
  { label: "Identity", value: "98%", tone: "violet" },
  { label: "Continuity", value: "94%", tone: "gold" },
  { label: "Workflow", value: "88%", tone: "gold" },
  { label: "Brand Voice", value: "96%", tone: "cyan" },
  { label: "Distribution", value: "91%", tone: "green" },
] as const;

const productionActions = [
  { title: "New Episode", icon: Plus, tone: "gold" },
  { title: "Run Continuity Scan", icon: ShieldCheck, tone: "cyan" },
  { title: "Generate Scene Pack", icon: WandSparkles, tone: "violet" },
  { title: "Build Trailer Arc", icon: Film, tone: "cyan" },
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
    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
      <div className={`h-full rounded-full bg-gradient-to-r ${t.gradient}`} style={{ width: `${value}%` }} />
    </div>
  );
}

/* ── Orbital Primitives ──────────────────────────────────────────── */

function OrbitalCard({ children, className = "", accent = "cyan" }: { children: React.ReactNode; className?: string; accent?: string }) {
  const t = toneClasses(accent);
  return (
    <section className={`relative overflow-hidden rounded-2xl border ${t.softBorder} bg-[#050a14]/90 ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-50"
        style={{ background: `radial-gradient(circle at 85% 0%, ${accent === "gold" ? "rgba(214,158,55,.06)" : accent === "violet" ? "rgba(139,92,246,.06)" : "rgba(0,229,255,.06)"}, transparent 40%), linear-gradient(180deg, rgba(255,255,255,.02), transparent 60%)` }}
      />
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
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

function CircularGauge({ value, label, tone }: { value: number; label: string; tone: string }) {
  const t = toneClasses(tone);
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative grid size-32 place-items-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={`url(#${tone}-grad)`} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s ease" }} />
          <defs>
            <linearGradient id={`${tone}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={tone === "gold" ? "#ffd36f" : tone === "violet" ? "#a78bfa" : tone === "green" ? "#34d399" : "#22d3ee"} />
              <stop offset="100%" stopColor={tone === "gold" ? "#b98025" : tone === "violet" ? "#c084fc" : tone === "green" ? "#2dd4bf" : "#38bdf8"} />
            </linearGradient>
          </defs>
        </svg>
        <div className={`text-2xl font-black ${t.text}`}>{value}%</div>
      </div>
      <div className="text-xs font-bold uppercase tracking-[.14em] text-zinc-500">{label}</div>
    </div>
  );
}

/* ── Sections ─────────────────────────────────────────────────────────── */

function Hero() {
  const { setActiveTab } = useAxsStore();
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_33rem]">
      <OrbitalCard className="border-cyan-300/20" accent="cyan">
        <div className="absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(circle at 20% 50%, rgba(0,229,255,.08), transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,.06), transparent 40%)" }}
        />
        <div className="relative p-7 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="grid size-8 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-400/10">
              <Orbit className="size-4 text-cyan-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-[.22em] text-cyan-300">Mission Control</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[.65rem] font-bold uppercase tracking-[.12em] text-emerald-300">Online</span>
            </div>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,4.5rem)] font-black leading-[.92] tracking-[-.04em] text-white">
            Universe Control
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Orchestrate every story, character, timeline, scene, location, memory rule, and campaign asset with cinematic precision.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {productionActions.map((action) => {
              const Icon = action.icon;
              const t = toneClasses(action.tone);
              return (
                <button key={action.title} className={`inline-flex items-center gap-2 rounded-xl border ${t.border} ${t.bg} px-4 py-2.5 text-sm font-bold ${t.text} hover:bg-white/[.06] transition`}>
                  <Icon className="size-4" /> {action.title}
                </button>
              );
            })}
          </div>
        </div>
      </OrbitalCard>

      <div className="grid grid-cols-2 gap-4">
        {universeStats.map((stat) => {
          const Icon = stat.icon;
          const t = toneClasses(stat.tone);
          return (
            <OrbitalCard key={stat.label} className={`p-5 ${t.softBorder}`} accent={stat.tone}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-3xl font-black ${stat.value.includes("%") ? t.text : "text-white"}`}>{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-zinc-600">{stat.label}</div>
                </div>
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Icon className={`size-4 ${t.text}`} />
                </div>
              </div>
            </OrbitalCard>
          );
        })}
      </div>
    </div>
  );
}

function EpisodeCard({ ep, compact = false }: { ep: (typeof episodes)[number]; compact?: boolean }) {
  const t = toneClasses(ep.tone);
  return (
    <article className={`relative overflow-hidden rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4 transition hover:border-cyan-300/25`}>
      <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${t.gradient}`} style={{ background: `linear-gradient(to bottom, ${ep.tone === "gold" ? "#ffd36f" : ep.tone === "green" ? "#34d399" : ep.tone === "slate" ? "#94a3b8" : "#22d3ee"}, transparent)` }} />
      <div className="relative flex items-start justify-between gap-3 ml-2">
        <div className={`text-xl font-black ${t.text}`}>{ep.number}</div>
        <span className={`rounded-full border ${t.border} ${t.bg} px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.text}`}>{ep.status}</span>
      </div>
      <h3 className="relative mt-4 text-sm font-bold tracking-[.02em] text-white ml-2">{ep.title}</h3>
      <p className="relative mt-2 line-clamp-2 text-xs leading-5 text-zinc-500 ml-2">{ep.arc}</p>
      <div className="relative mt-4 flex items-center gap-2 text-[.68rem] text-zinc-600 ml-2">
        <CalendarDays className="size-3.5" /> {ep.date}
      </div>
      <div className="relative mt-4 flex items-center gap-3 ml-2">
        <div className="flex-1"><ProgressBar value={ep.progress} tone={ep.tone} /></div>
        <span className="text-xs font-black text-zinc-400">{ep.progress}%</span>
      </div>
      {compact ? <button className="relative mt-4 w-full rounded-lg border border-white/[0.08] bg-white/[.03] py-2 text-xs font-bold text-zinc-400 hover:border-cyan-300/30 hover:text-cyan-300 transition ml-2">View Details</button> : null}
    </article>
  );
}

function SeasonCommandCenter() {
  return (
    <OrbitalCard className="p-6" accent="cyan">
      <SectionTitle title="Season Timeline" sub="Afterglow Protocol — Season 1" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {episodes.map((ep) => <EpisodeCard key={ep.number} ep={ep} />)}
      </div>
      <div className="mt-6 flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white">Season Continuity Score</span>
            <span className="text-sm font-black text-cyan-300">93%</span>
          </div>
          <ProgressBar value={93} tone="cyan" />
        </div>
        <div className="flex items-center gap-4 text-center">
          <div><div className="text-xl font-black text-white">10</div><div className="text-[.65rem] font-bold uppercase tracking-[.1em] text-zinc-600">Episodes</div></div>
          <div><div className="text-xl font-black text-white">3</div><div className="text-[.65rem] font-bold uppercase tracking-[.1em] text-zinc-600">In Prod</div></div>
        </div>
      </div>
    </OrbitalCard>
  );
}

function CommandCenter() {
  return (
    <OrbitalCard className="p-6" accent="violet">
      <SectionTitle title="Telemetry Dashboard" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,.95fr)]">
        <div className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-5">
          <h3 className="mb-6 text-xs font-black uppercase tracking-[.16em] text-zinc-500">Universe Health</h3>
          <div className="grid gap-6 md:grid-cols-[13rem_minmax(0,1fr)]">
            <div className="grid place-items-center">
              <CircularGauge value={93} label="Health" tone="cyan" />
            </div>
            <div className="space-y-4">
              {healthMetrics.map((metric) => (
                <div key={metric.label} className="grid grid-cols-[10rem_minmax(0,1fr)_3rem] items-center gap-3 text-xs">
                  <span className="font-medium text-zinc-500">{metric.label}</span>
                  <ProgressBar value={metric.value} tone={metric.tone} />
                  <span className="text-right font-black text-zinc-300">{metric.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-5">
          <SectionTitle title="Recent Activity" action="View All" />
          <div className="space-y-3">
            {activity.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[.03] p-3">
                  <span className="grid size-9 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-400/8 text-cyan-300"><Icon className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white">{item.title}</div>
                    <div className="truncate text-xs text-zinc-600">{item.sub} · {item.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {commandStats.map((stat) => {
          const Icon = stat.icon;
          const t = toneClasses(stat.tone);
          return (
            <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[.1em] text-zinc-600">{stat.label}</span>
                <Icon className={`size-4 ${t.text}`} />
              </div>
              <div className="mt-3 text-3xl font-black text-white">{stat.value}</div>
              <div className="mt-1 text-xs text-zinc-600">{stat.sub}</div>
            </div>
          );
        })}
      </div>
    </OrbitalCard>
  );
}

function CharacterGraph() {
  return (
    <OrbitalCard className="p-6" accent="violet">
      <SectionTitle title="Living Character Graph" sub="Relationship map, alliances, conflict, influence, and unknown links." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(23rem,.72fr)]">
        <div className="relative min-h-[20rem] overflow-hidden rounded-xl border border-white/[0.06] bg-[#04080e]/60">
          <div className="absolute inset-0 opacity-30"
            style={{ background: "radial-gradient(circle at 25% 35%, rgba(0,229,255,.12), transparent 18%), radial-gradient(circle at 80% 32%, rgba(139,92,246,.14), transparent 18%), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px)", backgroundSize: "auto, auto, 42px 42px, 42px 42px" }}
          />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="18" y1="35" x2="48" y2="58" stroke="rgba(0,229,255,.4)" strokeWidth=".35" />
            <line x1="48" y1="58" x2="78" y2="32" stroke="rgba(139,92,246,.42)" strokeWidth=".35" />
            <line x1="48" y1="58" x2="67" y2="78" stroke="rgba(255,211,111,.35)" strokeWidth=".35" strokeDasharray="2 2" />
            <line x1="18" y1="35" x2="78" y2="32" stroke="rgba(255,255,255,.12)" strokeWidth=".25" strokeDasharray="3 3" />
          </svg>
          {graphNodes.map((node) => {
            const t = toneClasses(node.tone);
            return (
              <div key={node.id} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                <div className={`mx-auto grid size-12 place-items-center rounded-full border ${t.border} bg-[#050a14]/90 text-xs font-black ${t.text} ${t.glow}`}>{node.id}</div>
                <div className="mt-2 text-xs font-bold text-white">{node.name}</div>
                <div className="text-[.65rem] text-zinc-600">{node.role}</div>
              </div>
            );
          })}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 text-[.65rem] font-bold uppercase tracking-[.12em] text-zinc-600">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-cyan-400/60" />Alliance</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-violet-400/60" />Conflict</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#ffd36f]/60" />Unknown</span>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
          <SectionTitle title="Graph Insights" />
          <div className="space-y-3">
            {["3 key conflicts", "2 alliance shifts", "1 new connection", "Network density rising"].map((item) => (
              <div key={item} className="rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-sm font-bold text-zinc-300">{item}</div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-lg border border-[#b8892e]/30 bg-[#1b1205]/40 py-2 text-xs font-bold text-[#ffd36f]">Analyze More</button>
        </div>
      </div>
    </OrbitalCard>
  );
}

function UniverseBible() {
  return (
    <OrbitalCard className="p-6" accent="gold">
      <SectionTitle title="Universe Command Bible" />
      <div className="mb-5 flex flex-wrap gap-2">
        {['All', 'Lore', 'Rules', 'Technology', 'Factions', 'Events', 'Glossary'].map((tab, index) => (
          <button key={tab} className={`rounded-full border px-3 py-1.5 text-[.68rem] font-black uppercase tracking-[.1em] transition ${index === 0 ? 'border-cyan-300/35 bg-cyan-400/8 text-cyan-300' : 'border-white/[0.08] bg-white/[.03] text-zinc-600 hover:text-zinc-400'}`}>{tab}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {bibleSections.map((section) => {
          const Icon = section.icon;
          const t = toneClasses(section.tone);
          return (
            <div key={section.title} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="mb-4 flex items-center gap-2">
                <span className={`grid size-9 place-items-center rounded-lg ${t.bg} ${t.text}`}><Icon className="size-4" /></span>
                <h3 className={`text-xs font-black uppercase tracking-[.14em] ${t.text}`}>{section.title}</h3>
              </div>
              <div className="space-y-3">
                {section.entries.map((entry) => (
                  <div key={entry} className="border-b border-white/[0.05] pb-2 last:border-0">
                    <div className="text-sm font-bold text-white">{entry}</div>
                    <div className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-600">The known record remains active in the universe bible.</div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full rounded-lg border border-white/[0.06] bg-white/[.03] py-2 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">View all entries</button>
            </div>
          );
        })}
      </div>
    </OrbitalCard>
  );
}

function RightRail() {
  const { setActiveTab } = useAxsStore();
  return (
    <aside className="space-y-4">
      <OrbitalCard className="border-violet-400/20 p-5" accent="violet">
        <SectionTitle title="Production Memory" />
        <div className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
          <div className="mb-4 text-xs font-black uppercase tracking-[.16em] text-zinc-600">Memory Proof</div>
          <div className="grid grid-cols-2 gap-2">
            {memoryProof.map((item) => {
              const t = toneClasses(item.tone);
              return (
                <div key={item.label} className={`rounded-lg border ${t.softBorder} ${t.bg} p-3`}>
                  <div className={`text-[.62rem] font-black uppercase tracking-[.1em] ${t.text}`}>{item.label}</div>
                  <div className="mt-1 text-lg font-black text-white">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </OrbitalCard>

      <OrbitalCard className="p-5" accent="cyan">
        <SectionTitle title="Active Universe" />
        <div className="space-y-3">
          <div className="rounded-xl border border-cyan-300/15 bg-cyan-400/6 p-4">
            <div className="text-xs text-zinc-600">Universe</div>
            <div className="mt-1 text-sm font-black text-white">Afterglow Protocol</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-3"><div className="text-xs text-zinc-600">DNA</div><div className="text-sm font-black text-white">Eli Voss</div></div>
            <div className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-3"><div className="text-xs text-zinc-600">Workflow</div><div className="text-sm font-black text-white">Worldbuild</div></div>
          </div>
        </div>
      </OrbitalCard>

      <OrbitalCard className="p-5" accent="gold">
        <SectionTitle title="Workflow Mode" />
        <div className="grid grid-cols-2 gap-3">
          {["Direct", "Assist", "Blend", "Studio"].map((mode, index) => (
            <button key={mode} className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${index === 1 ? 'border-cyan-300/35 bg-cyan-400/8 text-cyan-200' : 'border-white/[0.06] bg-white/[.03] text-zinc-600 hover:text-zinc-400'}`}>{mode}</button>
          ))}
        </div>
      </OrbitalCard>

      <OrbitalCard className="p-5" accent="green">
        <SectionTitle title="Next Best Moves" />
        <div className="space-y-3">
          {[
            [ShieldCheck, 'Lock episode 03 continuity'],
            [Users, 'Generate character conflict map'],
            [Film, 'Create cinematic scene pack'],
            [Rocket, 'Prepare launch campaign'],
          ].map(([Icon, label]) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <button key={label as string} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[.03] p-3 text-left text-sm font-bold text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-300 transition">
                <I className="size-4 text-[#ffd36f]" /> {label as string}
              </button>
            );
          })}
        </div>
      </OrbitalCard>
    </aside>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function AXSUniverseControl() {
  return (
    <div className="relative min-w-0 space-y-5">
      <Hero />
      <SeasonCommandCenter />
      <CommandCenter />
      <CharacterGraph />
      <UniverseBible />
      <RightRail />
    </div>
  );
}
