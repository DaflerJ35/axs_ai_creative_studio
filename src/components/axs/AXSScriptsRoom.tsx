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

const scriptStats = [
  { label: "Active Scripts", value: "34", icon: FileText, tone: "cyan" },
  { label: "Hooks", value: "128", icon: Sparkles, tone: "gold" },
  { label: "Templates", value: "24", icon: FolderOpen, tone: "violet" },
  { label: "Approval", value: "91%", icon: CheckCircle2, tone: "green" },
] as const;

const hookLab = [
  { hook: "The system isn't broken. It was built this way.", score: 96, tone: "cyan", tags: ["Pain-First", "Authority"] },
  { hook: "I spent $40K on tools I never used.", score: 92, tone: "violet", tags: ["Story", "Relatable"] },
  { hook: "Three lines. One decision. Zero regret.", score: 89, tone: "gold", tags: ["Short", "Direct"] },
  { hook: "The creative industry hates this one trick.", score: 85, tone: "green", tags: ["Curiosity", "Pattern"] },
] as const;

const sceneBeats = [
  { scene: "Cold Open", status: "Locked", duration: "0:15", tone: "cyan" },
  { scene: "Problem Agitation", status: "In Review", duration: "0:45", tone: "violet" },
  { scene: "Solution Reveal", status: "Draft", duration: "1:20", tone: "gold" },
  { scene: "Social Proof", status: "Locked", duration: "0:30", tone: "green" },
  { scene: "CTA", status: "Ready", duration: "0:10", tone: "cyan" },
] as const;

const templates = [
  { title: "VSL Script", type: "Video", tone: "cyan" },
  { title: "Email Sequence", type: "Text", tone: "violet" },
  { title: "Ad Hook Pack", type: "Ads", tone: "gold" },
  { title: "Landing Page", type: "Web", tone: "green" },
] as const;

const rewrites = [
  { original: "Buy now and save 50%", rewrite: "The price doubles at midnight. Here's why...", improvement: "+34% CTR", tone: "cyan" },
  { original: "Our product is the best", rewrite: "I fired my old agency after seeing this.", improvement: "+28% CTR", tone: "violet" },
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

/* ── Terminal Primitives ──────────────────────────────────────────── */

function TerminalCard({ children, className = "", accent = "cyan" }: { children: React.ReactNode; className?: string; accent?: string }) {
  const t = toneClasses(accent);
  return (
    <section className={`relative overflow-hidden rounded-2xl border ${t.softBorder} bg-[#050a14]/90 ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: `radial-gradient(ellipse 60% 30% at 0% 0%, ${accent === "gold" ? "rgba(214,158,55,.07)" : accent === "violet" ? "rgba(139,92,246,.07)" : "rgba(0,229,255,.07)"}, transparent 60%)` }}
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

function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#02060a]/80 p-4 font-mono text-xs leading-6">
      {lines.map((line, i) => (
        <div key={i} className="flex gap-3">
          <span className="w-6 text-right text-zinc-700 select-none">{i + 1}</span>
          <span className="text-zinc-400">{line}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Sections ─────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_33rem]">
      <TerminalCard className="border-cyan-300/20" accent="cyan">
        <div className="absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(circle at 10% 50%, rgba(0,229,255,.08), transparent 50%), radial-gradient(circle at 90% 20%, rgba(139,92,246,.05), transparent 40%)" }}
        />
        <div className="relative p-7 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="grid size-8 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-400/10">
              <TerminalSquare className="size-4 text-cyan-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-[.22em] text-cyan-300">Script Engine</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[.65rem] font-bold uppercase tracking-[.12em] text-emerald-300">Compiling</span>
            </div>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,4.5rem)] font-black leading-[.92] tracking-[-.04em] text-white">
            Scripts Room
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Write hooks, build scenes, rewrite for performance, and manage script versions. The engine that powers every word in production.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-white/[.06] transition">
              <Plus className="size-4" /> New Script
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#b8892e]/40 bg-[#1b1205]/50 px-4 py-2.5 text-sm font-bold text-[#ffd36f] hover:bg-white/[.06] transition">
              <WandSparkles className="size-4" /> Rewrite
            </button>
          </div>
        </div>
      </TerminalCard>

      <div className="grid grid-cols-2 gap-4">
        {scriptStats.map((stat) => {
          const Icon = stat.icon;
          const t = toneClasses(stat.tone);
          return (
            <TerminalCard key={stat.label} className={`p-5 ${t.softBorder}`} accent={stat.tone}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-3xl font-black ${stat.value.includes("%") ? t.text : "text-white"}`}>{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-zinc-600">{stat.label}</div>
                </div>
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Icon className={`size-4 ${t.text}`} />
                </div>
              </div>
            </TerminalCard>
          );
        })}
      </div>
    </div>
  );
}

function HookLab() {
  const [selected, setSelected] = useState<(typeof hookLab)[number]>(hookLab[0]);
  return (
    <TerminalCard className="p-6" accent="gold">
      <SectionTitle title="Hook Lab" sub="Performance-ranked opening lines." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="space-y-3">
          {hookLab.map((hook) => {
            const t = toneClasses(hook.tone);
            const isSelected = selected.hook === hook.hook;
            return (
              <button key={hook.hook} onClick={() => setSelected(hook)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${isSelected ? `${t.softBorder} ${t.bg}` : 'border-white/[0.06] bg-[#04080e]/60 hover:border-white/10'}`}>
                <div className={`grid size-10 place-items-center rounded-full border ${t.border} ${t.bg} text-sm font-black ${t.text}`}>{hook.score}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white truncate">"{hook.hook}"</div>
                  <div className="flex gap-2 mt-1">
                    {hook.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/[0.08] bg-white/[.04] px-2 py-0.5 text-[.65rem] font-bold text-zinc-500">{tag}</span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-5">
          <div className="text-xs font-black uppercase tracking-[.14em] text-zinc-600 mb-4">Selected Hook</div>
          <CodeBlock lines={[`"${selected.hook}"`, ``, `// Score: ${selected.score}%`, `// Tags: ${selected.tags.join(", ")}`, `// Status: Performance-tested`]} />
          <div className="mt-4 flex gap-3">
            <button className="flex-1 rounded-lg border border-cyan-300/25 bg-cyan-400/8 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400/12 transition">Copy</button>
            <button className="flex-1 rounded-lg border border-violet-300/25 bg-violet-500/8 py-2 text-xs font-bold text-violet-300 hover:bg-violet-500/12 transition">Rewrite</button>
            <button className="flex-1 rounded-lg border border-white/[0.08] bg-white/[.04] py-2 text-xs font-bold text-zinc-300 hover:border-[#b8892e]/40 hover:text-[#ffd36f] transition">Test</button>
          </div>
        </div>
      </div>
    </TerminalCard>
  );
}

function SceneBeatBoard() {
  return (
    <TerminalCard className="p-6" accent="violet">
      <SectionTitle title="Scene Beat Board" sub="Script structure and pacing." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {sceneBeats.map((beat) => {
          const t = toneClasses(beat.tone);
          return (
            <div key={beat.scene} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{beat.status}</span>
                <span className="text-xs text-zinc-600">{beat.duration}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{beat.scene}</h3>
              <div className="mt-3 flex gap-2">
                <button className="rounded-lg border border-white/[0.06] bg-white/[.03] px-2 py-1 text-[.65rem] font-bold text-zinc-500 hover:text-zinc-300 transition">Edit</button>
                <button className="rounded-lg border border-white/[0.06] bg-white/[.03] px-2 py-1 text-[.65rem] font-bold text-zinc-500 hover:text-zinc-300 transition">Preview</button>
              </div>
            </div>
          );
        })}
      </div>
    </TerminalCard>
  );
}

function TemplateLibrary() {
  return (
    <TerminalCard className="p-6" accent="cyan">
      <SectionTitle title="Template Library" sub="Reusable script frameworks." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => {
          const t = toneClasses(template.tone);
          return (
            <div key={template.title} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <FileText className={`size-4 ${t.text}`} />
                </div>
                <span className={`rounded-full border px-2 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{template.type}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-3">{template.title}</h3>
              <button className="w-full rounded-lg border border-white/[0.06] bg-white/[.03] py-2 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">Use Template</button>
            </div>
          );
        })}
      </div>
    </TerminalCard>
  );
}

function RewriteLab() {
  return (
    <TerminalCard className="p-6" accent="green">
      <SectionTitle title="Rewrite Lab" sub="Before/after performance comparison." />
      <div className="space-y-4">
        {rewrites.map((rw) => {
          const t = toneClasses(rw.tone);
          return (
            <div key={rw.original} className="grid gap-4 md:grid-cols-2 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[.14em] text-zinc-600 mb-2">Original</div>
                <div className="text-sm text-zinc-400 line-through">{rw.original}</div>
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-[.14em] text-zinc-600 mb-2">Rewrite</div>
                <div className={`text-sm font-bold ${t.text}`}>{rw.rewrite}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-black text-emerald-300">
                  <ArrowUpRight className="size-3" /> {rw.improvement}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </TerminalCard>
  );
}

function RightRail() {
  return (
    <aside className="space-y-4">
      <TerminalCard className="border-cyan-400/20 p-5" accent="cyan">
        <SectionTitle title="Script Health" />
        <div className="flex flex-col items-center py-4">
          <div className="relative grid size-28 place-items-center rounded-full border-[8px] border-cyan-300/30 bg-cyan-400/5">
            <div className="text-3xl font-black text-white">91%</div>
          </div>
          <div className="mt-3 text-sm font-bold text-white">Approval Rate</div>
          <div className="text-xs text-zinc-600">Production ready</div>
        </div>
      </TerminalCard>

      <TerminalCard className="p-5" accent="gold">
        <SectionTitle title="Quick Actions" />
        <div className="space-y-2">
          {["New Script", "Import Draft", "Export All", "Run Analysis"].map((action) => (
            <button key={action} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[.03] p-3 text-left text-sm font-bold text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-300 transition">
              <Zap className="size-4 text-[#ffd36f]" /> {action}
            </button>
          ))}
        </div>
      </TerminalCard>

      <TerminalCard className="p-5" accent="violet">
        <SectionTitle title="Recent Rewrites" />
        <div className="space-y-2">
          {["VSL opener v2.1", "Email subject lines", "Ad hook pack", "Landing page hero"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-xs font-bold text-zinc-400">
              <PenLine className="size-3 text-cyan-300" /> {item}
            </div>
          ))}
        </div>
      </TerminalCard>
    </aside>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function AXSScriptsRoom() {
  return (
    <div className="relative min-w-0 space-y-5">
      <Hero />
      <HookLab />
      <SceneBeatBoard />
      <TemplateLibrary />
      <RewriteLab />
      <RightRail />
    </div>
  );
}
