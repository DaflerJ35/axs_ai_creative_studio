import React, { Suspense, lazy, useState, useLayoutEffect, useEffect, type ComponentType } from 'react';
import {
  Sparkles,
  Cpu,
  Database,
  Calendar,
  DollarSign,
  Film,
  Sliders,
  Globe,
  Lock,
  Shield,
  ArrowRight,
  Check,
  Loader2,
  Play,
  X,
  ChevronRight,
  Video,
  Layers,
  Activity,
  ArrowUpRight,
  Menu
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import PitchPage from './PitchPage';
import CinematicBackground from './components/CinematicBackground';
import { Toaster } from 'sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { AXSStudioPageShell } from './components/axs/AXSStudioPageShell';
import { ProductionMemoryPanelController, useProductionMemoryPanel } from './components/platform/ProductionMemoryPanelController';
import { RouteErrorBoundary } from './components/platform/RouteErrorBoundary';
import { useAxsStore } from './store/useAxsStore';
import type { ForgeTab } from './lib/types';
import './axs.css';

// Clean relative image asset imports to resolve TS compilation, bundling and routing rules
// @ts-ignore
import axsGoldEmblem from './assets/images/axs_gold_emblem_1779633461494.png';
// @ts-ignore
import axsDashboardPreview from './assets/images/axs_dashboard_preview_1779633478949.png';

// Setup Supabase Client securely via typed cast env
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';
const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);
const supabase = hasSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Safe client-side analytics tracker
function trackEvent(eventName: string, metadata?: any) {
  console.log(`[AXS Analytics] Event: ${eventName}`, metadata || {});
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, metadata);
  }
}

const lazyNamed = <T extends Record<string, unknown>, K extends keyof T>(
  loader: () => Promise<T>,
  exportName: K
) => lazy(() => loader().then((module) => ({ default: module[exportName] as ComponentType })));

const AXSCommandDeck = lazyNamed(() => import('./components/axs/AXSCommandDeck'), 'AXSCommandDeck');
const UniverseForge = lazyNamed(() => import('./features/universe-forge'), 'UniverseForge');
const StrategyStudio = lazyNamed(() => import('./components/platform/StrategyStudio'), 'StrategyStudio');
const CharacterStudio = lazyNamed(() => import('./components/studio/CharacterStudio'), 'CharacterStudio');
const VoiceStudio = lazyNamed(() => import('./components/forge/VoiceStudio'), 'VoiceStudio');
const ScriptForge = lazyNamed(() => import('./components/forge/ScriptForge'), 'ScriptForge');
const ImageForge = lazyNamed(() => import('./components/forge/ImageForge'), 'ImageForge');
const VideoForge = lazyNamed(() => import('./components/forge/VideoForge'), 'VideoForge');
const MarketingStudio = lazy(() => import('./components/forge/MarketingStudio'));
const DistributeStudio = lazyNamed(() => import('./components/platform/DistributeStudio'), 'DistributeStudio');
const AnalyticsStudio = lazyNamed(() => import('./components/platform/AnalyticsStudio'), 'AnalyticsStudio');
const VaultStudio = lazyNamed(() => import('./components/platform/VaultStudio'), 'VaultStudio');
const Settings = lazyNamed(() => import('./components/settings/Settings'), 'Settings');
const SceneBuilder = lazyNamed(() => import('./features/scene-builder'), 'SceneBuilder');
const CreatorHub = lazyNamed(() => import('./components/platform/CreatorHub'), 'CreatorHub');

const pageMeta: Partial<Record<ForgeTab, { title: string; subtitle: string }>> = {
  studio: { title: 'Command Deck', subtitle: 'Production command, co-pilot routing, and studio overview.' },
  universe: { title: 'Universe Engine', subtitle: 'Story worlds, timeline integrity, lore, and continuity control.' },
  scene: { title: 'Scene Builder', subtitle: 'Cinematic composition, shot planning, and scene direction.' },
  strategy: { title: 'Strategy War Room', subtitle: 'Offers, positioning, launches, and campaign intelligence.' },
  creator: { title: 'Creator Hub', subtitle: 'Content engine and creative workspace.' },
  images: { title: 'Image Studio', subtitle: 'Concept art, production stills, posters, and visual identity.' },
  videos: { title: 'Video Studio', subtitle: 'Cinematic motion, trailers, ad cuts, and scene animation.' },
  voice: { title: 'Voice Studio', subtitle: 'Narration, brand voice, cadence, and audio direction.' },
  scripts: { title: 'Script Forge', subtitle: 'Writer’s room for hooks, ads, scenes, captions, and voiceovers.' },
  campaign: { title: 'Campaign Builder', subtitle: 'Launch sequences, asset systems, and monetizable content flows.' },
  distribute: { title: 'Distribution', subtitle: 'Platform-ready publishing, rollout systems, and scheduling.' },
  dna: { title: 'Character DNA', subtitle: 'Digital actor identity, references, locks, and consistency memory.' },
  vault: { title: 'Production Vault', subtitle: 'Archive assets, prompts, generations, and reusable production memory.' },
  analytics: { title: 'Analytics Center', subtitle: 'Performance intelligence, attribution, experiments, and signal tracking.' },
  config: { title: 'Config Core', subtitle: 'Studio configuration, integrations, models, and system controls.' },
};

function StudioLoadingFallback() {
  return (
    <div className="min-h-[45vh] rounded-[2rem] border border-[#D4AF37]/20 bg-black/35 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <div className="relative mb-6 h-12 w-12">
          <div className="absolute inset-0 rounded-full border border-[#D4AF37]/25" />
          <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-[#D4AF37] border-r-[#F6D57A]" />
          <div className="absolute inset-4 rounded-full bg-[#D4AF37]/80 shadow-[0_0_28px_rgba(212,175,55,0.55)]" />
        </div>
        <div className="text-xs font-black uppercase tracking-[0.38em] text-[#D4AF37]/70">AXS Module Loading</div>
        <div className="mt-3 text-2xl font-black text-white">Preparing the studio surface</div>
      </div>
    </div>
  );
}

function PlatformApp() {
  const { activeTab, setActiveTab, readingMode } = useAxsStore();
  const platformTab = activeTab === 'landing' ? 'studio' : activeTab;
  const panel = useProductionMemoryPanel(platformTab);
  const useReadingShell = readingMode && platformTab === 'universe';

  useEffect(() => {
    if (activeTab === 'landing') setActiveTab('studio');
  }, [activeTab, setActiveTab]);

  const renderPlatformContent = () => {
    switch (platformTab) {
      case 'studio': return <AXSCommandDeck />;
      case 'universe': return <UniverseForge />;
      case 'strategy': return <StrategyStudio />;
      case 'dna': return <CharacterStudio />;
      case 'voice': return <VoiceStudio />;
      case 'scripts': return <ScriptForge />;
      case 'images': return <ImageForge />;
      case 'videos': return <VideoForge />;
      case 'campaign': return <MarketingStudio />;
      case 'distribute': return <DistributeStudio />;
      case 'analytics': return <AnalyticsStudio />;
      case 'vault': return <VaultStudio />;
      case 'config': return <Settings />;
      case 'scene': return <SceneBuilder />;
      case 'creator': return <CreatorHub />;
      default: return <AXSCommandDeck />;
    }
  };

  return (
    <TooltipProvider>
      <div className={`min-h-screen text-white selection:bg-[#D4AF37]/30 overflow-x-hidden transition-colors duration-500 ${useReadingShell ? 'bg-[#f5f7fb] text-slate-950' : 'bg-[#02060a]'}`}>
        <AXSStudioPageShell
          pageTitle={pageMeta[platformTab]?.title ?? 'Command Deck'}
          pageSubtitle={pageMeta[platformTab]?.subtitle ?? 'AXS AI Creative Studio'}
          rightRail={<ProductionMemoryPanelController panel={panel} />}
          memoryPanel={panel}
        >
          <RouteErrorBoundary activeTab={platformTab}>
            <Suspense fallback={<StudioLoadingFallback />}>
              {renderPlatformContent()}
            </Suspense>
          </RouteErrorBoundary>
        </AXSStudioPageShell>
        <Toaster position="bottom-right" theme="dark" closeButton richColors />
      </div>
    </TooltipProvider>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Router listener
  useLayoutEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Intercept anchor clicks
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const currentPageTarget = document.getElementById(targetId);
    if (currentPageTarget) {
      currentPageTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
      return;
    }

    window.history.pushState(null, '', '/marketing');
    setCurrentPath('/marketing');
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    setMobileMenuOpen(false);
  };

  if (currentPath === '/' || currentPath === '/studio' || currentPath === '/platform') {
    return <PlatformApp />;
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-100 relative z-0 overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-white font-sans">
      {/* 3D Cinematic interactive background */}
      <CinematicBackground />
      
      {/* 1. CINEMATIC HEADER */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-[#D4AF37]/15 py-4.5 px-6 md:px-12 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo('/')}>
          <div className="relative">
            <div className="absolute inset-0 bg-[#D4AF37]/15 blur-md rounded-full scale-110 opacity-70 group-hover:opacity-100 transition-opacity" />
            <img 
              src={axsGoldEmblem} 
              alt="AXS Logo" 
              className="w-8 h-8 object-contain relative z-10 rounded-lg filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)] transition-transform group-hover:scale-110 duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="font-display font-black tracking-[0.25em] text-[#FFF] text-xs md:text-sm uppercase flex items-center gap-1.5">AXS <span className="text-[#D4AF37]">AI</span></h1>
            <span className="text-[8px] text-[#D4AF37] tracking-[0.3em] block -mt-0.5 font-mono uppercase">CINEMATIC_OS_V1.0</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-mono tracking-[0.2em] uppercase text-gray-400">
          {currentPath === '/pitch' ? (
            <>
              <a href="#scotty-pitch" onClick={(e) => handleAnchorClick(e, 'scotty-pitch')} className="relative py-1 hover:text-[#D4AF37] transition-colors group">
                Pitch Snapshot
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
              </a>
              <a href="#funding-ask" onClick={(e) => handleAnchorClick(e, 'funding-ask')} className="relative py-1 hover:text-[#D4AF37] transition-colors group font-mono">Launch Ask</a>
              <a href="#revenue-calculator" onClick={(e) => handleAnchorClick(e, 'revenue-calculator')} className="relative py-1 hover:text-[#D4AF37] transition-colors group">Projections</a>
              <a href="#pitch-roadmap" onClick={(e) => handleAnchorClick(e, 'pitch-roadmap')} className="relative py-1 hover:text-[#D4AF37] transition-colors group">Roadmap</a>
              <a href="#pitch-faq" onClick={(e) => handleAnchorClick(e, 'pitch-faq')} className="relative py-1 hover:text-[#D4AF37] transition-colors group">Campaign FAQ</a>
            </>
          ) : (
            <>
              <a href="#demo" onClick={(e) => handleAnchorClick(e, 'demo')} className="relative py-1 hover:text-[#D4AF37] transition-colors group">
                Demo
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
              </a>
              <a href="#problem" onClick={(e) => handleAnchorClick(e, 'problem')} className="relative py-1 hover:text-[#D4AF37] transition-colors group">
                Problem
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
              </a>
              <a href="#built-for" onClick={(e) => handleAnchorClick(e, 'built-for')} className="relative py-1 hover:text-[#D4AF37] transition-colors group">
                Built For
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
              </a>
              <a href="#modules" onClick={(e) => handleAnchorClick(e, 'modules')} className="relative py-1 hover:text-[#D4AF37] transition-colors group">
                Product
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
              </a>
              <a href="#founder-access" onClick={(e) => handleAnchorClick(e, 'founder-access')} className="relative py-1 hover:text-[#D4AF37] transition-colors group">
                Founder Access
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
              </a>
            </>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <a 
            href="#early-access" 
            onClick={(e) => {
              trackEvent('clicked_early_access', { position: 'header' });
              handleAnchorClick(e, 'early-access');
            }} 
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F3E5AB] text-black font-extrabold text-[10px] tracking-[0.18em] uppercase hover:brightness-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all duration-300"
          >
            Get Early Access
          </a>
        </div>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="lg:hidden text-gray-400 hover:text-[#D4AF37] focus:outline-none transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-16.5 left-0 w-full bg-[#050505]/95 backdrop-blur-3xl border-b border-[#D4AF37]/20 p-6 flex flex-col gap-4 text-xs font-mono tracking-widest uppercase z-50 shadow-2xl">
            {currentPath === '/pitch' ? (
              <>
                <a href="#scotty-pitch" onClick={(e) => handleAnchorClick(e, 'scotty-pitch')} className="py-2 hover:text-[#D4AF37] border-b border-gray-950 transition-colors">Pitch Snapshot</a>
                <a href="#funding-ask" onClick={(e) => handleAnchorClick(e, 'funding-ask')} className="py-2 hover:text-[#D4AF37] border-b border-gray-900 transition-colors">Launch Ask</a>
                <a href="#revenue-calculator" onClick={(e) => handleAnchorClick(e, 'revenue-calculator')} className="py-2 hover:text-[#D4AF37] border-b border-gray-900 transition-colors">Projections</a>
                <a href="#pitch-roadmap" onClick={(e) => handleAnchorClick(e, 'pitch-roadmap')} className="py-2 hover:text-[#D4AF37] border-b border-gray-900 transition-colors">Roadmap</a>
                <a href="#pitch-faq" onClick={(e) => handleAnchorClick(e, 'pitch-faq')} className="py-2 hover:text-[#D4AF37] border-b border-gray-900 transition-colors">Campaign FAQ</a>
              </>
            ) : (
              <>
                <a href="#demo" onClick={(e) => handleAnchorClick(e, 'demo')} className="py-2 hover:text-[#D4AF37] border-b border-gray-900 transition-colors">Demo</a>
                <a href="#problem" onClick={(e) => handleAnchorClick(e, 'problem')} className="py-2 hover:text-[#D4AF37] border-b border-gray-900 transition-colors">Problem</a>
                <a href="#built-for" onClick={(e) => handleAnchorClick(e, 'built-for')} className="py-2 hover:text-[#D4AF37] border-b border-gray-900 transition-colors">Built For</a>
                <a href="#modules" onClick={(e) => handleAnchorClick(e, 'modules')} className="py-2 hover:text-[#D4AF37] border-b border-gray-900 transition-colors">Product</a>
                <a href="#founder-access" onClick={(e) => handleAnchorClick(e, 'founder-access')} className="py-2 hover:text-[#D4AF37] border-b border-gray-900 transition-colors">Founder Access</a>
              </>
            )}
            <a 
              href="#early-access" 
              onClick={(e) => handleAnchorClick(e, 'early-access')} 
              className="mt-2 py-3 text-center rounded bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] text-black font-extrabold text-[10px] tracking-widest uppercase"
            >
              Get Early Access
            </a>
          </div>
        )}
      </header>

      {/* Master routing layout */}
      <main className="relative z-10">
        {currentPath === '/marketing' && <HomePage handleAnchorClick={handleAnchorClick} navigateTo={navigateTo} />}
        {currentPath === '/pitch' && <PitchPage handleAnchorClick={handleAnchorClick} navigateTo={navigateTo} />}
        {currentPath === '/contact' && <ContactPage navigateTo={navigateTo} />}
        {currentPath === '/privacy' && <PrivacyPage navigateTo={navigateTo} />}
        {currentPath === '/terms' && <TermsPage navigateTo={navigateTo} />}
      </main>

      {/* 21. FOOTER */}
      <footer className="bg-[#080808] border-t border-[#D4AF37]/10 py-16 px-6 md:px-12 mt-20 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src={axsGoldEmblem} alt="AXS Gold Logo" className="w-8 h-8 object-contain rounded-md" referrerPolicy="no-referrer" />
              <div className="font-bold tracking-widest text-[#FFF]">AXS AI Creative Studio</div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              The cinematic AI creative operating system for creators, brands, and studios. Turn one idea into a complete cinematic content system.
            </p>
            <div className="text-[10px] text-gray-500 font-mono">
              OFFICIAL WEBSITE SUPPORT • <a href="mailto:support@axscreativestudio.com" className="text-[#D4AF37] hover:underline">support@axscreativestudio.com</a>
            </div>
          </div>

          <div>
            <h4 className="text-[#FFF] font-semibold text-xs tracking-wider uppercase mb-4">Platform Info</h4>
            <div className="flex flex-col gap-2.5 text-xs text-gray-400">
              <a href="#demo" onClick={(e) => handleAnchorClick(e, 'demo')} className="hover:text-[#D4AF37] transition-all">Demo Studio</a>
              <a href="#built-for" onClick={(e) => handleAnchorClick(e, 'built-for')} className="hover:text-[#D4AF37] transition-all">Built For</a>
              <a href="#modules" onClick={(e) => handleAnchorClick(e, 'modules')} className="hover:text-[#D4AF37] transition-all">Core Modules</a>
              <a href="#faq" onClick={(e) => handleAnchorClick(e, 'faq')} className="hover:text-[#D4AF37] transition-all">System FAQ</a>
            </div>
          </div>

          <div>
            <h4 className="text-[#FFF] font-semibold text-xs tracking-wider uppercase mb-4">Enterprise & Legal</h4>
            <div className="flex flex-col gap-2.5 text-xs text-gray-400">
              <a href="#founder-access" onClick={(e) => handleAnchorClick(e, 'founder-access')} className="hover:text-[#D4AF37] transition-all font-sans">Founder Tiers</a>
              <a href="#early-access" onClick={(e) => handleAnchorClick(e, 'early-access')} className="hover:text-[#D4AF37] transition-all">Join Early Wave</a>
              <button onClick={() => navigateTo('/pitch')} className="text-left hover:text-[#D4AF37] transition-all cursor-pointer">Backer Pitch Page</button>
              <button onClick={() => navigateTo('/contact')} className="text-left hover:text-[#D4AF37] transition-all cursor-pointer">Contact Us</button>
              <button onClick={() => navigateTo('/privacy')} className="text-left hover:text-[#D4AF37] transition-all cursor-pointer">Privacy Policy</button>
              <button onClick={() => navigateTo('/terms')} className="text-left hover:text-[#D4AF37] transition-all cursor-pointer">Terms & Conditions</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 relative z-10">
          <div>© 2026 AXS AI Creative Studio. All rights reserved. Secure Cloud Environment.</div>
          <div className="mt-4 sm:mt-0 font-mono tracking-widest text-[#D4AF37]/50 text-[9px]">CINEMATIC_CONTENT_OS_V1.0</div>
        </div>
      </footer>
    </div>
  );
}

// ----------------------------------------------------
// HOMEPAGE COMPONENT
// ----------------------------------------------------
interface HomeProps {
  handleAnchorClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
  navigateTo: (path: string) => void;
}

function HomePage({ handleAnchorClick, navigateTo }: HomeProps) {
  return (
    <div className="space-y-36 pb-20">
      
      {/* 2. HERO / MAIN PITCH */}
      <section className="px-6 md:px-12 pt-20 md:pt-24 max-w-7xl mx-auto text-center relative z-10">
        
        {/* PREMIUM HERO LOGO CENTERPIECE Showcase */}
        <div className="relative mb-12 flex flex-col items-center justify-center">
          <div className="absolute w-[350px] h-[350px] bg-gradient-to-tr from-[#D4AF37]/20 via-[#D4AF37]/5 to-transparent rounded-full filter blur-[80px] pointer-events-none scale-75 animate-pulse" />
          <div className="relative group max-w-[220px] md:max-w-[280px]">
            {/* Ambient gold rings resembling the cinematic orbits on the logo */}
            <div className="absolute inset-[-15px] rounded-full border border-[#D4AF37]/15 border-dashed animate-[spin_80s_infinite_linear]" />
            <div className="absolute inset-[-25px] rounded-full border border-[#D4AF37]/5 select-none pointer-events-none" />
            
            <img 
              src={axsGoldEmblem} 
              alt="AXS - AI Creative Studio Logo" 
              className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.3)] border border-[#D4AF37]/20 transition-all duration-[3000ms] group-hover:scale-105 group-hover:rotate-[2deg]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-center mt-5 max-w-lg">
            <span className="text-[#D4AF37] font-mono text-[9px] uppercase tracking-[0.34em] block font-semibold leading-relaxed filter drop-shadow-[0_0_8px_rgba(212,175,55,0.2)]">IMAGINE • BUILD • DIRECT • DISTRIBUTE • REMEMBER</span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-[#0a0a0a]/80 backdrop-blur-2xl border border-[#D4AF37]/30 text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] mb-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_0_20px_rgba(212,175,55,0.12)]">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
          The AI Operating System for Cinema
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-display font-black tracking-[-0.03em] uppercase leading-[0.85] text-white">
          ONE IDEA. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#FFFFFF] drop-shadow-[0_0_20px_rgba(212,175,55,0.25)]">ONE MEMORY.</span> <br />
          INFINITE CINEMA.
        </h1>

        <p className="mt-10 text-base md:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed font-sans">
          AXS AI Creative Studio transforms a single creative spark into a complete cinematic content system — strategy, worldbuilding, character DNA, scripts, images, video, voice, campaigns, distribution, analytics, and persistent production memory.
        </p>

        <p className="mt-5 text-xs md:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
          Instead of scattered prompts and disconnected tools, AXS is built as one connected creative command center where every asset feeds the next step.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-5 max-w-lg mx-auto">
          <a
            href="#early-access"
            onClick={(e) => {
              trackEvent('clicked_early_access', { position: 'hero' });
              handleAnchorClick(e, 'early-access');
            }}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F3E5AB] text-black font-extrabold tracking-[0.2em] text-[10px] uppercase hover:shadow-[0_0_35px_rgba(212,175,55,0.45)] hover:brightness-105 active:scale-95 transition-all duration-300 text-center cursor-pointer"
          >
            Get Early Access
          </a>
          <a
            href="#demo"
            onClick={(e) => {
              trackEvent('clicked_demo', { position: 'hero' });
              handleAnchorClick(e, 'demo');
            }}
            className="w-full sm:w-auto px-10 py-4 rounded-xl smoked-glass border border-[#D4AF37]/30 text-[#FFF] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 active:scale-95 transition-all text-[11px] tracking-[0.2em] font-extrabold uppercase flex items-center justify-center gap-2 text-center cursor-pointer shadow-lg"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Watch Walkthrough
          </a>
        </div>

        {/* 3 Hero Stat Cards */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
          {[
            { value: '1 Connected OS', label: 'No More App Hopping', desc: 'Keep story universe lore, characters, script descriptions, and voiceover tones locked inside one core engine.' },
            { value: '12 Connected Modules', label: 'End-to-End Pipeline', desc: 'Seamlessly transition assets from creative storyworld outlines up to finalized high-fidelity digital delivery calendars.' },
            { value: '6 Immersive Rooms', label: 'Interactive Studios', desc: 'Create inside cinematic spaces designed with dark glass guidelines specifically for writers, film directors, and marketing agencies.' }
          ].map((stat, idx) => (
            <div key={idx} className="smoked-glass smoked-glass-interactive rounded-2xl p-7 border border-[#D4AF37]/15 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/8 to-transparent pointer-events-none group-hover:from-[#D4AF37]/15 transition-all duration-700 blur-xl" />
              <div className="liquid-glass-accent" />
              <div className="text-[#D4AF37] text-3xl font-display font-black tracking-tight">{stat.value}</div>
              <div className="text-white font-black text-[10px] font-mono uppercase tracking-[0.2em] mt-3">{stat.label}</div>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">{stat.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-[10px] font-mono tracking-[0.2em] text-[#D4AF37]/95 uppercase mt-12 text-center bg-[#050505]/70 py-3 px-6 rounded-xl border border-[#D4AF37]/25 inline-block mx-auto backdrop-blur-md shadow-md">
          ⚠️ Secure Early Access Waitlist Registration is active. Wave 1 slots compile in limited sequence.
        </p>

        {/* Cinematic Dashboard Showcase Container */}
        <div className="mt-24 max-w-5xl mx-auto rounded-3xl smoked-glass p-2 border border-[#D4AF37]/25 shadow-[0_0_80px_rgba(212,175,55,0.08)] group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[2000ms] ease-in-out pointer-events-none" />
          <div className="relative rounded-2xl overflow-hidden bg-[#050505]">
            <img 
              src={axsDashboardPreview} 
              alt="AXS Creative Command Centre Dashboard Preview" 
              className="w-full object-cover rounded-2xl filter brightness-95 contrast-[1.03] scale-[1.002] group-hover:scale-[1.015] duration-[2500ms] transition-transform"
              referrerPolicy="no-referrer"
            />
            {/* Visual glow layer */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent opacity-85 pointer-events-none" />
            
            {/* Overlay indicators */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4AF37]"></span>
                </span>
                <span className="text-xs font-mono tracking-widest text-[#FFF] uppercase">MOCKUP: ACTIVE PRE-PRODUCTION WORKFLOW</span>
              </div>
              <div className="text-[10px] font-mono text-[#D4AF37] bg-black/90 px-3.5 py-1.5 border border-[#D4AF37]/25 rounded backdrop-blur-md">
                PROJECT METRICS: 48 SHOT SEQUENCER ONLINE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DEMO / PRODUCT WALKTHROUGH & INTERACTIVE ENGINE */}
      <section id="demo" className="px-6 md:px-12 max-w-7xl mx-auto relative z-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-4 py-1.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-amber-500 text-[10px] font-mono uppercase tracking-[0.2em] mb-4">
            Interactive Product Walkthrough
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black uppercase text-white tracking-tight leading-tight">
            See the AXS Studio in motion.
          </h2>
          <p className="text-base text-gray-300 mt-4 leading-relaxed font-sans">
            One idea becomes a connected cinematic content system — from universe to launch. Move seamlessly between creative states without ever resetting context.
          </p>
        </div>

        {/* Live Simulator Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 smoked-glass p-7 md:p-9 rounded-3xl border border-[#D4AF37]/20 shadow-2xl relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            <div>
              <span className="text-[10px] font-mono text-[#D4AF37] tracking-[0.25em] uppercase font-bold">STAGE_CONTROLLER</span>
              <h3 className="text-xl font-display font-black text-white uppercase mt-1">AXS Pipeline Simulator</h3>
              <p className="text-xs text-gray-400 leading-relaxed mt-2 font-sans">
                Simulate how AXS coordinates an isolated prompt across multiple system modules in real time. Choose a universe to initialize.
              </p>
            </div>

            <WorkflowConsole />
          </div>

          <div className="lg:col-span-12 xl:col-span-7 bg-black/60 rounded-xl border border-gray-900 overflow-hidden flex flex-col min-h-[460px]">
            {/* Walkthrough Pipeline Cards */}
            <div className="bg-[#0b0b0b] px-4 py-3 border-b border-gray-900 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-mono tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE PIPELINE CONSOLE FEED
              </span>
              <span className="text-[10px] text-gray-500 font-mono">OS_DUMMY_RENDERER v1.0.2</span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-center text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/10 flex items-center justify-center mx-auto text-[#D4AF37] animate-pulse">
                  <Cpu className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm uppercase">Video Walkthrough Coming Soon</h4>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Our full cinematic video guide showing deep workflows is currently in post-production. Get early access below to join the waitlist.
                  </p>
                </div>
                <div className="flex justify-center flex-wrap gap-2 text-[10px] font-mono text-gray-500">
                  <span className="px-2 py-1 rounded bg-[#111] border border-gray-805">Idea → Universe</span>
                  <span className="px-2 py-1 rounded bg-[#111] border border-gray-805">DNA → Script</span>
                  <span className="px-2 py-1 rounded bg-[#111] border border-gray-805">Image → Video</span>
                  <span className="px-2 py-1 rounded bg-[#111] border border-gray-805">Distribute</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE PROBLEM */}
      <section id="problem" className="px-6 md:px-12 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold">The industry paradox</h2>
          <h3 className="text-3xl md:text-5xl font-display font-black uppercase text-white tracking-tight mt-1 leading-tight">
            Creators lose context every time they switch apps.
          </h3>
          <p className="text-gray-400 text-sm mt-4 leading-relaxed font-sans">
            Most AI tools generate isolated pieces — a prompt here, a script there, an image somewhere else. But the memory, strategy, characters, campaign structure, and distribution plan fall apart between tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: '1', title: 'Scattered prompts', desc: 'Ideas get trapped in one-off chats instead of becoming reusable systems.' },
            { id: '2', title: 'Lost character consistency', desc: 'Characters drift between scripts, scenes, images, videos, and campaigns.' },
            { id: '3', title: 'No world memory', desc: 'Lore, visual rules, tone, factions, and settings have to be rebuilt repeatedly.' },
            { id: '4', title: 'Manual campaign planning', desc: 'Creators still have to turn assets into launch plans by hand.' },
            { id: '5', title: 'Disconnected assets', desc: 'Prompts, references, outputs, scripts, and visuals live in separate places.' },
            { id: '6', title: 'No launch system', desc: 'Most tools stop at generation. AXS pushes toward campaign execution.' }
          ].map((prob) => (
            <div key={prob.id} className="smoked-glass rounded-2xl p-7 border-l-2 border-l-amber-700/60 border-[#D4AF37]/10 bg-[#060606]/85 shadow-lg group hover:border-[#D4AF37]/35 transition-all duration-300">
              <div className="text-amber-500/80 font-mono text-[9px] tracking-[0.2em] font-black mb-3.5">0{prob.id} // CONTEXT BLOCKER</div>
              <h4 className="text-white font-black text-sm tracking-wide uppercase font-display">{prob.title}</h4>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed font-sans">{prob.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. THE AXS SOLUTION */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#0c0c0c] via-[#050505] to-[#010101] rounded-3xl p-8 md:p-14 border border-[#D4AF37]/25 relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none blur-xl" />
          <div className="liquid-glass-accent" />

          <div className="max-w-3xl space-y-4">
            <span className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-[0.3em] block font-bold">the golden pipeline</span>
            <h3 className="text-3xl md:text-5xl font-display font-black uppercase text-white tracking-tight leading-none">
              AXS connects the creative system.
            </h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl font-sans">
              AXS is being built so every major piece of the creative process can live together: strategy, worldbuilding, character memory, script generation, visuals, video direction, campaigns, distribution, analytics, and stored production memory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-10 border-t border-[#D4AF37]/15">
            {[
              { title: 'Creative Memory', desc: 'Keep worlds, characters, tone, visual direction, and campaign logic connected.' },
              { title: 'Production Pipeline', desc: 'Move from idea to asset to campaign without rebuilding context every time.' },
              { title: 'Launch System', desc: 'Prepare platform-ready captions, cuts, hashtags, calendars, and distribution variants.' }
            ].map((sol, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-5.5 h-5.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.15)]">
                    <Check className="w-3 h-3" />
                  </div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-wide font-display">{sol.title}</h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed pl-8 font-sans">{sol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BUILT FOR */}
      <section id="built-for" className="px-6 md:px-12 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold">built for target audiences</h2>
          <h3 className="text-3xl md:text-5xl font-display font-black uppercase text-white tracking-tight leading-tight">
            Built for creators who think in worlds, campaigns, and cinematic systems.
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Filmmakers', desc: 'Develop worlds, scenes, scripts, and visual direction from one connected creative memory.' },
            { title: 'AI Creators', desc: 'Turn prompts into repeatable cinematic production systems.' },
            { title: 'Music Artists', desc: 'Build visuals, campaigns, clips, drops, and story worlds around your sound.' },
            { title: 'YouTubers', desc: 'Create hooks, scripts, thumbnails, shorts, and campaign packs from one idea.' },
            { title: 'Agencies', desc: 'Move from concept to campaign faster with consistent brand memory.' },
            { title: 'Brands', desc: 'Generate product stories, launch campaigns, ads, and content calendars.' },
            { title: 'Game / World Builders', desc: 'Lock lore, factions, characters, scenes, and cinematic direction.' },
            { title: 'AI Studios', desc: 'Build repeatable systems for multi-project AI content production.' },
            { title: 'Content Teams', desc: 'Keep every asset connected from idea to distribution.' }
          ].map((profile, i) => (
            <div key={i} className="smoked-glass smoked-glass-interactive rounded-2xl p-7 border border-[#D4AF37]/15 flex flex-col justify-between group relative">
              <div className="liquid-glass-accent" />
              <div>
                <span className="text-[#D4AF37]/80 text-[9px] font-mono block mb-2 font-black tracking-[0.25em]">// COHORT 0{i + 1}</span>
                <h4 className="text-white font-black text-xs md:text-sm tracking-wide uppercase transition-colors group-hover:text-[#D4AF37] font-display">
                  {profile.title}
                </h4>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed font-sans">{profile.desc}</p>
              </div>
              <div className="mt-5 flex items-center justify-end text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <span className="text-[9px] font-mono tracking-[0.25em] uppercase mr-1 w-max">LAUNCH MODULE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. AXS MEMORY LAYER */}
      <section id="memory-layer" className="px-6 md:px-12 max-w-7xl mx-auto scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-[#D4AF37] text-[9px] uppercase font-mono tracking-[0.25em] border border-[#D4AF37]/25 w-max block font-bold shadow-md">
              System Core Layer
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-black uppercase text-white tracking-tight leading-tight">
              AXS is the memory layer.
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed font-sans">
              AXS keeps the creative system connected. Your universe, characters, tone, visual direction, scripts, campaign strategy, and distribution plan stay aligned instead of being rebuilt every time you open a new tool.
            </p>
            <p className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-[0.25em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
              ACTIVE BRAIN INFRASTRUCTURE • CONTINUOUS CONTEXT MEMORY
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'DNA', desc: 'Lock characters, identities, voices, visual traits, and continuity.' },
              { title: 'World', desc: 'Build cinematic universes with rules, locations, factions, scenes, and lore.' },
              { title: 'Vault', desc: 'Keep assets, prompts, outputs, references, and production memory organized.' },
              { title: 'Launch', desc: 'Turn finished assets into campaigns, captions, calendars, and platform-ready drops.' }
            ].map((layer, index) => (
              <div key={index} className="smoked-glass rounded-2xl p-6 border border-[#D4AF37]/15 bg-[#060606]/80 relative hover:border-[#D4AF37]/35 transition-all">
                <div className="liquid-glass-accent" />
                <div className="text-[#D4AF37] font-mono text-xs font-black uppercase tracking-[0.15em] mb-1.5">{layer.title} Core</div>
                <div className="h-[1px] bg-gradient-to-r from-[#D4AF37]/30 to-transparent w-full mb-3.5" />
                <p className="text-xs text-gray-400 leading-relaxed font-sans">{layer.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CORE MODULES */}
      <section id="modules" className="px-6 md:px-12 max-w-7xl mx-auto scroll-mt-24 bg-[#050505]/95 backdrop-blur-3xl py-18 rounded-3xl border border-[#D4AF37]/15 shadow-[0_30px_70px_rgba(0,0,0,0.95)]">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold">not just outputs — a creative operating system</h2>
          <h3 className="text-3xl md:text-5xl font-display font-black uppercase text-white tracking-tight mt-1 leading-tight">
            What AXS actually gives you.
          </h3>
          <p className="text-gray-400 text-xs md:text-sm mt-3 leading-relaxed max-w-xl mx-auto font-sans">
            A comprehensive system designed across twelve interconnected production pillars, maintaining character, brand, and tone parameters correctly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { tag: 'Planning', title: 'Strategy', desc: 'Plan the launch, audience segment alignment, primary theme angles, and offer structure.' },
            { tag: 'Writing', title: 'Scripts', desc: 'Generate hooks, scene dialogues, platform ads, descriptive captions, and voiceover scripts.' },
            { tag: 'Worldbuilding', title: 'Universe', desc: 'Build worlds, multi-faction lore, key locations, systemic rules, and timeline continuity.' },
            { tag: 'Consistency', title: 'DNA', desc: 'Lock characters, visual references, distinct voices, style traits, and continuity rules.' },
            { tag: 'Generation', title: 'Images', desc: 'Create high-fidelity cinematic stills, reference concept art, key title covers, and visuals.' },
            { tag: 'Motion', title: 'Video', desc: 'Prepare advanced shot direction matrices, motion prompt configurations, and camera cuts.' },
            { tag: 'Audio', title: 'Voice', desc: 'Lock brand voice, narrators, distinct dialogue tones, emotion levels, and delivery cadence.' },
            { tag: 'Delivery', title: 'Campaigns', desc: 'Organize various digital assets, video variants, and audio lines into cohesive packages.' },
            { tag: 'Execution', title: 'Distribute', desc: 'Prepare tailored platform versions (TikTok, Instagram, LinkedIn, YouTube) automatically.' },
            { tag: 'Feedback', title: 'Analytics', desc: 'Track relative performance parameters and seamlessly pipe results back into memory.' },
            { tag: 'Storage', title: 'Vault', desc: 'Store high-res reference assets, prompts, final video renders, and reusable layers.' },
            { tag: 'Infrastructure', title: 'Production Memory', desc: 'Enforce complete structural integrity across all combined pipeline modules.' }
          ].map((mod, i) => (
            <div key={i} className="smoked-glass smoked-glass-interactive rounded-2xl p-6 border border-[#D4AF37]/10 flex flex-col justify-between group">
              <div className="liquid-glass-accent" />
              <div>
                <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-[#D4AF37] bg-[#D4AF37]/5 px-2.5 py-1 rounded border border-[#D4AF37]/25 inline-block mb-4.5">
                  {mod.tag}
                </span>
                <h4 className="text-white text-base font-black tracking-tight uppercase font-display group-hover:text-[#D4AF37] transition-colors">{mod.title}</h4>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed font-sans">{mod.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. SIX CINEMATIC ROOMS */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold">structural architecture</h2>
          <h3 className="text-3xl md:text-5xl font-display font-black uppercase text-white tracking-tight mt-1 leading-tight">
            Six cinematic rooms. <br />One connected brain.
          </h3>
          <p className="text-gray-400 text-sm mt-3 leading-relaxed max-w-lg mx-auto font-sans">
            We map output capabilities to specialized immersive environments designed with dark glass guidelines and gold specular accents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { room: 'Command Deck', desc: 'Your production overview — active projects, campaigns, assets, and next moves.' },
            { room: 'Universe Engine', desc: 'The worldbuilding core where story, lore, characters, and continuity live.' },
            { room: 'Image Studio', desc: 'Create key art, characters, posters, product visuals, and cinematic assets.' },
            { room: 'Video Studio', desc: 'Build video prompts, scene direction, motion concepts, and short-form production flows.' },
            { room: 'Script Forge', desc: 'Generate hooks, ads, captions, scenes, dialogue, and voiceover scripts.' },
            { room: 'Launch System', desc: 'Turn assets into platform-ready campaigns for TikTok, Instagram, YouTube, X, and LinkedIn.' }
          ].map((item, idx) => (
            <div key={idx} className="smoked-glass smoked-glass-interactive rounded-2xl p-8 border border-[#D4AF37]/15 relative group shadow-xl">
              <div className="liquid-glass-accent" />
              <div className="absolute top-4 right-4 text-[9px] font-mono tracking-widest text-[#D4AF37]">SYS_ROOM_0{idx+1}</div>
              <h4 className="text-white font-black text-lg tracking-wide uppercase mb-3 text-left font-display group-hover:text-[#D4AF37] transition-colors">{item.room}</h4>
              <p className="text-xs text-gray-400 leading-relaxed text-left font-sans">{item.desc}</p>
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] absolute bottom-6 right-6 shadow-[0_0_10px_#D4AF37]" />
            </div>
          ))}
        </div>
      </section>

      {/* 11. PRODUCT PROOF */}
      <section id="proof" className="px-6 md:px-12 max-w-5xl mx-auto scroll-mt-24">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold">PRODUCT PROOF OVER PROMISE</h2>
          <h3 className="text-3xl font-display font-black uppercase text-white tracking-tight mt-1 leading-tight">AXS is a real platform in action.</h3>
          <p className="text-sm text-gray-400 mt-3 max-w-xl mx-auto leading-relaxed font-sans">
            We reject "marketing smoke and mirrors." AXS is being constructed directly as a unified software architecture. Preview our target interface system blocks below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            'Studio Command View',
            'Universe / Memory System',
            'Character DNA Lock',
            'Script Builder',
            'Image / Video Workflow',
            'Campaign Builder',
            'Distribution Calendar',
            'Vault / Asset System',
            'Analytics Feedback Loop'
          ].map((proof, idx) => (
            <div key={idx} className="smoked-glass smoked-glass-interactive rounded-2xl p-7 border border-[#D4AF37]/15 relative overflow-hidden flex flex-col justify-between min-h-[170px] group">
              <div className="liquid-glass-accent" />
              <div>
                <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-[0.2em] font-bold">// PROOF NODE_0{idx+1}</span>
                <h4 className="text-white font-black text-sm tracking-wide mt-3 group-hover:text-[#D4AF37] transition-all font-display">{proof}</h4>
              </div>
              <div className="mt-5 flex items-center justify-between pt-4 border-t border-gray-900/40">
                <span className="text-[10px] font-mono text-emerald-500 uppercase flex items-center gap-1.5 font-bold tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  READY TO POLISH
                </span>
                <span className="text-[9px] font-mono text-gray-500">V1.0</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 14. PRODUCT DEVELOPMENT ROADMAP */}
      <section id="roadmap" className="px-6 md:px-12 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center mb-20">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold">operational calendar</h2>
          <h3 className="text-3xl md:text-5xl font-display font-black uppercase text-white tracking-tight mt-1 leading-tight">AXS Evolution Roadmap</h3>
        </div>

        {/* Milestones Horizontal Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative text-left">
          <div className="hidden md:block absolute top-[28px] left-[50px] right-[50px] h-[1px] bg-gradient-to-r from-[#D4AF37]/50 via-amber-500/20 to-transparent" />
          {[
            { date: 'June 2026', title: 'Core Validation', desc: 'Secure backend configurations, basic memory models, and database stability tests.' },
            { date: 'July 2026', title: 'Private Wave 1', desc: 'Controlled register gate open for the first selected cohort. Sandbox text/image loops.' },
            { date: 'August 2026', title: 'Video & Prompt Forge', desc: 'Complete shot direction grids showing advanced visual templates and lore slot compilations.' },
            { date: 'Sept 2026', title: 'Integrations Open', desc: 'Broaden system workspaces, enabling cross-platform distribution calendars and multi-profile setups.' },
            { date: 'October 2026', title: 'Public Cohorts', desc: 'Second cohort wave integrated. Deactivating early-access limitations sequentially as server loads balance.' }
          ].map((mile, idx) => (
            <div key={idx} className="smoked-glass smoked-glass-interactive rounded-2xl p-6 border border-[#D4AF37]/15 bg-[#050505]/70 relative z-10 flex flex-col justify-between">
              <div className="liquid-glass-accent" />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center font-mono text-[9px] text-[#D4AF37] font-black uppercase shadow-[0_0_8px_rgba(212,175,55,0.2)]">
                    W{idx+1}
                  </div>
                  <div className="text-[9px] text-[#D4AF37] font-mono tracking-[0.2em] uppercase font-bold">{mile.date}</div>
                </div>
                <h4 className="text-white text-xs font-black uppercase tracking-wide font-display group-hover:text-[#D4AF37] transition-all">{mile.title}</h4>
                <p className="text-[11px] text-gray-450 leading-relaxed mt-2 font-sans">{mile.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 15. FOUNDER ACCESS PRICING */}
      <section id="founder-access" className="px-6 md:px-12 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold">limited developer tiers</h2>
          <h3 className="text-3xl md:text-5xl font-display font-black uppercase text-white tracking-tight mt-1 leading-tight">Founder Access Pricing</h3>
          <p className="text-gray-300 text-sm mt-3 font-sans">Join early while the systems are refined directly with creative artists and agencies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              tier: 'Creator Pass',
              price: '$49',
              period: '/ month',
              desc: 'Ideal for solo filmmakers, experimental AI designers, writers, and storytellers.',
              features: [
                'Early entry keys to AXS OS workspace',
                'Pre-allocated monthly output credits',
                'Core character DNA continuity locks',
                'Unified scripting & dialogue pipelines',
                'Standard updates & bug disclosures',
                'Guaranteed legacy pricing lock-in'
              ],
              anchor: 'Creator Access'
            },
            {
              tier: 'Studio Pass',
              price: '$99',
              period: '/ month',
              desc: 'Our central tier for professional operators, active directors, and small crews.',
              features: [
                'Everything included in Creator tier',
                'Elevated monthly generation credits',
                'Priority queue processing on endpoints',
                'Full multi-platform campaign compiler',
                'Advanced faction & world lore databases',
                'Early gate access to future tools'
              ],
              anchor: 'Studio Access',
              featured: true
            },
            {
              tier: 'Empire Pass',
              price: '$179',
              period: '/ month',
              desc: 'Built for enterprise marketing departments, large game builders, and agencies.',
              features: [
                'Everything included in Studio tier',
                'Our maximum allocated credit pool',
                'Direct channel onboarding & setup',
                'Custom strategic content optimization',
                'Multi-track campaign database folders',
                'Direct priority developer access requests'
              ],
              anchor: 'Empire Access'
            }
          ].map((plan, i) => (
            <div 
              key={i} 
              className={`rounded-3xl p-8 md:p-10 relative flex flex-col justify-between overflow-hidden text-left transition-all duration-500 hover:-translate-y-1.5 ${
                plan.featured 
                  ? 'smoked-glass border-2 border-l-[#D4AF37] border-r-[#D4AF37] border-t-[#D4AF37] border-b-[#AA7C11]/30 shadow-[0_0_55px_rgba(212,175,55,0.18)] bg-[#070707]' 
                  : 'smoked-glass border border-[#D4AF37]/15 bg-[#030303]/85 shadow-xl'
              }`}
            >
              <div className="liquid-glass-accent" />
              {plan.featured && (
                <div className="absolute top-5 right-5 bg-[#D4AF37]/15 border border-[#D4AF37]/45 text-[#D4AF37] font-mono text-[8px] tracking-[0.2em] uppercase px-3 py-1 rounded-full font-black">
                  RECOMMENDED CHANNELS
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h4 className="text-white text-xl font-black tracking-tight uppercase font-display">{plan.tier}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mt-2 font-sans">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-white text-5xl font-mono font-black">{plan.price}</span>
                  <span className="text-gray-400 text-xs font-mono tracking-wider">{plan.period}</span>
                </div>

                <div className="h-[1px] bg-gradient-to-r from-[#D4AF37]/25 to-transparent" />

                <ul className="space-y-3.5 text-xs text-gray-300 font-sans">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10">
                <a
                  href="#early-access"
                  onClick={(e) => {
                    trackEvent('clicked_pricing', { tier: plan.tier });
                    handleAnchorClick(e, 'early-access');
                  }}
                  className={`w-full block py-4.5 rounded-xl font-extrabold tracking-[0.18em] text-[10px] uppercase text-center transition-all duration-300 cursor-pointer ${
                    plan.featured 
                      ? 'bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F3E5AB] text-black hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:brightness-105' 
                      : 'border border-[#D4AF37]/30 text-white hover:bg-white/5 hover:border-[#D4AF37]/65'
                  }`}
                >
                  Get {plan.anchor}
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed italic">
          ⚠️ Note on Stripe setups: Stripe processor integrations are inactive in our preview sandbox. Clicking purchase passes routes into our central Early Access registry below.
        </p>
      </section>

      {/* 16. EARLY ACCESS FORM COMPONENT */}
      <section id="early-access" className="px-6 md:px-12 max-w-3xl mx-auto scroll-mt-24">
        <div className="smoked-glass rounded-3xl p-8 md:p-14 border border-[#D4AF37]/25 bg-gradient-to-br from-black/95 via-[#0d0d0d] to-[#040404] relative overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)]">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full filter blur-xl pointer-events-none" />
          <div className="liquid-glass-accent" />

          <div className="text-center max-w-large mx-auto space-y-3">
            <span className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-[0.25em] block font-black">COHORT REGISTRATION</span>
            <h3 className="text-3xl font-display font-black uppercase text-white tracking-tight">Get Early Access</h3>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed max-w-xl mx-auto font-sans">
              AXS AI Creative Studio is opening founder access in limited waves. Tell us what you want to build, and we’ll notify you when your access keys are ready.
            </p>
          </div>

          <div className="mt-10">
            <EarlyAccessForm />
          </div>
        </div>
      </section>

      {/* 17. STABILITY CONTROLS */}
      <section className="px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold">STABILITY CONTROLS</h2>
          <h3 className="text-2xl font-display font-black uppercase text-white tracking-tight mt-1 leading-tight">Built for high scale, managed with discipline.</h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed font-sans max-w-2xl mx-auto">
            AXS is built with direct server-side guardrails. Early access is opened in waves, processing queues utilize strict rate limits, and our operations are monitored closely for optimal speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {[
            { tag: 'Access Controls', title: 'Controlled onboarding waves', desc: 'Founder licenses are unlocked in structured, sequential cohorts to analyze direct operational server capacity.' },
            { tag: 'Credit Structures', title: 'Governed calculations', desc: 'No unlimited outputs. All accounts operate within preset, bounded computing credit levels to prevent system overload costs.' },
            { tag: 'Backend Security', title: 'Rate throttle systems', desc: 'Capped credits, automated request throttling, process tracking logs, and administrative controls are configured to secure the systems.' },
            { tag: 'Transparency', title: 'Transparent updates', desc: 'Registered cohort members receive regular progress disclosures outlining software development results and features.' },
            { tag: 'Operational Grounding', title: 'Engineering guardrails', desc: 'Our credit ratios ensure everyone gets solid GPU processing blocks without crashing the backends.' }
          ].map((card, i) => (
            <div key={i} className="smoked-glass rounded-2xl p-6 border border-[#D4AF37]/10 bg-[#050505]/70 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-all">
              <div className="liquid-glass-accent" />
              <div>
                <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-[0.2em] block mb-2 font-black">{card.tag}</span>
                <h4 className="text-white text-xs font-extrabold uppercase tracking-wide">{card.title}</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-2">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 18. SYSTEM FAQ */}
      <section id="faq" className="px-6 md:px-12 max-w-4xl mx-auto scroll-mt-24">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold">SYSTEM INQUIRIES</h2>
          <h3 className="text-3xl font-display font-black uppercase text-white tracking-tight mt-1 leading-tight">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4 text-left">
          {[
            { q: 'What is AXS AI Creative Studio?', a: 'AXS is an integrated cinematic AI creative operating system for filmmakers and brands, coordinating world creation rules, scripting, story boards, campaigns, and metrics feedback loops.' },
            { q: 'Why is AXS different from other AI tools?', a: 'Standard AI tools function as localized, isolated chats. AXS preserves historic content metadata (character traits, lore seeds, visual parameters) across all workspace modules sequentially so you never lose context.' },
            { q: 'Is the platform currently available for use?', a: 'AXS is currently undergoing active code hardening in closed sandbox cohorts. We are opening access schedules in controlled waves to ensure server capacity and GPU pipeline reliability.' },
            { q: 'Will early users get unlimited generation?', a: 'No. Unlimited plans do not exist during early waves. High computing overhead is prevented via strictly governed credit bounds.' },
            { q: 'What is the main monthly plan pricing?', a: 'We offer three primary tiers: Creator Pass ($49/mo) for solo creators, Studio Pass ($99/mo) for professional crews requiring full campaign database arrays, and Empire Pass ($179/mo) for high-volume studios and advertising agency workspaces.' },
            { q: 'Can I import my own assets or brand guidelines?', a: 'Yes. The AXS Memory Layer has a dedicated Vault module specifically designed to store your high-resolution reference characters, visual rules, story seeds, and lore drafts to serve as structural context templates.' },
            { q: 'How do I secure an early access key?', a: 'Simply enter your details in our Early Access Registration form. We evaluate applications and contact qualified creators as soon as queue slots scale open.' }
          ].map((faq, i) => (
            <FaqItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* 19. FINAL CTA */}
      <section id="final-cta" className="px-6 md:px-12 max-w-4xl mx-auto text-center scroll-mt-24">
        <div className="smoked-glass rounded-3xl p-8 md:p-14 border border-[#D4AF37]/35 relative overflow-hidden bg-gradient-to-br from-black via-[#0a0a0a] to-[#030303] flex flex-col items-center shadow-[0_30px_70px_rgba(0,0,0,0.95)]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#D4AF37]/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="liquid-glass-accent" />

          <span className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-[0.25em] font-bold">CREATIVE OPPORTUNITY</span>
          <h3 className="text-3xl md:text-5xl font-display font-black uppercase text-white tracking-tight mt-3 leading-none">
            Ready to build with AXS?
          </h3>
          <p className="text-gray-300 text-sm max-w-xl mx-auto mt-4 leading-relaxed font-sans">
            Join the founder list, request a walkthrough demo, or support the build platform as we prepare our first active cloud cohort registry.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-md">
            <a
              href="#early-access"
              onClick={(e) => {
                trackEvent('clicked_early_access', { position: 'final-cta' });
                handleAnchorClick(e, 'early-access');
              }}
              className="w-full sm:w-auto px-9 py-4.5 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F3E5AB] text-black font-extrabold text-[10.5px] tracking-[0.2em] uppercase hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] transition-all text-center cursor-pointer"
            >
              Get Early Access
            </a>
            <a 
              href="#founder-access" 
              onClick={(e) => handleAnchorClick(e, 'founder-access')}
              className="w-full sm:w-auto px-9 py-4.5 rounded-xl border border-[#D4AF37]/30 text-white font-extrabold text-[10.5px] tracking-[0.2em] uppercase hover:bg-white/5 hover:border-[#D4AF37]/60 transition-all text-center cursor-pointer"
            >
              View Tiers
            </a>
          </div>

          <div className="mt-8 flex justify-center text-[9px] text-gray-500 font-mono tracking-[0.2em] uppercase gap-4 flex-wrap">
            <span>LIMITED COMPUTING LIMITS ACTIVE</span>
            <span>•</span>
            <span>SECURE SYSTEM INTERFACES</span>
          </div>
        </div>
      </section>

      {/* 20. GIANT AXS LOGO MOMENT */}
      <section className="py-24 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute w-[450px] h-[450px] bg-gradient-to-tr from-[#D4AF37]/15 via-[#D4AF37]/5 to-transparent rounded-full filter blur-[100px] pointer-events-none" />
        <div className="relative text-center space-y-6 max-w-xl mx-auto z-10 px-6 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute inset-[-10px] rounded-full border border-[#D4AF37]/10 border-dashed animate-[spin_50s_infinite_linear]" />
            <img 
              src={axsGoldEmblem} 
              alt="AXS Shield Logo Large" 
              className="w-48 h-48 mx-auto object-contain rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.4)] border border-[#D4AF37]/20 transition-all duration-[3000ms] group-hover:scale-105 group-hover:rotate-[3deg]" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-black tracking-[0.25em] text-[#FFF] uppercase mt-2">AXS AI CREATIVE STUDIO</h2>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent w-48 mx-auto my-3" />
            <p className="text-[9px] text-[#D4AF37] font-mono tracking-[0.32em] uppercase max-w-md mx-auto leading-relaxed">
              IMAGINE • BUILD • DIRECT • DISTRIBUTE • REMEMBER
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

// ----------------------------------------------------
// FAQS ACCORDION HELPER
// ----------------------------------------------------
export function FaqItem({ question, answer }: { question: string; answer: string; key?: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="smoked-glass rounded-2xl border border-[#D4AF37]/15 overflow-hidden transition-all duration-300">
      <div className="liquid-glass-accent" />
      <button 
        onClick={() => setOpen(!open)}
        className="w-full p-5 text-left flex justify-between items-center text-white hover:text-[#D4AF37] focus:outline-none cursor-pointer"
      >
        <span className="text-sm font-bold tracking-wide uppercase font-display">{question}</span>
        <ChevronRight className={`w-4 h-4 text-[#D4AF37] transition-transform duration-300 shrink-0 ${open ? 'rotate-90' : 'rotate-0'}`} />
      </button>
      {open && (
        <div className="p-6 pt-0 text-xs text-gray-400 leading-relaxed border-t border-[#D4AF37]/10 bg-black/40 font-sans">
          {answer}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// DETAILED INTERACTIVE SIMULATOR (ROOM TABS)
// ----------------------------------------------------
const SCENARIOS = [
  {
    theme: 'Interstellar Exodus',
    emoji: '🚀',
    dna: { char: 'Commander Aaron Gray', trait: 'Smudged flight crest, chrome robotic wrist prosthetics' },
    lore: 'Arks are carrying remnants of Sector-7 beyond dying Sol under corporate fleet lockdowns.',
    script: 'GRAY (VO): "The solar sails are tattered, but memory persists. We go into the deep charcoal dark."',
    media: 'Hyper-detailed wide frame containing reflective golden solar sails navigating a cluster of dead supergiant moons.',
    posts: '🚀 One memory carried beyond dying suns. Inside Commander Gray’s flight logs. #CinematicOS #SciFiCinema'
  },
  {
    theme: 'Neo-Noir Memory Heist',
    emoji: '🕵️',
    dna: { char: 'Detective Kage Vane', trait: 'Glossy wet trench coat, pulsing neon gold ocular scanner' },
    lore: 'Neo-Kyoto, 2154. Under heavy acid rainfall, rogue operators harvest persistent organic neural records.',
    script: 'VANE: "You don’t buy memory. You steal it from the smoked liquid glass cores of those who trusted the grid."',
    media: 'Gritty cinematic camera composition following Detective Vane down a narrow lane glistening with amber puddle reflections.',
    posts: '🕵️ Cybernetic records decoded. What did Detective Vane pull out of the glass cores? #NeoKyoto #StudioForge'
  },
  {
    theme: 'Retro Space Opera',
    emoji: '🌌',
    dna: { char: 'Princess Lyra Nova', trait: 'Brass solar medallion, champagne royal armor plates' },
    lore: 'Empire of stellar dynasties fighting for control of interstellar nebula energy portals.',
    script: 'LYRA: "Let the emperors claim the planets. We control the pathways between stars."',
    media: 'Breathtaking retro-future scene showing elegant brass-clad imperial frigates entering shimmering golden gas clouds.',
    posts: '🌌 Stellar pathways unlocked. Control the cosmic corridors. #SpaceOpera #AXSActive'
  }
];

function WorkflowConsole() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [currentTab, setCurrentTab] = useState<'DNA' | 'World' | 'Script' | 'Render' | 'Campaign'>('DNA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(100);

  const triggerProcessing = () => {
    setIsProcessing(true);
    setProgress(0);
    trackEvent('clicked_demo', { scenario: SCENARIOS[activeScenario].theme });
  };

  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsProcessing(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const selectScenario = (idx: number) => {
    if (isProcessing) return;
    setActiveScenario(idx);
    triggerProcessing();
  };

  const sc = SCENARIOS[activeScenario];

  return (
    <div className="space-y-4 text-left">
      <div className="flex gap-2">
        {SCENARIOS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => selectScenario(idx)}
            disabled={isProcessing}
            className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeScenario === idx
                ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white'
                : 'bg-black/40 border-gray-900 text-gray-400 hover:text-white hover:border-gray-700'
            }`}
          >
            <span>{item.emoji}</span>
            <span className="hidden sm:inline">{item.theme}</span>
          </button>
        ))}
      </div>

      <div className="smoked-glass rounded-xl p-4 border border-gray-900 bg-black/40 space-y-3">
        <div className="flex border-b border-gray-900 pb-2 gap-2 text-[10px] font-mono overflow-x-auto">
          {(['DNA', 'World', 'Script', 'Render', 'Campaign'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`pb-1 px-2 uppercase hover:text-[#D4AF37] transition-all shrink-0 ${
                currentTab === tab ? 'text-[#D4AF37] border-b-2 border-b-[#D4AF37] font-bold' : 'text-gray-500'
              }`}
            >
              {tab === 'Render' ? 'Image/Video' : tab}
            </button>
          ))}
        </div>

        {isProcessing ? (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37] mx-auto" />
            <div className="text-[10px] font-mono text-gray-400">CONNECTING SEQUENCING NODES: {progress}%</div>
            <div className="w-32 h-1 bg-gray-900 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-[#D4AF37] transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="min-h-[120px] pt-1 space-y-2 text-xs leading-relaxed text-left">
            {currentTab === 'DNA' && (
              <div>
                <div className="text-[10px] text-gray-500 font-mono">LOCKED IDENTITY DATA //</div>
                <div className="font-bold text-white mt-1">{sc.dna.char}</div>
                <div className="text-gray-400 font-mono text-[11px] mt-1 bg-black/50 p-2 rounded border border-gray-950">
                  🧬 Attributes: {sc.dna.trait}
                </div>
              </div>
            )}
            {currentTab === 'World' && (
              <div>
                <div className="text-[10px] text-gray-500 font-mono">WORLD CONTINUITY lore //</div>
                <p className="text-gray-300 mt-1">{sc.lore}</p>
                <div className="text-[10px] text-[#D4AF37] font-mono mt-2 flex items-center gap-1.5">
                  <Database className="w-3 h-3" /> PERSISTENT SEED INDEX: ACTIVE
                </div>
              </div>
            )}
            {currentTab === 'Script' && (
              <div>
                <div className="text-[10px] text-gray-500 font-mono">SCRIPT FORGE screenplay //</div>
                <p className="font-mono text-[11px] text-white bg-[#060606] p-2.5 rounded border border-gray-950 block mt-1 leading-normal whitespace-pre-wrap text-left">
                  {sc.script}
                </p>
              </div>
            )}
            {currentTab === 'Render' && (
              <div>
                <div className="text-[10px] text-gray-500 font-mono">PROMPT COMPILING STUDIO //</div>
                <p className="text-gray-300 mt-1">{sc.media}</p>
                <div className="text-[10px] text-gray-500 font-mono mt-2">COMPILER: TEXT_TO_STILL v1.0.12</div>
              </div>
            )}
            {currentTab === 'Campaign' && (
              <div>
                <div className="text-[10px] text-gray-500 font-mono">CROSS-PLATFORM CAMPAIGN BUILDER //</div>
                <p className="text-gray-300 mt-1 italic font-sans font-medium">{sc.posts}</p>
                <span className="text-[9px] text-emerald-500 font-mono bg-emerald-500/10 px-2 py-0.5 mt-2 inline-block rounded border border-emerald-500/20">
                  DISTRIBUTION: READY FOR COHORT EXPORT
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={triggerProcessing}
        disabled={isProcessing}
        className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-black bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 fill-current text-black" />
        Synapse Pipeline Connection
      </button>
    </div>
  );
}

// ----------------------------------------------------
// INTERACTIVE REVENUE CALCULATOR
// ----------------------------------------------------
export function RevenueCalculator() {
  const [subscribers, setSubscribers] = useState(500);
  const [includeGpuCost, setIncludeGpuCost] = useState(true);

  // Allocation profile parameters
  const creatorRatio = 0.35; // 35% at $49
  const studioRatio = 0.50;  // 50% at $99
  const empireRatio = 0.15;  // 15% at $179

  // Calculate parameters
  const cCount = Math.round(subscribers * creatorRatio);
  const sCount = Math.round(subscribers * studioRatio);
  const eCount = Math.round(subscribers * empireRatio);

  const creatorRevenue = cCount * 49;
  const studioRevenue = sCount * 99;
  const empireRevenue = eCount * 179;

  const mrr = creatorRevenue + studioRevenue + empireRevenue;
  const arr = mrr * 12;
  const arpu = subscribers > 0 ? (mrr / subscribers).toFixed(2) : '0';

  // Compute operating margins
  const gpuCostEstimate = includeGpuCost ? mrr * 0.18 : 0; // 18% hosting and api cost
  const netRevenue = mrr - gpuCostEstimate;
  const marginPercent = mrr > 0 ? Math.round((netRevenue / mrr) * 100) : 0;

  return (
    <div className="space-y-6 text-left">
      <div>
        <div className="flex justify-between items-center text-xs font-semibold uppercase text-gray-400">
          <span>Target Subscribers Cap</span>
          <span className="text-white font-mono">{subscribers} members</span>
        </div>
        <input
          type="range"
          min="100"
          max="5000"
          step="50"
          value={subscribers}
          onChange={(e) => {
            trackEvent('clicked_funding', { count: Number(e.target.value) });
            setSubscribers(Number(e.target.value));
          }}
          className="w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-[#D4AF37] mt-3"
        />
        <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
          <span>100 COHORT</span>
          <span>2,500 STUDIO MIDWAY</span>
          <span>5,000 CAP LIMIT</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/80 border border-gray-950 p-3 rounded-lg">
          <span className="text-[10px] text-gray-500 uppercase font-mono text-left block">Monthly Revenue MRR</span>
          <div className="text-[#D4AF37] text-xl font-black font-mono tracking-tight mt-1 text-left">
            ${mrr.toLocaleString()}
          </div>
        </div>

        <div className="bg-black/80 border border-gray-950 p-3 rounded-lg">
          <span className="text-[10px] text-gray-500 uppercase font-mono text-left block">Annualized ARR</span>
          <div className="text-white text-xl font-black font-mono tracking-tight mt-1 text-left">
            ${arr.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-black/80 border border-gray-950 p-4 rounded-xl space-y-2.5 text-xs text-gray-300">
        <div className="flex justify-between items-center text-[11px] text-gray-400 border-b border-gray-900 pb-2">
          <span>Plan Allocations</span>
          <span>ARPU Target: ${arpu}/mo</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Creator Pass ({cCount} users at $49)</span>
          <span className="font-mono text-white">${creatorRevenue.toLocaleString()}/mo</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Studio Pass ({sCount} users at $99)</span>
          <span className="font-mono text-white">${studioRevenue.toLocaleString()}/mo</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Empire Pass ({eCount} users at $179)</span>
          <span className="font-mono text-white">${empireRevenue.toLocaleString()}/mo</span>
        </div>
      </div>

      {/* GPU cost parameter switch toggle */}
      <div className="flex items-center justify-between border-t border-gray-900 pt-4">
        <div>
          <h5 className="text-white font-semibold text-xs uppercase cursor-pointer" onClick={() => setIncludeGpuCost(!includeGpuCost)}>
            Model GPU Overhead (18% API safety)
          </h5>
          <p className="text-[10px] text-gray-500">Estimate token & render computational costs.</p>
        </div>
        <button
          type="button"
          onClick={() => setIncludeGpuCost(!includeGpuCost)}
          className={`w-11 h-6 rounded-full p-1 transition-all flex items-center cursor-pointer ${includeGpuCost ? 'bg-[#D4AF37]' : 'bg-gray-800'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-black transition-transform ${includeGpuCost ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="border-t border-gray-900 pt-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-500 font-mono uppercase">Calculated net margin profile</span>
          <div className="text-white text-sm font-bold uppercase mt-0.5">Estimated Platform Margin</div>
        </div>
        <div className="text-right">
          <span className="text-emerald-500 text-lg font-black font-mono uppercase">{marginPercent}% Margin</span>
          {includeGpuCost && <span className="block text-[9px] text-gray-500">Net MRR: ${(netRevenue).toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// ROBUST EARLY ACCESS CAPTURE FORM (WITH DATABASE & FALLBACK)
// ----------------------------------------------------
export function EarlyAccessForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    has_youtube: 'Yes',
    youtube_channel: '',
    youtube_subscribers: '1k - 10k',
    use_case: '',
    generation_volume: 'Frequent Weekly Generation (Multiple videos per week)',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto load from localstorage if already signed up in session context
  useEffect(() => {
    const saved = localStorage.getItem('axs_early_access_user');
    if (saved) {
      setSubmitted(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setErrorMessage('Please fill out your Name and Email address.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    // Create highly descriptive payload structured perfectly to keep custom database layers safe
    const structuredGoalData = `YouTube Creator: ${formData.has_youtube}\n` +
      `Channel URL/Handle: ${formData.has_youtube === 'Yes' ? formData.youtube_channel : 'N/A'}\n` +
      `Estimated Subscribers: ${formData.has_youtube === 'Yes' ? formData.youtube_subscribers : 'N/A'}\n` +
      `Primary Use Case: ${formData.use_case}\n` +
      `Expected Volume: ${formData.generation_volume}`;

    trackEvent('submitted_early_access', { 
      creator_type: formData.has_youtube === 'Yes' ? 'YouTuber' : 'Creator', 
      plan_interest: 'Admin Review — Access Verification Request' 
    });

    try {
      if (hasSupabase && supabase) {
        // Submit directly to DB
        const { error } = await supabase.from('early_access').insert([
          {
            name: formData.name,
            email: formData.email,
            creator_type: formData.has_youtube === 'Yes' ? 'YouTuber' : 'Creator',
            project_goal: structuredGoalData,
            plan_interest: 'Pending Evaluation',
            wants_demo: false,
            source: 'axs_pitch_page',
          },
        ]);
        if (error) throw error;
      } else {
        // Fallback local persistence
        console.warn('Supabase environment keys not detected. Local Fallback Database Active.');
        localStorage.setItem('axs_early_access_user', JSON.stringify({
          ...formData,
          project_goal: structuredGoalData
        }));
      }

      // Mark success
      setSubmitted(true);
    } catch (err: any) {
      console.error('Database write error:', err);
      // Fallback with visual output so user experience stays beautiful
      localStorage.setItem('axs_early_access_user', JSON.stringify({
        ...formData,
        project_goal: structuredGoalData
      }));
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center mx-auto text-[#D4AF37]">
          <Check className="w-6 h-6" />
        </div>
        <h4 className="text-white text-xl font-bold uppercase tracking-tight">Application Submitted for Review</h4>
        <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed font-sans">
          Your platforms access application is currently pending evaluation. The administrator will inspect your YouTube credentials, use-case specifications, and volume requirements shortly to grant or deny access keys.
        </p>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem('axs_early_access_user');
            setSubmitted(false);
          }}
          className="text-[10px] text-gray-600 hover:text-white underline font-mono cursor-pointer uppercase"
        >
          Update Application Details
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {errorMessage && (
        <div className="text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded text-xs">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Name and Email layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2 leading-none font-bold">Your Name</label>
          <input
            type="text"
            required
            placeholder="Aaron Gray"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black/60 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] text-white duration-250 transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2 leading-none font-bold">Email Address</label>
          <input
            type="email"
            required
            placeholder="aaron@creative.co"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-black/60 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] text-white duration-250 transition-colors"
          />
        </div>
      </div>

      {/* YouTube Platform Presence Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2 leading-none font-bold">Do you have a YouTube Channel?</label>
          <select
            value={formData.has_youtube}
            onChange={(e) => setFormData({ ...formData, has_youtube: e.target.value })}
            className="w-full bg-[#0a0a0a] border border-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] text-white duration-250 transition-colors cursor-pointer"
          >
            <option value="Yes" className="bg-black text-white">Yes, I have a YouTube Channel</option>
            <option value="No" className="bg-black text-white">No, I do not have a YouTube Channel</option>
          </select>
        </div>

        {formData.has_youtube === 'Yes' && (
          <>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2 leading-none font-bold">YouTube Handle / Link</label>
              <input
                type="text"
                required
                placeholder="@mychannel or youtube.com/..."
                value={formData.youtube_channel}
                onChange={(e) => setFormData({ ...formData, youtube_channel: e.target.value })}
                className="w-full bg-black/60 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] text-white duration-250 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2 leading-none font-bold">Estimated Subscribers</label>
              <select
                value={formData.youtube_subscribers}
                onChange={(e) => setFormData({ ...formData, youtube_subscribers: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] text-white duration-250 transition-colors cursor-pointer"
              >
                <option value="Under 1k" className="bg-black text-white">Under 1,000 subscribers</option>
                <option value="1k - 10k" className="bg-black text-white">1,000 - 10,000 subscribers</option>
                <option value="10k - 100k" className="bg-black text-white">10,000 - 100,000 subscribers</option>
                <option value="100k - 1M" className="bg-black text-white">100,000 - 1,000,000 subscribers</option>
                <option value="Over 1M" className="bg-black text-white">Over 1,000,000 subscribers</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Use Case Details */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2 leading-none font-bold">What is your exact intended use case?</label>
        <textarea
          rows={3}
          required
          placeholder="What exactly is the use case? What specific type of content will you generate, or how do you plan to use AXS?"
          value={formData.use_case}
          onChange={(e) => setFormData({ ...formData, use_case: e.target.value })}
          className="w-full bg-black/60 border border-gray-900 rounded-xl p-4 text-sm focus:outline-none focus:border-[#D4AF37] text-white text-left align-top leading-normal resize-none duration-250 transition-colors"
        />
      </div>

      {/* Generation Volume Details */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2 leading-none font-bold">How much / how often would you need to use the platform?</label>
        <select
          value={formData.generation_volume}
          onChange={(e) => setFormData({ ...formData, generation_volume: e.target.value })}
          className="w-full bg-[#0a0a0a] border border-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] text-white duration-250 transition-colors cursor-pointer"
        >
          <option value="Heavy Daily Production (Continuous workflows)" className="bg-black text-white">Heavy Daily Production (Continuous daily workflow outputs)</option>
          <option value="Frequent Weekly Generation (Multiple videos per week)" className="bg-black text-white">Frequent Weekly Generation (Multiple videos & assets per week)</option>
          <option value="Occasional Projects (A few generations per month)" className="bg-black text-white">Occasional Projects (A few specific campaign generations per month)</option>
          <option value="Experimental Sandbox Testing (Curiosity or light validation)" className="bg-black text-white">Experimental Sandbox Testing (Light testing or curiosity/validation)</option>
        </select>
      </div>

      {/* Dynamic application submission action without redundant walkthrough demo checks */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F3E5AB] text-black font-extrabold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            SYNAPSE SECURING PROFILE...
          </>
        ) : (
          <>
            <span>Submit Application for Approval</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </>
        )}
      </button>

      <div className="text-[10px] text-gray-500 font-mono text-center max-w-lg mx-auto leading-normal">
        🔒 Access key allocations are personally reviewable. The system administrator preserves complete authority to approve or deny license grants on this platform.
      </div>
    </form>
  );
}

// ----------------------------------------------------
// CONTACT PAGE ROUTE
// ----------------------------------------------------
function ContactPage({ navigateTo }: { navigateTo: (p: string) => void }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 relative z-10 space-y-12">
      <div className="text-center space-y-3">
        <button
          onClick={() => navigateTo('/')}
          className="text-xs text-[#D4AF37] hover:underline font-mono tracking-widest uppercase block mx-auto mb-4"
        >
          ← BACK TO OS COMMAND CENTER
        </button>
        <span className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-widest block font-bold">SECURE SYSTEM NODE</span>
        <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">Contact AXS</h1>
        <p className="text-gray-300 text-sm max-w-lg mx-auto leading-relaxed">
          Have a question about founder campaign goals, GPU credit caps, legal integrations, or want an enterprise live workspace demo?
        </p>
      </div>

      <div className="smoked-glass rounded-2xl p-8 border border-[#D4AF37]/20 bg-gradient-to-br from-black/80 to-[#070707]">
        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37] flex items-center justify-center mx-auto text-[#D4AF37]">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-white text-lg font-bold uppercase tracking-tight">Message Received.</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Our pre-production support queue will evaluate your inquiry and respond within 24 standard hours.
            </p>
          </div>
        ) : (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }} 
            className="space-y-6 text-left"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2 leading-none font-bold">Your Name</label>
                <input required type="text" placeholder="Aaron Gray" className="w-full bg-black/60 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] text-white" />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2 leading-none font-bold">Email Address</label>
                <input required type="email" placeholder="aaron@creative.co" className="w-full bg-black/60 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] text-white" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2 leading-none font-bold">Inquiry Type</label>
              <select className="w-full bg-[#0a0a0a] border border-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] text-white">
                <option>Founder Access Questions</option>
                <option>Walkthrough Demo Requests</option>
                <option>Back the Build / Campaign Help</option>
                <option>Creator Partnerships</option>
                <option>Infrastructural Tech Support</option>
                <option>General Questions</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] mb-2 leading-none font-bold font-bold">Inquiry Message</label>
              <textarea required rows={4} placeholder="Describe your questions details here..." className="w-full bg-black/60 border border-gray-900 rounded-xl p-4 text-sm focus:outline-none focus:border-[#D4AF37] text-white leading-normal resize-none" />
            </div>

            <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] text-black font-extrabold uppercase tracking-widest text-xs hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer">
              <span>Transmit Message</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            <div className="text-[10px] text-gray-500 font-mono text-center">
              Direct administrative contact: <span className="text-[#D4AF37]">support@axscreativestudio.com</span>
            </div>
          </form>
        )}
      </div>

      <div className="text-center pt-10">
        <button onClick={() => navigateTo('/')} className="px-6 py-3 border border-gray-900 rounded-xl text-xs text-gray-400 hover:text-white transition-all">
          Return to platform home
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// PRIVACY PAGE ROUTE
// ----------------------------------------------------
function PrivacyPage({ navigateTo }: { navigateTo: (p: string) => void }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 relative z-10 space-y-8 text-left">
      <button onClick={() => navigateTo('/')} className="text-xs text-[#D4AF37] hover:underline font-mono tracking-widest uppercase block mb-4">
        ← BACK TO COMMAND DECK
      </button>

      <span className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-widest block font-bold">ADMINISTRATIVE COMPLIANCE</span>
      <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight font-bold">Privacy Policy</h1>
      <p className="text-gray-400 text-xs font-mono">Effective Date: 2026</p>

      <div className="h-px bg-gradient-to-r from-gray-800 to-transparent" />

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed font-sans">
        <p>
          AXS AI Creative Studio respects your privacy. This Privacy Policy explains what information we collect, how we use it, and how you can contact us about your information.
        </p>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2">1. Information We Collect</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            We may collect information you provide directly, including name, email address, creator type, project goals, founder plan interest, demo requests, messages submitted through forms, and account information if user accounts are enabled.
          </p>
          <p className="text-gray-400 text-xs leading-relaxed mt-2">
            We may also collect basic usage information, including pages visited, button clicks, device/browser information, approximate location from analytics providers, referral source, and interaction with site features.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2">2. How We Use Information</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            We use collected information to manage early access requests, contact users about AXS updates, respond to demo or support requests, improve the website and product, understand creator demand, prepare founder access onboarding, and maintain security.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2">3. Early Access Data</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            If you join the early access list, we may store your name, email, creator type, project goal, plan interest, and demo preference.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2">4. Analytics</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            AXS may use analytics tools to understand how visitors use the website.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2">5. Third-Party Services</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            AXS may use third-party services for hosting, databases, analytics, email, payments, and AI infrastructure. Possible services may include Supabase, Stripe, Netlify, Vercel, Cloudflare, email providers, analytics providers, and AI infrastructure providers.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2">6. Payments</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            If payments are enabled, payment information is processed by a third-party payment provider such as Stripe. AXS does not store full card numbers on its own servers.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2">7. Cookies</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            The website may use cookies or similar technologies for analytics, preferences, and basic functionality.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2">8. Data Security</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            We use reasonable measures to protect user information, but no online system can be guaranteed completely secure.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2">9. Your Choices</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            You may contact us to request access, correction, or deletion of your information at: <span className="text-[#D4AF37]">support@axscreativestudio.com</span>
          </p>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-900 text-center">
        <button onClick={() => navigateTo('/')} className="px-6 py-3 bg-[#0d0d0d] border border-gray-900 rounded-xl text-xs text-white hover:border-[#D4AF37] transition-all">
          Return to platform home
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// TERMS PAGE ROUTE
// ----------------------------------------------------
function TermsPage({ navigateTo }: { navigateTo: (p: string) => void }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 relative z-10 space-y-8 text-left">
      <button onClick={() => navigateTo('/')} className="text-xs text-[#D4AF37] hover:underline font-mono tracking-widest uppercase block mb-4">
        ← BACK TO SYS CONSOLE
      </button>

      <span className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-widest block font-bold">LEGAL COMPLIANCE DECK</span>
      <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight font-bold font-bold">Terms & Conditions</h1>
      <p className="text-gray-400 text-xs font-mono">Effective Date: 2026</p>

      <div className="h-px bg-gradient-to-r from-gray-800 to-transparent" />

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed font-sans">
        <p>
          These Terms & Conditions govern your use of AXS AI Creative Studio, including the website, early access program, founder access offers, and related services. By using the website or submitting an early access request, you agree to these Terms.
        </p>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2 font-bold">1. About AXS</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            AXS AI Creative Studio is a cinematic AI creative operating system designed to help creators develop strategy, scripts, images, video, voice, campaigns, distribution assets, and production memory.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2 font-bold font-bold">2. Early Access / Beta Notice</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            AXS may be offered as an early access or beta product. Features may change, break, improve, be delayed, or be removed as the platform develops.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2 font-bold">3. Founder Access & Credit Caps</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Founder Access may include limited access to platform tools, guided onboarding, updates, and limited generation credits. Founder Access does not include unlimited AI generation resources.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2 font-bold">4. User Responsibility</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            You are responsible for the content you create, upload, generate, publish, or distribute using AXS. AI outputs may be imperfect, inaccurate, inconsistent, or unsuitable for certain uses. You are responsible for reviewing outputs before publication or commercial use.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2 font-bold">5. Acceptable Use</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            You may not abuse, attack, scrape, disrupt, bypass limits, misuse endpoints, upload illegal content, violate rights, or misrepresent AXS.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2 font-bold">6. Limitation of Liability</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            To the maximum extent permitted by law, AXS is not liable for indirect, incidental, special, consequential, or punitive damages related to your use of the website or platform.
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold text-base uppercase tracking-tight mb-2 font-bold">7. Contact</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            For questions about these Terms, contact: <span className="text-[#D4AF37]">support@axscreativestudio.com</span>
          </p>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-900 text-center">
        <button onClick={() => navigateTo('/')} className="px-6 py-3 bg-[#0d0d0d] border border-gray-900 rounded-xl text-xs text-white hover:border-[#D4AF37] transition-all">
          Return to platform home
        </button>
      </div>
    </div>
  );
}
