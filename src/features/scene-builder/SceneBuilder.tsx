import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { useState } from "react";
import { CanvasArea } from "./components/CanvasArea";
import { DirectorInspectorPanel } from "./components/DirectorInspectorPanel";
import { LegalGateModal } from "./components/LegalGateModal";
import { StudioControlPanel } from "./components/StudioControlPanel";
import { TimelineStrip } from "./components/TimelineStrip";
import { TopProjectBar } from "./components/TopProjectBar";
import { UploadModal } from "./components/UploadModal";
import { useSceneBuilderStore } from "./store/useSceneBuilderStore";
import type { SceneLibraryItem, StudioMode } from "./types/scene-builder.types";
import { WorkflowAutoLoader, WorkflowManagerPanel } from "../workflow-manager/components/WorkflowManagerPanel";
import { ArrowDownRight, Camera, Film, MoveRight, Sparkles } from "lucide-react";

type ActiveDragData =
  | { kind: "library-item"; item: SceneLibraryItem }
  | { kind: "canvas-item"; item: { instanceId: string; name: string; thumbnail: string; accent: string } };

export function SceneBuilder() {
  const addItemToCanvas = useSceneBuilderStore((state) => state.addItemToCanvas);
  const moveItem = useSceneBuilderStore((state) => state.moveItem);
  const studioMode = useSceneBuilderStore((state) => state.studioMode);
  const nsfwGateAccepted = useSceneBuilderStore((state) => state.nsfwGateAccepted);
  const uploadModalOpen = useSceneBuilderStore((state) => state.uploadModalOpen);
  const advanced = useSceneBuilderStore((state) => state.advanced);
  const aiDirectorActive = useSceneBuilderStore((state) => state.aiDirectorActive);
  const directorsCutActive = useSceneBuilderStore((state) => state.directorsCutActive);
  const selectedItemId = useSceneBuilderStore((state) => state.selectedItemId);
  const setStudioMode = useSceneBuilderStore((state) => state.setStudioMode);
  const confirmNsfwGate = useSceneBuilderStore((state) => state.confirmNsfwGate);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeDrag, setActiveDrag] = useState<ActiveDragData | null>(null);
  const [showLegalGate, setShowLegalGate] = useState(false);
  const showInspector = aiDirectorActive || directorsCutActive || Boolean(selectedItemId);

  const requestStudioMode = (mode: StudioMode) => {
    if (mode === "nsfw" && !nsfwGateAccepted) {
      setShowLegalGate(true);
      return;
    }

    setStudioMode(mode);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDrag((event.active.data.current as ActiveDragData | undefined) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const dragData = event.active.data.current as ActiveDragData | undefined;
    setActiveDrag(null);

    if (!dragData) return;

    if (dragData.kind === "library-item" && event.over?.id === "scene-canvas") {
      addItemToCanvas(dragData.item);
      return;
    }

    if (dragData.kind === "canvas-item") {
      moveItem(dragData.item.instanceId, event.delta);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className={`flex-1 min-h-[600px] overflow-hidden text-white transition-colors duration-500 ${
          studioMode === "nsfw" ? "bg-[#0A0718]" : "bg-[#111112]"
        }`}
      >
        {studioMode === "nsfw" && (
          <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_80%_5%,rgba(168,85,247,0.20),transparent_28%),radial-gradient(circle_at_28%_18%,rgba(192,38,211,0.16),transparent_26%),linear-gradient(180deg,#0A0718,#07050F)]" />
        )}
        <div className={`grid h-full grid-cols-1 transition-[grid-template-columns] duration-500 lg:grid-cols-[minmax(320px,26%)_minmax(0,1fr)] ${showInspector ? "xl:grid-cols-[minmax(360px,24%)_minmax(0,1fr)_280px]" : "xl:grid-cols-[minmax(360px,24%)_minmax(0,1fr)]"}`}>
          <StudioControlPanel />

          <div
            className={`relative z-10 flex min-h-0 min-w-0 flex-col border-l ${
              studioMode === "nsfw" ? "border-fuchsia-200/10 bg-[#0A0718]/70" : "border-white/[0.055] bg-[#111112]"
            }`}
          >
            <WorkflowAutoLoader model={advanced.model} />
            <TopProjectBar onRequestStudioMode={requestStudioMode} />
            <WorkflowManagerPanel nsfw={studioMode === "nsfw"} />
            <StoryboardDirectorBar />
            <CanvasArea />
            <TimelineStrip />
          </div>

          {showInspector && <DirectorInspectorPanel />}
        </div>
      </div>

      <DragOverlay>
        {activeDrag ? (
          <div className="rounded-2xl border border-white/15 bg-[#111113]/95 px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-black text-black ${activeDrag.item.accent}`}>
                {activeDrag.item.thumbnail}
              </div>
              <div>
                <div className="text-sm font-black text-white">{activeDrag.item.name}</div>
                <div className="text-xs text-white/45">Drop to compose</div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
      {showLegalGate && (
        <LegalGateModal
          onCancel={() => setShowLegalGate(false)}
          onConfirm={() => {
            confirmNsfwGate();
            setStudioMode("nsfw");
            setShowLegalGate(false);
          }}
        />
      )}
      {uploadModalOpen && <UploadModal />}
    </DndContext>
  );
}

function StoryboardDirectorBar() {
  const [activeBeat, setActiveBeat] = useState(0);
  const [atmosphere, setAtmosphere] = useState(68);
  const beats = [
    { label: "Wide", note: "Establish world", motion: "slow drift", Icon: Film },
    { label: "Close", note: "Emotion lock", motion: "micro push", Icon: Camera },
    { label: "Dolly", note: "Character reveal", motion: "left to right", Icon: MoveRight },
    { label: "Transition", note: "Match cut", motion: "light wipe", Icon: ArrowDownRight },
  ];

  return (
    <div className="relative z-10 border-b border-white/[0.055] bg-black/18 px-6 py-3 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-2xl border border-cyan-200/16 bg-cyan-200/10 text-cyan-100">
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-white/34">Directorial Storyboard</div>
            <div className="text-sm font-black text-white">Beat-based framing, motion, and continuity cues</div>
          </div>
        </div>
        <div className="hidden min-w-[220px] items-center gap-3 2xl:flex">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">Atmosphere</span>
          <input
            aria-label="Atmosphere intensity"
            type="range"
            min={0}
            max={100}
            value={atmosphere}
            onChange={(event) => setAtmosphere(Number(event.target.value))}
            className="h-1.5 w-32 accent-cyan-200"
          />
          <span className="w-8 text-xs font-black text-cyan-100">{atmosphere}%</span>
        </div>
      </div>
      <div className="mt-3 hidden items-center gap-2 xl:flex">
        {beats.map(({ label, note, motion, Icon }, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveBeat(index)}
            className={`group flex min-w-[150px] items-center gap-2 rounded-2xl border px-3 py-2 text-left transition ${
              activeBeat === index ? "border-cyan-200/28 bg-cyan-200/[0.10] shadow-[0_0_30px_rgba(0,212,255,0.10)]" : "border-white/[0.08] bg-white/[0.035] hover:border-cyan-200/20 hover:bg-cyan-200/[0.07]"
            }`}
          >
            <Icon className="size-4 text-cyan-100/60 transition group-hover:text-cyan-100" />
            <span>
              <span className="block text-xs font-black text-white/70">{label}</span>
              <span className="block text-[10px] font-bold text-white/32">{note}</span>
            </span>
            <span className="ml-auto rounded-full border border-white/8 bg-black/24 px-2 py-1 text-[10px] font-black text-white/36">
              {motion}
            </span>
          </button>
        ))}
        <div className="ml-auto hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 2xl:block">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30">Narrative note</div>
          <div className="mt-1 text-xs font-bold text-white/54">
            Carry lighting, lens, and DNA from beat {activeBeat + 1} into the next shot.
          </div>
        </div>
      </div>
    </div>
  );
}
