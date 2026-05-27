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
  Download,
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
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";

/* ── Data ─────────────────────────────────────────────────────────────── */

const vaultStats = [
  { label: "Total Assets", value: "342", icon: Archive, tone: "gold" },
  { label: "Collections", value: "18", icon: FolderOpen, tone: "cyan" },
  { label: "Exports", value: "64", icon: Download, tone: "violet" },
  { label: "Archived", value: "128", icon: Lock, tone: "green" },
] as const;

const assetBoard = [
  { id: "A-001", title: "Launch Trailer Final", type: "Video", size: "1.2GB", date: "May 15", tone: "violet" },
  { id: "A-002", title: "Hero Image Pack", type: "Images", size: "486MB", date: "May 14", tone: "cyan" },
  { id: "A-003", title: "VSL Script v2.1", type: "Text", size: "24KB", date: "May 13", tone: "gold" },
  { id: "A-004", title: "Brand Voice Guide", type: "Document", size: "2.1MB", date: "May 12", tone: "green" },
  { id: "A-005", title: "Motion Prompts", type: "Prompts", size: "156KB", date: "May 11", tone: "cyan" },
] as const;

const collections = [
  { title: "Launch Campaign 2026", count: "24 assets", tone: "cyan" },
  { title: "Brand Identity Kit", count: "18 assets", tone: "violet" },
  { title: "Product Demos", count: "12 assets", tone: "gold" },
  { title: "Social Media Pack", count: "36 assets", tone: "green" },
] as const;

const exportHistory = [
  { title: "Launch Trailer", format: "MP4", date: "May 15", tone: "violet" },
  { title: "Hero Images", format: "PNG", date: "May 14", tone: "cyan" },
  { title: "VSL Script", format: "PDF", date: "May 13", tone: "gold" },
] as const;

const memoryLocks = [
  { title: "Brand Colors v2.0", status: "Locked", tone: "cyan" },
  { title: "Voice Model: Mara", status: "Locked", tone: "violet" },
  { title: "Launch Trailer Final", status: "Locked", tone: "gold" },
  { title: "Strategy Doc Q2", status: "Unlocked", tone: "green" },
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

/* ── Archive Primitives ──────────────────────────────────────────── */

function ArchiveCard({ children, className = "", accent = "gold" }: { children: React.ReactNode; className?: string; accent?: string }) {
  const t = toneClasses(accent);
  return (
    <section className={`relative overflow-hidden rounded-2xl border ${t.softBorder} bg-[#050a14]/90 ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: `radial-gradient(circle at 50% 100%, ${accent === "gold" ? "rgba(214,158,55,.06)" : accent === "violet" ? "rgba(139,92,246,.06)" : "rgba(0,229,255,.06)"}, transparent 50%)` }}
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
      <ArchiveCard className="border-[#b8892e]/25" accent="gold">
        <div className="absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(circle at 50% 100%, rgba(214,158,55,.1), transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,.06), transparent 40%)" }}
        />
        <div className="relative p-7 lg:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="grid size-8 place-items-center rounded-lg border border-[#b8892e]/40 bg-[#1b1205]/50">
              <Archive className="size-4 text-[#ffd36f]" />
            </div>
            <span className="text-xs font-black uppercase tracking-[.22em] text-[#ffd36f]">Secure Archive</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[.65rem] font-bold uppercase tracking-[.12em] text-emerald-300">Protected</span>
            </div>
          </div>
          <h1 className="max-w-4xl text-[clamp(2.2rem,4vw,4.5rem)] font-black leading-[.92] tracking-[-.04em] text-white">
            Vault
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Archive every asset, prompt, export, and version. Lock what matters. Retrieve what you need. Nothing gets lost.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-[#ffe08a]/50 bg-gradient-to-r from-[#ffd36f] to-[#b98025] px-4 py-2.5 text-sm font-black text-black hover:brightness-110 transition">
              <Plus className="size-4" /> New Archive
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/8 px-4 py-2.5 text-sm font-bold text-cyan-200 hover:bg-white/[.06] transition">
              <Search className="size-4" /> Search Vault
            </button>
          </div>
        </div>
      </ArchiveCard>

      <div className="grid grid-cols-2 gap-4">
        {vaultStats.map((stat) => {
          const Icon = stat.icon;
          const t = toneClasses(stat.tone);
          return (
            <ArchiveCard key={stat.label} className={`p-5 ${t.softBorder}`} accent={stat.tone}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`text-3xl font-black ${stat.value.includes("%") ? t.text : "text-white"}`}>{stat.value}</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-zinc-600">{stat.label}</div>
                </div>
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <Icon className={`size-4 ${t.text}`} />
                </div>
              </div>
            </ArchiveCard>
          );
        })}
      </div>
    </div>
  );
}

function AssetBoard() {
  const [selected, setSelected] = useState<(typeof assetBoard)[number]>(assetBoard[0]);
  return (
    <ArchiveCard className="p-6" accent="violet">
      <SectionTitle title="Asset Board" sub="All archived files and their metadata." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="space-y-2">
          {assetBoard.map((asset) => {
            const t = toneClasses(asset.tone);
            const isSelected = selected.id === asset.id;
            return (
              <button key={asset.id} onClick={() => setSelected(asset)}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${isSelected ? `${t.softBorder} ${t.bg}` : 'border-white/[0.06] bg-[#04080e]/60 hover:border-white/10'}`}>
                <div className={`grid size-10 place-items-center rounded-lg border ${t.border} ${t.bg}`}>
                  <FileText className={`size-4 ${t.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white">{asset.title}</div>
                  <div className="text-xs text-zinc-600">{asset.type} · {asset.size}</div>
                </div>
                <span className="text-xs text-zinc-600">{asset.date}</span>
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-5">
          <div className="text-xs font-black uppercase tracking-[.14em] text-zinc-600 mb-4">Asset Details</div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-zinc-600">ID</span><span className="font-bold text-white">{selected.id}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-600">Title</span><span className="font-bold text-white">{selected.title}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-600">Type</span><span className="font-bold text-white">{selected.type}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-600">Size</span><span className="font-bold text-white">{selected.size}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-600">Date</span><span className="font-bold text-white">{selected.date}</span></div>
          </div>
          <div className="mt-5 flex gap-3">
            <button className="flex-1 rounded-lg border border-cyan-300/25 bg-cyan-400/8 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400/12 transition">Download</button>
            <button className="flex-1 rounded-lg border border-violet-300/25 bg-violet-500/8 py-2 text-xs font-bold text-violet-300 hover:bg-violet-500/12 transition">Share</button>
          </div>
        </div>
      </div>
    </ArchiveCard>
  );
}

function CollectionDrawers() {
  return (
    <ArchiveCard className="p-6" accent="cyan">
      <SectionTitle title="Collection Drawers" sub="Organized asset groups." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {collections.map((collection) => {
          const t = toneClasses(collection.tone);
          return (
            <div key={collection.title} className={`rounded-xl border ${t.softBorder} bg-[#060d16]/80 p-4`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`grid size-10 place-items-center rounded-xl border ${t.border} ${t.bg}`}>
                  <FolderOpen className={`size-4 ${t.text}`} />
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{collection.title}</h3>
              <p className="text-xs text-zinc-600">{collection.count}</p>
              <button className="mt-4 w-full rounded-lg border border-white/[0.06] bg-white/[.03] py-2 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">Open</button>
            </div>
          );
        })}
      </div>
    </ArchiveCard>
  );
}

function ExportHistory() {
  return (
    <ArchiveCard className="p-6" accent="green">
      <SectionTitle title="Export History" sub="Previously generated and downloaded files." />
      <div className="space-y-3">
        {exportHistory.map((item) => {
          const t = toneClasses(item.tone);
          return (
            <div key={item.title} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className={`grid size-10 place-items-center rounded-lg border ${t.border} ${t.bg}`}>
                <Download className={`size-4 ${t.text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white">{item.title}</div>
                <div className="text-xs text-zinc-600">{item.format} · {item.date}</div>
              </div>
              <button className="rounded-lg border border-white/[0.06] bg-white/[.03] px-3 py-1.5 text-xs font-bold text-zinc-500 hover:border-cyan-300/30 hover:text-cyan-300 transition">Download</button>
            </div>
          );
        })}
      </div>
    </ArchiveCard>
  );
}

function MemoryLocks() {
  return (
    <ArchiveCard className="p-6" accent="gold">
      <SectionTitle title="Memory Locks" sub="Protected assets that cannot be altered without authorization." />
      <div className="space-y-3">
        {memoryLocks.map((lock) => {
          const t = toneClasses(lock.tone);
          return (
            <div key={lock.title} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#04080e]/60 p-4">
              <div className={`grid size-10 place-items-center rounded-full border ${lock.status === "Locked" ? 'border-cyan-400/30 bg-cyan-400/10' : 'border-rose-400/30 bg-rose-400/10'}`}>
                <Lock className={`size-4 ${lock.status === "Locked" ? 'text-cyan-300' : 'text-rose-300'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white">{lock.title}</div>
                <div className="text-xs text-zinc-600">{lock.status}</div>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[.62rem] font-black uppercase tracking-[.08em] ${lock.status === "Locked" ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300' : 'border-rose-400/30 bg-rose-400/10 text-rose-300'}`}>{lock.status}</span>
            </div>
          );
        })}
      </div>
    </ArchiveCard>
  );
}

function RightRail() {
  return (
    <aside className="space-y-4">
      <ArchiveCard className="border-gold-400/20 p-5" accent="gold">
        <SectionTitle title="Vault Health" />
        <div className="flex flex-col items-center py-4">
          <div className="relative grid size-28 place-items-center rounded-full border-[8px] border-[#b8892e]/30 bg-[#1b1205]/40">
            <div className="text-3xl font-black text-white">99%</div>
          </div>
          <div className="mt-3 text-sm font-bold text-white">Integrity</div>
          <div className="text-xs text-zinc-600">All assets verified</div>
        </div>
      </ArchiveCard>

      <ArchiveCard className="p-5" accent="cyan">
        <SectionTitle title="Quick Actions" />
        <div className="space-y-2">
          {["New Archive", "Import Assets", "Export All", "Run Backup"].map((action) => (
            <button key={action} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[.03] p-3 text-left text-sm font-bold text-zinc-300 hover:border-cyan-300/30 hover:text-cyan-300 transition">
              <Zap className="size-4 text-[#ffd36f]" /> {action}
            </button>
          ))}
        </div>
      </ArchiveCard>

      <ArchiveCard className="p-5" accent="violet">
        <SectionTitle title="Recent Archives" />
        <div className="space-y-2">
          {["Launch Trailer Final", "Hero Image Pack", "VSL Script v2.1", "Brand Voice Guide"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[.03] p-3 text-xs font-bold text-zinc-400">
              <Archive className="size-3 text-[#ffd36f]" /> {item}
            </div>
          ))}
        </div>
      </ArchiveCard>
    </aside>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function AXSVault() {
  return (
    <div className="relative min-w-0 space-y-5">
      <Hero />
      <AssetBoard />
      <CollectionDrawers />
      <ExportHistory />
      <MemoryLocks />
      <RightRail />
    </div>
  );
}
