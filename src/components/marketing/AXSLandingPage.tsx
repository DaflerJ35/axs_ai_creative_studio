import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clapperboard,
  Dna,
  Film,
  Fingerprint,
  Globe2,
  Image,
  Layers3,
  Lock,
  Megaphone,
  Network,
  PenLine,
  Play,
  RadioTower,
  Rocket,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAxsStore } from "../../store/useAxsStore";
import { NullRealityBackground } from "./NullRealityBackground";
import type { ForgeTab } from "../../lib/types";

const platforms = ["TikTok", "YouTube", "Instagram", "Shorts", "X", "OnlyFans", "Fanvue", "Fansly", "Newsletter", "Discord"];

const outcomes = [
  "Persistent Character DNA",
  "Universe continuity memory",
  "Cinematic image + video pipelines",
  "Scripts, hooks, captions, campaigns",
  "Production Vault that compounds",
];

const modules: Array<{ title: string; copy: string; icon: typeof Sparkles; tab: ForgeTab; tone: string; metric: string }> = [
  { title: "Character DNA", copy: "Reusable digital actors with face, body, voice, styling, references, and identity memory.", icon: Dna, tab: "dna", tone: "violet", metric: "Identity Lock" },
  { title: "Universe Engine", copy: "Living world bibles: factions, locations, relationships, timelines, episodes, and lore rules.", icon: Globe2, tab: "universe", tone: "cyan", metric: "Continuity Core" },
  { title: "Image Studio", copy: "Production stills, thumbnails, posters, ad creatives, portraits, and cinematic concept frames.", icon: Image, tab: "images", tone: "blue", metric: "Visual Surface" },
  { title: "Video Studio", copy: "Shot direction, camera logic, trailers, reels, motion prompts, and AI filmmaking workflows.", icon: Film, tab: "videos", tone: "rose", metric: "Motion Bay" },
  { title: "Script Forge", copy: "Hooks, voiceovers, ads, scenes, captions, story beats, creator copy, and brand voice writing.", icon: PenLine, tab: "scripts", tone: "pink", metric: "Writer's Room" },
  { title: "Campaign Builder", copy: "Turn every asset into launch systems, calendars, offers, platform variants, and distribution plans.", icon: Megaphone, tab: "campaign", tone: "gold", metric: "Launch System" },
];

const productionStack = [
  { label: "DNA", value: "Character identity, references, seed logic, visual continuity", icon: Fingerprint },
  { label: "WORLD", value: "Lore, relationships, locations, timeline, emotional state", icon: Network },
  { label: "CREATE", value: "Images, motion, scripts, captions, ad angles, voice", icon: WandSparkles },
  { label: "LAUNCH", value: "Campaigns, publishing systems, platform variants, vault", icon: RadioTower },
];

function toneClasses(tone: string) {
  switch (tone) {
    case "violet": return "border-violet-300/25 bg-violet-500/[0.08] text-violet-200 shadow-[0_0_60px_rgba(139,92,246,.08)]";
    case "blue": return "border-blue-300/25 bg-blue-500/[0.08] text-blue-200 shadow-[0_0_60px_rgba(96,165,250,.08)]";
    case "rose": return "border-rose-300/25 bg-rose-500/[0.08] text-rose-200 shadow-[0_0_60px_rgba(251,113,133,.08)]";
    case "pink": return "border-pink-300/25 bg-pink-500/[0.08] text-pink-200 shadow-[0_0_60px_rgba(244,114,182,.08)]";
    case "gold": return "border-amber-300/25 bg-amber-500/[0.08] text-amber-200 shadow-[0_0_60px_rgba(245,158,11,.08)]";
    default: return "border-cyan-300/25 bg-cyan-500/[0.08] text-cyan-200 shadow-[0_0_60px_rgba(34,211,238,.08)]";
  }
}

function StudioLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/assets/axs-logo.png"
        alt="AXS AI Creative Studios logo"
        className={`${compact ? "size-10 rounded-xl" : "size-16 rounded-2xl md:size-20"} object-cover shadow-[0_0_42px_rgba(34,211,238,0.24)] ring-1 ring-cyan-100/20`}
      />
      <div>
        <div className={`${compact ? "text-xs" : "text-sm"} font-black uppercase tracking-[0.28em] text-white`}>AXS</div>
        <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/52">AI Creative Studios</div>
      </div>
    </div>
  );
}

function FloatingGate({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="fixed left-1/2 top-5 z-50 hidden w-[min(1120px,calc(100vw-2rem))] -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-black/42 px-4 py-3 shadow-[0_24px_90px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-3xl lg:flex">
      <StudioLogo compact />
      <div className="flex items-center gap-1">
        <a href="#platform" className="rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/48 hover:text-cyan-100">Platform</a>
        <a href="#modules" className="rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/48 hover:text-cyan-100">Studios</a>
        <a href="#workflow" className="rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/48 hover:text-cyan-100">Workflow</a>
        <a href="#founders" className="rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/48 hover:text-cyan-100">Founders</a>
        <button onClick={onEnter} className="ml-2 rounded-full bg-cyan-100 px-5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-black shadow-[0_0_28px_rgba(34,211,238,.3)] hover:bg-white">Enter Studio</button>
      </div>
    </div>
  );
}

function ProductTheater() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="absolute -inset-10 rounded-[3.5rem] bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.22),transparent_44%),radial-gradient(circle_at_92%_28%,rgba(168,85,247,.22),transparent_34%),radial-gradient(circle_at_10%_88%,rgba(245,158,11,.12),transparent_30%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[#050914]/88 p-3 shadow-[0_55px_210px_rgba(0,0,0,.78),inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur-3xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-rose-400/80" />
            <span className="size-2.5 rounded-full bg-amber-300/80" />
            <span className="size-2.5 rounded-full bg-emerald-300/80" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100/48">
            <img src="/assets/axs-logo.png" alt="AXS" className="size-6 rounded-md object-cover ring-1 ring-cyan-100/15" />
            Production Memory OS
          </div>
          <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black text-emerald-200">LIVE</div>
        </div>

        <div className="grid gap-3 p-3 xl:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-2xl border border-cyan-300/16 bg-black/38 p-5">
            <div className="mb-5 flex items-start justify-between gap-5">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200/52">Current production</div>
                <h3 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">Neon Myth Universe</h3>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/48">Characters, world bible, episode arc, image set, launch scripts, and distribution plan are all connected.</p>
              </div>
              <Sparkles className="size-8 text-cyan-200" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Mara DNA", "Episode 04", "Launch Set"].map((item, i) => (
                <div key={item} className="group rounded-xl border border-white/10 bg-white/[.035] p-3 transition hover:border-cyan-200/30 hover:bg-white/[.055]">
                  <div className="relative h-24 overflow-hidden rounded-lg bg-[linear-gradient(135deg,rgba(34,211,238,.25),rgba(168,85,247,.18)),radial-gradient(circle_at_70%_25%,rgba(255,255,255,.32),transparent_18%)]">
                    <div className="absolute inset-x-3 bottom-3 h-2 rounded-full bg-black/35"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-300" style={{ width: `${92 - i * 7}%` }} /></div>
                  </div>
                  <div className="mt-3 text-xs font-black text-white">{item}</div>
                  <div className="mt-1 text-[10px] text-white/38">{92 - i * 7}% continuity</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[.025] p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/50"><span>Production memory</span><span className="text-cyan-200">Synced</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[88%] rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-amber-200" /></div>
            </div>
          </div>

          <div className="space-y-3">
            {productionStack.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.035] p-4 transition hover:border-white/18 hover:bg-white/[.055]">
                  <span className="grid size-12 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-400/10"><Icon className="size-5 text-cyan-200" /></span>
                  <div><div className="font-black text-white">{item.label}</div><div className="text-xs leading-5 text-white/42">{item.value}</div></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero({ onEnter }: { onEnter: () => void }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.25], [0, -70]);

  return (
    <section className="relative flex min-h-screen items-center px-5 pb-24 pt-32">
      <motion.div style={{ y }} className="mx-auto grid w-full max-w-[1540px] items-center gap-12 xl:grid-cols-[1fr_.92fr]">
        <div className="relative z-10">
          <div className="mb-7"><StudioLogo /></div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/18 bg-cyan-300/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100/72">
            <Zap className="size-4" /> Built to beat single-output AI tools
          </div>
          <h1 className="max-w-5xl text-[clamp(4.2rem,9vw,11.4rem)] font-black leading-[0.76] tracking-[-0.095em] text-white">
            The AI studio that remembers.
          </h1>
          <p className="mt-8 max-w-3xl text-xl leading-9 text-cyan-50/70 md:text-2xl">
            Stop juggling disconnected generators. AXS turns one idea into permanent characters, living universes, cinematic assets, scripts, campaigns, and production memory.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {outcomes.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-bold text-white/66">
                <CheckCircle2 className="size-4 text-cyan-200" /> {item}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button onClick={onEnter} className="h-14 rounded-2xl bg-white px-7 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_0_70px_rgba(34,211,238,0.32)] hover:bg-cyan-100">
              Launch Studio <ArrowRight className="size-4" />
            </Button>
            <a href="#platform" className="inline-flex h-14 items-center gap-3 rounded-2xl border border-white/12 bg-white/[.035] px-6 text-sm font-black uppercase tracking-[0.14em] text-white/74 hover:border-cyan-200/30 hover:text-cyan-100">
              <Play className="size-4" /> See why it wins
            </a>
          </div>
        </div>
        <ProductTheater />
      </motion.div>
    </section>
  );
}

function PlatformSection() {
  return (
    <section id="platform" className="relative px-5 py-28">
      <div className="mx-auto max-w-[1450px]">
        <div className="grid gap-9 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.36em] text-amber-200/60">The wedge</p>
            <h2 className="mt-5 text-5xl font-black leading-[0.9] tracking-[-0.06em] text-white md:text-7xl">Higgsfield makes shots. SeaArt makes images. AXS builds the entire production system.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Single-output tools", "Great for a cool image or clip. Weak when you need the same character, world, and campaign to stay consistent."],
              ["AXS Creative Studios", "Characters, worlds, scripts, assets, campaigns, and memory work as one connected production OS."],
              ["Prompt chaos", "Every generation starts from zero. Context leaks. Style drifts. Identity breaks."],
              ["Production memory", "Your universe compounds: DNA, lore, prompts, assets, launch angles, and publishing logic stay connected."],
            ].map(([title, copy], index) => (
              <div key={title} className={`rounded-[1.5rem] border p-5 ${index % 2 ? "border-cyan-300/22 bg-cyan-300/[0.055]" : "border-white/10 bg-white/[.03]"}`}>
                <div className="text-lg font-black text-white">{title}</div>
                <p className="mt-3 text-sm leading-6 text-white/54">{copy}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            ["9+", "Creator workflows", "unified into one premium studio"],
            ["DNA", "Character lock", "identity-first generation"],
            ["Vault", "Production memory", "never lose the system"],
            ["Multi", "Launch output", "assets for every surface"],
          ].map(([value, label, detail]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-black/34 p-5 backdrop-blur-xl">
              <div className="text-4xl font-black text-white">{value}</div>
              <div className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/42">{label}</div>
              <div className="mt-3 text-sm text-white/45">{detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModulesSection({ onRoute }: { onRoute: (tab: ForgeTab) => void }) {
  return (
    <section id="modules" className="relative px-5 py-28">
      <div className="mx-auto max-w-[1450px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.36em] text-cyan-100/45">Inside AXS</p>
            <h2 className="mt-4 text-5xl font-black tracking-[-0.06em] text-white md:text-7xl">Every room has a job. Every output stays connected.</h2>
          </div>
          <p className="max-w-xl text-lg leading-8 text-white/52">Not a generic dashboard. A cinematic production floor built around character continuity, campaign output, and memory.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button key={module.title} onClick={() => onRoute(module.tab)} className={`group min-h-[20rem] overflow-hidden rounded-[1.75rem] border p-6 text-left transition hover:-translate-y-1 ${toneClasses(module.tone)}`}>
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-13 place-items-center rounded-2xl border border-current/30 bg-black/22"><Icon className="size-6" /></span>
                  <span className="rounded-full border border-current/20 bg-black/18 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] opacity-70">{module.metric}</span>
                </div>
                <h3 className="mt-14 text-3xl font-black tracking-[-0.04em] text-white">{module.title}</h3>
                <p className="mt-4 text-base leading-7 text-white/58">{module.copy}</p>
                <div className="mt-7 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/60 group-hover:text-white">
                  Open studio <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  const steps = [
    [Sparkles, "Idea", "Start with a product, story, persona, campaign, fantasy, or creator brand."],
    [Dna, "Lock DNA", "Define identity, references, voice, styling, and continuity rules."],
    [Network, "Build World", "Create lore, locations, relationships, episodes, and production context."],
    [WandSparkles, "Generate", "Produce images, video direction, scripts, hooks, captions, and assets."],
    [RadioTower, "Launch", "Convert outputs into platform-native campaigns and publishing systems."],
  ] as const;

  return (
    <section id="workflow" className="relative px-5 py-28">
      <div className="mx-auto max-w-[1450px] rounded-[2.5rem] border border-white/10 bg-white/[.035] p-6 shadow-[0_40px_150px_rgba(0,0,0,.45)] backdrop-blur-2xl md:p-10">
        <div className="mb-10 max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.36em] text-amber-200/56">One idea → complete ecosystem</p>
          <h2 className="mt-4 text-5xl font-black leading-[0.9] tracking-[-0.06em] text-white md:text-7xl">The workflow compounds instead of resetting.</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          {steps.map(([Icon, title, copy], index) => (
            <div key={title} className="relative rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="mb-8 flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-400/10"><Icon className="size-5 text-cyan-200" /></span>
                <span className="font-mono text-xs text-white/28">0{index + 1}</span>
              </div>
              <h3 className="text-xl font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/48">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DistributionSection() {
  return (
    <section className="relative px-5 py-28">
      <div className="mx-auto max-w-[1450px] text-center">
        <p className="text-xs font-black uppercase tracking-[0.36em] text-cyan-100/45">Built for where creators actually publish</p>
        <h2 className="mx-auto mt-4 max-w-5xl text-5xl font-black leading-[0.9] tracking-[-0.06em] text-white md:text-7xl">One story becomes every surface.</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {platforms.map((platform) => (
            <span key={platform} className="rounded-full border border-white/10 bg-white/[.035] px-5 py-3 text-sm font-black text-white/66">{platform}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderCTA({ onEnter }: { onEnter: () => void }) {
  return (
    <section id="founders" className="relative px-5 py-28">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.75rem] border border-cyan-200/16 bg-[linear-gradient(135deg,rgba(34,211,238,.10),rgba(168,85,247,.08),rgba(251,191,36,.08))] p-8 text-center shadow-[0_50px_190px_rgba(0,0,0,.58)] backdrop-blur-3xl md:p-14">
        <ShieldCheck className="mx-auto size-12 text-cyan-100" />
        <h2 className="mx-auto mt-7 max-w-5xl text-5xl font-black leading-[0.86] tracking-[-0.075em] text-white md:text-8xl">Back the studio creators actually need.</h2>
        <p className="mx-auto mt-7 max-w-3xl text-xl leading-8 text-cyan-50/62">AXS is being built for serious creative production: APIs, GPU compute, infrastructure, testing, polish, and launch. Founder support turns the prototype into a real company.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button onClick={onEnter} className="h-14 rounded-2xl bg-white px-8 text-sm font-black uppercase tracking-[0.18em] text-black hover:bg-cyan-100">
            Try the Studio <Rocket className="size-4" />
          </Button>
          <a href="mailto:founders@axs-ai-creative-studios.com?subject=AXS%20Founder%20Access" className="inline-flex h-14 items-center rounded-2xl border border-white/14 bg-black/25 px-8 text-sm font-black uppercase tracking-[0.18em] text-white/74 hover:border-cyan-200/32 hover:text-cyan-100">
            Founder Access
          </a>
        </div>
      </div>
    </section>
  );
}

interface AXSLandingPageProps {
  standalone?: boolean;
  appUrl?: string;
}

export function AXSLandingPage({ standalone = false, appUrl = "/app" }: AXSLandingPageProps = {}) {
  const setActiveTab = useAxsStore((state) => state.setActiveTab);
  const openApp = (tab?: ForgeTab) => {
    if (standalone) {
      const suffix = tab ? `#${tab}` : "";
      window.location.assign(`${appUrl}${suffix}`);
      return;
    }
    setActiveTab(tab ?? "studio");
  };
  const enterStudio = () => openApp("studio");
  const routeTo = (tab: ForgeTab) => openApp(tab);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#010104] text-white">
      <NullRealityBackground />
      <FloatingGate onEnter={enterStudio} />
      <main className="relative z-10">
        <Hero onEnter={enterStudio} />
        <PlatformSection />
        <ModulesSection onRoute={routeTo} />
        <WorkflowSection />
        <DistributionSection />
        <FounderCTA onEnter={enterStudio} />
        <footer className="relative px-5 pb-28 text-center text-xs font-black uppercase tracking-[0.26em] text-white/28">
          AXS AI Creative Studios — cinematic production memory for the next creator economy
        </footer>
      </main>
    </div>
  );
}
