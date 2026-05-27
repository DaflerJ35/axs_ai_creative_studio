import { motion } from "motion/react";
import {
  Sparkles,
  UserRound,
  Image as ImageIcon,
  Clapperboard,
  FileText,
  Megaphone,
  Grid3X3,
  SlidersHorizontal,
  Zap,
  Dna,
} from "lucide-react";
import { useNyxStore } from "../store/useNyxStore";
import type { ForgeTab } from "../lib/types";

const TABS: { id: ForgeTab; label: string; Icon: typeof Sparkles; hot?: boolean }[] = [
  { id: "studio",    label: "Studio",   Icon: UserRound },
  { id: "images",   label: "Images",   Icon: ImageIcon },
  { id: "videos",   label: "Videos",   Icon: Clapperboard },
  { id: "scripts",  label: "Scripts",  Icon: FileText, hot: true },
  { id: "marketing",label: "Campaign", Icon: Megaphone },
  { id: "dna",      label: "DNA Library", Icon: Dna },
  { id: "gallery",  label: "Vault",    Icon: Grid3X3 },
  { id: "settings", label: "Config",   Icon: SlidersHorizontal },
];

export const Navbar = () => {
  const { activeTab, setActiveTab, gallery } = useNyxStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.07] bg-[#050505]/80 backdrop-blur-3xl">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => setActiveTab("studio")}
          className="flex items-center gap-3 group outline-none flex-shrink-0"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: -5 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(192,38,211,0.5)]"
          >
            <Sparkles className="w-4 h-4 text-black" strokeWidth={3} />
          </motion.div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30">Momentum</span>
            <span className="text-base font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              AI Creator
            </span>
          </div>
        </button>

        {/* Nav tabs */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            const Icon = t.Icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 outline-none"
              >
                {active && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-xl bg-white/[0.10] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon
                  className={`relative w-3.5 h-3.5 transition-colors ${active ? "text-white" : "text-white/40"}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={`relative transition-colors ${active ? "text-white" : "text-white/50 hover:text-white/70"}`}>
                  {t.label}
                </span>
                {t.hot && (
                  <span className="relative ml-0.5 px-1.5 py-0.5 text-[9px] font-black uppercase rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-white leading-none">
                    NEW
                  </span>
                )}
                {t.id === "gallery" && gallery.length > 0 && (
                  <span className="relative min-w-[18px] h-[18px] px-1 rounded-full bg-violet-500/80 text-[10px] font-bold text-white flex items-center justify-center">
                    {gallery.length > 99 ? "99+" : gallery.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setActiveTab("scripts")}
            className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-white/40 hover:text-white/70 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Script
          </button>
          <motion.button
            onClick={() => setActiveTab("marketing")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-black bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 shadow-[0_0_24px_rgba(139,92,246,0.5)] hover:brightness-110 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Campaign</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
};
