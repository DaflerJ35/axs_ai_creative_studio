import {
  BookOpen,
  Clapperboard,
  Dna,
  Eye,
  EyeOff,
  Fingerprint,
  FileText,
  GripVertical,
  Globe2,
  Maximize2,
  Minimize2,
  Mic2,
  Moon,
  Network,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { motion, useDragControls } from "motion/react";
import { toast } from "sonner";
import type { AxsContentRating, AxsWorkflowMode, ForgeTab } from "../../lib/types";
import type { AxsProofCategorySummary, AxsProofSignal, AxsProofStatus } from "../../lib/proofLayer";
import { useAxsProofSummary } from "../../lib/useAxsProofSummary";
import { useActiveCharacter, useAxsStore } from "../../store/useAxsStore";
import { useUniverseForgeStore } from "../../features/universe-forge/store/useUniverseForgeStore";
import { ProofDetailsDrawer } from "./ProofDetailsDrawer";

const modes: Array<{ id: AxsWorkflowMode; label: string; Icon: typeof Sparkles }> = [
  { id: "worldbuilding", label: "Worldbuild", Icon: Network },
  { id: "directing", label: "Direct", Icon: Clapperboard },
  { id: "distribution", label: "Launch", Icon: Globe2 },
  { id: "reading", label: "Read", Icon: BookOpen },
];

const ratings: AxsContentRating[] = ["PG", "PG-13", "R", "X", "XXX"];

export function AXSContextRail({
  isOpen,
  isDrawer,
  isMinimized,
  offset,
  onClose,
  onMinimizedChange,
  onOffsetChange,
}: {
  isOpen: boolean;
  isDrawer: boolean;
  isMinimized: boolean;
  offset: { x: number; y: number };
  onClose: () => void;
  onMinimizedChange: (minimized: boolean) => void;
  onOffsetChange: (offset: { x: number; y: number }) => void;
}) {
  const [proofOpen, setProofOpen] = useState(false);
  const dragControls = useDragControls();
  const {
    activeTab,
    brandVoice,
    workflowMode,
    setWorkflowMode,
    contentRating,
    setContentRating,
    readingMode,
    toggleReadingMode,
    setActiveTab,
  } = useAxsStore();
  const proof = useAxsProofSummary();
  const activeCharacter = useActiveCharacter();
  const bible = useUniverseForgeStore((state) => state.bible);
  const runContinuityAudit = useUniverseForgeStore((state) => state.runContinuityAudit);
  const universeCharacters = useUniverseForgeStore((state) => state.characters);
  const selectedUniverseCharacterId = useUniverseForgeStore((state) => state.selectedCharacterId);
  const selectedUniverseCharacter = universeCharacters.find((character) => character.id === selectedUniverseCharacterId);
  const characterName = activeCharacter?.name ?? selectedUniverseCharacter?.name ?? "No DNA locked";
  const isUniverse = activeTab === "universe";
  const isCommandDeck = activeTab === "studio";
  const primaryIssues = proof.signals.filter((signal) => signal.status !== "ready");
  const handleProofAction = (signal: AxsProofSignal) => {
    try {
      switch (signal.action?.intent) {
        case "run-continuity-audit":
          runContinuityAudit();
          setActiveTab("universe");
          toast.success("Continuity audit complete", {
            description: "Production Memory recalculated wardrobe, emotion, timeline, and event proof.",
          });
          break;
        case "open-settings":
          setActiveTab("config");
          break;
        case "open-dna-lock":
          setActiveTab("dna");
          break;
        case "open-brand-training":
          setActiveTab("creator");
          break;
        case "prepare-distribution":
          setActiveTab("distribute");
          break;
        case "navigate":
        default:
          if (signal.action?.targetTab) setActiveTab(signal.action.targetTab);
          break;
      }
      setProofOpen(false);
    } catch (error) {
      toast.error("Proof action failed", {
        description: error instanceof Error ? error.message : "The drawer stayed open so you can try again.",
      });
    }
  };

  if (!isOpen) return null;

  const panelWidth = isMinimized ? 260 : 330;
  const shouldDrag = !isDrawer;
  const topValue = isDrawer ? "var(--axs-topbar-height)" : "88px";
  const rightValue = isDrawer ? "0" : "16px";

  return (
    <>
      {isDrawer ? (
        <motion.div
          className="fixed inset-0 z-30 bg-black/55 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      ) : null}

      <motion.aside
        drag={shouldDrag}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          if (!shouldDrag) return;
          onOffsetChange({ x: offset.x + info.offset.x, y: offset.y + info.offset.y });
        }}
        animate={{ x: offset.x, y: offset.y }}
        initial={false}
        whileDrag={shouldDrag ? { scale: 1.01 } : undefined}
        className={`fixed z-40 select-none ${isDrawer ? "top-0 right-0" : "top-[88px] right-4"} ${isDrawer ? "h-[calc(100vh-var(--axs-topbar-height))] w-full max-w-[420px]" : "h-auto"}`}
        style={{ top: topValue, right: rightValue, width: isDrawer ? undefined : `${panelWidth}px` }}
      >
        <motion.div
          layout
          className={`axs-panel rounded-2xl border-white/10 bg-[#05070a]/82 shadow-[0_24px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-3xl ${isMinimized ? "p-3" : "p-4"}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40">Production Memory</p>
            </div>
            <div className="flex items-center gap-2">
              {isDrawer ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/40 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close Production Memory"
                >
                  <X className="size-3" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onMinimizedChange(!isMinimized)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/40 transition hover:bg-white/10 hover:text-white"
                aria-label={isMinimized ? "Expand Production Memory" : "Minimize Production Memory"}
              >
                {isMinimized ? <Maximize2 className="size-3" /> : <Minimize2 className="size-3" />}
              </button>
            </div>
          </div>

          {isMinimized ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2"
            >
              <button type="button" onClick={() => setProofOpen(true)} className="flex w-full items-center justify-between gap-3 text-left">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-white/80">{bible.title}</p>
                </div>
                <ProofScore score={proof.overallScore} status={proof.status} compact />
              </button>
            </motion.div>
          ) : isCommandDeck ? (
            <CommandDeckMemoryRailContent
              score={proof.overallScore}
              status={proof.status}
              onOptimize={() => setProofOpen(true)}
              onNavigate={setActiveTab}
            />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="contents">
              <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Memory Proof</p>
                    <p className="mt-1 text-xs font-bold text-white/70">
                      {primaryIssues.length > 0 ? `${primaryIssues.length} items to verify` : "Clean"}
                    </p>
                  </div>
                  <div className="relative">
                    <ProofScore score={proof.overallScore} status={proof.status} />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {Object.values(proof.categories).map((category) => (
                    <ProofCategoryChip key={category.category} category={category} />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setProofOpen(true)}
                  className="mt-4 flex w-full items-center justify-center rounded-lg border border-white/10 bg-white/5 py-2 text-[10px] font-bold text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  View Details
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <ContextCard
                  icon={Network}
                  label="Universe"
                  value={bible.title}
                  tone={isUniverse ? "primary" : "default"}
                />
                <ContextCard icon={Dna} label="DNA" value={characterName} />
              </div>

              <div className="mt-4 rounded-xl border border-white/5 bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Workflow</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {modes.map(({ id, label, Icon }) => {
                    const active = workflowMode === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setWorkflowMode(id)}
                        className={`relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[10px] font-bold transition ${
                          active ? "text-white" : "text-white/30 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {active ? (
                          <motion.div
                            layoutId="axs-workflow-mode"
                            className="absolute inset-0 rounded-lg bg-white/10"
                          />
                        ) : null}
                        <Icon className="relative size-3" />
                        <span className="relative">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={toggleReadingMode}
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
              >
                <span>
                  <span className="block text-xs font-bold text-white/80">Reading Mode</span>
                </span>
                {readingMode ? <Eye className="size-3.5 text-cyan-400/70" /> : <EyeOff className="size-3.5 text-white/20" />}
              </button>
            </motion.div>
          )}
        </motion.div>
        {proofOpen ? (
          <ProofDetailsDrawer
            signals={proof.signals}
            onClose={() => setProofOpen(false)}
            onAction={handleProofAction}
          />
        ) : null}
      </motion.aside>
    </>
  );
}

function CommandDeckMemoryRailContent({
  score,
  status,
  onOptimize,
  onNavigate,
}: {
  score: number;
  status: AxsProofStatus;
  onOptimize: () => void;
  onNavigate: (tab: ForgeTab) => void;
}) {
  const label = score >= 90 ? "Exceptional" : score >= 70 ? "High Consistency" : "Needs Attention";
  const ingredients = [
    { label: "Characters", value: "142", Icon: Dna },
    { label: "Locations", value: "68", Icon: Network },
    { label: "Lore & Rules", value: "312", Icon: BookOpen },
    { label: "Voice Profiles", value: "6", Icon: Mic2 },
    { label: "Visual Styles", value: "24", Icon: Sparkles },
  ];
  const outputs = [
    { title: "Scene 04 - City Overlook", kind: "Video", age: "2m ago", tone: "cyan" },
    { title: "Character - Nova Flux", kind: "Image", age: "15m ago", tone: "cyan" },
    { title: "Campaign - Teaser Hook", kind: "Script", age: "1h ago", tone: "violet" },
    { title: "Lore Update - District 9", kind: "Doc", age: "2h ago", tone: "violet" },
  ];
  const actions = [
    { label: "New Universe", detail: "Start a new universe", Icon: Network, tab: "universe" as const },
    { label: "Run Script", detail: "Generate from prompt", Icon: FileText, tab: "scripts" as const },
    { label: "Sync Platforms", detail: "Push to all connected", Icon: Globe2, tab: "distribute" as const },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="contents">
      <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex size-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <ProofScore score={score} status={status} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Memory Score</p>
            <p className="mt-1 text-2xl font-bold leading-none text-white">{score}%</p>
            <p className="mt-1 text-[11px] font-bold text-white/50">{label}</p>
            <button
              type="button"
              onClick={onOptimize}
              className="mt-3 rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Optimize
            </button>
          </div>
        </div>
      </div>

      <RailSection title="Ingredients">
        {ingredients.map(({ label: itemLabel, value, Icon }) => (
          <div key={itemLabel} className="flex items-center justify-between gap-3 text-[11px]">
            <span className="flex items-center gap-2.5 text-white/50">
              <Icon className="size-3.5 text-white/30" />
              {itemLabel}
            </span>
            <span className="font-mono text-white/70">{value}</span>
          </div>
        ))}
      </RailSection>

      <RailSection title="Recent Outputs">
        {outputs.map((output, index) => (
          <div key={output.title} className="flex items-center gap-3">
            <div className={`h-10 w-12 shrink-0 rounded border border-white/5 bg-white/5`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold text-white/70">{output.title}</p>
              <div className="mt-0.5 flex items-center gap-2 text-[9px] text-white/30">
                <span className={`rounded border border-white/10 px-1 py-0.5 text-[8px] font-black uppercase`}>
                  {output.kind}
                </span>
                {output.age}
              </div>
            </div>
          </div>
        ))}
      </RailSection>

      <RailSection title="Actions">
        {actions.map(({ label: actionLabel, detail, Icon, tab }) => (
          <button
            key={actionLabel}
            type="button"
            onClick={() => onNavigate(tab)}
            className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition hover:bg-white/5"
          >
            <span className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <Icon className="size-3.5 text-white/40" />
            </span>
            <span>
              <span className="block text-[11px] font-bold text-white/80">{actionLabel}</span>
              <span className="mt-0.5 block text-[10px] text-white/30">{detail}</span>
            </span>
          </button>
        ))}
      </RailSection>
    </motion.div>
  );
}

function RailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">{title}</p>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function ProofScore({ score, status, compact = false }: { score: number; status: AxsProofStatus; compact?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border font-black ${
        compact ? "size-10 text-[10px]" : "size-12 text-sm"
      } ${proofTone(status, "score")}`}
      title={`AXS Proof Score: ${score}%`}
    >
      {score}
    </div>
  );
}

function ProofCategoryChip({ category }: { category: AxsProofCategorySummary }) {
  return (
    <div className={`rounded-xl border px-3 py-1.5 ${proofTone(category.status, "chip")}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[9px] font-black uppercase tracking-[0.08em]">{category.label}</span>
        <span className="text-[9px] font-bold">{category.score}%</span>
      </div>
    </div>
  );
}

function proofTone(status: AxsProofStatus, surface: "score" | "chip") {
  if (status === "ready") {
    return surface === "score"
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-400"
      : "border-cyan-400/10 bg-cyan-400/5 text-cyan-400/70";
  }
  if (status === "watch") {
    return surface === "score"
      ? "border-amber-400/20 bg-amber-400/10 text-amber-400"
      : "border-amber-400/10 bg-amber-400/5 text-amber-400/70";
  }
  return surface === "score"
    ? "border-rose-400/20 bg-rose-400/10 text-rose-400"
    : "border-rose-400/10 bg-rose-400/5 text-rose-400/70";
}

function ContextCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  tone?: "default" | "primary";
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        tone === "primary"
          ? "border-cyan-400/10 bg-cyan-400/5"
          : "border-white/5 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <Icon className="size-3 text-white/40" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/30">{label}</p>
          <p className="mt-0.5 truncate text-[11px] font-bold text-white/70">{value}</p>
        </div>
      </div>
    </div>
  );
}
