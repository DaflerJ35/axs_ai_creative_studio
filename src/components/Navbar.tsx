import { motion } from "motion/react";
import {
  Archive,
  BarChart3,
  Bell,
  Dna,
  FileText,
  Image as ImageIcon,
  LayoutPanelTop,
  Megaphone,
  Mic2,
  Network,
  Send,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  UserCircle,
  Video,
} from "lucide-react";
import { CommandSearch } from "./command/CommandDeck";
import { useAxsStore } from "../store/useAxsStore";
import type { ForgeTab } from "../lib/types";

const TABS: { id: ForgeTab; label: string; Icon: typeof Sparkles }[] = [
  { id: "studio", label: "Command Deck", Icon: LayoutPanelTop },
  { id: "universe", label: "Universe", Icon: Network },
  { id: "dna", label: "DNA", Icon: Dna },
  { id: "voice", label: "Voice", Icon: Mic2 },
  { id: "strategy", label: "Strategy", Icon: Settings2 },
  { id: "scripts", label: "Scripts", Icon: FileText },
  { id: "images", label: "Images", Icon: ImageIcon },
  { id: "videos", label: "Video", Icon: Video },
  { id: "campaign", label: "Campaigns", Icon: Megaphone },
  { id: "distribute", label: "Distribute", Icon: Send },
  { id: "analytics", label: "Analytics", Icon: BarChart3 },
  { id: "vault", label: "Vault", Icon: Archive },
  { id: "config", label: "Config", Icon: SlidersHorizontal },
];

export const Navbar = ({
  onToggleMemoryPanel,
  memoryPanelOpen,
}: {
  onToggleMemoryPanel?: () => void;
  memoryPanelOpen?: boolean;
}) => {
  const { activeTab, setActiveTab } = useAxsStore();
  const current = TABS.find((tab) => tab.id === activeTab)?.label ?? "Command Deck";

  return (
    <>
      <aside className="axs-side-rail fixed left-0 top-0 z-50 hidden h-screen w-[104px] border-r border-white/10 backdrop-blur-2xl xl:block">
        <button
          type="button"
          onClick={() => setActiveTab("landing")}
          className="relative flex h-[78px] w-full flex-col items-center justify-center border-b border-white/10"
        >
          <span className="axs-wordmark text-4xl leading-none">AXS</span>
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60">AI Studio</span>
          <span className="absolute bottom-0 h-px w-[86%] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </button>

        <nav className="flex h-[calc(100vh-78px)] flex-col justify-between px-2 py-4">
          <div className="space-y-1">
            {TABS.map(({ id, label, Icon }) => {
              const active = activeTab === id || (activeTab === "scene" && id === "studio");
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`group relative flex w-full flex-col items-center gap-2 rounded-lg border px-2 py-3 text-[11px] font-medium transition ${
                    active
                      ? "axs-rail-active text-white"
                      : "border-transparent text-white/60 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {active ? <motion.span layoutId="axs-rail-glow" className="absolute left-0 top-2 h-[calc(100%-1rem)] w-0.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(0,212,255,0.6)]" /> : null}
                  <Icon className={`h-5 w-5 ${active ? "text-cyan-200" : "text-white/60"}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("creator")}
            className="mx-1 rounded-xl border border-violet-300/25 bg-violet-400/10 p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <div className="mx-auto mb-2 h-10 w-10 rounded-full border border-violet-200/30 bg-violet-400/15" />
            <div className="text-[11px] font-semibold text-violet-100">Co-Pilot</div>
          </button>
        </nav>
      </aside>

      <header className="axs-topbar fixed left-0 right-0 top-0 z-40 h-[64px] border-b border-white/10 backdrop-blur-2xl xl:left-[104px]">
        <div className="flex h-full items-center justify-between gap-5 px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden text-sm font-semibold uppercase tracking-wider text-white/70 md:block truncate">
              {current}
            </span>
            <span className="block xl:hidden axs-wordmark text-3xl">AXS</span>
          </div>

          <CommandSearch />

          <div className="flex items-center gap-3">
            {onToggleMemoryPanel ? (
              <button
                type="button"
                onClick={onToggleMemoryPanel}
                className={`hidden items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition md:flex ${memoryPanelOpen ? "border-cyan-300/50 bg-cyan-300/10 text-white" : "border-white/10 bg-black/20 text-white/70 hover:border-cyan-200/30 hover:text-white"}`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Memory</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setActiveTab("billing")}
              className={`hidden items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition md:flex ${activeTab === "billing" ? "border-cyan-300/50 bg-cyan-300/10 text-white" : "border-white/10 bg-black/20 text-white/70 hover:border-cyan-200/30 hover:text-white"}`}
            >
              Plan <span className="text-white/30">⌄</span>
            </button>
            <button aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/24 text-white/60">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-400" />
            </button>
            <button aria-label="User profile" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70">
              <UserCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
