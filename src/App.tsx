import { Suspense, lazy, useCallback, useEffect, type ComponentType } from "react";
import { motion, AnimatePresence } from "motion/react";
import { del } from "idb-keyval";
import { Navbar } from "./components/Navbar";
import { useAxsStore } from "./store/useAxsStore";
import { ProductionMemoryPanelController, useProductionMemoryPanel } from "./components/platform/ProductionMemoryPanelController";
import { RouteErrorBoundary } from "./components/platform/RouteErrorBoundary";
import { MobileNav } from "./components/MobileNav";
import { Toaster, toast } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { AXSStudioPageShell } from "./components/axs/AXSStudioPageShell";
const lazyNamed = <T extends Record<string, unknown>, K extends keyof T>(
  loader: () => Promise<T>,
  exportName: K
) => lazy(() => loader().then((module) => ({ default: module[exportName] as ComponentType })));

const AXSCommandDeck = lazyNamed(() => import("./components/axs/AXSCommandDeck"), "AXSCommandDeck");
const AXSUniverseControl = lazyNamed(() => import("./components/axs/AXSUniverseControl"), "AXSUniverseControl");
const AXSStrategyWarRoom = lazyNamed(() => import("./components/axs/AXSStrategyWarRoom"), "AXSStrategyWarRoom");
const AXSDNALab = lazyNamed(() => import("./components/axs/AXSDNALab"), "AXSDNALab");
const AXSVoiceStudio = lazyNamed(() => import("./components/axs/AXSVoiceStudio"), "AXSVoiceStudio");
const AXSScriptsRoom = lazyNamed(() => import("./components/axs/AXSScriptsRoom"), "AXSScriptsRoom");
const AXSImageStudio = lazyNamed(() => import("./components/axs/AXSImageStudio"), "AXSImageStudio");
const AXSVideoBay = lazyNamed(() => import("./components/axs/AXSVideoBay"), "AXSVideoBay");
const AXSCampaignBoard = lazyNamed(() => import("./components/axs/AXSCampaignBoard"), "AXSCampaignBoard");
const AXSDistributionCockpit = lazyNamed(() => import("./components/axs/AXSDistributionCockpit"), "AXSDistributionCockpit");
const AXSAnalyticsCenter = lazyNamed(() => import("./components/axs/AXSAnalyticsCenter"), "AXSAnalyticsCenter");
const AXSVault = lazyNamed(() => import("./components/axs/AXSVault"), "AXSVault");
const AXSConfigCore = lazyNamed(() => import("./components/axs/AXSConfigCore"), "AXSConfigCore");
const AXSLandingPage = lazyNamed(
  () => import("./components/marketing/AXSLandingPage"),
  "AXSLandingPage"
);
const StudioHome = lazyNamed(() => import("./components/platform/StudioHome"), "StudioHome");
const StrategyStudio = lazyNamed(() => import("./components/platform/StrategyStudio"), "StrategyStudio");
const CreatorHub = lazyNamed(() => import("./components/platform/CreatorHub"), "CreatorHub");
const DistributeStudio = lazyNamed(() => import("./components/platform/DistributeStudio"), "DistributeStudio");
const VaultStudio = lazyNamed(() => import("./components/platform/VaultStudio"), "VaultStudio");
const AnalyticsStudio = lazyNamed(() => import("./components/platform/AnalyticsStudio"), "AnalyticsStudio");
const SceneBuilder = lazyNamed(() => import("./features/scene-builder"), "SceneBuilder");
const UniverseForge = lazyNamed(() => import("./features/universe-forge"), "UniverseForge");
const ImageForge = lazyNamed(() => import("./components/forge/ImageForge"), "ImageForge");
const VideoForge = lazyNamed(() => import("./components/forge/VideoForge"), "VideoForge");
const VoiceStudio = lazyNamed(() => import("./components/forge/VoiceStudio"), "VoiceStudio");
const ScriptForge = lazyNamed(() => import("./components/forge/ScriptForge"), "ScriptForge");
const MarketingStudio = lazy(() => import("./components/forge/MarketingStudio"));
const DNALibrary = lazyNamed(() => import("./components/dna/DNALibrary"), "DNALibrary");
const CharacterStudio = lazyNamed(() => import("./components/studio/CharacterStudio"), "CharacterStudio");
const Settings = lazyNamed(() => import("./components/settings/Settings"), "Settings");
const BillingPanel = lazyNamed(() => import("./components/platform/BillingPanel"), "BillingPanel");

function StudioLoadingFallback() {
  return (
    <div className="min-h-[45vh] rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
        <div className="relative mb-6 h-12 w-12">
          <div className="absolute inset-0 rounded-full border border-cyan-300/20" />
          <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-cyan-300 border-r-violet-300" />
          <div className="absolute inset-4 rounded-full bg-cyan-200/70 shadow-[0_0_28px_rgba(103,232,249,0.55)]" />
        </div>
        <div className="text-xs font-black uppercase tracking-[0.38em] text-cyan-100/45">AXS Module Loading</div>
        <div className="mt-3 text-2xl font-black text-white">Preparing the studio surface</div>
      </div>
    </div>
  );
}

export default function App() {
  const { activeTab, settings, readingMode } = useAxsStore();
  const panel = useProductionMemoryPanel(activeTab);
  const useReadingShell = readingMode && activeTab === "universe";

  const resetLocalSettings = useCallback(async () => {
    try {
      await del("axs-vault-v1");
    } catch {
      // IndexedDB may be unavailable; reloading still restores default state.
    }
    window.location.reload();
  }, []);

  // Handle Stripe/PayPal checkout return params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    const provider = params.get("provider");
    const plan = params.get("plan");
    if (checkoutStatus === "success") {
      toast.success("Subscription started", {
        description: `Welcome to the ${plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : ""} plan via ${provider ?? "Stripe"}.`,
      });
      // Clean URL without reload
      window.history.replaceState({}, "", window.location.pathname);
    } else if (checkoutStatus === "cancelled") {
      toast.error("Checkout cancelled", {
        description: "You can restart checkout anytime from the Plan menu.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    try {
      if (settings.runpodApiKey)
        localStorage.setItem("axs.apiKey", settings.runpodApiKey);
      if (settings.runpodEndpointId)
        localStorage.setItem("axs.endpointId", settings.runpodEndpointId);
      if (settings.runpodVideoEndpointId)
        localStorage.setItem("axs.videoEndpointId", settings.runpodVideoEndpointId);
    } catch {
      // Blocked localStorage should not prevent the studio from booting.
    }
  }, [settings.runpodApiKey, settings.runpodEndpointId, settings.runpodVideoEndpointId]);

  const renderLegacyContent = () => {
    switch (activeTab) {
      case "scene":     return <SceneBuilder />;
      case "creator":   return <CreatorHub />;
      case "billing":   return <BillingPanel />;
      default:          return <SceneBuilder />;
    }
  };

  const pageMeta: Record<string, { title: string; subtitle: string }> = {
    studio:    { title: "Command Deck",  subtitle: "Production command, co-pilot routing, and studio overview." },
    universe:  { title: "Universe Engine", subtitle: "Story worlds, timeline integrity, lore, and continuity control." },
    scene:     { title: "Scene Builder", subtitle: "Cinematic composition, shot planning, and scene direction." },
    strategy:  { title: "Strategy War Room", subtitle: "Offers, positioning, launches, and campaign intelligence." },
    creator:   { title: "Creator Hub",   subtitle: "Content engine and creative workspace." },
    images:    { title: "Image Studio",  subtitle: "Concept art, production stills, posters, and visual identity." },
    videos:    { title: "Video Studio",  subtitle: "Cinematic motion, trailers, ad cuts, and scene animation." },
    voice:     { title: "Voice Studio",  subtitle: "Narration, brand voice, cadence, and audio direction." },
    scripts:   { title: "Script Forge",  subtitle: "Writer’s room for hooks, ads, scenes, captions, and voiceovers." },
    campaign:  { title: "Campaign Builder", subtitle: "Launch sequences, asset systems, and monetizable content flows." },
    distribute:{ title: "Distribution", subtitle: "Platform-ready publishing, rollout systems, and scheduling." },
    dna:       { title: "Character DNA", subtitle: "Digital actor identity, references, locks, and consistency memory." },
    vault:     { title: "Production Vault", subtitle: "Archive assets, prompts, generations, and reusable production memory." },
    analytics: { title: "Analytics Center", subtitle: "Performance intelligence, attribution, experiments, and signal tracking." },
    config:    { title: "Config Core",   subtitle: "Studio configuration, integrations, models, and system controls." },
    billing:   { title: "Billing",       subtitle: "Plan, usage, and subscription management." },
  };

  return (
    <TooltipProvider>
      {activeTab === "landing" ? (
        <>
          <Suspense fallback={<div className="min-h-screen bg-[#02040a]" />}>
            <AXSLandingPage />
          </Suspense>
          <Toaster position="bottom-right" theme="dark" closeButton richColors />
        </>
      ) : (
      <div className={`min-h-screen text-white selection:bg-cyan-500/30 overflow-x-hidden transition-colors duration-500 ${useReadingShell ? "bg-[#f5f7fb] text-slate-950" : "bg-[#02060a]"}`}>
        <AXSStudioPageShell
          pageTitle={pageMeta[activeTab]?.title ?? "Studio"}
          pageSubtitle={pageMeta[activeTab]?.subtitle ?? "AXS AI Creative Studio"}
          rightRail={<ProductionMemoryPanelController panel={panel} />}
        >
          <Suspense fallback={<StudioLoadingFallback />}>
            {activeTab === "studio" ? <AXSCommandDeck />
            : activeTab === "universe" ? <UniverseForge />
            : activeTab === "strategy" ? <StrategyStudio />
            : activeTab === "dna" ? <CharacterStudio />
            : activeTab === "voice" ? <VoiceStudio />
            : activeTab === "scripts" ? <ScriptForge />
            : activeTab === "images" ? <ImageForge />
            : activeTab === "videos" ? <VideoForge />
            : activeTab === "campaign" ? <MarketingStudio />
            : activeTab === "distribute" ? <DistributeStudio />
            : activeTab === "analytics" ? <AnalyticsStudio />
            : activeTab === "vault" ? <VaultStudio />
            : activeTab === "config" ? <Settings />
            : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="min-w-0 flex flex-col flex-1"
                >
                  <RouteErrorBoundary
                    activeTab={activeTab}
                  >
                    <Suspense fallback={<StudioLoadingFallback />}>
                      {renderLegacyContent()}
                    </Suspense>
                  </RouteErrorBoundary>
                </motion.div>
              </AnimatePresence>
            )}
          </Suspense>
        </AXSStudioPageShell>

        <MobileNav />
        <Toaster position="bottom-right" theme="dark" closeButton richColors />
      </div>
      )}
    </TooltipProvider>
  );
}
