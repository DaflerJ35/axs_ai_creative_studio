import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  Clapperboard,
  Dna,
  FileText,
  GripVertical,
  ListChecks,
  Pencil,
  Play,
  Plus,
  Send,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUniverseForgeStore } from "../store/useUniverseForgeStore";
import type { StoryBeat } from "../types/universe-forge.types";
import { UniverseHandoffActions } from "./UniverseHandoffActions";

const STATUS_LABELS: Record<StoryBeat["status"], string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  generated: "Generated",
  polished: "Polished",
};

const STATUS_STYLES: Record<StoryBeat["status"], string> = {
  "not-started": "border-white/10 bg-white/[0.035] text-white/44",
  "in-progress": "border-amber-200/20 bg-amber-300/[0.08] text-amber-50/78",
  generated: "border-cyan-200/20 bg-cyan-300/[0.08] text-cyan-50/78",
  polished: "border-violet-200/24 bg-violet-300/[0.10] text-violet-50/82",
};

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function EpisodeField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/34">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-24 w-full resize-none rounded-2xl border border-white/[0.08] bg-black/24 px-3 py-2 text-sm leading-6 text-white/68 outline-none transition focus:border-cyan-200/35 focus:bg-black/34"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/[0.08] bg-black/24 px-3 py-2 text-sm font-bold text-white/76 outline-none transition focus:border-cyan-200/35 focus:bg-black/34"
        />
      )}
    </label>
  );
}

function EpisodeCard({
  beat,
  index,
  total,
  characterNames,
  onUpdate,
  onMove,
  onExpand,
  onGenerate,
  onPolish,
  onDelete,
}: {
  key?: string;
  beat: StoryBeat;
  index: number;
  total: number;
  characterNames: Record<string, string>;
  onUpdate: (patch: Partial<StoryBeat>) => void;
  onMove: (direction: "up" | "down") => void;
  onExpand: () => void;
  onGenerate: () => void;
  onPolish: () => void;
  onDelete: () => void;
}) {
  const requiredNames = beat.requiredCharacterIds.map((id) => characterNames[id] ?? id);
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({ id: beat.id });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: beat.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 40 : undefined,
  };

  return (
    <article
      ref={(node) => {
        setDragRef(node);
        setDropRef(node);
      }}
      style={style}
      className={cn(
        "axs-episode-card group relative overflow-hidden rounded-[16px] border border-[rgba(212,160,23,0.22)] bg-[rgba(15,15,26,0.72)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_80px_rgba(0,0,0,0.42),0_0_40px_rgba(0,212,255,0.035)] backdrop-blur-3xl transition before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[rgba(212,160,23,0.62)] before:to-transparent",
        isDragging && "scale-[0.985] opacity-80 shadow-[0_0_80px_rgba(0,212,255,0.18)]",
        isOver && !isDragging && "border-cyan-200/40 bg-cyan-300/[0.055]"
      )}
    >
      <div className="relative grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="axs-episode-frame relative min-h-[260px] overflow-hidden rounded-[14px] border border-[rgba(212,160,23,0.20)] bg-black/38 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_24px_90px_rgba(0,0,0,0.36)]">
          <div className="absolute inset-0" style={{ background: beat.lastFrameThumbnail }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent,rgba(0,0,0,0.72)_70%)]" />
          <button
            type="button"
            {...listeners}
            {...attributes}
            className="absolute left-4 top-4 flex size-10 cursor-grab items-center justify-center rounded-full border border-white/14 bg-black/38 text-white/66 backdrop-blur-xl transition hover:bg-white/14 hover:text-white active:cursor-grabbing"
            aria-label="Drag episode"
          >
            <GripVertical className="size-4" />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="rounded-[24px] border border-white/12 bg-black/48 p-4 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-50/54">
                Last Generated Frame
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-4xl font-black text-white">{beat.continuityScore}%</span>
                <span className="text-[11px] font-black text-white/42">continuity</span>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 py-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100/46">
                  <Clapperboard className="size-3.5" />
                  Episode {beat.episodeNumber.toString().padStart(2, "0")}
                </div>
                <span className={cn("rounded-full border px-3 py-1 text-[11px] font-black", STATUS_STYLES[beat.status])}>
                  {STATUS_LABELS[beat.status]}
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-white">{beat.title}</h3>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/56">{beat.emotionalShift}</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onMove("up")}
                disabled={index === 0}
                className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/54 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-30"
                aria-label="Move episode up"
              >
                <ArrowUp className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onMove("down")}
                disabled={index === total - 1}
                className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white/54 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-30"
                aria-label="Move episode down"
              >
                <ArrowDown className="size-3.5" />
              </button>
              <Button
                type="button"
                size="sm"
                onClick={onExpand}
                className="rounded-full bg-white/[0.08] px-3 text-xs font-black text-white hover:bg-cyan-100 hover:text-black"
              >
                <Plus className="size-3.5" />
                Expand
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={onGenerate}
              className="rounded-full bg-cyan-100 px-4 text-xs font-black text-black hover:bg-white"
            >
              <Sparkles className="size-3.5" />
              Generate
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onExpand}
              className="rounded-full border border-white/12 bg-white/[0.07] px-4 text-xs font-black text-white hover:bg-white hover:text-black"
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onPolish}
              className="rounded-full bg-violet-200 px-4 text-xs font-black text-black shadow-[0_0_28px_rgba(168,85,247,0.22)] hover:bg-white"
            >
              <Play className="size-3.5" />
              Director's Cut
            </Button>
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 rounded-full border border-rose-200/15 bg-rose-300/[0.06] px-4 py-2 text-xs font-black text-rose-100/68 transition hover:bg-rose-300/[0.12] hover:text-rose-50"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>

          <div className="mt-5 grid gap-3 2xl:grid-cols-2">
            <EpisodeField label="Title" value={beat.title} onChange={(title) => onUpdate({ title })} />
            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/34">Status</span>
              <select
                value={beat.status}
                onChange={(event) => onUpdate({ status: event.target.value as StoryBeat["status"] })}
                className="w-full rounded-2xl border border-white/[0.08] bg-black/24 px-3 py-2 text-sm font-bold text-white/76 outline-none transition focus:border-cyan-200/35 focus:bg-black/34"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <EpisodeField
              label="Key Emotional Beat"
              value={beat.emotionalShift}
              onChange={(emotionalShift) => onUpdate({ emotionalShift })}
            />
            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/34">Continuity Score</span>
              <input
                type="number"
                min={0}
                max={100}
                value={beat.continuityScore}
                onChange={(event) => onUpdate({ continuityScore: Number(event.target.value) })}
                className="w-full rounded-2xl border border-white/[0.08] bg-black/24 px-3 py-2 text-sm font-bold text-white/76 outline-none transition focus:border-cyan-200/35 focus:bg-black/34"
              />
            </label>
            <EpisodeField label="Conflict" value={beat.conflict} onChange={(conflict) => onUpdate({ conflict })} multiline />
            <EpisodeField
              label="Continuity Notes"
              value={beat.continuityNotes}
              onChange={(continuityNotes) => onUpdate({ continuityNotes })}
              multiline
            />
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
            <EpisodeField
              label="Key Scenes"
              value={beat.keyScenes.join("\n")}
              onChange={(value) => onUpdate({ keyScenes: splitLines(value) })}
              multiline
            />

            <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/34">
                <Dna className="size-3.5" />
                Required Characters
              </div>
              <div className="flex flex-wrap gap-2">
                {requiredNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-cyan-200/20 bg-cyan-300/[0.08] px-3 py-1 text-xs font-black text-cyan-50/78"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {beat.expandedPrompt && (
            <div className="mt-4 rounded-2xl border border-violet-200/15 bg-violet-300/[0.06] p-3">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-violet-100/58">
                <FileText className="size-3.5" />
                Director Expansion
              </div>
              <p className="whitespace-pre-line text-xs leading-6 text-white/58">{beat.expandedPrompt}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function StoryArcPlanner() {
  const storyConcept = useUniverseForgeStore((state) => state.storyConcept);
  const storyBeats = useUniverseForgeStore((state) => state.storyBeats);
  const characters = useUniverseForgeStore((state) => state.characters);
  const generationStatus = useUniverseForgeStore((state) => state.generationStatus);
  const generationProgress = useUniverseForgeStore((state) => state.generationProgress);
  const seriesShots = useUniverseForgeStore((state) => state.seriesShots);
  const setStoryConcept = useUniverseForgeStore((state) => state.setStoryConcept);
  const generateStoryArc = useUniverseForgeStore((state) => state.generateStoryArc);
  const generateSeries = useUniverseForgeStore((state) => state.generateSeries);
  const updateStoryBeat = useUniverseForgeStore((state) => state.updateStoryBeat);
  const moveStoryBeat = useUniverseForgeStore((state) => state.moveStoryBeat);
  const reorderStoryBeat = useUniverseForgeStore((state) => state.reorderStoryBeat);
  const expandStoryBeat = useUniverseForgeStore((state) => state.expandStoryBeat);
  const generateEpisode = useUniverseForgeStore((state) => state.generateEpisode);
  const polishEpisode = useUniverseForgeStore((state) => state.polishEpisode);
  const deleteStoryBeat = useUniverseForgeStore((state) => state.deleteStoryBeat);
  const characterNames = Object.fromEntries(characters.map((character) => [character.id, character.name]));

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over) return;
    reorderStoryBeat(String(event.active.id), String(event.over.id));
  };

  return (
    <section id="arcs" className="axs-universe-lower axs-season-board relative overflow-hidden rounded-[16px] border border-[rgba(212,160,23,0.24)] bg-[rgba(15,15,26,0.68)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_34px_120px_rgba(0,0,0,0.46),0_0_70px_rgba(124,58,237,0.06)] backdrop-blur-3xl before:pointer-events-none before:absolute before:inset-x-12 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[rgba(212,160,23,0.64)] before:to-transparent">
      <div className="pointer-events-none absolute -right-24 top-10 size-80 rounded-full bg-cyan-300/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-1/3 size-96 rounded-full bg-violet-400/[0.07] blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-violet-100/54">
            <WandSparkles className="size-4" />
            AI Showrunner Season Board
          </div>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Season command board</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/52">
            Drag episodes to reshape the season, polish emotional continuity, and launch the whole arc into Scene Builder or Director's Cut.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UniverseHandoffActions compact />
          <Button
            type="button"
            onClick={generateStoryArc}
            className="rounded-full bg-cyan-100 px-5 text-sm font-black text-black hover:bg-white"
          >
            <Sparkles className="size-4" />
            Generate Arc
          </Button>
          <Button
            type="button"
            onClick={generateSeries}
            className="rounded-full bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-300 px-7 text-sm font-black text-black shadow-[0_0_48px_rgba(0,212,255,0.22)] hover:brightness-110"
          >
            <Play className="size-4" />
            Generate Full Season
          </Button>
        </div>
      </div>

      <div className="relative mt-5 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/34">
            High-Level Concept
          </span>
          <textarea
            value={storyConcept}
            onChange={(event) => setStoryConcept(event.target.value)}
            className="min-h-40 w-full resize-none rounded-[30px] border border-white/[0.12] bg-black/28 px-5 py-4 text-base leading-8 text-white/74 outline-none transition focus:border-cyan-200/35 focus:bg-black/36"
            placeholder="Elli's journey from heartbroken to confident fitness influencer..."
          />
        </label>

        <div className="rounded-[30px] border border-white/[0.10] bg-black/26 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/36">
            <ListChecks className="size-3.5" />
            Arc Intelligence
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/42">Episodes</span>
              <span className="font-black text-white">{storyBeats.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/42">Queued shots</span>
              <span className="font-black text-white">{seriesShots.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/42">DNA locks</span>
              <span className="font-black text-cyan-100">{characters.length}</span>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={cn("h-full rounded-full transition-all duration-500", generationProgress >= 100 ? "bg-violet-200" : "bg-cyan-200")}
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          <div className="mt-2 text-xs font-bold leading-5 text-white/42">{generationStatus}</div>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="relative mt-5 grid gap-4">
          {storyBeats.length === 0 && (
            <div className="rounded-[28px] border border-white/[0.10] bg-black/24 p-10 text-center">
              <WandSparkles className="mx-auto size-8 text-cyan-100/50" />
              <h3 className="mt-3 text-xl font-black text-white">Start with a high-level universe concept</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/44">
                Write the transformation, conflict, and desired tone. Universe Forge will turn it into an editable multi-episode season board with continuity locks.
              </p>
            </div>
          )}
          {storyBeats.map((beat, index) => (
            <EpisodeCard
              key={beat.id}
              beat={beat}
              index={index}
              total={storyBeats.length}
              characterNames={characterNames}
              onUpdate={(patch) => updateStoryBeat(beat.id, patch)}
              onMove={(direction) => moveStoryBeat(beat.id, direction)}
              onExpand={() => expandStoryBeat(beat.id)}
              onGenerate={() => generateEpisode(beat.id)}
              onPolish={() => polishEpisode(beat.id)}
              onDelete={() => deleteStoryBeat(beat.id)}
            />
          ))}
        </div>
      </DndContext>
    </section>
  );
}
