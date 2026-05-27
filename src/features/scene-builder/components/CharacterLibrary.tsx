import { useDraggable } from "@dnd-kit/core";
import { Boxes, ChevronLeft, ChevronRight, Gem, Plus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ASSET_ITEMS, CHARACTER_ITEMS, ENVIRONMENT_ITEMS } from "../data/library-items";
import { useSceneBuilderStore } from "../store/useSceneBuilderStore";
import type { LibraryTab, SceneLibraryItem } from "../types/scene-builder.types";

const LIBRARY_GROUPS: { id: LibraryTab; label: string; eyebrow: string; icon: typeof UserRound; items: SceneLibraryItem[] }[] = [
  { id: "characters", label: "DNA Characters", eyebrow: "Identity", icon: UserRound, items: CHARACTER_ITEMS },
  { id: "environments", label: "Models", eyebrow: "Worlds", icon: Gem, items: ENVIRONMENT_ITEMS },
  { id: "assets", label: "Assets", eyebrow: "Props", icon: Boxes, items: ASSET_ITEMS },
];

function DraggableLibraryRow({ item, collapsed }: { item: SceneLibraryItem; collapsed: boolean; key?: string }) {
  const addItemToCanvas = useSceneBuilderStore((state) => state.addItemToCanvas);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { kind: "library-item", item },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border border-transparent p-2 transition",
        "hover:border-white/[0.08] hover:bg-white/[0.035]",
        isDragging && "z-50 scale-[1.02] border-cyan-300/35 bg-white/[0.055] opacity-80",
        collapsed && "justify-center"
      )}
      {...listeners}
      {...attributes}
    >
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-black text-black", item.accent)}>
        {item.thumbnail}
      </div>
      {!collapsed && (
        <>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-white/88">{item.name}</div>
            <div className="mt-0.5 truncate text-xs font-medium text-white/35">{item.subtitle}</div>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="rounded-full text-white/35 opacity-0 transition hover:bg-white/[0.06] hover:text-white group-hover:opacity-100"
            onClick={(event) => {
              event.stopPropagation();
              addItemToCanvas(item);
            }}
            aria-label={`Add ${item.name} to scene`}
          >
            <Plus className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}

function LibraryGroup({
  group,
  collapsed,
}: {
  group: (typeof LIBRARY_GROUPS)[number];
  collapsed: boolean;
  key?: string;
}) {
  const Icon = group.icon;

  return (
    <section className={cn("space-y-2", collapsed && "flex flex-col items-center")}>
      {!collapsed ? (
        <div className="flex items-end justify-between px-2">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/28">{group.eyebrow}</div>
            <h3 className="mt-1 text-sm font-black text-white/78">{group.label}</h3>
          </div>
          <Icon className="size-4 text-white/28" />
        </div>
      ) : (
        <div className="flex size-10 items-center justify-center rounded-2xl text-white/35">
          <Icon className="size-4" />
        </div>
      )}
      <div className="space-y-1">
        {group.items.map((item) => (
          <DraggableLibraryRow key={item.id} item={item} collapsed={collapsed} />
        ))}
      </div>
    </section>
  );
}

export function CharacterLibrary({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-white/[0.06] bg-[#0F0F10]">
      <div className={cn("flex h-16 shrink-0 items-center border-b border-white/[0.06] px-4", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-black text-white">Library</div>
            <div className="mt-0.5 text-xs font-semibold text-white/32">DNA, models, assets</div>
          </div>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-white/38 hover:bg-white/[0.06] hover:text-white"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? "Expand library" : "Collapse library"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>

      <div className={cn("min-h-0 flex-1 overflow-y-auto py-5", collapsed ? "px-2" : "px-3")}>
        <div className="space-y-7">
          {LIBRARY_GROUPS.map((group) => (
            <LibraryGroup key={group.id} group={group} collapsed={collapsed} />
          ))}
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-white/[0.06] p-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-2 text-xs font-bold text-white/54 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Plus className="size-3.5" />
            Import DNA
          </button>
        </div>
      )}
    </aside>
  );
}
