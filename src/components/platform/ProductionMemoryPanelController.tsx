import { useMemo } from "react";
import { AXSContextRail } from "./AXSContextRail";
import { useLocalStorageSafe } from "../../hooks/useLocalStorageSafe";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import type { ForgeTab } from "../../lib/types";

const MEMORY_ROUTES = new Set<ForgeTab>([
  "universe",
  "dna",
  "scripts",
  "strategy",
  "campaign",
  "analytics",
]);

const HIDDEN_DEFAULT_ROUTES = new Set<ForgeTab>([
  "images",
  "videos",
  "voice",
  "config",
  "vault",
  "distribute",
  "creator",
  "scene",
  "landing",
]);

interface ProductionMemoryState {
  openOverrides: Partial<Record<ForgeTab, boolean>>;
  minimized: boolean;
  offset: { x: number; y: number };
}

const DEFAULT_STATE: ProductionMemoryState = {
  openOverrides: {},
  minimized: false,
  offset: { x: 0, y: 0 },
};

function isPanelState(value: unknown): value is ProductionMemoryState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ProductionMemoryState>;
  return (
    (!candidate.openOverrides || typeof candidate.openOverrides === "object") &&
    typeof candidate.minimized === "boolean" &&
    (!candidate.offset ||
      (typeof candidate.offset.x === "number" && typeof candidate.offset.y === "number"))
  );
}

export function useProductionMemoryPanel(activeTab: ForgeTab) {
  const isDrawer = useMediaQuery("(max-width: 1499px)");
  const [state, setState, resetState] = useLocalStorageSafe(
    "axs.productionMemoryPanel.v1",
    DEFAULT_STATE,
    isPanelState
  );

  const routeDefaultOpen = MEMORY_ROUTES.has(activeTab) && !HIDDEN_DEFAULT_ROUTES.has(activeTab);
  const isOpen = state.openOverrides[activeTab] ?? (isDrawer ? false : routeDefaultOpen);
  const isRelevant = MEMORY_ROUTES.has(activeTab);

  const controls = useMemo(
    () => ({
      isOpen,
      isRelevant,
      isDrawer,
      isMinimized: state.minimized,
      offset: state.offset,
      setOpen: (open: boolean) =>
        setState((current) => ({
          ...current,
          openOverrides: {
            ...current.openOverrides,
            [activeTab]: open,
          },
        })),
      toggleOpen: () =>
        setState((current) => ({
          ...current,
          openOverrides: {
            ...current.openOverrides,
            [activeTab]: !(current.openOverrides[activeTab] ?? (isDrawer ? false : routeDefaultOpen)),
          },
        })),
      setMinimized: (minimized: boolean) => setState((current) => ({ ...current, minimized })),
      setOffset: (offset: { x: number; y: number }) => setState((current) => ({ ...current, offset })),
      reset: resetState,
    }),
    [activeTab, isDrawer, isOpen, isRelevant, resetState, routeDefaultOpen, setState, state.minimized, state.offset]
  );

  return controls;
}

export function ProductionMemoryPanelController({
  panel,
}: {
  panel: ReturnType<typeof useProductionMemoryPanel>;
}) {
  if (!panel.isRelevant) return null;

  return (
    <AXSContextRail
      isOpen={panel.isOpen}
      isDrawer={panel.isDrawer}
      isMinimized={panel.isMinimized}
      offset={panel.offset}
      onClose={() => panel.setOpen(false)}
      onMinimizedChange={panel.setMinimized}
      onOffsetChange={panel.setOffset}
    />
  );
}
