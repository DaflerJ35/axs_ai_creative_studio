import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSceneBuilderStore } from "../store/useSceneBuilderStore";
import type { SceneCanvasItem } from "../types/scene-builder.types";

function CanvasItemNode({ item }: { item: SceneCanvasItem; key?: string }) {
  const selectedItemId = useSceneBuilderStore((state) => state.selectedItemId);
  const selectItem = useSceneBuilderStore((state) => state.selectItem);
  const isSelected = selectedItemId === item.instanceId;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.instanceId,
    data: { kind: "canvas-item", item },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        selectItem(item.instanceId);
      }}
      className={cn(
        "absolute flex select-none flex-col items-center justify-center rounded-2xl border backdrop-blur-xl transition",
        item.type === "environment" ? "h-40 w-64 bg-[#141416]/90" : "h-32 w-28 bg-[#111113]/88",
        isSelected ? "border-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.28),0_22px_70px_rgba(0,0,0,0.48)]" : "border-white/12 shadow-[0_20px_55px_rgba(0,0,0,0.34)] hover:border-white/28",
        isDragging && "cursor-grabbing opacity-85"
      )}
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        zIndex: item.layer,
        transform: `translate(-50%, -50%) translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0) rotate(${item.rotation}deg) scale(${item.scale})`,
      }}
      {...listeners}
      {...attributes}
    >
      <div className={cn("flex size-14 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black text-black", item.accent)}>
        {item.thumbnail}
      </div>
      <div className="mt-3 max-w-[84%] truncate text-xs font-black text-white/90">{item.name}</div>
    </button>
  );
}

export function CanvasArea() {
  const { setNodeRef, isOver } = useDroppable({ id: "scene-canvas" });
  const canvasItems = useSceneBuilderStore((state) => state.canvasItems);
  const studioMode = useSceneBuilderStore((state) => state.studioMode);
  const frameSlots = useSceneBuilderStore((state) => state.frameSlots);
  const openUploadModal = useSceneBuilderStore((state) => state.openUploadModal);
  const selectItem = useSceneBuilderStore((state) => state.selectItem);
  const nsfw = studioMode === "nsfw";

  return (
    <main className={cn("min-h-0 flex-1 px-10 pt-20 transition-colors duration-500 2xl:px-16 2xl:pt-28", nsfw ? "bg-[#0A0718]/30" : "bg-[#111112]")}>
      <div className="mx-auto max-w-[1180px]">
        <div
          ref={setNodeRef}
          onClick={() => selectItem(null)}
          className={cn(
            "relative aspect-[16/9] w-full overflow-hidden border bg-[#0B0B0C] shadow-[0_28px_120px_rgba(0,0,0,0.35)] transition",
            isOver ? (nsfw ? "border-fuchsia-200/34" : "border-white/30") : nsfw ? "border-fuchsia-200/[0.10]" : "border-white/[0.075]"
          )}
        >
          <div className={cn("absolute inset-0", nsfw ? "bg-[radial-gradient(circle_at_50%_52%,rgba(192,38,211,0.10),transparent_34%)]" : "bg-[radial-gradient(circle_at_50%_52%,rgba(255,255,255,0.018),transparent_34%)]")} />

          {canvasItems.length === 0 && (
            <div className="absolute left-1/2 top-1/2 flex w-[min(520px,82%)] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
              <div className="mb-7 flex items-center">
                <div className={cn("h-12 w-24 rounded-lg shadow-[0_14px_50px_rgba(0,0,0,0.48)]", nsfw ? "bg-[linear-gradient(135deg,rgba(192,38,211,0.38),rgba(10,7,24,0.95))]" : "bg-[linear-gradient(135deg,rgba(232,100,30,0.45),rgba(10,10,10,0.95))]")} />
                <div className={cn("-mx-2 h-20 w-40 rounded-lg shadow-[0_0_35px_rgba(225,235,202,0.12)]", nsfw ? "bg-[linear-gradient(135deg,rgba(168,85,247,0.72),rgba(60,31,91,0.85)_45%,rgba(10,7,24,0.92))]" : "bg-[linear-gradient(135deg,rgba(196,222,203,0.72),rgba(55,67,73,0.85)_45%,rgba(14,14,15,0.92))]")} />
                <div className={cn("h-12 w-24 rounded-lg shadow-[0_14px_50px_rgba(0,0,0,0.48)]", nsfw ? "bg-[linear-gradient(135deg,rgba(236,72,153,0.46),rgba(10,7,24,0.95))]" : "bg-[linear-gradient(135deg,rgba(214,113,28,0.56),rgba(18,18,18,0.95))]")} />
              </div>
              <h2 className="text-base font-black tracking-tight text-white/76">
                Create your first frame, then turn it into a video with &quot;Directing&quot;
              </h2>
            </div>
          )}

          {[...canvasItems]
            .sort((a, b) => a.layer - b.layer)
            .map((item) => (
              <CanvasItemNode key={item.instanceId} item={item} />
            ))}
        </div>

        <div className={cn("mt-3 flex h-[72px] items-center rounded-xl border px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_16px_50px_rgba(0,0,0,0.25)]", nsfw ? "border-fuchsia-200/14 bg-[#10091F]" : "border-white/[0.12] bg-[#111112]")}>
          <button
            type="button"
            onClick={() => openUploadModal("start-frame")}
            className="flex h-14 w-32 items-center justify-center gap-2 overflow-hidden rounded-lg border border-white/[0.10] bg-white/[0.035] text-xs font-black text-white/62 transition hover:bg-white/[0.06] hover:text-white"
          >
            {frameSlots.startFrame ? (
              <img src={frameSlots.startFrame.dataUrl} alt="Start frame" className="h-full w-full object-cover" />
            ) : (
              <>
                <ImageIcon className="size-3.5" />
                Start frame
              </>
            )}
          </button>
          <div className="mx-4 h-px flex-1 bg-white/[0.12]" />
          <button
            type="button"
            onClick={() => openUploadModal("end-frame")}
            className="flex h-14 w-32 items-center justify-center gap-2 overflow-hidden rounded-lg border border-white/[0.10] bg-white/[0.035] text-xs font-black text-white/62 transition hover:bg-white/[0.06] hover:text-white"
          >
            {frameSlots.endFrame ? (
              <img src={frameSlots.endFrame.dataUrl} alt="End frame" className="h-full w-full object-cover" />
            ) : (
              <>
                End frame
                <ImageIcon className="size-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
