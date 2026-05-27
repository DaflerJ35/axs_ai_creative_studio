import type { ReactNode } from "react";
import {
  Archive,
  BarChart3,
  Bell,
  Brain,
  ChevronDown,
  Dna,
  Film,
  Image,
  Megaphone,
  Mic,
  Orbit,
  PenLine,
  Rocket,
  Search,
  Send,
  Settings,
  Sparkles,
  Target,
  TerminalSquare,
  UserRound,
} from "lucide-react";
import { useAxsStore } from "../../store/useAxsStore";
import type { ForgeTab } from "../../lib/types";
import { ComfyStatusBadge } from "../ui/ComfyStatusBadge";

/* ── Sidebar navigation ───────────────────────────────────────────────── */

interface SidebarItem {
  label: string;
  icon: typeof TerminalSquare;
  tab: ForgeTab;
}

const sidebarItems: SidebarItem[] = [
  { label: "Command\nDeck", icon: TerminalSquare, tab: "studio" },
  { label: "Universe", icon: Orbit, tab: "universe" },
  { label: "DNA", icon: Dna, tab: "dna" },
  { label: "Voice", icon: Mic, tab: "voice" },
  { label: "Strategy", icon: Target, tab: "strategy" },
  { label: "Scripts", icon: PenLine, tab: "scripts" },
  { label: "Images", icon: Image, tab: "images" },
  { label: "Video", icon: Film, tab: "videos" },
  { label: "Campaigns", icon: Megaphone, tab: "campaign" },
  { label: "Distribute", icon: Send, tab: "distribute" },
  { label: "Analytics", icon: BarChart3, tab: "analytics" },
  { label: "Vault", icon: Archive, tab: "vault" },
  { label: "Config", icon: Settings, tab: "config" },
];

type StudioTheme = {
  accent: string;
  accentSoft: string;
  icon: string;
  aura: string;
  grid: string;
  beam: string;
  navGlow: string;
  command: string;
  status: string;
  texture: "command" | "orbit" | "helix" | "wave" | "script" | "lens" | "film" | "campaign" | "distribution" | "archive" | "analytics" | "config";
};

const studioThemes: Partial<Record<ForgeTab, StudioTheme>> = {
  studio: { accent: "#22d3ee", accentSoft: "rgba(34,211,238,.16)", icon: "text-cyan-300", aura: "rgba(34,211,238,.14)", grid: "rgba(34,211,238,.16)", beam: "rgba(139,92,246,.13)", navGlow: "rgba(34,211,238,.18)", command: "Ask AXS to route a production task...", status: "Command intelligence online", texture: "command" },
  universe: { accent: "#38bdf8", accentSoft: "rgba(56,189,248,.16)", icon: "text-sky-300", aura: "rgba(56,189,248,.18)", grid: "rgba(125,211,252,.13)", beam: "rgba(167,139,250,.15)", navGlow: "rgba(56,189,248,.22)", command: "Search lore, timelines, characters, and story rules...", status: "Universe continuity engine synced", texture: "orbit" },
  dna: { accent: "#a78bfa", accentSoft: "rgba(167,139,250,.16)", icon: "text-violet-300", aura: "rgba(167,139,250,.18)", grid: "rgba(167,139,250,.14)", beam: "rgba(34,211,238,.11)", navGlow: "rgba(167,139,250,.22)", command: "Find a character, identity rule, reference, or lock...", status: "Identity locks protected", texture: "helix" },
  voice: { accent: "#2dd4bf", accentSoft: "rgba(45,212,191,.16)", icon: "text-teal-300", aura: "rgba(45,212,191,.16)", grid: "rgba(45,212,191,.12)", beam: "rgba(14,165,233,.12)", navGlow: "rgba(45,212,191,.22)", command: "Audition voices, narration direction, and brand cadence...", status: "Voice print monitor active", texture: "wave" },
  strategy: { accent: "#fbbf24", accentSoft: "rgba(251,191,36,.16)", icon: "text-amber-300", aura: "rgba(251,191,36,.15)", grid: "rgba(251,191,36,.11)", beam: "rgba(34,211,238,.10)", navGlow: "rgba(251,191,36,.20)", command: "Ask for a campaign plan, offer angle, or launch sequence...", status: "Strategic planner calibrated", texture: "campaign" },
  scripts: { accent: "#f472b6", accentSoft: "rgba(244,114,182,.14)", icon: "text-pink-300", aura: "rgba(244,114,182,.14)", grid: "rgba(244,114,182,.10)", beam: "rgba(251,191,36,.10)", navGlow: "rgba(244,114,182,.20)", command: "Draft hooks, ads, captions, scenes, or voiceovers...", status: "Writer's room ready", texture: "script" },
  images: { accent: "#60a5fa", accentSoft: "rgba(96,165,250,.15)", icon: "text-blue-300", aura: "rgba(96,165,250,.16)", grid: "rgba(96,165,250,.12)", beam: "rgba(168,85,247,.10)", navGlow: "rgba(96,165,250,.21)", command: "Search concepts, references, prompts, or image jobs...", status: "Concept render surface live", texture: "lens" },
  videos: { accent: "#fb7185", accentSoft: "rgba(251,113,133,.14)", icon: "text-rose-300", aura: "rgba(251,113,133,.15)", grid: "rgba(251,113,133,.11)", beam: "rgba(251,191,36,.10)", navGlow: "rgba(251,113,133,.20)", command: "Plan shots, motion passes, trailers, or video renders...", status: "Motion bay on standby", texture: "film" },
  campaign: { accent: "#f59e0b", accentSoft: "rgba(245,158,11,.16)", icon: "text-orange-300", aura: "rgba(245,158,11,.15)", grid: "rgba(245,158,11,.11)", beam: "rgba(34,211,238,.10)", navGlow: "rgba(245,158,11,.20)", command: "Build launch systems, offers, assets, and content calendars...", status: "Campaign builder armed", texture: "campaign" },
  distribute: { accent: "#34d399", accentSoft: "rgba(52,211,153,.15)", icon: "text-emerald-300", aura: "rgba(52,211,153,.15)", grid: "rgba(52,211,153,.11)", beam: "rgba(14,165,233,.11)", navGlow: "rgba(52,211,153,.20)", command: "Prepare publishing, captions, rollout, and platform variants...", status: "Distribution lanes clear", texture: "distribution" },
  analytics: { accent: "#c084fc", accentSoft: "rgba(192,132,252,.15)", icon: "text-purple-300", aura: "rgba(192,132,252,.15)", grid: "rgba(192,132,252,.11)", beam: "rgba(34,211,238,.10)", navGlow: "rgba(192,132,252,.20)", command: "Inspect performance, attribution, experiments, or trends...", status: "Signal analytics running", texture: "analytics" },
  vault: { accent: "#d6b365", accentSoft: "rgba(214,179,101,.15)", icon: "text-[#f5d27b]", aura: "rgba(214,179,101,.15)", grid: "rgba(214,179,101,.10)", beam: "rgba(34,211,238,.09)", navGlow: "rgba(214,179,101,.19)", command: "Search assets, prompts, generations, and production memory...", status: "Archive memory synchronized", texture: "archive" },
  config: { accent: "#94a3b8", accentSoft: "rgba(148,163,184,.14)", icon: "text-slate-300", aura: "rgba(148,163,184,.13)", grid: "rgba(148,163,184,.10)", beam: "rgba(34,211,238,.08)", navGlow: "rgba(148,163,184,.18)", command: "Find integrations, model settings, billing, or system controls...", status: "Configuration core stable", texture: "config" },
};

const fallbackTheme = studioThemes.studio!;

interface AXSStudioPageShellProps {
  children: ReactNode;
  rightRail?: ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

export function AXSStudioPageShell({
  children,
  rightRail,
  pageTitle = "Studio",
  pageSubtitle = "AXS AI Creative Studio",
}: AXSStudioPageShellProps) {
  const { setActiveTab, activeTab } = useAxsStore();
  const theme = studioThemes[activeTab] ?? fallbackTheme;

  return (
    <div className="min-h-screen overflow-hidden bg-[#020407] text-zinc-100">
      {/* Tab-aware production atmosphere. Same shell, different room per discipline. */}
      <div className="pointer-events-none fixed inset-0 opacity-95 transition-colors duration-500"
        style={{
          background: `radial-gradient(circle at 34% 8%, ${theme.aura}, transparent 30%), radial-gradient(circle at 86% 18%, ${theme.beam}, transparent 31%), radial-gradient(circle at 72% 82%, rgba(214,158,55,.08), transparent 31%), linear-gradient(180deg, #020407 0%, #04070c 50%, #020407 100%)`,
        }}
      />
      <div className="pointer-events-none fixed inset-0 opacity-[.16]"
        style={{
          backgroundImage: `linear-gradient(${theme.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.grid} 1px, transparent 1px)`,
          backgroundSize: theme.texture === "script" ? "48px 72px" : theme.texture === "film" ? "96px 54px" : "76px 76px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 opacity-25"
        style={{
          background: `linear-gradient(115deg, transparent 0 18%, ${theme.accentSoft} 18.2%, transparent 19.2% 54%, ${theme.beam} 54.5%, transparent 55.6% 76%, rgba(214,158,55,.10) 76.5%, transparent 77.5%)`,
        }}
      />
      <div className={`pointer-events-none fixed inset-0 axs-studio-texture axs-studio-texture-${theme.texture}`} />

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside className="z-30 flex min-h-screen w-[7.8rem] shrink-0 flex-col border-r border-[#8f6a29]/32 bg-[#03070c]/94 shadow-[14px_0_55px_rgba(0,0,0,.5)]">
          <div className="border-b border-[#8f6a29]/25 px-4 py-5 text-center">
            <div className="text-4xl font-black leading-none tracking-tight text-[#f5c86d] drop-shadow-[0_0_18px_rgba(245,200,109,.28)]">AXS</div>
            <div className="mt-1 text-[.64rem] font-black uppercase tracking-[.26em] text-[#d8b565]">AI Studio</div>
          </div>

          <nav className="flex-1 space-y-1.5 px-3 py-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.tab)}
                  className={[
                    "group flex w-full flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-center text-[.72rem] font-bold leading-tight transition",
                    isActive
                      ? "text-white"
                      : "border-transparent text-zinc-300 hover:border-[#9d782f]/40 hover:bg-white/[.035] hover:text-[#ffd36f]",
                  ].join(" ")}
                  style={isActive ? { borderColor: theme.accent, background: theme.accentSoft, boxShadow: `inset 3px 0 0 ${theme.accent}, 0 0 30px ${theme.navGlow}` } : undefined}
                >
                  <Icon className={`h-5 w-5 ${isActive ? theme.icon : "text-[#d7ad5d]"}`} />
                  <span className="whitespace-pre-line">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-3">
            <button
              onClick={() => setActiveTab("studio")}
              className="w-full rounded-xl border border-violet-400/45 bg-violet-500/16 px-2 py-3 text-center shadow-[0_0_30px_rgba(139,92,246,.2)]"
            >
              <Brain className="mx-auto mb-1.5 h-6 w-6 text-violet-300" />
              <div className="text-xs font-black">Co-Pilot</div>
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-20 flex h-[4.65rem] items-center gap-5 border-b border-white/10 bg-black/62 px-6 backdrop-blur-xl">
            <div className="w-64 min-w-0">
              <div className="mb-1 h-0.5 w-14 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 18px ${theme.navGlow}` }} />
              <h1 className="truncate text-lg font-black uppercase tracking-[.08em] text-white">{pageTitle}</h1>
              <p className="mt-0.5 truncate text-sm text-zinc-400">{pageSubtitle}</p>
            </div>

            <div className="mx-auto flex h-11 w-full max-w-2xl items-center gap-3 rounded-xl border bg-black/48 px-4 text-zinc-500 shadow-[0_0_26px_rgba(0,0,0,.25)]" style={{ borderColor: theme.accentSoft }}>
              <Search className={`h-4 w-4 ${theme.icon}`} />
              <span className="truncate text-sm">{theme.command}</span>
              <span className="ml-auto rounded-md border border-white/10 bg-white/[.03] px-2 py-0.5 text-xs text-zinc-400">⌘K</span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <ComfyStatusBadge />
              <button
                onClick={() => setActiveTab("vault")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[.035] px-4 py-2 text-sm font-bold text-zinc-200 hover:border-[#b8892e]/50 hover:text-[#ffd36f]"
              >
                <Sparkles className="h-4 w-4" /> Memory
              </button>
              <button
                onClick={() => setActiveTab("strategy")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[.035] px-4 py-2 text-sm font-bold text-zinc-200 hover:border-[#b8892e]/50 hover:text-[#ffd36f]"
              >
                Plan <ChevronDown className="h-4 w-4" />
              </button>
              <button className="relative grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/[.035] text-zinc-300">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ffb32f] shadow-[0_0_14px_rgba(255,179,47,.8)]" />
              </button>
              <button className="grid h-11 w-11 place-items-center rounded-full border border-[#b8892e]/45 bg-[#17110a] text-[#ffd36f]">
                <UserRound className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-auto">
            {rightRail ? (
              <div className="grid min-w-0 grid-cols-1 gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_22.5rem] 2xl:p-6">
                <main className="min-w-0">
                  {children}
                </main>
                <aside className="min-w-0">{rightRail}</aside>
              </div>
            ) : (
              <div className="min-w-0 p-5 2xl:p-6">
                {children}
              </div>
            )}
          </div>

          {/* Bottom status */}
          <footer className="flex h-12 items-center gap-8 border-t border-white/10 bg-black/45 px-8 text-xs text-zinc-500">
            <div className="font-black uppercase tracking-[.14em] text-zinc-400">System Status</div>
            <div><span className="mr-2" style={{ color: theme.accent }}>●</span>{theme.status}</div>
            <div className="ml-auto flex items-center gap-8">
              <div><span className="font-bold text-zinc-300">Memory Sync</span> <span className="ml-2 text-zinc-200">92%</span></div>
              <div>AXS CORE v2.1</div>
              <div>All systems nominal</div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
