import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  Clock3,
  Filter,
  GitBranch,
  Layers3,
  MapPin,
  MoreVertical,
  Network,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  SunMedium,
  UsersRound,
  WandSparkles,
} from "lucide-react";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAxsProofSummary } from "@/lib/useAxsProofSummary";
import { useAxsStore } from "@/store/useAxsStore";
import { LegalGateModal } from "../scene-builder/components/LegalGateModal";
import { useSceneBuilderStore } from "../scene-builder/store/useSceneBuilderStore";
import { WorkflowAutoLoader } from "../workflow-manager/components/WorkflowManagerPanel";
import { useUniverseForgeStore } from "./store/useUniverseForgeStore";
import type { ContinuityCheck, StoryBeat, UniverseCharacterMemory, UniverseRelationship } from "./types/universe-forge.types";

const SEASON_CARDS = ["Universe", "Characters", "Locations", "Lore Engine", "Story Arc", "Timeline", "Relationships", "Analytics"];

const GRAPH_POINTS = [
  { x: 52, y: 48, tone: "teal" },
  { x: 26, y: 27, tone: "teal" },
  { x: 78, y: 26, tone: "purple" },
  { x: 20, y: 58, tone: "pink" },
  { x: 34, y: 76, tone: "purple" },
  { x: 74, y: 65, tone: "amber" },
  { x: 58, y: 80, tone: "teal" },
];

const STATUS_META: Record<StoryBeat["status"], { label: string; className: string }> = {
  generated: { label: "Locked", className: "axs-status-pill-live" },
  polished: { label: "Locked", className: "axs-status-pill-live" },
  "in-progress": { label: "In Review", className: "axs-status-pill-watch" },
  "not-started": { label: "Outline", className: "axs-status-pill-draft" },
};

export function UniverseForge() {
  const bible = useUniverseForgeStore((state) => state.bible);
  const characters = useUniverseForgeStore((state) => state.characters);
  const relationships = useUniverseForgeStore((state) => state.relationships);
  const storyBeats = useUniverseForgeStore((state) => state.storyBeats);
  const continuityChecks = useUniverseForgeStore((state) => state.continuityChecks);
  const seriesShots = useUniverseForgeStore((state) => state.seriesShots);
  const workflowProfile = useUniverseForgeStore((state) => state.workflowProfile);
  const generateStoryArc = useUniverseForgeStore((state) => state.generateStoryArc);
  const generateEpisode = useUniverseForgeStore((state) => state.generateEpisode);
  const generateSeries = useUniverseForgeStore((state) => state.generateSeries);
  const runContinuityAudit = useUniverseForgeStore((state) => state.runContinuityAudit);
  const setActiveTab = useAxsStore((state) => state.setActiveTab);
  const setDraftPrompt = useAxsStore((state) => state.setDraftPrompt);
  const proof = useAxsProofSummary();
  const studioMode = useSceneBuilderStore((state) => state.studioMode);
  const setStudioMode = useSceneBuilderStore((state) => state.setStudioMode);
  const nsfwGateAccepted = useSceneBuilderStore((state) => state.nsfwGateAccepted);
  const confirmNsfwGate = useSceneBuilderStore((state) => state.confirmNsfwGate);
  const [nsfwGateOpen, setNsfwGateOpen] = useState(false);
  const [season, setSeason] = useState("Season 1");
  const [episodeFilter, setEpisodeFilter] = useState("All");
  const [bibleFilter, setBibleFilter] = useState("All");
  const [bibleQuery, setBibleQuery] = useState("");
  const [detailBeat, setDetailBeat] = useState<StoryBeat | null>(null);
  const [panelTitle, setPanelTitle] = useState<string | null>(null);
  const isNsfw = studioMode === "nsfw";
  const continuityScore = Math.round(
    continuityChecks.reduce((total, check) => total + (check.status === "ok" ? 100 : check.status === "watch" ? 72 : 38), 0) /
      Math.max(1, continuityChecks.length)
  );
  const activeWorkflows = Math.max(1, Math.round(seriesShots.length / Math.max(1, storyBeats.length)) + 4);
  const filteredBeats = storyBeats.filter((beat) => {
    if (episodeFilter === "All") return true;
    if (episodeFilter === "In Production") return beat.status === "in-progress";
    if (episodeFilter === "Draft") return beat.status === "not-started";
    if (episodeFilter === "Outline") return beat.status === "not-started";
    if (episodeFilter === "Planned") return beat.status !== "generated" && beat.status !== "polished";
    return true;
  });

  const runDemoAction = (title: string, description?: string) => {
    setPanelTitle(title);
    toast.success(title, { description: description ?? "AXS updated the local Universe Engine demo state." });
  };

  const toggleMode = () => {
    if (isNsfw) {
      setStudioMode("sfw");
      return;
    }
    if (nsfwGateAccepted) {
      setStudioMode("nsfw");
      return;
    }
    setNsfwGateOpen(true);
  };

  return (
    <div className="axs-universe-reference axs-workspace-page text-white">
      <WorkflowAutoLoader model={workflowProfile.model} />

      <header className="axs-universe-reference-hero">
        <div className="min-w-0">
          <h1>Hollywood-grade universe control</h1>
          <p>Orchestrate every story, character, and timeline with cinematic precision.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <ProofChip label="Cinematic Intelligence" />
            <ProofChip label="Continuity Protected" />
            <ProofChip label="AI-Native Workflows" />
          </div>
        </div>
        <div className="axs-universe-hero-stats">
          <HeroStat label="Active Universes" value="10" delta="+2" />
          <HeroStat label="Episodes in Production" value="38" delta="+18" />
          <HeroStat label="Active Workflows" value={String(activeWorkflows)} delta="+7" />
          <HeroStat label="Continuity Integrity" value={`${continuityScore}%`} delta="+8%" />
        </div>
      </header>

      <section className="axs-reference-panel mt-5 p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="axs-reference-kicker flex items-center gap-2">
              <Layers3 className="size-3.5" />
              Universe Command Center
              <span className="text-muted">i</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-muted">{bible.title}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => { setSeason(season === "Season 1" ? "Season 2" : "Season 1"); toast.success("Season filter updated"); }} className="axs-ref-select">{season}</button>
            <button type="button" onClick={() => { generateStoryArc(); runDemoAction("New episode arc created", "A fresh story arc was staged in the Universe planner."); }} className="axs-ref-gold-button"><Plus className="size-3.5" />New Episode</button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {storyBeats.slice(0, 8).map((beat, index) => (
            <SeasonCard key={beat.id} beat={beat} index={index} onOpen={() => setDetailBeat(beat)} />
          ))}
        </div>

        <div className="axs-season-summary mt-5">
          <div>
            <div className="text-2xl font-semibold text-white">{continuityScore}%</div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Season Continuity Score</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-[linear-gradient(90deg,var(--axs-teal),var(--axs-purple))]" style={{ width: `${continuityScore}%` }} />
            </div>
          </div>
          <div className="text-center"><strong>{storyBeats.length}</strong><span>Episodes</span></div>
          <div className="text-center"><strong>{storyBeats.filter((beat) => beat.status === "in-progress").length}</strong><span>In Production</span></div>
          <button type="button" onClick={() => { generateSeries(); runDemoAction("Season overview refreshed", "Series continuity and production coverage were recalculated."); }} className="axs-ref-dark-button">Season Overview</button>
        </div>
      </section>

      <section className="axs-reference-panel mt-5 p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2>Command Center</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-muted">
            <span className="axs-ref-tab-active">Overview</span>
            <span>Continuity</span>
            <span>Characters</span>
            <span>Locations</span>
            <span>Timeline</span>
            <span>Themes</span>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="axs-command-health-card">
            <div className="axs-reference-kicker">Universe Health</div>
            <div className="mt-5 grid gap-5 md:grid-cols-[170px_minmax(0,1fr)]">
              <div className="axs-health-ring" style={{ "--ring-pct": `${continuityScore}%` } as CSSProperties}>
                <span>{continuityScore}%</span>
                <small>Excellent</small>
              </div>
              <div className="space-y-3">
                {[
                  ["Continuity Integrity", proof.categories.continuity.score],
                  ["Character Consistency", proof.categories.identity.score],
                  ["Timeline Accuracy", continuityScore - 4],
                  ["Lore Adherence", continuityScore - 1],
                  ["World Rule Compliance", continuityScore - 6],
                ].map(([label, value]) => (
                  <HealthLine key={String(label)} label={String(label)} value={Number(value)} />
                ))}
              </div>
            </div>
            <button type="button" onClick={() => { runContinuityAudit(); runDemoAction("Continuity report opened", "Universe proof, identity, timeline, and lore checks are ready."); }} className="axs-ref-gold-button mt-5 w-full justify-center">View Full Report</button>
          </div>
          <RecentActivity checks={continuityChecks} onViewAll={() => runDemoAction("Activity drawer opened", "Showing the latest continuity, lore, and timeline activity.")} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <MiniMetric label="World Rules" value={String(bible.worldRules.length * 35 + 2)} detail="Active Rules" />
          <MiniMetric label="Characters" value={String(characters.length * 37 + 1)} detail="Tracked" />
          <MiniMetric label="Locations" value="24" detail="Key Locations" />
          <MiniMetric label="Timelines" value="7" detail="Active Threads" />
        </div>
      </section>

      <section className="axs-reference-panel mt-5 p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2>Episodes</h2>
          <div className="flex flex-wrap items-center gap-2">
            {["All", "In Production", "Draft", "Outline", "Planned"].map((item) => (
              <button type="button" key={item} onClick={() => setEpisodeFilter(item)} className={cn("axs-ref-filter", episodeFilter === item && "active")}>{item}</button>
            ))}
            <button type="button" onClick={() => runDemoAction("Episodes sorted", "Episode number sorting is active.")} className="axs-ref-select ml-2">Sort by: Episode Number</button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredBeats.slice(0, 8).map((beat) => (
            <EpisodeCard key={beat.id} beat={beat} characters={characters} onOpen={() => setDetailBeat(beat)} onGenerate={() => { generateEpisode(beat.id); toast.success("Episode generation queued"); }} />
          ))}
        </div>
      </section>

      <section className="axs-reference-panel mt-5 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2>Living character graph <span className="text-muted">i</span></h2>
          <div className="flex gap-2"><button type="button" onClick={() => runDemoAction("Graph filters opened", "Relationship filters are ready for characters, factions, locations, and conflicts.")} className="axs-ref-select"><Filter className="size-3.5" />Filters</button><button type="button" onClick={() => runDemoAction("Graph expanded", "The living graph is staged for expanded reading mode.")} className="axs-ref-select">Expand</button></div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <CharacterGraph characters={characters} relationships={relationships} />
          <GraphInsights relationships={relationships} />
        </div>
      </section>

      <section className="axs-reference-panel mt-5 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2>Universe command bible <span className="text-muted">i</span></h2>
          <div className="flex gap-2">
            <label className="axs-ref-search">
              <Search className="size-3.5" />
              <input value={bibleQuery} onChange={(event) => setBibleQuery(event.target.value)} placeholder="Search the bible..." className="min-w-0 bg-transparent text-xs outline-none placeholder:text-white/35" />
            </label>
            <button type="button" onClick={() => runDemoAction("New codex entry opened", "A demo entry editor is ready for lore, rules, factions, events, and glossary records.")} className="axs-ref-gold-button"><Plus className="size-3.5" />New Entry</button>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">{["All", "Lore", "Rules", "Technology", "Factions", "Events", "Glossary"].map((item) => <button type="button" onClick={() => setBibleFilter(item)} key={item} className={cn("axs-ref-filter", bibleFilter === item && "active")}>{item}</button>)}</div>
        {bibleQuery || bibleFilter !== "All" ? <p className="mb-3 text-xs text-muted">Filtering bible by {bibleFilter} {bibleQuery ? `and "${bibleQuery}"` : ""}.</p> : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BibleColumn title="Core Lore" items={["The Veil", "The First Convergence", "The Architects"]} action="View all 28 entries" onAction={() => runDemoAction("Core lore opened")} />
          <BibleColumn title="World Rules" items={bible.worldRules.slice(0, 3)} action="View all 42 entries" onAction={() => runDemoAction("World rules opened")} />
          <BibleColumn title="Technology" items={["Chrono Analyzer", "Signal Mask", "Resonance Core"]} action="View all 18 entries" onAction={() => runDemoAction("Technology codex opened")} />
          <BibleColumn title="Recently Updated" items={["Veil Resonance", "Detective Cole", "Crossover Event"]} action="View All Updates" onAction={() => runDemoAction("Recent updates opened")} />
        </div>
      </section>

      <button type="button" onClick={toggleMode} className="mt-5 rounded-lg border border-amber-200/20 bg-white/[0.03] px-4 py-2 text-xs font-black text-muted transition hover:border-cyan-200/34 hover:text-white">
        <SunMedium className="mr-2 inline size-4" />
        {isNsfw ? "NSFW Director Mode Enabled" : "SFW Studio Mode"}
      </button>

      {nsfwGateOpen && (
        <LegalGateModal
          onCancel={() => setNsfwGateOpen(false)}
          onConfirm={() => {
            confirmNsfwGate();
            setStudioMode("nsfw");
            setNsfwGateOpen(false);
          }}
        />
      )}
      {detailBeat || panelTitle ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-xl" onClick={() => { setDetailBeat(null); setPanelTitle(null); }}>
          <div className="w-full max-w-xl rounded-3xl border border-[#F6D57A]/24 bg-[#080808]/96 p-6 shadow-[0_28px_100px_rgba(0,0,0,.75),0_0_70px_rgba(212,175,55,.13)]" onClick={(event) => event.stopPropagation()}>
            <div className="axs-reference-kicker">{detailBeat ? "Episode Detail" : "Universe Panel"}</div>
            <h3 className="mt-3 text-2xl font-black text-white">{detailBeat?.title ?? panelTitle}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              {detailBeat ? `${detailBeat.conflict} Continuity score: ${detailBeat.continuityScore}%. Required characters: ${detailBeat.requiredCharacterIds.join(", ") || "TBD"}.` : "This control is now connected to a local demo panel. Backend persistence can be attached later without changing the workflow."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {detailBeat ? <Button type="button" onClick={() => { setDraftPrompt(detailBeat.scenePrompt); setActiveTab("scene"); }} className="axs-ref-gold-button">Open in Scene Builder</Button> : null}
              <Button type="button" onClick={() => { setDetailBeat(null); setPanelTitle(null); }} className="axs-ref-dark-button">Close</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProofChip({ label }: { label: string }) {
  return <span className="axs-proof-chip"><ShieldCheck className="size-3" />{label}</span>;
}

function HeroStat({ label, value, delta }: { label: string; value: string; delta: string }) {
  return <div className="axs-hero-stat"><strong>{value}</strong><span>{delta}</span><small>{label}</small></div>;
}

function SeasonCard({ beat, index, onOpen }: { beat: StoryBeat; index: number; onOpen: () => void }) {
  const meta = STATUS_META[beat.status];
  return (
    <button type="button" onClick={onOpen} className="axs-season-tile text-left">
      <div className="flex items-start justify-between gap-3"><span className="text-2xl font-semibold text-white">{String(index + 1).padStart(2, "0")}</span><span className={meta.className}>{meta.label}</span></div>
      <h3 className="mt-5 truncate text-sm font-black uppercase text-white">{beat.title}</h3>
      <p className="mt-2 text-xs font-semibold text-muted">Written by AXS</p>
      <p className="mt-2 text-xs text-dim">May {20 + index}, 2026</p>
      <div className="mt-5 h-px bg-[linear-gradient(90deg,var(--axs-teal),transparent)]" />
      <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em]"><span className={meta.className}>{meta.label}</span><span>{beat.continuityScore}%</span></div>
    </button>
  );
}

function HealthLine({ label, value }: { label: string; value: number }) {
  return <div className="grid grid-cols-[1fr_120px_42px] items-center gap-3 text-xs"><span className="text-muted">{label}</span><span className="h-1.5 rounded-full bg-white/10"><span className="block h-full rounded-full bg-[linear-gradient(90deg,var(--axs-teal),var(--axs-green))]" style={{ width: `${Math.max(8, Math.min(100, value))}%` }} /></span><span className="font-mono text-[color:var(--axs-teal)]">{value}%</span></div>;
}

function RecentActivity({ checks, onViewAll }: { checks: ContinuityCheck[]; onViewAll: () => void }) {
  return <div className="axs-command-health-card"><div className="axs-reference-kicker">Recent Activity</div><div className="mt-4 space-y-3">{checks.map((check, index) => <div key={check.id} className="flex gap-3 rounded-lg border border-white/8 bg-white/[0.025] p-3"><span className="flex size-7 items-center justify-center rounded-full border border-cyan-200/16 bg-cyan-300/[0.08] text-cyan-100"><Clock3 className="size-3.5" /></span><div><div className="text-sm font-semibold text-white">{check.label}</div><p className="mt-1 line-clamp-1 text-xs text-muted">{check.detail} - {index + 1}h ago</p></div></div>)}</div><button type="button" onClick={onViewAll} className="axs-ref-gold-button mt-4 w-full justify-center">View All Activity</button></div>;
}

function MiniMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="axs-mini-metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function EpisodeCard({ beat, characters, onOpen, onGenerate }: { beat: StoryBeat; characters: UniverseCharacterMemory[]; onOpen: () => void; onGenerate: () => void }) {
  const meta = STATUS_META[beat.status];
  const required = beat.requiredCharacterIds.map((id) => characters.find((character) => character.id === id)?.name).filter(Boolean).join(", ");
  return (
    <div className="axs-season-tile text-left">
      <div className="flex items-start justify-between gap-3">
        <span className="text-2xl font-semibold text-white">{String(beat.episodeNumber).padStart(2, "0")}</span>
        <span className={meta.className}>{meta.label}</span>
      </div>
      <h3 className="mt-4 text-sm font-black text-white">{beat.title}</h3>
      <p className="mt-2 text-xs text-muted">{beat.conflict}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
        <span><CalendarClock className="inline size-3.5" /> May {18 + beat.episodeNumber}, 2026</span>
        <span><UsersRound className="inline size-3.5" /> {required || "Characters TBD"}</span>
      </div>
      <div className="mt-4 h-px bg-[linear-gradient(90deg,var(--axs-teal),transparent)]" />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">Continuity</span>
        <span className="text-xs font-mono text-[var(--axs-teal)]">{beat.continuityScore}%</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--axs-teal),var(--axs-green))]" style={{ width: `${beat.continuityScore}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
      <Button type="button" onClick={onOpen} className="axs-ref-dark-button h-9 justify-center text-xs">
        View Details
      </Button>
      <Button type="button" onClick={onGenerate} className="axs-ref-gold-button h-9 justify-center text-xs">
        Generate
      </Button>
      </div>
    </div>
  );
}

function CharacterGraph({ characters, relationships }: { characters: UniverseCharacterMemory[]; relationships: UniverseRelationship[] }) {
  const graphCharacters = characters.slice(0, 7);
  return <div className="axs-graph-stage"><svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">{GRAPH_POINTS.slice(0, graphCharacters.length).map((from, index) => GRAPH_POINTS.slice(index + 1, graphCharacters.length).map((to, toIndex) => <line key={`${index}-${toIndex}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={toIndex % 2 ? "rgba(124,58,237,0.46)" : "rgba(0,212,255,0.42)"} strokeWidth="0.35" />))}</svg>{graphCharacters.map((character, index) => { const point = GRAPH_POINTS[index] ?? GRAPH_POINTS[0]; return <div key={character.id} className={cn("axs-graph-node", `tone-${point.tone}`)} style={{ left: `${point.x}%`, top: `${point.y}%` }}><span>{initials(character.name)}</span><strong>{character.name}</strong><small>{character.role}</small></div>; })}<div className="absolute bottom-4 left-4 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-[0.12em] text-muted"><span>+ Strong Alliance</span><span>+ Alliance</span><span>+ Conflict</span><span>+ Influence</span><span>+ Unknown</span></div><span className="absolute right-4 top-4 rounded-full border border-white/10 px-3 py-1 text-xs text-muted">{relationships.length} links</span></div>;
}

function GraphInsights({ relationships }: { relationships: UniverseRelationship[] }) {
  return <aside className="axs-graph-insights"><div className="axs-reference-kicker">Graph Insights</div>{[["3 key conflicts", "Driving the narrative", AlertTriangle], ["2 alliance shifts", "Detected this season", Network], ["1 new connection", "Revealed in Episode 5", CheckCircle2], ["Network density", `${relationships.length} active links`, Sparkles]].map(([label, detail, Icon]) => <div key={String(label)} className="axs-insight-row"><Icon className="size-4" /><div><strong>{String(label)}</strong><span>{String(detail)}</span></div></div>)}<button type="button" onClick={() => toast.success("Relationship analysis updated", { description: `${relationships.length} links scanned for conflicts, alliances, and continuity drift.` })} className="axs-ref-gold-button mt-4 w-full justify-center">Analyze More</button></aside>;
}

function BibleColumn({ title, items, action, onAction }: { title: string; items: string[]; action: string; onAction: () => void }) {
  return <div className="axs-bible-column"><div className="axs-reference-kicker">{title}</div><div className="mt-4 space-y-3">{items.map((item) => <button type="button" onClick={() => toast.success(`${item} opened`, { description: "Codex detail drawer is running in local demo mode." })} className="block w-full text-left" key={item}><strong>{item}</strong><p>{biblePreview(item)}</p></button>)}</div><button type="button" onClick={onAction} className="axs-ref-gold-button mt-4 w-full justify-center">{action}</button></div>;
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function slug(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "_").slice(0, 13);
}

function biblePreview(value: string) {
  return value.length > 55 ? `${value.slice(0, 55)}...` : "The known record remains active in the universe bible.";
}
