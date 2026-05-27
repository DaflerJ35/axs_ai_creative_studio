import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "./components/Navbar";
import { useNyxStore } from "./store/useNyxStore";
import { CharacterStudio } from "./components/studio/CharacterStudio";
import { ImageForge } from "./components/forge/ImageForge";
import { VideoForge } from "./components/forge/VideoForge";
import { ScriptForge } from "./components/forge/ScriptForge";
import MarketingStudio from "./components/forge/MarketingStudio";
import { DNALibrary } from "./components/dna/DNALibrary";
import { Gallery } from "./components/gallery/Gallery";
import { Settings } from "./components/settings/Settings";
import { MobileNav } from "./components/MobileNav";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

export default function App() {
  const { activeTab, settings } = useNyxStore();

  useEffect(() => {
    if (settings.runpodApiKey)
      localStorage.setItem("momentum.apiKey", settings.runpodApiKey);
    if (settings.runpodEndpointId)
      localStorage.setItem("momentum.endpointId", settings.runpodEndpointId);
    if (settings.runpodVideoEndpointId)
      localStorage.setItem("momentum.videoEndpointId", settings.runpodVideoEndpointId);
  }, [settings.runpodApiKey, settings.runpodEndpointId, settings.runpodVideoEndpointId]);

  const renderContent = () => {
    switch (activeTab) {
      case "studio":    return <CharacterStudio />;
      case "images":    return <ImageForge />;
      case "videos":    return <VideoForge />;
      case "scripts":   return <ScriptForge />;
      case "marketing": return <MarketingStudio />;
      case "dna":       return <DNALibrary />;
      case "gallery":   return <Gallery />;
      case "settings":  return <Settings />;
      default:          return <CharacterStudio />;
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 overflow-x-hidden">
        <Navbar />

        {/* Ambient orbs — reacts to tab */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[5%] w-[60%] h-[60%] bg-violet-700/8 blur-[180px] rounded-full"
          />
          <motion.div
            animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/8 blur-[160px] rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.15, 0.4, 0.15], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[35%] left-[40%] w-[40%] h-[40%] bg-pink-600/6 blur-[150px] rounded-full"
          />
          {/* Subtle noise grain overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "150px",
            }}
          />
        </div>

        <main className="pt-[72px] pb-32 max-w-[1600px] mx-auto px-5 lg:px-10 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="pt-8"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <MobileNav />
        <Toaster position="bottom-right" theme="dark" closeButton richColors />
      </div>
    </TooltipProvider>
  );
}
