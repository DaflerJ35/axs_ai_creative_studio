import {
  BookOpen,
  CalendarClock,
  Dna,
  Download,
  Eye,
  Link2,
  MapPinned,
  Pencil,
  Pin,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  UsersRound,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAxsStore } from "@/store/useAxsStore";
import { cn } from "@/lib/utils";
import { useUniverseForgeStore } from "../store/useUniverseForgeStore";
import { UniverseHandoffActions } from "./UniverseHandoffActions";

type BibleTab = "codex" | "characters" | "rules" | "timeline" | "atlas" | "lore";

const BIBLE_TABS: { id: BibleTab; label: string; Icon: LucideIcon }[] = [
  { id: "codex", label: "Codex", Icon: Search },
  { id: "characters", label: "Master Characters", Icon: UsersRound },
  { id: "rules", label: "World Rules", Icon: ShieldCheck },
  { id: "timeline", label: "Timeline", Icon: CalendarClock },
  { id: "atlas", label: "Spatial Atlas", Icon: MapPinned },
  { id: "lore", label: "Lore / Backstory", Icon: BookOpen },
];

function GlassSection({
  id,
  title,
  icon: Icon,
  action,
  children,
}: {
  id?: string;
  title: string;
  icon: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="relative overflow-hidden rounded-[38px] border border-white/[0.15] bg-white/[0.055] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_36px_130px_rgba(0,0,0,0.44),0_0_100px_rgba(0,212,255,0.045)] backdrop-blur-3xl before:pointer-events-none before:absolute before:inset-x-12 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent">
      <div className="pointer-events-none absolute -right-24 top-8 size-72 rounded-full bg-cyan-300/[0.045] blur-3xl" />
      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100/52">
            <Icon className="size-4" />
            {title}
          </div>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Universe command bible</h2>
        </div>
        {action}
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}

function Field({
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
          className="min-h-32 w-full resize-none rounded-[22px] border border-white/[0.10] bg-black/26 px-4 py-3 text-sm leading-7 text-white/72 outline-none transition focus:border-cyan-200/35 focus:bg-black/34"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-[22px] border border-white/[0.10] bg-black/26 px-4 py-3 text-sm font-bold text-white/78 outline-none transition focus:border-cyan-200/35 focus:bg-black/34"
        />
      )}
    </label>
  );
}

export function UniverseBible() {
  const [activeTab, setActiveTabLocal] = useState<BibleTab>("codex");
  const [pinnedIds, setPinnedIds] = useState<string[]>(["elli"]);
  const [extracting, setExtracting] = useState(false);
  const [manuscriptText, setManuscriptText] = useState("");
  const [codexSuggestions, setCodexSuggestions] = useState<string[]>([]);
  const bible = useUniverseForgeStore((state) => state.bible);
  const characters = useUniverseForgeStore((state) => state.characters);
  const relationships = useUniverseForgeStore((state) => state.relationships);
  const timeline = useUniverseForgeStore((state) => state.timeline);
  const savedUniverses = useUniverseForgeStore((state) => state.savedUniverses);
  const generationStatus = useUniverseForgeStore((state) => state.generationStatus);
  const updateBible = useUniverseForgeStore((state) => state.updateBible);
  const updateWorldRule = useUniverseForgeStore((state) => state.updateWorldRule);
  const addWorldRule = useUniverseForgeStore((state) => state.addWorldRule);
  const saveUniverse = useUniverseForgeStore((state) => state.saveUniverse);
  const loadUniverse = useUniverseForgeStore((state) => state.loadUniverse);
  const selectCharacter = useUniverseForgeStore((state) => state.selectCharacter);
  const deleteCharacterMemory = useUniverseForgeStore((state) => state.deleteCharacterMemory);
  const dnaCharacters = useAxsStore((state) => state.characters);
  const readingMode = useAxsStore((state) => state.readingMode);
  const addCharacter = useAxsStore((state) => state.addCharacter);
  const setActiveCharacter = useAxsStore((state) => state.setActiveCharacter);
  const setActiveTab = useAxsStore((state) => state.setActiveTab);

  const openOrCreateDna = (character: typeof characters[number]) => {
    const dnaMatch = dnaCharacters.find((dna) => dna.name.toLowerCase() === character.name.toLowerCase());
    if (dnaMatch) {
      setActiveCharacter(dnaMatch.id);
      setActiveTab("dna");
      return;
    }

    const dnaId = `dna-${character.id}-${Date.now()}`;
    addCharacter({
      id: dnaId,
      name: character.name,
      age: "28",
      heritage: "Synthetic cinematic character",
      bodyType: "Production-defined",
      description: `${character.appearance} ${character.backstory} Wardrobe: ${character.wardrobe}. Current emotional state: ${character.emotionalState}.`,
      personality: character.personality.split(",").map((item) => item.trim()).filter(Boolean),
      styleKeywords: ["cinematic", "premium", "locked-dna", "universe-forge"],
      stylePreset: "cinematic",
      seed: Math.abs(character.id.split("").reduce((total, char) => total + char.charCodeAt(0), 1000)),
      loraWeight: 0.85,
      createdAt: Date.now(),
    });
    setActiveCharacter(dnaId);
    setActiveTab("dna");
  };

  const togglePin = (id: string) => {
    setPinnedIds((current) => current.includes(id) ? current.filter((pinned) => pinned !== id) : [id, ...current]);
  };

  const buildCodexSuggestions = (source: string) => {
    const atLinks = Array.from(source.matchAll(/@([A-Za-z][A-Za-z0-9_-]*(?:\s+[A-Za-z][A-Za-z0-9_-]*)?)/g)).map((match) => match[1]);
    const titleCaseNames = Array.from(source.matchAll(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g)).map((match) => match[1]);
    const ignored = new Set(["AI", "AXS", "DNA", "IP", "PG", "NSFW", "SFW", "The", "This", "Use", "Ready"]);
    return Array.from(new Set([...atLinks, ...titleCaseNames]))
      .filter((entry) => !ignored.has(entry) && entry.length > 2)
      .slice(0, 16);
  };

  const renderLinkedText = (text: string) => {
    if (!text.trim()) return "Paste lore or mention @characters to generate durable Codex links.";

    return text.split(/(@[A-Za-z][A-Za-z0-9_-]*)/g).map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span key={`${part}-${index}`} className={cn("rounded-full px-2 py-0.5 font-black", readingMode ? "bg-cyan-100 text-cyan-800" : "bg-cyan-200/12 text-cyan-100")}>
            {part}
          </span>
        );
      }

      return <span key={`${part}-${index}`}>{part}</span>;
    });
  };

  const runMetadataExtraction = () => {
    setExtracting(true);
    window.setTimeout(() => {
      const source = manuscriptText.trim() || bible.persistentLore;
      const suggestions = buildCodexSuggestions(source);
      setCodexSuggestions(suggestions);
      const extractedRules = [
        "Extracted: every major scene must preserve the current emotional state unless the beat explicitly changes it.",
        "Extracted: locations should inherit lighting and palette from the active universe visual style.",
        "Extracted: @mentions are treated as immutable Codex references across Scene Builder, Voice Studio, and Distribute.",
      ];
      updateBible({
        worldRules: Array.from(new Set([...bible.worldRules, ...extractedRules])),
        persistentLore: `${bible.persistentLore}\n\nAI extraction pass: detected ${characters.length} characters, ${relationships.length} relationship links, ${timeline.length} major timeline events, and ${suggestions.length} Codex candidates. Suggested tags: @${suggestions.join(" @")}.`,
      });
      setExtracting(false);
    }, 650);
  };

  return (
    <div className="space-y-6">
      <GlassSection
        id="bible"
        title="Universe Bible"
        icon={BookOpen}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <UniverseHandoffActions compact />
            <Button type="button" onClick={saveUniverse} size="sm" className="rounded-full bg-cyan-100 px-3 text-xs font-black text-black hover:bg-white">
              <Save className="size-3.5" />
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full border-white/12 bg-white/[0.04] px-3 text-xs font-black text-white/72 hover:bg-white/[0.08]"
              onClick={() => savedUniverses[0] && loadUniverse(savedUniverses[0].id)}
              disabled={savedUniverses.length === 0}
            >
              <Upload className="size-3.5" />
              Load
            </Button>
          </div>
        }
      >
        <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
          <Field label="Title" value={bible.title} onChange={(title) => updateBible({ title })} />
          <Field label="Logline" value={bible.logline} onChange={(logline) => updateBible({ logline })} multiline />
          <div className="rounded-[24px] border border-cyan-200/14 bg-cyan-300/[0.055] p-4 text-xs font-semibold leading-6 text-cyan-50/62 xl:col-span-2">
            {generationStatus}
          </div>
        </div>

        <div className="mt-6 grid gap-2 rounded-[28px] border border-white/[0.10] bg-black/24 p-2 md:grid-cols-6">
          {BIBLE_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTabLocal(id)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-[22px] px-3 py-3 text-xs font-black transition",
                activeTab === id ? "bg-cyan-100 text-black shadow-[0_0_32px_rgba(0,212,255,0.18)]" : "text-white/48 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === "codex" && (
          <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <div className={cn("rounded-[30px] border p-5", readingMode ? "border-slate-300 bg-white text-slate-950" : "border-white/[0.10] bg-black/24")}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className={cn("text-xs font-black uppercase tracking-[0.2em]", readingMode ? "text-slate-500" : "text-cyan-100/46")}>Lore Wiki Architecture</div>
                  <h3 className={cn("mt-2 text-3xl font-black", readingMode ? "text-slate-950" : "text-white")}>The Codex reads like a wiki, behaves like memory.</h3>
                  <p className={cn("mt-3 text-sm leading-7", readingMode ? "text-slate-600" : "text-white/52")}>
                    Use @character, @location, and /entry style references in lore. AXS treats them as durable production memory for scene, voice, strategy, and distribution.
                  </p>
                </div>
                <Button type="button" onClick={runMetadataExtraction} disabled={extracting} className="rounded-full bg-cyan-100 px-4 text-xs font-black text-black hover:bg-white">
                  <Wand2 className="size-3.5" />
                  {extracting ? "Extracting..." : "Extract Metadata"}
                </Button>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {[
                  ["Characters", characters.map((character) => `@${character.name}`).join(", ")],
                  ["Locations", "@NeonGym, @RooftopStudio, @MidnightStreet"],
                  ["Factions", "@CreatorCollective, @OldAgency, @Audience"],
                  ["Items", "@GlassPhone, @BlueJacket, @TrainingMirror"],
                ].map(([label, value]) => (
                  <div key={label} className={cn("rounded-[24px] border p-4", readingMode ? "border-slate-200 bg-slate-50" : "border-white/[0.08] bg-white/[0.035]")}>
                    <div className={cn("text-[10px] font-black uppercase tracking-[0.18em]", readingMode ? "text-slate-500" : "text-white/34")}>{label}</div>
                    <div className={cn("mt-2 text-sm font-bold leading-6", readingMode ? "text-slate-800" : "text-white/66")}>{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3">
                <label className="block">
                  <span className={cn("mb-2 block text-[10px] font-black uppercase tracking-[0.18em]", readingMode ? "text-slate-500" : "text-white/34")}>Manuscript / raw lore import</span>
                  <textarea
                    value={manuscriptText}
                    onChange={(event) => setManuscriptText(event.target.value)}
                    placeholder="Paste a scene, outline, or messy notes. Mention @Elli, @RooftopStudio, or /timeline to let AXS extract structured memory."
                    className={cn(
                      "min-h-28 w-full resize-none rounded-[24px] border px-4 py-3 text-sm leading-7 outline-none transition",
                      readingMode
                        ? "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-cyan-300"
                        : "border-white/[0.10] bg-black/26 text-white/72 placeholder:text-white/28 focus:border-cyan-200/35 focus:bg-black/34"
                    )}
                  />
                </label>
                <div className={cn("min-h-20 rounded-[24px] border p-4 text-sm leading-7", readingMode ? "border-slate-200 bg-slate-50 text-slate-700" : "border-white/[0.08] bg-white/[0.035] text-white/58")}>
                  {renderLinkedText(manuscriptText)}
                </div>
              </div>
            </div>

            <div className={cn("rounded-[30px] border p-5", readingMode ? "border-slate-300 bg-white text-slate-950" : "border-white/[0.10] bg-black/24")}>
              <div className={cn("text-xs font-black uppercase tracking-[0.2em]", readingMode ? "text-slate-500" : "text-cyan-100/46")}>Agentic Continuity Brief</div>
              <div className="mt-4 space-y-3">
                {[
                  `Universe: ${bible.title}`,
                  `Tone: ${bible.tone}`,
                  `Visual style: ${bible.visualStyle}`,
                  `Current timeline events: ${timeline.length}`,
                  `Relationship links: ${relationships.length}`,
                ].map((item) => (
                  <div key={item} className={cn("rounded-[22px] border px-4 py-3 text-sm font-bold", readingMode ? "border-slate-200 bg-slate-50 text-slate-700" : "border-white/[0.08] bg-white/[0.035] text-white/58")}>
                    {item}
                  </div>
                ))}
              </div>
              {codexSuggestions.length > 0 && (
                <div className="mt-5">
                  <div className={cn("text-[10px] font-black uppercase tracking-[0.18em]", readingMode ? "text-slate-500" : "text-white/34")}>Extracted Codex Candidates</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {codexSuggestions.map((entry) => (
                      <button
                        key={entry}
                        type="button"
                        onClick={() => setManuscriptText((current) => `${current}${current.endsWith(" ") || current.length === 0 ? "" : " "}@${entry.replace(/\s+/g, "")}`)}
                        className={cn("rounded-full border px-3 py-1.5 text-xs font-black transition", readingMode ? "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100" : "border-cyan-200/14 bg-cyan-200/8 text-cyan-50/72 hover:bg-cyan-200/14")}
                      >
                        @{entry.replace(/\s+/g, "")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "characters" && (
          <div id="characters" className="mt-6 grid gap-4 xl:grid-cols-3">
            {dnaCharacters.length === 0 && (
              <div className="rounded-[26px] border border-cyan-200/18 bg-cyan-300/[0.06] p-4 text-xs leading-6 text-cyan-50/64 xl:col-span-3">
                No Character DNA profiles exist in the main DNA system yet. Create production profiles from these cards to lock the universe across scenes.
              </div>
            )}
            {characters.map((character) => {
              const dnaMatch = dnaCharacters.find((dna) => dna.name.toLowerCase() === character.name.toLowerCase());
              const pinned = pinnedIds.includes(character.id);
              return (
                <article key={character.id} className={cn("rounded-[28px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition", pinned ? "border-cyan-200/24 bg-cyan-300/[0.07]" : "border-white/[0.10] bg-black/26")}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-white">{character.name}</div>
                      <div className="mt-1 text-xs font-bold text-cyan-50/48">{character.role}</div>
                    </div>
                    <button type="button" onClick={() => togglePin(character.id)} className={cn("flex size-8 items-center justify-center rounded-full border transition", pinned ? "border-cyan-200/30 bg-cyan-200 text-black" : "border-white/10 bg-white/[0.04] text-white/46 hover:text-white")}>
                      <Pin className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-4 grid gap-2 text-xs leading-5 text-white/48">
                    <p><span className="font-black text-white/66">Appearance:</span> {character.appearance}</p>
                    <p><span className="font-black text-white/66">Emotion:</span> {character.emotionalState}</p>
                    <p><span className="font-black text-white/66">Wardrobe:</span> {character.wardrobe}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => openOrCreateDna(character)} className="flex items-center gap-1.5 rounded-full border border-cyan-200/18 bg-cyan-300/[0.06] px-3 py-1.5 text-[11px] font-black text-cyan-50/78 hover:bg-cyan-300/[0.12]">
                      <Dna className="size-3" />
                      {dnaMatch ? "View DNA" : "Create DNA"}
                    </button>
                    <button type="button" onClick={() => { selectCharacter(character.id); document.getElementById("relationships")?.scrollIntoView({ behavior: "smooth" }); }} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-black text-white/58 hover:text-white">
                      <Eye className="size-3" />
                      Details
                    </button>
                    <button type="button" onClick={() => openOrCreateDna(character)} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-black text-white/58 hover:text-white">
                      <Pencil className="size-3" />
                      Edit
                    </button>
                    <button type="button" onClick={() => deleteCharacterMemory(character.id)} className="flex items-center gap-1.5 rounded-full border border-rose-200/14 bg-rose-300/[0.06] px-3 py-1.5 text-[11px] font-black text-rose-100/62 hover:text-rose-50">
                      <Trash2 className="size-3" />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {activeTab === "rules" && (
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              <Field label="Tone" value={bible.tone} onChange={(tone) => updateBible({ tone })} multiline />
              <Field label="Visual Style" value={bible.visualStyle} onChange={(visualStyle) => updateBible({ visualStyle })} multiline />
              <Field label="Time Period" value={bible.timePeriod} onChange={(timePeriod) => updateBible({ timePeriod })} />
              <Field label="Restrictions" value={bible.restrictions} onChange={(restrictions) => updateBible({ restrictions })} multiline />
            </div>
            <div className="rounded-[30px] border border-white/[0.10] bg-black/24 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-white/42">World Rules</div>
                <button type="button" onClick={addWorldRule} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-black text-white/58 hover:text-white">
                  <Plus className="size-3" />
                  Rule
                </button>
              </div>
              <div className="space-y-3">
                {bible.worldRules.map((rule, index) => (
                  <input
                    key={`${rule}-${index}`}
                    value={rule}
                    onChange={(event) => updateWorldRule(index, event.target.value)}
                    className="w-full rounded-[20px] border border-white/[0.10] bg-black/26 px-4 py-3 text-xs font-semibold leading-5 text-white/66 outline-none transition focus:border-cyan-200/35 focus:bg-black/34"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div id="timeline" className="mt-6 grid gap-4">
            {timeline.map((event, index) => (
              <div key={event.id} className="grid grid-cols-[42px_minmax(0,1fr)] gap-4">
                <div className={cn("mt-1 flex size-10 items-center justify-center rounded-full text-xs font-black", index === 0 ? "bg-cyan-200 text-black" : "bg-white/[0.07] text-white/58")}>
                  {index + 1}
                </div>
                <div className="rounded-[26px] border border-white/[0.10] bg-black/24 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-black text-white">{event.title}</div>
                    <div className="flex items-center gap-1 text-[11px] font-black text-white/36">
                      <CalendarClock className="size-3" />
                      {event.timestamp}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-white/46">{event.episode} / {event.consequence}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "atlas" && (
          <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[430px] overflow-hidden rounded-[34px] border border-white/[0.10] bg-black/30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_30%,rgba(0,212,255,0.20),transparent_20%),radial-gradient(circle_at_70%_64%,rgba(168,85,247,0.20),transparent_22%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:auto,auto,64px_64px,64px_64px]" />
              {[
                ["Neon Gym", "28%", "34%", "Elli rebuilds discipline here"],
                ["Rooftop Studio", "68%", "24%", "Final campaign monitor wall"],
                ["Midnight Street", "58%", "72%", "Breakthrough chase sequence"],
              ].map(([label, left, top, detail]) => (
                <button key={label} type="button" className="absolute rounded-2xl border border-cyan-200/22 bg-cyan-200/12 px-4 py-3 text-left shadow-[0_0_34px_rgba(0,212,255,0.16)] backdrop-blur-xl" style={{ left, top }}>
                  <div className="text-xs font-black text-white">{label}</div>
                  <div className="mt-1 max-w-36 text-[11px] font-semibold leading-4 text-white/48">{detail}</div>
                </button>
              ))}
            </div>
            <div className="rounded-[34px] border border-white/[0.10] bg-black/24 p-5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100/46">
                <MapPinned className="size-4" />
                Spatial Atlas
              </div>
              <h3 className="mt-2 text-2xl font-black text-white">Lore pinned to places, not buried in notes.</h3>
              <p className="mt-4 text-sm leading-7 text-white/52">
                This is the browser-native map layer for locations, sets, recurring camera positions, palette rules, and timeline events. It is built as a visual atlas now and ready for tile maps later.
              </p>
              <div className="mt-5 space-y-3">
                {["Pin lore to map", "Attach characters to locations", "Track lighting/time of day", "Flag geography continuity"].map((item) => (
                  <div key={item} className="rounded-[22px] border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/58">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "lore" && (
          <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <textarea
              value={bible.persistentLore}
              onChange={(event) => updateBible({ persistentLore: event.target.value })}
              className="min-h-80 w-full resize-none rounded-[30px] border border-white/[0.10] bg-black/26 px-5 py-4 text-sm leading-8 text-white/72 outline-none transition focus:border-cyan-200/35 focus:bg-black/34"
            />
            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/[0.10] bg-black/24 p-5">
                <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/42">
                  <Link2 className="size-4" />
                  Relationship Overview
                </div>
                <div className="space-y-3">
                  {relationships.map((relationship) => {
                    const from = characters.find((character) => character.id === relationship.fromCharacterId);
                    const to = characters.find((character) => character.id === relationship.toCharacterId);
                    return (
                      <div key={relationship.id} className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-3">
                        <div className="text-sm font-black text-white">{from?.name} to {to?.name}</div>
                        <div className="mt-1 text-xs font-semibold text-cyan-50/48">{relationship.label}</div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-cyan-200" style={{ width: `${relationship.tension}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {savedUniverses.length > 0 && (
                <div className="rounded-[28px] border border-white/[0.10] bg-black/24 p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/42">
                    <Download className="size-4" />
                    Universe Vault
                  </div>
                  <div className="space-y-2">
                    {savedUniverses.slice(0, 4).map((saved) => (
                      <button
                        key={saved.id}
                        type="button"
                        onClick={() => loadUniverse(saved.id)}
                        className="flex w-full items-center justify-between rounded-[18px] border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-left text-sm font-bold text-white/62 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        {saved.name}
                        <span className="text-[11px] text-white/32">{new Date(saved.savedAt).toLocaleTimeString()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </GlassSection>
    </div>
  );
}
