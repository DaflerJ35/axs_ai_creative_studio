import {
  Archive,
  BarChart3,
  Bell,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ClipboardList,
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
  UserRound,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";

/* ── Data ─────────────────────────────────────────────────────────────── */

const dnaStats = [
  { label: "Active Profiles", value: "12", icon: Users, tone: "violet" },
  { label: "Locked", value: "8", icon: Lock, tone: "cyan" },
  { label: "References", value: "186", icon: ClipboardList, tone: "gold" },
  { label: "Checks", value: "94%", icon: CheckCircle2, tone: "green" },
] as const;

const profiles = [
  { id: "P-01", name: "Mara Sain", role: "Creator / narrative lead", status: "Locked", tone: "cyan", traits: ["Ambitious", "Cynical", "Visionary"], locked: true },
  { id: "P-02", name: "Eli Voss", role: "Editor / antagonist", status: "In Review", tone: "violet", traits: ["Methodical", "Cold", "Strategic"], locked: false },
  { id: "P-03", name: "Dante Vale", role: "Fixer / rival agent", status: "Draft", tone: "gold", traits: ["Ruthless", "Efficient", "Loyal"], locked: false },
  { id: "P-04", name: "Ari Rune", role: "Signal broker", status: "Locked", tone: "green", traits: ["Charming", "Calculating", "Resourceful"], locked: true },
] as const;

const referenceVault = [
  { title: "Visual Reference Pack", type: "Images", count: "48 files", tone: "cyan" },
  { title: "Voice Sample Library", type: "Audio", count: "24 clips", tone: "violet" },
  { title: "Brand Style Guide", type: "Document", count: "12 pages", tone: "gold" },
  { title: "Character Mood Boards", type: "Images", count: "36 boards", tone: "green" },
] as const;

const rulesChecks = [
  { rule: "Voice consistency across all scripts", pass: true, tone: "cyan" },
  { rule: "Visual style alignment verified", pass: true, tone: "green" },
  { rule: "Brand tone adherence checked", pass: true, tone: "gold" },
  { rule: "Character arc continuity", pass: false, tone: "violet" },
  { rule: "Cross-platform formatting", pass: true, tone: "cyan" },
] as const;

const identityMetrics = [
  { label: "Core Identity", value: 96, tone: "cyan" },
  { label: "Visual Lock", value: 92, tone: "violet" },
  { label: "Voice Lock", value: 89, tone: "gold" },
  { label: "Brand Coherence", value: 94, tone: "green" },
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

/* ── Helix Primitives ──────────────────────────────────────────────── */

function HelixCard({ children, className = "", accent = "cyan" }: { children: React.ReactNode; className?: string; accent?: string }) {
  const t = toneClasses(accent);
  return (
    <section className={`relative overflow-hidden rounded-2xl border ${t.softBorder} bg-[#050a14]/90 ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${accent === "gold" ? "rgba(214,158,55,.07)" : accent === "violet" ? "rgba(139,92,246,.07)" : "rgba(0,229,255,.07)"}, transparent 60%)` }}
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

function DnaStrand({ count = 12, tone = "cyan" }: { count?: number; tone?: string }) {
  const color = tone === "gold" ? "#ffd36f" : tone === "violet" ? "#a78bfa" : tone === "green" ? "#34d399" : "#22d3ee";
  return (
    <svg className="absolute right-4 top-4 size-20 opacity-10" viewBox="0 0 40 80">
      {Array.from({ length: count }).map((_, i) => (
        <g key={i}>
          <circle cx={20 + Math.sin(i * 0.8) * 10} cy={i * 5} r="1.5" fill={color} />
          <line x1={20 + Math.sin(i * 0.8) * 10} y1={i * 5} x2={20 - Math.sin(i * 0.8) * 10} y2={i * 5 + 4} stroke={color} strokeWidth="0.5" opacity="0.5" />
          <circle cx={20 - Math.sin(i * 0.8) * 10} cy={i * 5 + 4} r="1.5" fill={color} />
        </g>
      ))}
    </svg>
  );
}

/* ── Sections ─────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_33rem]">
      <HelixCard className="border-violet-300/20" accent="violet">
        <div className="absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(circle at 30% 50%, rgba(139,92,246,.1), transparent 50%), radial-gradient(circle at 70% 20%, rgba(0,229,255,.06), transparent 40%)" }}
        />
        <DnaStrand count={14} tone="violet" />
        <div className="relative p-7 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="grid size-8 place-items-center rounded-lg border border-violet-300/30 bg-violet-500/10">
              <Dna className="size-4 text-violet-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-[.22em] text-violet-300">Identity Lab</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[.65rem] font-bold uppercase tracking-[.12em] text-emerald-300">Sequencer Online</span>
            </div>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,4.5rem)] font-black leading-[.92] tracking-[-.04em] text-white">
            DNA Lab
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Lock identity, character DNA, brand voice, visual rules, and reference vaults. Every creative asset inherits its genetics from here.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-violet-300/40 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-200 hover:bg-white/[.06] transition">
              <Plus className="size-4" /> New Profile
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/8 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-white/[.06] transition">
              <Lock className="size-4" /> Lock Identity
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#b8892e]/40 bg-[#1b1205]/50 px-4 py-2.5 text-sm font-bold text-[#ffd36f] hover:bg-white/[.06] transition">
              <ClipboardList className="size-4" /> Run Checks
            </button>
          </div>
        </div>
      </HelixCard>

      <div className="grid grid-cols-2 gap-4">
        {dnaStats.map((stat) => {
          const Icon = stat.icon;
          const t = toneClasses(stat.tone);
          return (
            <HelixCard key={stat.label} className={`p-5 ${t.softBorder}`} accent={stat.tone}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-3xl font-black ${stat.value.includes("%") ? t.text : "text-white"}`}>{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-zinc-600">{stat.label}</div>
                </div>
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Icon className={`size-4 ${t.text}`} />
                </div>
              </div>
            </HelixCard>
          );
        })}
      </div>
    </div>
  );
}

function IdentityLab() {
  const [selected, setSelected] = useState<(typeof profiles)[number]>(profiles[0]);
  return (
    <HelixCard className="p-6" accent="violet">
      <SectionTitle title="Identity Sequencer" sub="Character DNA profiles and trait locks." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="space-y-3">
          {profiles.map((profile) => {
            const t = toneClasses(profile.tone);
            const isSelected = selected.id === profile.id;
            return (
              <button key={profile.id} onClick={() => setSelected(profile)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${isSelected ? `${t.softBorder} ${t.bg}` : 'border-white/[0.06] bg-[#04080e]/60 hover:border-white/10'}`}>
                <div className={`grid size-12 shrink-0 place-items-center rounded-full border ${t.border} ${t.bg} text-sm font-black ${t.text}`}>{profile.id}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{profile.name}</span>
                    {profile.locked ? <Lock className="size-3 text-cyan-300" /> : null}
                  </div>
                  <div className="text-xs text-zinc-500">{profile.role}</div>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{profile.status}</span>
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className={`grid size-12 place-items-center rounded-full border ${toneClasses(selected.tone).border} ${toneClasses(selected.tone).bg}`}>
              <UserRound className={`size-5 ${toneClasses(selected.tone).text}`} />
            </div>
            <div>
              <div className="text-lg font-black text-white">{selected.name}</div>
              <div className="text-xs text-zinc-500">{selected.role}</div>
            </div>
          </div>
          <div className="mb-4 text-xs font-black uppercase tracking-[.14em] text-zinc-600">Trait Map</div>
          <div className="flex flex-wrap gap-2">
            {selected.traits.map((trait) => (
              <span key={trait} className="rounded-lg border border-white/[0.08] bg-white/[.04] px-3 py-1.5 text-xs font-bold text-zinc-300">{trait}</span>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {identityMetrics.map((m) => (
              <div key={m.label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">{m.label}</span>
                  <span className="font-black text-zinc-300">{m.value}%</span>
                </div>
                <ProgressBar value={m.value} tone={m.tone} />
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            <button className="flex-1 rounded-lg border border-white/[0.08] bg-white/[.04] py-2 text-xs font-bold text-zinc-300 hover:border-violet-300/30 hover:text-violet-300 transition">Edit DNA</button>
            <button className="flex-1 rounded-lg border border-cyan-300/25 bg-cyan-400/8 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400/12 transition">Clone</button>
          </div>
        </div>
      </div>
    </HelixCard>
  );
}

function ReferenceVault() {
  return (
    <HelixCard className="p-6" accent="gold">
      <SectionTitle title="Reference Vault" sub="Source material, style guides, and reference packs." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {referenceVault.map((ref) => {
          const t = toneClasses(ref.tone);
          return (
            <div key={ref.title} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <FolderOpen className={`size-4 ${t.text}`} />
                </div>
                <span className={`rounded-full border px-2 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{ref.type}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{ref.title}</h3>
              <p className="text-xs text-zinc-600">{ref.count}</p>
              <button className="mt-4 w-full rounded-lg border border-white/[0.06] bg-white/[.03] py-2 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">Open Vault</button>
            </div>
          );
        })}
      </div>
    </HelixCard>
  );
}

function RulesAndChecks() {
  return (
    <HelixCard className="p-6" accent="cyan">
      <SectionTitle title="Rules & Checks" sub="Identity consistency verification and brand rule enforcement." />
      <div className="space-y-3">
        {rulesChecks.map((check) => {
          const t = toneClasses(check.tone);
          return (
            <div key={check.rule} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className={`grid size-10 place-items-center rounded-full border ${check.pass ? 'border-emerald-400/30 bg-emerald-400/10' : 'border-rose-400/30 bg-rose-400/10'}`}>
                {check.pass ? <CheckCircle2 className="size-5 text-emerald-300" /> : <CircleDot className="size-5 text-rose-300" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white">{check.rule}</div>
                <div className="text-xs text-zinc-600">{check.pass ? "Verified and locked" : "Requires attention"}</div>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${check.pass ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/30 bg-rose-400/10 text-rose-300'}`}>{check.pass ? "Pass" : "Fail"}</span>
            </div>
          );
        })}
      </div>
    </HelixCard>
  );
}

function RightRail() {
  return (
    <aside className="space-y-4">
      <HelixCard className="border-violet-400/20 p-5" accent="violet">
        <SectionTitle title="Identity Score" />
        <div className="flex flex-col items-center py-4">
          <div className="relative grid size-28 place-items-center rounded-full border-[8px] border-violet-300/30 bg-violet-500/5">
            <div className="text-3xl font-black text-white">94%</div>
          </div>
          <div className="mt-3 text-sm font-bold text-white">Identity Integrity</div>
          <div className="text-xs text-zinc-600">All systems nominal</div>
        </div>
      </HelixCard>

      <HelixCard className="p-5" accent="cyan">
        <SectionTitle title="Quick Actions" />
        <div className="space-y-2">
          {["New Profile", "Import DNA", "Export Rules", "Run Scan"].map((action) => (
            <button key={action} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[.03] p-3 text-left text-sm font-bold text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-300 transition">
              <Zap className="size-4 text-[#ffd36f]" /> {action}
            </button>
          ))}
        </div>
      </HelixCard>

      <HelixCard className="p-5" accent="gold">
        <SectionTitle title="Recent Locks" />
        <div className="space-y-2">
          {["Mara Sain voice locked", "Visual style v2.1 approved", "Brand tone guide updated", "Character arc continuity check"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-xs font-bold text-zinc-400">
              <Lock className="size-3 text-cyan-300" /> {item}
            </div>
          ))}
        </div>
      </HelixCard>
    </aside>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function AXSDNALab() {
  return (
    <div className="relative min-w-0 space-y-5">
      <Hero />
      <IdentityLab />
      <ReferenceVault />
      <RulesAndChecks />
      <RightRail />
    </div>
  );
}
