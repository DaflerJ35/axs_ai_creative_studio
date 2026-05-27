import { motion } from "motion/react";
import {
  UserRound,
  Image as ImageIcon,
  Clapperboard,
  FileText,
  Megaphone,
  Grid3X3,
} from "lucide-react";
import { useNyxStore } from "../store/useNyxStore";
import type { ForgeTab } from "../lib/types";

const TABS: { id: ForgeTab; label: string; Icon: typeof UserRound }[] = [
  { id: "studio",    label: "Studio",  Icon: UserRound },
  { id: "images",   label: "Images",  Icon: ImageIcon },
  { id: "scripts",  label: "Scripts", Icon: FileText },
  { id: "marketing",label: "Campaign",Icon: Megaphone },
  { id: "gallery",  label: "Vault",   Icon: Grid3X3 },
  { id: "videos",   label: "Videos",  Icon: Clapperboard },
];

export const MobileNav = () => {
  const { activeTab, setActiveTab } = useNyxStore();
  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 rounded-3xl border border-white/10 bg-black/85 backdrop-blur-2xl p-2">
      <div className="grid grid-cols-6">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="relative flex flex-col items-center justify-center py-2 gap-0.5"
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
