import { motion } from "motion/react";
import {
  Archive,
  BarChart3,
  BrainCircuit,
  Dna,
  Network,
  Image as ImageIcon,
  FileText,
  Headphones,
  Megaphone,
  Mic2,
  Play,
  Send,
  SlidersHorizontal,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useAxsStore } from "../store/useAxsStore";
import type { ForgeTab } from "../lib/types";

const TABS: { id: ForgeTab; label: string; Icon: typeof Sparkles }[] = [
  { id: "studio",     label: "Studio",   Icon: Sparkles },
  { id: "universe",   label: "Universe", Icon: Network },
  { id: "strategy",   label: "Strategy", Icon: BrainCircuit },
  { id: "creator",    label: "Creator",  Icon: Mic2 },
  { id: "images",     label: "Images",   Icon: ImageIcon },
  { id: "videos",     label: "Videos",   Icon: Play },
  { id: "voice",      label: "Voice",    Icon: Headphones },
  { id: "scripts",    label: "Scripts",  Icon: FileText },
  { id: "campaign",   label: "Campaign", Icon: Megaphone },
  { id: "distribute", label: "Launch",   Icon: Send },
  { id: "dna",        label: "DNA",      Icon: Dna },
  { id: "vault",      label: "Vault",    Icon: Archive },
  { id: "analytics",  label: "Stats",    Icon: BarChart3 },
  { id: "config",     label: "Config",   Icon: SlidersHorizontal },
];

export const MobileNav = () => {
  const { activeTab, setActiveTab, workflowMode, contentRating } = useAxsStore();
  return (
    <div className="xl:hidden fixed bottom-4 left-4 right-4 z-50 rounded-3xl border border-white/10 bg-black/85 backdrop-blur-2xl p-2 shadow-[0_18px_70px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.10)]">
      <div className="mb-1 flex items-center justify-between px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="size-3 text-cyan-100/60" />
          {workflowMode}
        </span>
        <span>{contentRating}</span>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="relative flex min-w-[74px] flex-col items-center justify-center py-2 gap-0.5"
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-1 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 border border-white/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`relative w-5 h-5 transition-colors ${active ? "text-white" : "text-white/40"}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`relative text-[9px] font-bold tracking-wide transition-colors ${active ? "text-white" : "text-white/40"}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
