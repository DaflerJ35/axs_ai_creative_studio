import {
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  HeartPulse,
  Plus,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUniverseForgeStore } from "../store/useUniverseForgeStore";
import type { ContinuitySeverity, UniverseRelationship } from "../types/universe-forge.types";
import { UniverseHandoffActions } from "./UniverseHandoffActions";

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  elli: { x: 50, y: 18 },
  mara: { x: 20, y: 70 },
  dante: { x: 80, y: 70 },
};

const RELATIONSHIP_TYPES: UniverseRelationship["type"][] = [
  "romantic",
  "friends",
  "rivals",
  "family",
  "creative",
  "unknown",
];

const CHECK_STYLES: Record<ContinuitySeverity, string> = {
  ok: "border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100/78",
  watch: "border-amber-300/20 bg-amber-300/[0.08] text-amber-100/78",
  break: "border-rose-300/25 bg-rose-300/[0.08] text-rose-100/80",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export function RelationshipMap() {
  const characters = useUniverseForgeStore((state) => state.characters);
  const relationships = useUniverseForgeStore((state) => state.relationships);
  const continuityChecks = useUniverseForgeStore((state) => state.continuityChecks);
  const continuityStates = useUniverseForgeStore((state) => state.continuityStates);
  const selectedCharacterId = useUniverseForgeStore((state) => state.selectedCharacterId);
  const selectCharacter = useUniverseForgeStore((state) => state.selectCharacter);
  const addRelationship = useUniverseForgeStore((state) => state.addRelationship);
  const updateRelationship = useUniverseForgeStore((state) => state.updateRelationship);
  const runContinuityAudit = useUniverseForgeStore((state) => state.runContinuityAudit);
  const selectedCharacter = characters.find((character) => character.id === selectedCharacterId) ?? characters[0];
  const selectedStates = continuityStates.filter((state) => state.characterId === selectedCharacter?.id);

  return (
    <section id="relationships" className="axs-universe-lower axs-relationship-section relative overflow-hidden rounded-[16px] border border-[rgba(212,160,23,0.24)] bg-[rgba(15,15,26,0.68)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_34px_120px_rgba(0,0,0,0.46),0_0_70px_rgba(0,212,255,0.05)] backdrop-blur-3xl before:pointer-events-none before:absolute before:inset-x-12 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[rgba(212,160,23,0.64)] before:to-transparent">
      <div className="pointer-events-none absolute -right-28 top-20 size-96 rounded-full bg-cyan-300/[0.055] blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-12 size-80 rounded-full bg-violet-400/[0.065] blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100/48">
            <GitBranch className="size-4" />
            Relationship Map
          </div>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Living character graph</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <UniverseHandoffActions compact />
          <Button
            type="button"
            onClick={addRelationship}
            className="rounded-full border border-white/12 bg-white/[0.08] px-4 text-sm font-black text-white hover:bg-white hover:text-black"
          >
            <Plus className="size-4" />
            Add Relationship
          </Button>
          <Button
            type="button"
            onClick={runContinuityAudit}
            className="rounded-full bg-cyan-100 px-4 text-sm font-black text-black hover:bg-white"
          >
            <ShieldAlert className="size-4" />
            Run Audit
          </Button>
        </div>
      </div>

      <div className="relative mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="axs-relationship-graph relative h-[520px] overflow-hidden rounded-[14px] border border-[rgba(212,160,23,0.18)] bg-black/34 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_26px_90px_rgba(0,0,0,0.28)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.14),transparent_38%),radial-gradient(circle_at_78%_72%,rgba(168,85,247,0.16),transparent_34%),linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:auto,auto,70px_70px,70px_70px]" />
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {relationships.map((relationship) => {
              const from = NODE_POSITIONS[relationship.fromCharacterId] ?? { x: 50, y: 50 };
              const to = NODE_POSITIONS[relationship.toCharacterId] ?? { x: 50, y: 50 };
              const stroke = relationship.type === "romantic" ? "rgba(236,72,153,0.48)" : relationship.type === "rivals" ? "rgba(248,113,113,0.45)" : "rgba(34,211,238,0.42)";

              return (
                <line
                  key={relationship.id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={stroke}
                  strokeWidth={Math.max(1.1, relationship.tension / 28)}
                  strokeDasharray={relationship.type === "rivals" ? "4 3" : undefined}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {characters.map((character) => {
            const position = NODE_POSITIONS[character.id] ?? { x: 50, y: 50 };
            const selected = selectedCharacter?.id === character.id;
            const relatedRelationships = relationships.filter(
              (relationship) => relationship.fromCharacterId === character.id || relationship.toCharacterId === character.id
            );
            const relationshipStrength =
              relatedRelationships.length > 0
                ? Math.round(relatedRelationships.reduce((total, relationship) => total + relationship.tension, 0) / relatedRelationships.length)
                : 0;
            const relationshipTypes = Array.from(new Set(relatedRelationships.map((relationship) => relationship.type))).join(" / ") || "unmapped";

            return (
              <button
                key={character.id}
                type="button"
                onClick={() => selectCharacter(character.id)}
                className={cn(
                  "group absolute w-52 -translate-x-1/2 -translate-y-1/2 rounded-[28px] border p-4 text-left shadow-[0_28px_90px_rgba(0,0,0,0.48)] transition",
                  selected
                    ? "border-cyan-200/45 bg-cyan-200/[0.12] ring-1 ring-cyan-100/20"
                    : "border-white/[0.12] bg-[#101218]/88 hover:border-white/24 hover:bg-white/[0.08]"
                )}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-black", selected ? "bg-cyan-100 text-black shadow-[0_0_30px_rgba(0,212,255,0.24)]" : "bg-white/[0.08] text-white")}>
                    {initials(character.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-base font-black text-white">{character.name}</div>
                    <div className="mt-1 truncate text-[11px] font-bold text-white/42">{character.role}</div>
                  </div>
                </div>
                <div className="pointer-events-none absolute left-1/2 top-[calc(100%+14px)] z-30 w-72 -translate-x-1/2 translate-y-2 rounded-[24px] border border-white/[0.14] bg-[#080A12]/95 p-4 opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_28px_90px_rgba(0,0,0,0.58),0_0_46px_rgba(0,212,255,0.12)] backdrop-blur-2xl transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/58">Character Memory</div>
                  <div className="mt-2 text-sm font-black text-white">{character.name}</div>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-white/52">{character.backstory}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2">
                      <div className="text-lg font-black text-white">{relationshipStrength}%</div>
                      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/34">Strength</div>
                    </div>
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2">
                      <div className="text-lg font-black text-white">{relatedRelationships.length}</div>
                      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/34">Links</div>
                    </div>
                  </div>
                  <div className="mt-3 rounded-2xl border border-cyan-200/12 bg-cyan-300/[0.055] px-3 py-2 text-[11px] font-bold capitalize text-cyan-50/68">
                    {relationshipTypes}
                  </div>
                  <div className="mt-2 text-[11px] font-black text-white/34">Click to open character detail panel</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="rounded-[32px] border border-white/[0.12] bg-black/28 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/38">
              <UserRound className="size-3.5" />
              Selected Character
            </div>
            <h3 className="mt-4 text-3xl font-black tracking-tight text-white">{selectedCharacter?.name}</h3>
            <p className="mt-3 text-sm leading-7 text-white/56">{selectedCharacter?.backstory}</p>
            <div className="mt-3 grid gap-2 text-xs text-white/44">
              <div><span className="font-black text-white/64">Wardrobe:</span> {selectedCharacter?.wardrobe}</div>
              <div><span className="font-black text-white/64">Emotion:</span> {selectedCharacter?.emotionalState}</div>
              <div><span className="font-black text-white/64">Arc:</span> {selectedCharacter?.arcStatus}</div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/[0.12] bg-black/28 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/38">
              <HeartPulse className="size-3.5" />
              Editable Relationships
            </div>
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {relationships.map((relationship) => (
                <div key={relationship.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
                  <input
                    value={relationship.label}
                    onChange={(event) => updateRelationship(relationship.id, { label: event.target.value })}
                    className="w-full rounded-xl border border-white/[0.08] bg-black/24 px-3 py-2 text-sm font-black text-white/76 outline-none focus:border-cyan-200/35"
                  />
                  <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_96px]">
                    <select
                      value={relationship.type}
                      onChange={(event) => updateRelationship(relationship.id, { type: event.target.value as UniverseRelationship["type"] })}
                      className="rounded-xl border border-white/[0.08] bg-black/24 px-3 py-2 text-xs font-bold capitalize text-white/64 outline-none focus:border-cyan-200/35"
                    >
                      {RELATIONSHIP_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={relationship.tension}
                      onChange={(event) => updateRelationship(relationship.id, { tension: Number(event.target.value) })}
                      className="rounded-xl border border-white/[0.08] bg-black/24 px-3 py-2 text-xs font-black text-white/64 outline-none focus:border-cyan-200/35"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[14px] border border-[rgba(212,160,23,0.16)] bg-black/28 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/38">
            Continuity State Timeline
          </div>
            <div className="space-y-2">
            {selectedStates.length === 0 && (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-sm leading-6 text-white/46">
                No tracked continuity states for this character yet. Generate an arc or add scene events to begin tracking wardrobe, appearance, emotion, and major event changes.
              </div>
            )}
            {selectedStates.map((state) => (
              <div key={state.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-white">Episode {state.episodeNumber}</div>
                  <div className="text-[11px] font-black text-cyan-100/58">{state.majorEvent}</div>
                </div>
                <div className="mt-2 grid gap-1 text-xs leading-5 text-white/42">
                  <div><span className="font-black text-white/62">Clothing:</span> {state.clothing}</div>
                  <div><span className="font-black text-white/62">Appearance:</span> {state.appearance}</div>
                  <div><span className="font-black text-white/62">Emotion:</span> {state.emotionalState}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[14px] border border-[rgba(212,160,23,0.16)] bg-black/28 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/38">
            Continuity Engine Warnings
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {continuityChecks.map((check) => (
              <div key={check.id} className={cn("rounded-2xl border p-3", CHECK_STYLES[check.status])}>
                <div className="flex items-center gap-2 text-sm font-black">
                  {check.status === "ok" ? <CheckCircle2 className="size-4" /> : check.status === "watch" ? <AlertTriangle className="size-4" /> : <ShieldAlert className="size-4" />}
                  {check.label}
                </div>
                <p className="mt-2 text-xs leading-5 opacity-82">{check.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
