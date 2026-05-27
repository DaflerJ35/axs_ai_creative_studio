import { useMemo, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import {
  Archive,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  Cpu,
  Dna,
  Gauge,
  Image,
  LockKeyhole,
  Megaphone,
  Orbit,
  Plus,
  RadioTower,
  Rocket,
  Search,
  Send,
  TrendingUp,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import { useAxsStore } from "../../store/useAxsStore";
import type { ForgeTab } from "../../lib/types";

type Tone = "gold" | "steel" | "emerald" | "amber";

const toneClasses: Record<Tone, { text: string; border: string; bg: string; glow: string; gradient: string }> = {
  gold: {
    text: "text-[#F6D57A]",
    border: "border-[#F6D57A]/30",
    bg: "bg-[#D4AF37]/10",
    glow: "shadow-[0_0_34px_rgba(212,175,55,.14)]",
    gradient: "from-[#F6D57A] via-[#D4AF37] to-[#8B6F2F]",
  },
  amber: {
    text: "text-amber-300",
    border: "border-amber-300/24",
    bg: "bg-amber-400/8",
    glow: "shadow-[0_0_28px_rgba(245,158,11,.10)]",
    gradient: "from-amber-200 via-[#D4AF37] to-amber-700",
  },
  emerald: {
    text: "text-emerald-300",
    border: "border-emerald-300/22",
    bg: "bg-emerald-400/8",
    glow: "shadow-[0_0_28px_rgba(52,211,153,.10)]",
    gradient: "from-emerald-200 via-[#D4AF37] to-[#8B6F2F]",
  },
  steel: {
    text: "text-zinc-200",
    border: "border-white/10",
    bg: "bg-white/[.035]",
    glow: "shadow-[0_0_28px_rgba(255,255,255,.05)]",
    gradient: "from-zinc-200 via-[#D4AF37] to-zinc-500",
  },
};

const studioPulse = [
  { label: "Launch Readiness", value: "87%", detail: "4 checks left", icon: Gauge, tone: "gold" as Tone },
  { label: "AI Generation Queue", value: "18", detail: "6 rendering now", icon: Cpu, tone: "amber" as Tone },
  { label: "Universe Sync", value: "94%", detail: "canon aligned", icon: Orbit, tone: "gold" as Tone },
  { label: "Vault Assets", value: "312", detail: "28 reusable refs", icon: Archive, tone: "steel" as Tone },
  { label: "Distribution", value: "5/6", detail: "channels staged", icon: RadioTower, tone: "emerald" as Tone },
  { label: "Revenue Setup", value: "Ready", detail: "payments linked", icon: TrendingUp, tone: "gold" as Tone },
] as const;

const activeProductions = [
  {
    title: "Aurum Signal Pilot",
    phase: "Storyboard lock",
    owner: "Scene Builder",
    progress: 78,
    tab: "scene" as ForgeTab,
    status: "Director review",
    tone: "gold" as Tone,
  },
  {
    title: "Nocturne City Launch",
    phase: "Platform variants",
    owner: "Distribute",
    progress: 91,
    tab: "distribute" as ForgeTab,
    status: "Launch pack",
    tone: "emerald" as Tone,
  },
  {
    title: "Origin Forge Brand Film",
    phase: "Character continuity",
    owner: "DNA",
    progress: 64,
    tab: "dna" as ForgeTab,
    status: "Canon lock",
    tone: "amber" as Tone,
  },
] as const;

const generationQueue = [
  { job: "Anchor portraits", module: "Character DNA", eta: "02:15", state: "Rendering", icon: Dna },
  { job: "Moonlit alley boards", module: "Scene Builder", eta: "04:40", state: "Queued", icon: Clapperboard },
  { job: "Launch thumbnails", module: "Vault", eta: "07:10", state: "Review", icon: Image },
] as const;

const campaignPipeline = [
  { step: "Create", label: "Source post", progress: 100 },
  { step: "Adapt", label: "Channel variants", progress: 82 },
  { step: "Schedule", label: "Weekly calendar", progress: 64 },
  { step: "Review", label: "Readiness check", progress: 46 },
] as const;

const intelligenceItems = [
  { label: "Character DNA", value: "3 identity locks need refreshed anchor images.", icon: LockKeyhole, tab: "dna" as ForgeTab },
  { label: "Universe Codex", value: "2 timeline events are linked to uncatalogued locations.", icon: Orbit, tab: "universe" as ForgeTab },
  { label: "Distribution", value: "LinkedIn cut needs a shorter executive caption.", icon: Megaphone, tab: "distribute" as ForgeTab },
  { label: "Vault Memory", value: "18 high-performing references are ready for reuse.", icon: Archive, tab: "vault" as ForgeTab },
] as const;

const quickActions = [
  { title: "Create Campaign", sub: "Open launch operations and build a campaign system.", icon: Megaphone, tab: "campaign" as ForgeTab, primary: true },
  { title: "Generate Script", sub: "Send a conversion brief into Script Forge.", icon: Search, tab: "scripts" as ForgeTab, prompt: "Write a premium AXS launch script with a cinematic hook, proof, offer, and CTA." },
  { title: "Open Universe", sub: "Inspect codex, lore, timelines, and continuity.", icon: Orbit, tab: "universe" as ForgeTab },
  { title: "Lock Character DNA", sub: "Anchor identity before generating new scenes.", icon: Dna, tab: "dna" as ForgeTab },
  { title: "Build Storyboard", sub: "Move into beat and shot control.", icon: Clapperboard, tab: "scene" as ForgeTab },
  { title: "Prepare Launch Pack", sub: "Prepare captions, hashtags, and variants.", icon: Rocket, tab: "distribute" as ForgeTab },
  { title: "Investor Demo", sub: "Open the funding presentation route.", icon: BarChart3, tab: "studio" as ForgeTab, href: "/pitch" },
] as const;

const launchChecklist = [
  { label: "Canon continuity", done: true },
  { label: "Storyboard coverage", done: true },
  { label: "Platform captions", done: true },
  { label: "Payment/revenue setup", done: true },
  { label: "Final legal sweep", done: false },
] as const;

const moduleMap = [
  { title: "Universe Engine", sub: "Codex, lore, timeline, linked world rules", icon: Orbit, tab: "universe" as ForgeTab },
  { title: "Character DNA", sub: "Anchor images, canon locks, style bible", icon: Dna, tab: "dna" as ForgeTab },
  { title: "Scene Builder", sub: "Beat boards, camera, mood, motion notes", icon: Clapperboard, tab: "scene" as ForgeTab },
  { title: "Distribute", sub: "Create -> Adapt -> Schedule -> Review", icon: Send, tab: "distribute" as ForgeTab },
  { title: "Vault Memory", sub: "Assets, prompts, outputs, reusable references", icon: Archive, tab: "vault" as ForgeTab },
  { title: "Analytics", sub: "Signals, performance, launch intelligence", icon: BarChart3, tab: "analytics" as ForgeTab },
] as const;

type Attachment = { id: string; name: string; type: string; dataUrl: string };

function inferDestinationTab(text: string): ForgeTab {
  const value = text.toLowerCase();
  if (/character|dna|face|identity|anchor|canon/.test(value)) return "dna";
  if (/scene|shot|camera|storyboard|motion|beat/.test(value)) return "scene";
  if (/image|poster|thumbnail|visual|render/.test(value)) return "images";
  if (/video|trailer|reel|clip/.test(value)) return "videos";
  if (/script|hook|caption|copy|voiceover/.test(value)) return "scripts";
  if (/campaign|launch|offer|calendar/.test(value)) return "campaign";
  if (/world|universe|lore|timeline|codex/.test(value)) return "universe";
  if (/publish|distribute|tiktok|youtube|instagram|linkedin|schedule/.test(value)) return "distribute";
  if (/asset|vault|reference|memory/.test(value)) return "vault";
  return "strategy";
}

function readDroppedImages(files: FileList | File[], onReady: (items: Attachment[]) => void) {
  const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
  if (!imageFiles.length) return;

  Promise.all(
    imageFiles.slice(0, 8).map(
      (file) =>
        new Promise<Attachment>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, type: file.type, dataUrl: String(reader.result) });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  )
    .then(onReady)
    .catch(() => toast.error("Reference upload failed"));
}

function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`axs-liquid-panel relative overflow-hidden rounded-2xl ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 82% 0%, rgba(246,213,122,.10), transparent 30%), linear-gradient(180deg, rgba(255,255,255,.045), transparent 38%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F6D57A]/40 to-transparent" />
      <div className="relative">{children}</div>
    </section>
  );
}

function SectionTitle({ title, sub, action, onAction }: { title: string; sub?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-xs font-black uppercase tracking-[.24em] text-[#F6D57A]">{title}</h2>
        {sub ? <p className="mt-1.5 text-sm font-medium text-zinc-500">{sub}</p> : null}
      </div>
      {action ? (
        <button onClick={onAction} className="shrink-0 text-[11px] font-black uppercase tracking-widest text-[#D4AF37] transition hover:text-[#F6D57A]">
          {action}
        </button>
      ) : null}
    </div>
  );
}

function ProgressBar({ value, tone = "gold" }: { value: number; tone?: Tone }) {
  const t = toneClasses[tone];
  return (
    <div className="h-2 overflow-hidden rounded-full border border-white/5 bg-black/60">
      <div className={`h-full rounded-full bg-gradient-to-r ${t.gradient} shadow-[0_0_18px_rgba(212,175,55,.22)]`} style={{ width: `${value}%` }} />
    </div>
  );
}

function StudioPulse() {
  return (
    <CardShell className="p-5 lg:p-6">
      <SectionTitle title="Studio Pulse" sub="Executive signal across production, memory, launch, and revenue." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {studioPulse.map((item) => {
          const Icon = item.icon;
          const t = toneClasses[item.tone];
          return (
            <div key={item.label} className={`rounded-2xl border ${t.border} ${t.bg} p-4 ${t.glow}`}>
              <div className="mb-5 flex items-center justify-between">
                <Icon className={`h-5 w-5 ${t.text}`} />
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_16px_rgba(212,175,55,.7)]" />
              </div>
              <div className="text-2xl font-black tracking-tight text-white">{item.value}</div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-[.16em] text-zinc-500">{item.label}</div>
              <div className="mt-2 text-xs font-medium text-zinc-400">{item.detail}</div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

function CommandHero() {
  const { setActiveTab } = useAxsStore();
  return (
    <CardShell className="border-[#F6D57A]/30">
      <div className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,5,1) 0%, rgba(8,8,8,.94) 48%, rgba(8,8,8,.5) 100%), radial-gradient(circle at 78% 34%, rgba(246,213,122,.18), transparent 25%), repeating-linear-gradient(90deg, rgba(246,213,122,.06) 0 1px, transparent 1px 54px)",
        }}
      />
      <div className="absolute right-6 top-6 hidden h-56 w-56 rounded-full border border-[#D4AF37]/20 lg:block" />
      <div className="absolute right-20 top-20 hidden h-28 w-28 rounded-full border border-[#F6D57A]/25 lg:block" />
      <div className="relative p-6 lg:p-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F6D57A]/24 bg-[#D4AF37]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.22em] text-[#F6D57A]">
          <Zap className="h-3.5 w-3.5" />
          Command Deck Online
        </div>
        <h1 className="max-w-4xl text-[clamp(2rem,4vw,4.7rem)] font-black leading-[.92] tracking-tight text-white">
          Creative operations, memory, and launch control in one cockpit.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
          AXS is routing the work by production stage: codex, character DNA, storyboard, asset memory, campaign pipeline, and distribution readiness.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab("scene")}
            className="inline-flex items-center gap-2 rounded-xl border border-[#F6D57A]/45 bg-gradient-to-br from-[#F6D57A] via-[#D4AF37] to-[#8B6F2F] px-5 py-3 text-sm font-black text-[#171006] shadow-[0_18px_45px_rgba(212,175,55,.22)] transition hover:-translate-y-0.5"
          >
            Open Storyboard <Clapperboard className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTab("distribute")}
            className="inline-flex items-center gap-2 rounded-xl border border-[#F6D57A]/24 bg-[#D4AF37]/10 px-5 py-3 text-sm font-black text-[#F6D57A] transition hover:border-[#F6D57A]/50 hover:bg-[#D4AF37]/16"
          >
            Check Launch Pack <Rocket className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveTab("vault")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-5 py-3 text-sm font-black text-zinc-200 transition hover:border-[#F6D57A]/35 hover:text-[#F6D57A]"
          >
            Search Memory <Search className="h-4 w-4" />
          </button>
        </div>
      </div>
    </CardShell>
  );
}

function ActiveProductions() {
  const { setActiveTab } = useAxsStore();
  return (
    <CardShell className="p-5 lg:p-6">
      <SectionTitle title="Active Productions" sub="Workflow-first production lanes with module ownership." action="Open Vault" onAction={() => setActiveTab("vault")} />
      <div className="space-y-3">
        {activeProductions.map((production) => {
          const t = toneClasses[production.tone];
          return (
            <button
              key={production.title}
              onClick={() => setActiveTab(production.tab)}
              className={`group w-full rounded-2xl border ${t.border} bg-black/36 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[.04]`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black uppercase tracking-[.08em] text-white">{production.title}</div>
                  <div className="mt-1 text-xs font-medium text-zinc-500">{production.phase} - {production.owner}</div>
                </div>
                <span className={`rounded-full border ${t.border} ${t.bg} px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${t.text}`}>
                  {production.status}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1"><ProgressBar value={production.progress} tone={production.tone} /></div>
                <span className="w-10 text-right text-xs font-black text-zinc-200">{production.progress}%</span>
                <ChevronRight className={`h-4 w-4 ${t.text} opacity-0 transition group-hover:opacity-100`} />
              </div>
            </button>
          );
        })}
      </div>
    </CardShell>
  );
}

function LaunchReadiness() {
  return (
    <CardShell className="p-5 lg:p-6">
      <SectionTitle title="Launch Readiness" sub="Continuity, platform, and revenue gates." />
      <div className="space-y-3">
        {launchChecklist.map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/35 px-3 py-3">
            <CheckCircle2 className={`h-4 w-4 ${item.done ? "text-[#F6D57A]" : "text-zinc-600"}`} />
            <span className="text-sm font-bold text-zinc-200">{item.label}</span>
            <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${item.done ? "bg-[#D4AF37]/10 text-[#F6D57A]" : "bg-white/[.04] text-zinc-500"}`}>
              {item.done ? "Clear" : "Open"}
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

function QueueAndPipeline() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <CardShell className="p-5 lg:p-6">
        <SectionTitle title="AI Generation Queue" sub="Render jobs tied to production memory." />
        <div className="space-y-3">
          {generationQueue.map((job) => {
            const Icon = job.icon;
            return (
              <div key={job.job} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/35 p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#F6D57A]/20 bg-[#D4AF37]/8 text-[#F6D57A]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black text-white">{job.job}</div>
                  <div className="mt-1 text-xs text-zinc-500">{job.module}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-[#F6D57A]">{job.eta}</div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">{job.state}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardShell>

      <CardShell className="p-5 lg:p-6">
        <SectionTitle title="Campaign Pipeline" sub="Create -> Adapt -> Schedule -> Review." />
        <div className="space-y-4">
          {campaignPipeline.map((step, index) => (
            <div key={step.step}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-[#F6D57A]/24 bg-[#D4AF37]/10 text-xs font-black text-[#F6D57A]">{index + 1}</span>
                  <div>
                    <div className="text-sm font-black text-white">{step.step}</div>
                    <div className="text-xs text-zinc-500">{step.label}</div>
                  </div>
                </div>
                <span className="text-xs font-black text-zinc-300">{step.progress}%</span>
              </div>
              <ProgressBar value={step.progress} tone="gold" />
            </div>
          ))}
        </div>
      </CardShell>
    </div>
  );
}

function IntelligenceAndActions() {
  const { setActiveTab, setDraftPrompt } = useAxsStore();
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(19rem,.8fr)]">
      <CardShell className="p-5 lg:p-6">
        <SectionTitle title="Recent Creative Intelligence" sub="What AXS learned from the current production state." />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {intelligenceItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.tab)}
                className="group rounded-2xl border border-white/8 bg-black/35 p-4 text-left transition hover:border-[#F6D57A]/28 hover:bg-[#D4AF37]/8"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Icon className="h-4 w-4 text-[#F6D57A]" />
                  <span className="text-[10px] font-black uppercase tracking-[.18em] text-[#D4AF37]">{item.label}</span>
                </div>
                <p className="text-sm leading-6 text-zinc-300">{item.value}</p>
              </button>
            );
          })}
        </div>
      </CardShell>

      <CardShell className="p-5 lg:p-6">
        <SectionTitle title="Quick Actions" sub="High-leverage moves, routed by workflow." />
        <div className="space-y-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isPrimary = "primary" in action && action.primary;
            return (
              <button
                key={action.title}
                onClick={() => {
                  if ("href" in action && action.href) {
                    window.location.assign(action.href);
                    return;
                  }
                  if ("prompt" in action && action.prompt) setDraftPrompt(action.prompt);
                  setActiveTab(action.tab);
                  toast.success(action.title, { description: "Command Deck routed the action." });
                }}
                className={[
                  "group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition",
                  isPrimary
                    ? "border-[#F6D57A]/34 bg-[#D4AF37]/12 text-[#F6D57A] shadow-[0_0_34px_rgba(212,175,55,.12)]"
                    : "border-white/8 bg-black/35 text-zinc-200 hover:border-[#F6D57A]/28 hover:text-[#F6D57A]",
                ].join(" ")}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-current/20 bg-black/35">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black">{action.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-zinc-500">{action.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </CardShell>
    </div>
  );
}

function ProductionRouter() {
  const { setActiveTab, setDraftPrompt } = useAxsStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);

  const destination = useMemo(() => inferDestinationTab(prompt), [prompt]);

  const addAttachments = (items: Attachment[]) => {
    setAttachments((current) => [...items, ...current].slice(0, 8));
    toast.success(`${items.length} reference${items.length === 1 ? "" : "s"} attached`);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    readDroppedImages(event.dataTransfer.files, addAttachments);
  };

  const routeCommand = () => {
    const text = prompt.trim();
    if (!text && attachments.length === 0) {
      toast.error("Add a production command or reference first");
      return;
    }

    const stagedText = text || "Analyze the attached production references.";
    const routedTab = inferDestinationTab(stagedText);
    setDraftPrompt(stagedText);
    setActiveTab(routedTab);
    setPrompt("");
    setAttachments([]);
    toast.success(`Routed to ${routedTab.toUpperCase()}`);
  };

  return (
    <CardShell className="p-5 lg:p-6">
      <SectionTitle title="Production Router" sub="Prompt-guided routing without making prompt entry the whole product." />
      <div
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-2xl border p-4 transition ${dragging ? "border-[#F6D57A]/60 bg-[#D4AF37]/12" : "border-white/8 bg-black/45"}`}
      >
        {attachments.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {attachments.map((item) => (
              <div key={item.id} className="group relative h-14 w-14 overflow-hidden rounded-xl border border-[#F6D57A]/20 bg-black">
                <img src={item.dataUrl} alt={item.name} className="h-full w-full object-cover opacity-80" />
                <button type="button" onClick={() => setAttachments((current) => current.filter((a) => a.id !== item.id))} className="absolute inset-0 grid place-items-center bg-black/65 opacity-0 transition group-hover:opacity-100">
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="min-h-[6rem] w-full resize-none bg-transparent text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600"
          placeholder="Route a production task: lock character DNA, build a beat board, adapt launch captions, sync codex lore..."
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => event.target.files && readDroppedImages(event.target.files, addAttachments)}
        />

        <div className="mt-4 flex flex-col gap-3 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[.18em] text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F6D57A] shadow-[0_0_14px_rgba(246,213,122,.8)]" />
            Route: <span className="text-[#F6D57A]">{destination.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-zinc-300 transition hover:border-[#F6D57A]/35 hover:text-[#F6D57A]" title="Attach references">
              <UploadCloud className="h-4 w-4" />
            </button>
            <button type="button" onClick={routeCommand} className="inline-flex items-center gap-2 rounded-xl border border-[#F6D57A]/34 bg-[#D4AF37]/12 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#F6D57A] transition hover:bg-[#D4AF37]/18">
              Route Task <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function ModuleMap() {
  const { setActiveTab } = useAxsStore();
  return (
    <CardShell className="p-5 lg:p-6">
      <SectionTitle title="Creative OS Map" sub="The production system is organized by workflow, memory, and launch state." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {moduleMap.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.title} onClick={() => setActiveTab(item.tab)} className="group rounded-2xl border border-white/8 bg-black/35 p-4 text-left transition hover:border-[#F6D57A]/28 hover:bg-[#D4AF37]/8">
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-[#F6D57A]/20 bg-[#D4AF37]/8 text-[#F6D57A]">
                  <Icon className="h-5 w-5" />
                </span>
                <ChevronRight className="h-4 w-4 text-[#F6D57A] opacity-0 transition group-hover:opacity-100" />
              </div>
              <div className="text-sm font-black uppercase tracking-[.08em] text-white">{item.title}</div>
              <p className="mt-2 text-xs leading-5 text-zinc-500">{item.sub}</p>
            </button>
          );
        })}
      </div>
    </CardShell>
  );
}

export function AXSCommandDeck() {
  return (
    <div className="relative min-w-0 space-y-5">
      <CommandHero />
      <StudioPulse />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,.55fr)]">
        <ActiveProductions />
        <LaunchReadiness />
      </div>
      <QueueAndPipeline />
      <IntelligenceAndActions />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,.62fr)]">
        <ModuleMap />
        <ProductionRouter />
      </div>
    </div>
  );
}
