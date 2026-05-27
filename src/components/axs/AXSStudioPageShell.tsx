import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Archive,
  BarChart3,
  Bell,
  Brain,
  ChevronDown,
  Clapperboard,
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
  { label: "Scene\nBuilder", icon: Clapperboard, tab: "scene" },
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

const goldAccent = "#D4AF37";
const goldHighlight = "#F6D57A";
const softGold = "rgba(212,175,55,.14)";
const goldGrid = "rgba(246,213,122,.12)";
const goldGlow = "rgba(212,175,55,.22)";

const studioThemes: Partial<Record<ForgeTab, StudioTheme>> = {
  studio: { accent: goldHighlight, accentSoft: softGold, icon: "text-[#F6D57A]", aura: "rgba(212,175,55,.16)", grid: goldGrid, beam: "rgba(139,111,47,.16)", navGlow: goldGlow, command: "Search production state, launch blockers, memory, or route a task...", status: "Command Deck synchronized", texture: "command" },
  universe: { accent: goldHighlight, accentSoft: softGold, icon: "text-[#F6D57A]", aura: "rgba(212,175,55,.15)", grid: goldGrid, beam: "rgba(139,111,47,.15)", navGlow: goldGlow, command: "Search codex lore, characters, locations, factions, tags, and timelines...", status: "Universe Engine continuity synced", texture: "orbit" },
  dna: { accent: goldHighlight, accentSoft: softGold, icon: "text-[#F6D57A]", aura: "rgba(212,175,55,.15)", grid: goldGrid, beam: "rgba(246,213,122,.10)", navGlow: goldGlow, command: "Find identity locks, anchor images, reference weights, or style bible rules...", status: "Character DNA locks protected", texture: "helix" },
  scene: { accent: goldHighlight, accentSoft: softGold, icon: "text-[#F6D57A]", aura: "rgba(212,175,55,.15)", grid: goldGrid, beam: "rgba(246,213,122,.10)", navGlow: goldGlow, command: "Search beats, shot types, camera moves, atmosphere, or motion notes...", status: "Scene Builder director controls ready", texture: "film" },
  voice: { accent: goldAccent, accentSoft: softGold, icon: "text-[#D4AF37]", aura: "rgba(212,175,55,.12)", grid: "rgba(212,175,55,.10)", beam: "rgba(44,44,44,.16)", navGlow: goldGlow, command: "Audition voices, narration direction, and brand cadence...", status: "Voice print monitor active", texture: "wave" },
  strategy: { accent: goldAccent, accentSoft: softGold, icon: "text-[#D4AF37]", aura: "rgba(212,175,55,.13)", grid: "rgba(212,175,55,.10)", beam: "rgba(246,213,122,.09)", navGlow: goldGlow, command: "Ask for offer angles, campaign plans, funnel logic, or launch sequences...", status: "Strategic planner calibrated", texture: "campaign" },
  scripts: { accent: goldAccent, accentSoft: softGold, icon: "text-[#D4AF37]", aura: "rgba(212,175,55,.11)", grid: "rgba(212,175,55,.09)", beam: "rgba(246,213,122,.08)", navGlow: goldGlow, command: "Draft hooks, ads, captions, scenes, voiceovers, or script variants...", status: "Writer's room ready", texture: "script" },
  images: { accent: goldAccent, accentSoft: softGold, icon: "text-[#D4AF37]", aura: "rgba(212,175,55,.12)", grid: "rgba(212,175,55,.09)", beam: "rgba(246,213,122,.08)", navGlow: goldGlow, command: "Search concepts, anchor references, prompts, or image generation jobs...", status: "Concept render surface live", texture: "lens" },
  videos: { accent: goldAccent, accentSoft: softGold, icon: "text-[#D4AF37]", aura: "rgba(212,175,55,.12)", grid: "rgba(212,175,55,.09)", beam: "rgba(246,213,122,.08)", navGlow: goldGlow, command: "Plan shots, motion passes, trailers, reels, or video renders...", status: "Motion bay on standby", texture: "film" },
  campaign: { accent: goldHighlight, accentSoft: softGold, icon: "text-[#F6D57A]", aura: "rgba(212,175,55,.14)", grid: goldGrid, beam: "rgba(139,111,47,.14)", navGlow: goldGlow, command: "Build launch systems, offers, assets, calendars, and campaign variants...", status: "Campaign builder armed", texture: "campaign" },
  distribute: { accent: goldHighlight, accentSoft: softGold, icon: "text-[#F6D57A]", aura: "rgba(212,175,55,.14)", grid: goldGrid, beam: "rgba(52,211,153,.08)", navGlow: goldGlow, command: "Prepare Create, Adapt, Schedule, Review, captions, and platform variants...", status: "Distribution lanes clear", texture: "distribution" },
  analytics: { accent: goldAccent, accentSoft: softGold, icon: "text-[#D4AF37]", aura: "rgba(212,175,55,.11)", grid: "rgba(212,175,55,.09)", beam: "rgba(246,213,122,.08)", navGlow: goldGlow, command: "Inspect performance, attribution, experiments, and creative intelligence...", status: "Signal analytics running", texture: "analytics" },
  vault: { accent: goldHighlight, accentSoft: softGold, icon: "text-[#F6D57A]", aura: "rgba(212,175,55,.13)", grid: goldGrid, beam: "rgba(139,111,47,.14)", navGlow: goldGlow, command: "Search assets, prompts, generations, launch packs, and production memory...", status: "Vault memory synchronized", texture: "archive" },
  config: { accent: "#b9a56c", accentSoft: "rgba(185,165,108,.12)", icon: "text-[#d8c486]", aura: "rgba(185,165,108,.10)", grid: "rgba(185,165,108,.08)", beam: "rgba(44,44,44,.18)", navGlow: "rgba(185,165,108,.14)", command: "Find integrations, model settings, billing, or system controls...", status: "Configuration core stable", texture: "config" },
};

const fallbackTheme = studioThemes.studio!;

interface AXSStudioPageShellProps {
  children: ReactNode;
  rightRail?: ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  memoryPanel?: {
    isOpen: boolean;
    isRelevant: boolean;
    setOpen: (open: boolean) => void;
    toggleOpen: () => void;
  };
}

export function AXSStudioPageShell({
  children,
  rightRail,
  pageTitle = "Studio",
  pageSubtitle = "AXS AI Creative Studio",
  memoryPanel,
}: AXSStudioPageShellProps) {
  const { setActiveTab, activeTab, setDraftPrompt } = useAxsStore();
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [planOpen, setPlanOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const theme = studioThemes[activeTab] ?? fallbackTheme;
  const commandItems = useMemo(
    () => [
      { label: "Open Command Deck", detail: "Executive studio overview", tab: "studio" as ForgeTab },
      { label: "Create Campaign", detail: "Launch operations room", tab: "campaign" as ForgeTab },
      { label: "Generate Script", detail: "Writer's room", tab: "scripts" as ForgeTab },
      { label: "Open Universe", detail: "Codex and continuity", tab: "universe" as ForgeTab },
      { label: "Lock Character DNA", detail: "Identity laboratory", tab: "dna" as ForgeTab },
      { label: "Build Storyboard", detail: "Director's scene room", tab: "scene" as ForgeTab },
      { label: "Forge Images", detail: "Visual production lab", tab: "images" as ForgeTab },
      { label: "Forge Video", detail: "Motion director studio", tab: "videos" as ForgeTab },
      { label: "Prepare Launch Pack", detail: "Create, adapt, schedule, review", tab: "distribute" as ForgeTab },
      { label: "Open Config", detail: "Integrations and endpoints", tab: "config" as ForgeTab },
    ],
    []
  );
  const filteredCommandItems = commandItems.filter((item) =>
    `${item.label} ${item.detail}`.toLowerCase().includes(commandQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setPlanOpen(false);
        setAlertsOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const runCommand = (tab: ForgeTab, label: string) => {
    setActiveTab(tab);
    setDraftPrompt(label.includes("Script") ? "Write a high-converting short-form script for the active production." : "");
    setCommandOpen(false);
    setCommandQuery("");
    toast.success(label, { description: "AXS routed the command to the correct studio room." });
  };

  const openMemory = () => {
    if (memoryPanel?.isRelevant) {
      memoryPanel.setOpen(true);
      toast.success("Production Memory opened");
      return;
    }
    setActiveTab("studio");
    window.setTimeout(() => memoryPanel?.setOpen(true), 0);
    toast.info("Production Memory opens from the Command Deck");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#050505] text-zinc-100">
      {/* Tab-aware production atmosphere. Same shell, different room per discipline. */}
      <div className="pointer-events-none fixed inset-0 opacity-95 transition-colors duration-500"
        style={{
          background: `radial-gradient(circle at 34% 8%, ${theme.aura}, transparent 30%), radial-gradient(circle at 86% 18%, ${theme.beam}, transparent 31%), radial-gradient(circle at 72% 82%, rgba(214,175,55,.08), transparent 31%), linear-gradient(180deg, #050505 0%, #080808 48%, #050505 100%)`,
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
          background: `linear-gradient(115deg, transparent 0 18%, ${theme.accentSoft} 18.2%, transparent 19.2% 54%, ${theme.beam} 54.5%, transparent 55.6% 76%, rgba(246,213,122,.10) 76.5%, transparent 77.5%)`,
        }}
      />
      <div className={`pointer-events-none fixed inset-0 axs-studio-texture axs-studio-texture-${theme.texture}`} />

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside className="z-30 hidden min-h-screen w-[7.8rem] shrink-0 flex-col border-r border-[#8f6a29]/32 bg-[#050505]/94 shadow-[14px_0_55px_rgba(0,0,0,.5)] md:flex">
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
              className="w-full rounded-xl border border-[#F6D57A]/35 bg-[#D4AF37]/12 px-2 py-3 text-center shadow-[0_0_30px_rgba(212,175,55,.16)]"
            >
              <Brain className="mx-auto mb-1.5 h-6 w-6 text-[#F6D57A]" />
              <div className="text-xs font-black">Co-Pilot</div>
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-20 flex min-h-[4.65rem] flex-wrap items-center gap-3 border-b border-[#F6D57A]/14 bg-black/72 px-4 py-3 backdrop-blur-xl lg:flex-nowrap lg:gap-5 lg:px-6">
            <div className="min-w-0 flex-1 lg:w-64 lg:flex-none">
              <div className="mb-1 h-0.5 w-14 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 18px ${theme.navGlow}` }} />
              <h1 className="truncate text-lg font-black uppercase tracking-[.08em] text-white">{pageTitle}</h1>
              <p className="mt-0.5 truncate text-sm text-zinc-400">{pageSubtitle}</p>
            </div>

            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="order-3 mx-auto flex h-11 w-full min-w-0 items-center gap-3 rounded-xl border bg-black/48 px-4 text-left text-zinc-500 shadow-[0_0_26px_rgba(0,0,0,.25)] transition hover:border-[#F6D57A]/30 hover:text-zinc-300 lg:order-none lg:max-w-2xl"
              style={{ borderColor: theme.accentSoft }}
            >
              <Search className={`h-4 w-4 ${theme.icon}`} />
              <span className="truncate text-sm">{theme.command}</span>
              <span className="ml-auto hidden rounded-md border border-white/10 bg-white/[.03] px-2 py-0.5 text-xs text-zinc-400 sm:block">Ctrl K</span>
            </button>

            <div className="flex shrink-0 items-center gap-2 lg:gap-3">
              <ComfyStatusBadge />
              <button
                onClick={openMemory}
                className="hidden items-center gap-2 rounded-xl border border-white/12 bg-white/[.035] px-4 py-2 text-sm font-bold text-zinc-200 hover:border-[#b8892e]/50 hover:text-[#ffd36f] sm:inline-flex"
              >
                <Sparkles className="h-4 w-4" /> {memoryPanel?.isOpen ? "Memory Open" : "Memory"}
              </button>
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setPlanOpen((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[.035] px-4 py-2 text-sm font-bold text-zinc-200 hover:border-[#b8892e]/50 hover:text-[#ffd36f]"
                >
                  Plan <ChevronDown className="h-4 w-4" />
                </button>
                {planOpen ? (
                  <TopbarMenu>
                    {[
                      ["Strategy Board", "strategy"],
                      ["Campaign Pipeline", "campaign"],
                      ["Launch Calendar", "distribute"],
                      ["Performance Signals", "analytics"],
                    ].map(([label, tab]) => (
                      <MenuButton key={label} onClick={() => { setActiveTab(tab as ForgeTab); setPlanOpen(false); }}>
                        {label}
                      </MenuButton>
                    ))}
                  </TopbarMenu>
                ) : null}
              </div>
              <div className="relative">
              <button
                onClick={() => setAlertsOpen((value) => !value)}
                className="relative grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/[.035] text-zinc-300 transition hover:text-[#F6D57A]"
                aria-label="Open notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ffb32f] shadow-[0_0_14px_rgba(255,179,47,.8)]" />
              </button>
              {alertsOpen ? (
                <TopbarMenu align="right">
                  <div className="px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#F6D57A]">Notifications</div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-300">
                    No blocking alerts. 4 launch checks remain in demo mode.
                  </div>
                  <MenuButton onClick={() => { setAlertsOpen(false); setActiveTab("distribute"); }}>Review Launch Readiness</MenuButton>
                </TopbarMenu>
              ) : null}
              </div>
              <div className="relative">
              <button
                onClick={() => setAccountOpen((value) => !value)}
                className="grid h-11 w-11 place-items-center rounded-full border border-[#b8892e]/45 bg-[#17110a] text-[#ffd36f] transition hover:bg-[#2a1d0c]"
                aria-label="Open account menu"
              >
                <UserRound className="h-5 w-5" />
              </button>
              {accountOpen ? (
                <TopbarMenu align="right">
                  <MenuButton onClick={() => { setAccountOpen(false); setActiveTab("config"); }}>Account & Config</MenuButton>
                  <MenuButton onClick={() => { setAccountOpen(false); setActiveTab("vault"); }}>Local Data Vault</MenuButton>
                  <MenuButton onClick={() => toast.info("Authentication is not connected in this local demo shell.")}>Sign Out Requires Auth Setup</MenuButton>
                </TopbarMenu>
              ) : null}
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="border-b border-[#F6D57A]/12 bg-black/55 px-3 py-2 md:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.tab;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.tab)}
                    className={[
                      "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition",
                      isActive
                        ? "border-[#F6D57A]/40 bg-[#D4AF37]/12 text-[#F6D57A]"
                        : "border-white/8 bg-white/[.025] text-zinc-400",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label.replace("\n", " ")}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {rightRail ? (
              <div className="grid min-w-0 grid-cols-1 gap-4 p-3 sm:p-5 xl:grid-cols-[minmax(0,1fr)_22.5rem] 2xl:p-6">
                <main className="min-w-0">
                  {children}
                </main>
                <aside className="min-w-0">{rightRail}</aside>
              </div>
            ) : (
              <div className="min-w-0 p-3 sm:p-5 2xl:p-6">
                {children}
              </div>
            )}
          </div>

          {/* Bottom status */}
          <footer className="flex min-h-12 flex-wrap items-center gap-3 border-t border-[#F6D57A]/12 bg-black/55 px-4 py-3 text-xs text-zinc-500 lg:gap-8 lg:px-8">
            <div className="font-black uppercase tracking-[.14em] text-zinc-400">System Status</div>
            <div><span className="mr-2" style={{ color: theme.accent }}>●</span>{theme.status}</div>
            <div className="flex w-full items-center gap-4 sm:ml-auto sm:w-auto lg:gap-8">
              <div><span className="font-bold text-zinc-300">Memory Sync</span> <span className="ml-2 text-zinc-200">92%</span></div>
              <div className="hidden sm:block">AXS CORE v2.1</div>
              <div className="hidden lg:block">All systems nominal</div>
            </div>
          </footer>
        </div>
      </div>

      {commandOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-xl" onClick={() => setCommandOpen(false)}>
          <div
            className="mx-auto mt-20 max-w-2xl rounded-3xl border border-[#F6D57A]/24 bg-[#070707]/95 p-4 shadow-[0_30px_110px_rgba(0,0,0,.70),0_0_70px_rgba(212,175,55,.14)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/50 px-4 py-3">
              <Search className="h-5 w-5 text-[#F6D57A]" />
              <input
                autoFocus
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                placeholder="Search commands, modules, launch actions..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>
            <div className="mt-3 grid gap-2">
              {filteredCommandItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => runCommand(item.tab, item.label)}
                  className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-left transition hover:border-[#F6D57A]/30 hover:bg-[#D4AF37]/10"
                >
                  <div className="text-sm font-black text-white">{item.label}</div>
                  <div className="mt-1 text-xs text-zinc-500">{item.detail}</div>
                </button>
              ))}
              {filteredCommandItems.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-sm text-zinc-400">
                  No command matches. Try “script”, “launch”, “universe”, or “config”.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TopbarMenu({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return (
    <div
      className={`absolute top-[calc(100%+.5rem)] z-50 w-72 rounded-2xl border border-[#F6D57A]/18 bg-[#070707]/96 p-2 shadow-[0_24px_80px_rgba(0,0,0,.65),0_0_45px_rgba(212,175,55,.10)] backdrop-blur-xl ${align === "right" ? "right-0" : "left-0"}`}
    >
      {children}
    </div>
  );
}

function MenuButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold text-zinc-300 transition hover:bg-[#D4AF37]/10 hover:text-[#F6D57A]"
    >
      {children}
    </button>
  );
}
