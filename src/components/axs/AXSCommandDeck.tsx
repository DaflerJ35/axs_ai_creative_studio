import { useMemo, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { useAxsStore } from "../../store/useAxsStore";
import type { ForgeTab } from "../../lib/types";
import {
  Archive,
  BarChart3,
  Bell,
  Brain,
  CalendarDays,
  ChevronDown,
  Clapperboard,
  Cpu,
  Dna,
  Film,
  FolderOpen,
  Gauge,
  Image,
  Layers3,
  Megaphone,
  Mic,
  Orbit,
  PenLine,
  Plus,
  Rocket,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TerminalSquare,
  UserRound,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

/* ── Stats ──────────────────────────────────────────────────────────── */

const productionStats = [
  { label: "Characters", value: "12", icon: UserRound, tone: "gold" },
  { label: "Scripts", value: "34", icon: PenLine, tone: "gold" },
  { label: "Images", value: "186", icon: Image, tone: "cyan" },
  { label: "Videos", value: "42", icon: Clapperboard, tone: "violet" },
  { label: "Campaigns", value: "7", icon: Megaphone, tone: "gold" },
] as const;

/* ── Create actions ─────────────────────────────────────────────────── */

const createActions = [
  { title: "New Universe", description: "Build a world, story, brand, or product ecosystem.", icon: Orbit, tone: "gold", tab: "universe" as ForgeTab },
  { title: "New Campaign", description: "Create ads, hooks, launch content, and distribution plans.", icon: Megaphone, tone: "cyan", tab: "campaign" as ForgeTab },
  { title: "Generate Images", description: "Create thumbnails, scenes, product shots, or character visuals.", icon: Image, tone: "violet", tab: "images" as ForgeTab },
  { title: "Write Scripts", description: "Create hooks, ads, voiceovers, captions, and scenes.", icon: PenLine, tone: "gold", tab: "scripts" as ForgeTab },
  { title: "Make Video", description: "Generate cinematic motion prompts and production plans.", icon: Clapperboard, tone: "cyan", tab: "videos" as ForgeTab },
] as const;

/* ── Projects ───────────────────────────────────────────────────────── */

const projects = [
  {
    badge: "LIVE",
    title: "Cyberpunk 2077 Universe",
    phase: "Distribution",
    progress: 87,
    updated: "Updated 2 min ago",
    tone: "cyan",
    tab: "universe" as ForgeTab,
    bg: "radial-gradient(circle at 75% 28%, rgba(0,229,255,.55), transparent 16%), linear-gradient(120deg, rgba(11,32,48,.92), rgba(13,7,28,.9)), repeating-linear-gradient(90deg, rgba(0,229,255,.11) 0 2px, transparent 2px 34px)",
  },
  {
    badge: "DRAFT",
    title: "Galactic Empire Saga",
    phase: "Scriptwriting",
    progress: 32,
    updated: "Updated 1 hr ago",
    tone: "gold",
    tab: "scene" as ForgeTab,
    bg: "radial-gradient(circle at 76% 24%, rgba(255,197,93,.45), transparent 13%), linear-gradient(130deg, rgba(28,18,12,.96), rgba(8,10,18,.95)), linear-gradient(26deg, transparent 0 48%, rgba(255,200,110,.18) 49%, transparent 53%)",
  },
  {
    badge: "BUILD",
    title: "Eclipse Protocol",
    phase: "Visual Build",
    progress: 71,
    updated: "Updated 3 hr ago",
    tone: "cyan",
    tab: "videos" as ForgeTab,
    bg: "radial-gradient(circle at 68% 42%, rgba(255,220,124,.75), transparent 6%), radial-gradient(circle at 69% 43%, #04060a 0 11%, transparent 12%), radial-gradient(circle at 70% 44%, rgba(0,229,255,.2), transparent 30%), linear-gradient(130deg, rgba(7,11,18,.97), rgba(15,24,33,.94))",
  },
  {
    badge: "SCRIPT",
    title: "Neon Requiem",
    phase: "Scriptwriting",
    progress: 58,
    updated: "Updated 5 hr ago",
    tone: "violet",
    tab: "scripts" as ForgeTab,
    bg: "radial-gradient(circle at 78% 18%, rgba(255,46,172,.5), transparent 16%), linear-gradient(135deg, rgba(31,9,37,.92), rgba(4,14,28,.95)), repeating-linear-gradient(90deg, rgba(236,72,153,.14) 0 3px, transparent 3px 38px)",
  },
] as const;

/* ── Studio groups ────────────────────────────────────────────────── */

const studioGroups = [
  {
    title: "Foundation",
    tone: "gold",
    items: [
      { title: "Universe", sub: "World, lore, setting", icon: Orbit, tab: "universe" as ForgeTab },
      { title: "DNA", sub: "Characters, brand, rules", icon: Dna, tab: "dna" as ForgeTab },
      { title: "Voice", sub: "Tone, voice, narration", icon: Mic, tab: "voice" as ForgeTab },
    ],
  },
  {
    title: "Creation",
    tone: "cyan",
    items: [
      { title: "Strategy", sub: "Positioning, offers, funnel", icon: Target, tab: "strategy" as ForgeTab },
      { title: "Scripts", sub: "Hooks, ads, scenes", icon: PenLine, tab: "scripts" as ForgeTab },
      { title: "Images", sub: "Visuals, art, thumbnails", icon: Image, tab: "images" as ForgeTab },
      { title: "Video", sub: "Motion, cinematic, reels", icon: Film, tab: "videos" as ForgeTab },
    ],
  },
  {
    title: "Launch",
    tone: "violet",
    items: [
      { title: "Campaigns", sub: "Calendar, content, variants", icon: Megaphone, tab: "campaign" as ForgeTab },
      { title: "Distribute", sub: "Platforms, formatting, prep", icon: Send, tab: "distribute" as ForgeTab },
      { title: "Analytics", sub: "Performance, insights, wins", icon: BarChart3, tab: "analytics" as ForgeTab },
    ],
  },
  {
    title: "Library",
    tone: "gold",
    items: [
      { title: "Vault", sub: "Assets, prompts, exports", icon: Archive, tab: "vault" as ForgeTab },
      { title: "Config", sub: "Studio settings, integrations", icon: Settings, tab: "config" as ForgeTab },
    ],
  },
] as const;

/* ── Copilot data ───────────────────────────────────────────────────── */

const nextMoves = [
  { title: "Build a 7-day launch plan", sub: "for this universe", icon: CalendarDays, tone: "cyan" },
  { title: "Generate 10 image prompts", sub: "from latest script", icon: Image, tone: "gold" },
  { title: "Create TikTok hooks", sub: "for current campaign", icon: Sparkles, tone: "gold" },
  { title: "Review brand consistency", sub: "across all assets", icon: ShieldCheck, tone: "cyan" },
] as const;

const memoryItems = [
  { label: "Universe Tone", value: "Dark, Cyberpunk, Gritty", icon: Sparkles, tone: "violet" },
  { label: "Audience", value: "Creators, Founders, Gamers", icon: Target, tone: "gold" },
  { label: "Visual Style", value: "Neon Noir, High Contrast", icon: Image, tone: "violet" },
  { label: "Current Goal", value: "Launch campaign & scale across platforms", icon: Rocket, tone: "cyan" },
] as const;

/* ── Helpers ──────────────────────────────────────────────────────── */

function toneClasses(tone?: string) {
  switch (tone) {
    case "gold":
      return {
        text: "text-[#f7d794]",
        border: "border-[#d4af37]/45",
        glow: "shadow-[0_0_30px_rgba(212,175,55,.12)]",
        bg: "bg-[#1c1a05]/55",
        gradient: "from-[#f7d794] to-[#d4af37]",
      };
    case "violet":
      return {
        text: "text-violet-300",
        border: "border-violet-400/35",
        glow: "shadow-[0_0_30px_rgba(139,92,246,.12)]",
        bg: "bg-violet-500/10",
        gradient: "from-violet-400 to-fuchsia-300",
      };
    default:
      return {
        text: "text-cyan-300",
        border: "border-cyan-300/35",
        glow: "shadow-[0_0_30px_rgba(0,229,255,.12)]",
        bg: "bg-cyan-400/10",
        gradient: "from-cyan-300 to-sky-400",
      };
  }
}

/* ── UI Primitives ──────────────────────────────────────────────────── */

function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0a0f]/85 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-2xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle at 85% 0%, rgba(247,215,148,.08), transparent 32%), linear-gradient(180deg, rgba(255,255,255,.03), transparent 42%)",
        }}
      />
      {/* 1px light catching top border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-50" />
      <div className="relative">{children}</div>
    </section>
  );
}

function SectionTitle({ title, sub, action, onAction }: { title: string; sub?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-xs font-black uppercase tracking-[.25em] text-[#f7d794]/90">{title}</h2>
        {sub ? <p className="mt-1.5 text-sm text-zinc-500 font-medium">{sub}</p> : null}
      </div>
      {action ? (
        <button onClick={onAction} className="shrink-0 text-xs font-black uppercase tracking-widest text-cyan-400/80 hover:text-cyan-300 transition-colors">{action}</button>
      ) : null}
    </div>
  );
}

function ActionButton({ children, primary, violet, onClick }: { children: React.ReactNode; primary?: boolean; violet?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "group inline-flex items-center justify-center gap-3 rounded-xl border px-6 py-3.5 text-sm font-black tracking-tight transition-all duration-300",
        primary
          ? "border-[#f7d794]/50 bg-gradient-to-br from-[#f7d794] via-[#d4af37] to-[#b8860b] text-[#1a1105] shadow-[0_10px_40px_rgba(212,175,55,.2)] hover:shadow-[0_15px_50px_rgba(212,175,55,.3)] hover:-translate-y-0.5 active:scale-[0.98]"
          : violet
          ? "border-violet-400/30 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20 hover:border-violet-400/50"
          : "border-cyan-300/30 bg-cyan-400/8 text-cyan-100 hover:bg-cyan-400/15 hover:border-cyan-300/50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ProgressBar({ value, tone = "cyan" }: { value: number; tone?: string }) {
  const t = toneClasses(tone);
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full bg-gradient-to-r ${t.gradient}`} style={{ width: `${value}%` }} />
    </div>
  );
}

/* ── Sections ───────────────────────────────────────────────────────── */



function CurrentProductionHero() {
  const { setActiveTab } = useAxsStore();
  return (
    <CardShell className="border-[#d4af37]/30">
      <div className="absolute inset-0 opacity-80"
        style={{
          background: "linear-gradient(90deg, rgba(10,10,15,1) 0%, rgba(10,10,15,0.95) 35%, rgba(10,10,15,0.3) 65%, rgba(10,10,15,0.85) 100%), radial-gradient(circle at 75% 35%, rgba(247,215,148,.18), transparent 25%), radial-gradient(circle at 85% 25%, rgba(0,212,255,.12), transparent 20%), linear-gradient(135deg, #0a0a0f, #141428)",
        }}
      />
      <div className="absolute right-0 top-0 h-full w-[60%] opacity-40 mix-blend-overlay"
        style={{
          background: "repeating-linear-gradient(90deg, rgba(247,215,148,.1) 0 1px, transparent 1px 40px), radial-gradient(circle at 60% 40%, rgba(255,255,255,.1), transparent 10%)",
        }}
      />
      <div className="absolute right-[10%] top-[30%] h-32 w-64 rounded-[100%] bg-[#f7d794]/10 blur-[80px]" />

      <div className="relative p-8 lg:p-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[.3em] text-[#f7d794]">
            <div className="relative size-2">
              <div className="absolute inset-0 rounded-full bg-[#f7d794] animate-ping opacity-75" />
              <div className="absolute inset-0 rounded-full bg-[#f7d794]" />
            </div>
            Active Intelligence Stream
          </div>
        </div>

        <div className="max-w-3xl">
          <div className="flex flex-wrap items-end gap-6">
            <h2 className="text-[clamp(2.2rem,4vw,4.2rem)] font-black tracking-tightest text-white leading-[0.9]">
              Cyberpunk 2077 <br />
              <span className="text-[#f7d794]">Universe</span>
            </h2>
            <div className="mb-3 rounded-full border border-[#f7d794]/30 bg-[#f7d794]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-[#f7d794] backdrop-blur-md">
              Level 4 Production
            </div>
          </div>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-400 font-medium">
            Strategic world-build in progress. Neural pathways active across 12 characters and 34 narrative nodes.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ActionButton primary onClick={() => setActiveTab("universe")}>
              RESUME ARCHITECTURE <span className="ml-2 text-xl opacity-50">→</span>
            </ActionButton>
            <ActionButton onClick={() => setActiveTab("images")}>
              <Sparkles className="size-4" /> VISUALIZE NODE
            </ActionButton>
            <ActionButton violet onClick={() => setActiveTab("campaign")}>
              <Rocket className="size-4" /> DEPLOY CAMPAIGN
            </ActionButton>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-px rounded-3xl border border-white/5 bg-white/5 p-px sm:grid-cols-3 lg:grid-cols-6 overflow-hidden">
          {productionStats.map((stat) => {
            const Icon = stat.icon;
            const t = toneClasses(stat.tone);
            return (
              <div key={stat.label} className="flex flex-col gap-1 bg-[#0a0a0f]/60 p-5 backdrop-blur-md transition-colors hover:bg-[#0a0a0f]/40">
                <div className="flex items-center justify-between mb-2">
                   <Icon className={`size-4 ${t.text} opacity-70`} />
                   <div className={`size-1 rounded-full ${t.bg} opacity-50`} />
                </div>
                <div className="text-3xl font-black tracking-tight text-white">{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{stat.label}</div>
              </div>
            );
          })}
          <div className="flex flex-col gap-1 bg-[#0a0a0f]/80 p-5 backdrop-blur-md border-l border-white/5 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
                <Zap className="size-4 text-emerald-400 opacity-70" />
                <div className="text-[10px] font-black text-emerald-400">READY</div>
            </div>
            <div className="text-3xl font-black tracking-tight text-white">87%</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Launch Integrity</div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function CreateSomething() {
  const { setActiveTab } = useAxsStore();
  return (
    <CardShell className="p-6 h-full flex flex-col">
      <SectionTitle title="Direct Initiation" sub="Spawn a new production node." />
      <div className="grid grid-cols-1 gap-3 flex-1">
        {createActions.map((action) => {
          const Icon = action.icon;
          const t = toneClasses(action.tone);
          return (
            <button
              key={action.title}
              onClick={() => setActiveTab(action.tab)}
              className={`group relative overflow-hidden rounded-2xl border ${t.border} bg-white/[.02] p-4 text-left transition-all duration-300 hover:bg-white/[.05] hover:-translate-x-1 ${t.glow}`}
            >
              <div className="relative flex items-center gap-4">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${t.border} ${t.bg} shadow-inner`}>
                  <Icon className={`h-6 w-6 ${t.text}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">{action.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500 line-clamp-1">{action.description}</p>
                </div>
                <span className={`ml-auto text-xl ${t.text} opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0`}>›</span>
              </div>
            </button>
          );
        })}
      </div>
    </CardShell>
  );
}

function ContinueWork() {
  const { setActiveTab } = useAxsStore();
  return (
    <CardShell className="p-6 h-full">
      <SectionTitle title="Active Pipeline" sub="Continue your creative execution." action="Vault Registry" onAction={() => setActiveTab("vault")} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {projects.map((project) => {
          const t = toneClasses(project.tone);
          return (
            <article 
              key={project.title} 
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[.02] transition-all duration-300 hover:border-white/10 hover:bg-white/[.04]"
            >
              <div className="relative h-24 overflow-hidden" style={{ background: project.bg }}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent opacity-80" />
                <span className={`absolute left-3 top-3 rounded-md border ${t.border} bg-[#0a0a0f]/80 px-2 py-1 text-[9px] font-black tracking-widest ${t.text} backdrop-blur-md`}>
                  {project.badge}
                </span>
              </div>
              <div className="p-4">
                <h3 className="truncate text-sm font-black text-white uppercase tracking-tight">{project.title}</h3>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-zinc-500">Phase</span>
                  <span className={t.text}>{project.phase}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex-1"><ProgressBar value={project.progress} tone={project.tone} /></div>
                  <span className="text-[10px] font-black text-white">{project.progress}%</span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold text-zinc-600">{project.updated}</span>
                  <button
                    onClick={() => setActiveTab(project.tab)}
                    className="rounded-lg border border-white/10 bg-white/[.03] px-4 py-1.5 text-xs font-black text-zinc-300 uppercase tracking-widest transition-all hover:border-[#f7d794]/50 hover:text-[#f7d794] hover:bg-[#f7d794]/5"
                  >
                    Open
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        <button
          onClick={() => setActiveTab("universe")}
          className="group relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d4af37]/30 bg-[#1c1a05]/10 p-6 text-center transition-all duration-500 hover:border-[#f7d794]/60 hover:bg-[#1c1a05]/20"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#f7d794]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative grid h-14 w-14 place-items-center rounded-full border border-[#f7d794]/30 bg-[#f7d794]/5 text-[#f7d794] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-90">
              <Plus className="size-7" />
            </div>
          </div>
          <h3 className="mt-5 text-sm font-black text-white uppercase tracking-widest">New Production</h3>
          <p className="mt-2 max-w-[12rem] text-[11px] leading-relaxed text-zinc-500 font-medium italic">"Initialize a clean slate for your next grand vision."</p>
        </button>
      </div>
    </CardShell>
  );
}

function StudioMap() {
  const { setActiveTab } = useAxsStore();
  return (
    <CardShell className="p-8">
      <SectionTitle title="Neural Pipeline" sub="Connected intelligence nodes across the creative stack." />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
        {/* Connection lines (decorative) */}
        <div className="hidden lg:block absolute top-[45%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent z-0" />
        
        {studioGroups.map((group) => {
          const t = toneClasses(group.tone);
          return (
            <div key={group.title} className="relative z-10">
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className={`size-1.5 rounded-full ${t.bg} shadow-[0_0_8px_currentColor] ${t.text}`} />
                <h3 className={`text-[10px] font-black uppercase tracking-[.25em] ${t.text}`}>{group.title}</h3>
              </div>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      onClick={() => setActiveTab(item.tab)}
                      className="group flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[.02] p-3 text-left transition-all duration-300 hover:border-white/10 hover:bg-white/[.05] hover:shadow-[0_10px_30px_rgba(0,0,0,.2)]"
                    >
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/5 bg-black/40 ${t.text} transition-transform group-hover:scale-110`}><Icon className="h-5 w-5" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-black text-white uppercase tracking-tight group-hover:text-[#f7d794] transition-colors">{item.title}</span>
                        <span className="block truncate text-[10px] text-zinc-500 font-medium">{item.sub}</span>
                      </span>
                      <span className={`${t.text} opacity-0 group-hover:opacity-100 transition-opacity`}>›</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

type CopilotAttachment = { id: string; name: string; type: string; dataUrl: string };
type CopilotMessage = { id: string; role: "you" | "axs"; text: string; attachments?: CopilotAttachment[] };

function inferDestinationTab(text: string): ForgeTab {
  const value = text.toLowerCase();
  if (/character|dna|face|body|identity|actor/.test(value)) return "dna";
  if (/image|photo|poster|thumbnail|concept|render/.test(value)) return "images";
  if (/video|motion|trailer|reel|clip|shot/.test(value)) return "videos";
  if (/script|hook|caption|voiceover|copy/.test(value)) return "scripts";
  if (/campaign|launch|offer|ad|funnel/.test(value)) return "campaign";
  if (/world|universe|lore|timeline|episode|story/.test(value)) return "universe";
  if (/publish|distribute|tiktok|youtube|instagram|schedule/.test(value)) return "distribute";
  if (/setting|config|api|runpod|comfy|model/.test(value)) return "config";
  return "strategy";
}

function readDroppedImages(files: FileList | File[], onReady: (items: CopilotAttachment[]) => void) {
  const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
  if (!imageFiles.length) return;
  Promise.all(
    imageFiles.slice(0, 8).map(
      (file) =>
        new Promise<CopilotAttachment>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, type: file.type, dataUrl: String(reader.result) });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  )
    .then(onReady)
    .catch(() => toast.error("Image upload failed"));
}

function AxsCopilotConsole() {
  const { setActiveTab, setDraftPrompt } = useAxsStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<CopilotAttachment[]>([]);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "welcome",
      role: "axs",
      text: "Awaiting production command. Drop visual references or define your next creative node. I will stage the payload and route to the optimal module.",
    },
  ]);
  const [dragging, setDragging] = useState(false);

  const destination = useMemo(() => inferDestinationTab(prompt), [prompt]);
  const payload = useMemo(
    () => ({
      command: prompt.trim(),
      route: destination,
      attachments: attachments.map(({ name, type }) => ({ name, type })),
      mode: "unrestricted production command surface",
    }),
    [attachments, destination, prompt]
  );

  const addAttachments = (items: CopilotAttachment[]) => {
    setAttachments((current) => [...items, ...current].slice(0, 8));
    toast.success(`${items.length} image${items.length === 1 ? "" : "s"} attached`);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    readDroppedImages(event.dataTransfer.files, addAttachments);
  };

  const sendCommand = () => {
    const text = prompt.trim();
    if (!text && attachments.length === 0) {
      toast.error("Input required. Define a command or provide visual context.");
      return;
    }

    const stagedText = text || "Analyze the attached production references.";
    const routedTab = inferDestinationTab(stagedText);
    const nextMessages: CopilotMessage[] = [
      { id: crypto.randomUUID(), role: "you", text: stagedText, attachments },
      {
        id: crypto.randomUUID(),
        role: "axs",
        text: `Command staged. Target module: ${routedTab.toUpperCase()}. Payload initialized and synchronized with the production pipeline.`,
      },
    ];
    setMessages((current) => [...current, ...nextMessages].slice(-20));
    setDraftPrompt(stagedText);
    setActiveTab(routedTab);
    setPrompt("");
    setAttachments([]);
  };

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast.success("Command payload copied");
    } catch {
      toast.error("Clipboard unavailable");
    }
  };

  return (
    <CardShell className="border-cyan-400/20 p-6 h-full flex flex-col">
      <SectionTitle title="Mission Control" sub="Routing surface for AXS Intelligence." />
      
      <div
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex-1 flex flex-col rounded-2xl border transition-all duration-500 overflow-hidden ${
          dragging ? "border-cyan-400/60 bg-cyan-400/10 scale-[0.99]" : "border-white/5 bg-black/40"
        }`}
      >
        <div className="flex-1 max-h-[16rem] space-y-4 overflow-y-auto p-5 scrollbar-hide">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`relative rounded-2xl p-4 border transition-all ${
                message.role === "you" 
                  ? "ml-12 border-cyan-400/20 bg-cyan-400/5 shadow-[0_0_20px_rgba(34,211,238,0.05)]" 
                  : "mr-12 border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="absolute top-4 -left-1 px-2 py-0.5 rounded-sm bg-black/80 text-[8px] font-black uppercase tracking-[.2em] text-zinc-500 rotate-90 origin-top-left">
                {message.role === "you" ? "USER" : "SYSTEM"}
              </div>
              <p className="text-sm leading-relaxed text-zinc-200 font-medium">{message.text}</p>
              {message.attachments?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.attachments.map((item) => (
                    <img key={item.id} src={item.dataUrl} alt={item.name} className="h-12 w-12 rounded-lg object-cover ring-1 ring-white/10 grayscale hover:grayscale-0 transition-all duration-500" />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="relative border-t border-white/5 bg-black/20 p-4">
          {attachments.length ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {attachments.map((item) => (
                <div key={item.id} className="group relative h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                  <img src={item.dataUrl} alt={item.name} className="h-full w-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                  <button 
                    type="button" 
                    onClick={() => setAttachments((current) => current.filter((a) => a.id !== item.id))} 
                    className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="size-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="w-full min-h-[5rem] max-h-[12rem] bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600 font-mono tracking-tight leading-relaxed"
            placeholder="Execute production command..."
          />
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => event.target.files && readDroppedImages(event.target.files, addAttachments)}
          />

          <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/5 pt-4">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Route: <span className="text-cyan-400">{destination.toUpperCase()}</span></span>
               </div>
               {attachments.length > 0 && (
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{attachments.length}/8 REFERENCES</span>
               )}
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="size-10 grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white transition-all"
                title="Add Reference Images"
              >
                <FolderOpen className="size-4" />
              </button>
              <button 
                type="button" 
                onClick={copyPayload} 
                className="size-10 grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white transition-all"
                title="Copy Command Payload"
              >
                <TerminalSquare className="size-4" />
              </button>
              <button 
                type="button" 
                onClick={sendCommand} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-[11px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all shadow-[0_0_30px_rgba(34,211,238,0.1)]"
              >
                EXECUTE <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function SuggestedNextMoves() {
  const { setActiveTab } = useAxsStore();
  return (
    <CardShell className="border-violet-400/20 p-6 h-full flex flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
          <Brain className="h-5 w-5" />
        </div>
        <h2 className="text-xs font-black uppercase tracking-[.2em] text-white">Next Moves</h2>
      </div>
      <div className="space-y-3 flex-1">
        {nextMoves.map((move) => {
          const Icon = move.icon;
          const t = toneClasses(move.tone);
          return (
            <button
              key={move.title}
              onClick={() => setActiveTab("strategy")}
              className="group flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[.02] p-4 text-left transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10"
            >
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/5 bg-black/40 ${t.text} group-hover:scale-110 transition-transform`}><Icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="block text-xs font-black text-white leading-tight uppercase tracking-tight">{move.title}</div>
                <div className="block text-[10px] text-zinc-500 font-medium mt-1">{move.sub}</div>
              </div>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => setActiveTab("strategy")}
        className="mt-6 w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-[.25em] text-zinc-400 hover:border-violet-400/40 hover:text-violet-200 transition-all"
      >
        Expand Strategy <ChevronDown className="ml-2 inline h-3.5 w-3.5" />
      </button>
    </CardShell>
  );
}

function MemorySnapshot() {
  return (
    <CardShell className="p-6 h-full flex flex-col">
      <SectionTitle title="Neural Snapshot" sub="Continuity across all modules." />
      <div className="space-y-4 rounded-[1.5rem] border border-white/5 bg-black/40 p-6 flex-1">
        {memoryItems.map((item) => {
          const Icon = item.icon;
          const t = toneClasses(item.tone);
          return (
            <div key={item.label} className="flex items-start gap-4">
              <div className={`mt-1 size-1.5 rounded-full ${t.bg} shadow-[0_0_8px_currentColor] ${t.text} shrink-0`} />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">{item.label}</div>
                <div className="text-sm font-black text-zinc-200 uppercase tracking-tight leading-snug">{item.value}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        <div className="size-12 shrink-0 grid place-items-center rounded-xl bg-[#f7d794]/5 border border-[#f7d794]/10">
           <Brain className="size-6 text-[#f7d794] opacity-80" />
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-400 font-medium italic">"AXS maintains state so you never lose the creative thread."</p>
      </div>
    </CardShell>
  );
}


/* ── Main export ──────────────────────────────────────────────────────── */

export function AXSCommandDeck() {
  return (
    <div className="relative min-w-0 grid grid-cols-12 gap-5 auto-rows-auto">
      {/* Row 1: Mission Control & Memory */}
      <div className="col-span-12 lg:col-span-8">
        <AxsCopilotConsole />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <MemorySnapshot />
      </div>

      {/* Row 2: Active Production Focus */}
      <div className="col-span-12">
        <CurrentProductionHero />
      </div>

      {/* Row 3: Quick Start & Continue (Flipped Priority 3 & 4) */}
      <div className="col-span-12 xl:col-span-5">
        <CreateSomething />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <ContinueWork />
      </div>

      {/* Row 4: Pipeline Map */}
      <div className="col-span-12 lg:col-span-9">
        <StudioMap />
      </div>

      {/* Row 5: Suggested Next Moves */}
      <div className="col-span-12 lg:col-span-3">
        <SuggestedNextMoves />
      </div>
    </div>
  );
}
