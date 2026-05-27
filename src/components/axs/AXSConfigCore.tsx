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
  CreditCard,
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
  Key,
  Layers3,
  Lock,
  MapPin,
  Megaphone,
  Mic,
  Network,
  Orbit,
  PenLine,
  Plus,
  Puzzle,
  RadioTower,
  Rocket,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Shield,
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

const configStats = [
  { label: "Integrations", value: "12", icon: Puzzle, tone: "cyan" },
  { label: "API Keys", value: "6", icon: Key, tone: "violet" },
  { label: "Team", value: "4", icon: Users, tone: "gold" },
  { label: "Uptime", value: "99.9%", icon: CheckCircle2, tone: "green" },
] as const;

const integrations = [
  { name: "OpenAI", status: "Connected", type: "AI", tone: "cyan" },
  { name: "Midjourney", status: "Connected", type: "Image", tone: "violet" },
  { name: "Stripe", status: "Connected", type: "Payment", tone: "green" },
  { name: "Slack", status: "Pending", type: "Comms", tone: "gold" },
] as const;

const billing = [
  { plan: "Pro", price: "$149/mo", status: "Active", seats: "4", tone: "cyan" },
  { plan: "API Usage", price: "$34/mo", status: "Active", seats: "—", tone: "violet" },
  { plan: "Storage", price: "$12/mo", status: "Active", seats: "—", tone: "gold" },
] as const;

const security = [
  { label: "Two-Factor Auth", status: "Enabled", tone: "green" },
  { label: "API Key Rotation", status: "Due in 12 days", tone: "gold" },
  { label: "Session Timeout", status: "24 hours", tone: "cyan" },
  { label: "Backup Encryption", status: "AES-256", tone: "violet" },
] as const;

const systemHealth = [
  { service: "API Gateway", status: "Operational", latency: "24ms", tone: "cyan" },
  { service: "Database", status: "Operational", latency: "8ms", tone: "violet" },
  { service: "Storage", status: "Operational", latency: "42ms", tone: "gold" },
  { service: "Queue Worker", status: "Degraded", latency: "156ms", tone: "slate" },
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

/* ── Engine Primitives ──────────────────────────────────────────────── */

function EngineCard({ children, className = "", accent = "cyan" }: { children: React.ReactNode; className?: string; accent?: string }) {
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
      {action ? <button className="shrink-0 rounded-lg border border-white/10 bg-white/[.04] px-3 py-1.5 text-xs font-bold text-zinc-400 hover:border-cyan-300/35 hover:text-cyan-300 transition">{action}</button> : null}
    </div>
  );
}

/* ── Sections ─────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_33rem]">
      <EngineCard className="border-cyan-300/20" accent="cyan">
        <div className="absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(circle at 50% 0%, rgba(0,229,255,.1), transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,.06), transparent 40%)" }}
        />
        <div className="relative p-7 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="grid size-8 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-400/10">
              <Settings className="size-4 text-cyan-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-[.22em] text-cyan-300">Engine Room</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[.65rem] font-bold uppercase tracking-[.12em] text-emerald-300">All Systems Go</span>
            </div>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,4.5rem)] font-black leading-[.92] tracking-[-.04em] text-white">
            Config Core
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Manage integrations, API keys, billing, team access, and security settings. The control center for the entire AXS engine.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-white/[.06] transition">
              <Plus className="size-4" /> New Integration
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-violet-300/35 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-200 hover:bg-white/[.06] transition">
              <Key className="size-4" /> Rotate Keys
            </button>
          </div>
        </div>
      </EngineCard>

      <div className="grid grid-cols-2 gap-4">
        {configStats.map((stat) => {
          const Icon = stat.icon;
          const t = toneClasses(stat.tone);
          return (
            <EngineCard key={stat.label} className={`p-5 ${t.softBorder}`} accent={stat.tone}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-3xl font-black ${stat.value.includes("%") ? t.text : "text-white"}`}>{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-zinc-600">{stat.label}</div>
                </div>
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Icon className={`size-4 ${t.text}`} />
                </div>
              </div>
            </EngineCard>
          );
        })}
      </div>
    </div>
  );
}

function IntegrationHub() {
  return (
    <EngineCard className="p-6" accent="cyan">
      <SectionTitle title="Integration Hub" sub="Connected services and their status." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {integrations.map((integration) => {
          const t = toneClasses(integration.tone);
          return (
            <div key={integration.name} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Puzzle className={`size-4 ${t.text}`} />
                </div>
                <span className={`rounded-full border px-2 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${integration.status === "Connected" ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-[#b8892e]/30 bg-[#1b1205]/50 text-[#ffd36f]'}`}>{integration.status}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{integration.name}</h3>
              <p className="text-xs text-zinc-600">{integration.type}</p>
              <button className="mt-4 w-full rounded-lg border border-white/[0.06] bg-white/[.03] py-2 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">Configure</button>
            </div>
          );
        })}
      </div>
    </EngineCard>
  );
}

function Billing() {
  return (
    <EngineCard className="p-6" accent="violet">
      <SectionTitle title="Billing & Plan" sub="Current subscription and usage." />
      <div className="space-y-3">
        {billing.map((item) => {
          const t = toneClasses(item.tone);
          return (
            <div key={item.plan} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className={`grid size-10 place-items-center rounded-lg border ${t.border} ${t.bg}`}>
                <CreditCard className={`size-4 ${t.text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{item.plan}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>{item.status}</span>
                </div>
                <div className="text-xs text-zinc-600">{item.seats !== "—" ? `${item.seats} seats · ` : ""}{item.price}</div>
              </div>
            </div>
          );
        })}
      </div>
    </EngineCard>
  );
}

function SecurityLocks() {
  return (
    <EngineCard className="p-6" accent="green">
      <SectionTitle title="Security Locks" sub="Access controls and encryption status." />
      <div className="space-y-3">
        {security.map((item) => {
          const t = toneClasses(item.tone);
          return (
            <div key={item.label} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className={`grid size-10 place-items-center rounded-full border ${t.border} ${t.bg}`}>
                <Shield className={`size-4 ${t.text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white">{item.label}</div>
                <div className="text-xs text-zinc-600">{item.status}</div>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${t.border} ${t.bg} ${t.text}`}>Active</span>
            </div>
          );
        })}
      </div>
    </EngineCard>
  );
}

function SystemHealth() {
  return (
    <EngineCard className="p-6" accent="cyan">
      <SectionTitle title="System Health" sub="Service status and performance metrics." />
      <div className="space-y-3">
        {systemHealth.map((service) => {
          const t = toneClasses(service.tone);
          return (
            <div key={service.service} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className={`grid size-10 place-items-center rounded-lg border ${t.border} ${t.bg}`}>
                <Zap className={`size-4 ${t.text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{service.service}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[.62rem] font-black uppercase tracking-[.08em] ${service.status === "Operational" ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/30 bg-rose-400/10 text-rose-300'}`}>{service.status}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-black ${t.text}`}>{service.latency}</div>
                <div className="text-xs text-zinc-600">latency</div>
              </div>
            </div>
          );
        })}
      </div>
    </EngineCard>
  );
}

function RightRail() {
  return (
    <aside className="space-y-4">
      <EngineCard className="border-cyan-400/20 p-5" accent="cyan">
        <SectionTitle title="System Status" />
        <div className="flex flex-col items-center py-4">
          <div className="relative grid size-28 place-items-center rounded-full border-[8px] border-cyan-300/30 bg-cyan-400/5">
            <div className="text-3xl font-black text-white">99.9%</div>
          </div>
          <div className="mt-3 text-sm font-bold text-white">Uptime</div>
          <div className="text-xs text-zinc-600">Last 30 days</div>
        </div>
      </EngineCard>

      <EngineCard className="p-5" accent="gold">
        <SectionTitle title="Quick Actions" />
        <div className="space-y-2">
          {["Add Integration", "Invite User", "Export Logs", "Run Diagnostics"].map((action) => (
            <button key={action} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[.03] p-3 text-left text-sm font-bold text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-300 transition">
              <Zap className="size-4 text-[#ffd36f]" /> {action}
            </button>
          ))}
        </div>
      </EngineCard>

      <EngineCard className="p-5" accent="violet">
        <SectionTitle title="Recent Changes" />
        <div className="space-y-2">
          {["OpenAI key rotated", "Stripe webhook updated", "New team member added", "Backup completed"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-xs font-bold text-zinc-400">
              <Settings className="size-3 text-cyan-300" /> {item}
            </div>
          ))}
        </div>
      </EngineCard>
    </aside>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function AXSConfigCore() {
  return (
    <div className="relative min-w-0 space-y-5">
      <Hero />
      <IntegrationHub />
      <Billing />
      <SecurityLocks />
      <SystemHealth />
      <RightRail />
    </div>
  );
}
