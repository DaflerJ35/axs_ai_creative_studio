import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Dna, User as UserIcon, Search, Plus, Trash2, Edit3,
  CheckCircle, Lock, Copy, Zap, ChevronRight, Shield, Shirt, Sparkles, Heart, Grid3X3, Wand2, UsersRound,
} from "lucide-react";
import { useAxsStore } from "../../store/useAxsStore";
import { GlassCard } from "../ui/glass-card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { Character } from "../../lib/types";
import { copyToClipboard } from "../../lib/safeClipboard";
import { useAxsProofSummary } from "../../lib/useAxsProofSummary";
import { ProofBadge } from "../platform/ProofBadge";
import { CommandMetric, CommandModuleCard, CommandPanel } from "../command/CommandDeck";

export const DNALibrary = () => {
  const { characters, activeCharacterId, setActiveCharacter, deleteCharacter, setActiveTab } = useAxsStore();
  const proof = useAxsProofSummary();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = characters.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.heritage?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedChar = characters.find((c) => c.id === selected) ?? null;
  const identityDetail = proof.categories.identity.signals[0]?.detail;
  const continuityDetail = proof.categories.continuity.signals[0]?.detail;

  const handleSetActive = (id: string) => {
    setActiveCharacter(id);
    setActiveTab("images");
  };

  const handleEditDna = (id: string) => {
    setActiveCharacter(id);
    setActiveTab("studio");
  };

  return (
    <div className="space-y-8">
      <CommandPanel className="p-6">
        <div className="relative z-10 grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <div className="text-[12px] font-black uppercase tracking-[0.35em] text-amber-200">DNA Studio</div>
            <h1 className="mt-3 text-4xl font-semibold text-white">Build, lock, and evolve unforgettable characters.</h1>
            <p className="mt-2 max-w-2xl text-white/58">Every character profile becomes reusable production memory for images, scenes, videos, campaigns, and Universe Forge.</p>
          </div>
          <div className="flex flex-wrap rounded-xl border border-amber-200/18 bg-black/30 py-4">
            <CommandMetric label="Identity Lock" value={`${characters.length}/8`} detail="Locked" tone="gold" />
            <CommandMetric label="Face Lock" value={`${proof.categories.identity.score}%`} detail="Consistency" tone="cyan" />
            <CommandMetric label="DNA Health" value={`${proof.overallScore}%`} detail="Optimal" tone="violet" />
          </div>
        </div>
      </CommandPanel>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {[
          { title: "Identity Core", subtitle: "Define the foundation of your character's identity.", Icon: UserIcon, active: true },
          { title: "Face Lock", subtitle: "Lock facial structure and key features.", Icon: Dna, active: true },
          { title: "Full Body", subtitle: "Lock proportions, posture, and physical presence.", Icon: Shield, active: true },
          { title: "Style Signature", subtitle: "Define visual style, mood, and aesthetic language.", Icon: Wand2, active: true },
          { title: "Wardrobe Memory", subtitle: "Lock outfits, fabrics, and key looks.", Icon: Shirt, active: true },
          { title: "Values & Themes", subtitle: "Define motivations, values, and narrative themes.", Icon: Heart, active: false },
          { title: "Visual DNA", subtitle: "Lock visual traits that make your character unique.", Icon: Grid3X3, active: true },
          { title: "Seed Consistency", subtitle: "Control randomness and ensure repeatability.", Icon: Sparkles, active: true },
          { title: "Character Variants", subtitle: "Create and manage alternate versions.", Icon: UsersRound, active: false },
        ].map((item) => (
          <CommandModuleCard
            key={item.title}
            title={item.title}
            subtitle={item.subtitle}
            Icon={item.Icon}
            active={item.active}
            complete={item.active}
            onClick={() => setActiveTab("studio")}
            className={item.title === "Character Variants" ? "xl:col-span-2 min-h-[210px]" : "min-h-[210px]"}
          />
        ))}
      </div>

      {/* Header */}
      <div className="hidden">
        <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">DNA Library</div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
          Your{" "}
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            characters.
          </span>
        </h1>
        <p className="text-white/50 mt-3 max-w-xl">
          Every character you've built — their DNA, seed locks, and consistency settings — all in one place.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ProofBadge label="Identity" score={proof.categories.identity.score} status={proof.categories.identity.status} />
          <ProofBadge label="Continuity" score={proof.categories.continuity.score} status={proof.categories.continuity.status} />
        </div>
      </div>

      {/* Search + New */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search characters…"
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => setActiveTab("studio")}
          className="bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold hover:brightness-110"
        >
          <Plus className="w-4 h-4 mr-2" /> New Character
        </Button>
      </div>

      {characters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center mb-6">
            <Dna className="w-8 h-8 text-white/20" />
          </div>
          <div className="text-xl font-bold text-white/60 mb-2">No characters yet</div>
          <div className="text-sm text-white/30 mb-6 max-w-xs">
            Build your first character in Studio — define their DNA, appearance, and style.
          </div>
          <Button
            onClick={() => setActiveTab("studio")}
            className="bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Create First Character
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Character grid */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
            <AnimatePresence>
              {filtered.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  isActive={char.id === activeCharacterId}
                  isSelected={char.id === selected}
                  onSelect={() => setSelected(char.id === selected ? null : char.id)}
                  onSetActive={() => handleSetActive(char.id)}
                  onEdit={() => handleEditDna(char.id)}
                  onDelete={() => deleteCharacter(char.id)}
                />
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-white/30 text-sm">
                No characters match "{search}"
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedChar ? (
                <motion.div
                  key={selectedChar.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard className="p-6 space-y-5 sticky top-24">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black border border-white/10 flex-shrink-0">
                        {selectedChar.portraitDataUrl ? (
                          <img src={selectedChar.portraitDataUrl} alt={selectedChar.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-white/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-lg truncate">{selectedChar.name}</div>
                        {selectedChar.heritage && (
                          <div className="text-sm text-white/50">{selectedChar.heritage}</div>
                        )}
                        {selectedChar.id === activeCharacterId && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
                            <CheckCircle className="w-3 h-3" /> Active character
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DNA Fields */}
                    <div className="space-y-3">
                      {[
                        { label: "Age", value: selectedChar.age },
                        { label: "Body Type", value: selectedChar.bodyType },
                        { label: "Style Tags", value: selectedChar.styleKeywords?.join(", ") },
                        { label: "LoRA", value: selectedChar.loraName || "None" },
                        { label: "LoRA Weight", value: selectedChar.loraWeight?.toString() || "—" },
                        { label: "Seed", value: selectedChar.seed?.toString() || "Random" },
                      ].filter((f) => f.value).map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                          <span className="text-white/40">{label}</span>
                          <span className="text-white/80 font-medium truncate max-w-[60%] text-right">{value}</span>
                        </div>
                      ))}
                    </div>

                    {selectedChar.description && (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs text-white/60 leading-relaxed">
                        {selectedChar.description}
                      </div>
                    )}

                    {selectedChar.seed && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-500/30">
                        <Lock className="w-3.5 h-3.5 text-violet-400" />
                        <div className="text-xs text-violet-300">
                          Seed locked: <span className="font-mono font-bold">{selectedChar.seed}</span>
                        </div>
                        <button
                          onClick={async () => {
                            const copied = await copyToClipboard(String(selectedChar.seed));
                            if (copied) toast.success("Seed copied");
                            else toast.error("Clipboard unavailable");
                          }}
                          className="ml-auto"
                        >
                          <Copy className="w-3 h-3 text-violet-400/60 hover:text-violet-300" />
                        </button>
                      </div>
                    )}

                    <div className="grid gap-3">
                      <ProofBadge
                        label="Identity Lock"
                        score={proof.categories.identity.score}
                        status={proof.categories.identity.status}
                        detail={identityDetail}
                        variant="full"
                      />
                      <ProofBadge
                        label="Continuity Memory"
                        score={proof.categories.continuity.score}
                        status={proof.categories.continuity.status}
                        detail={continuityDetail}
                        variant="full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleSetActive(selectedChar.id)}
                        className="bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold hover:brightness-110"
                      >
                        <Zap className="w-3.5 h-3.5 mr-1.5" /> Use in Forge
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleEditDna(selectedChar.id)}
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit DNA
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-64 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-white/30 gap-3"
                >
                  <ChevronRight className="w-6 h-6" />
                  <div className="text-sm">Select a character to inspect</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

interface CharacterCardProps {
  character: Character;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onSetActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
  key?: React.Key;
}

const CharacterCard = ({ character, isActive, isSelected, onSelect, onSetActive, onEdit, onDelete }: CharacterCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    onClick={onSelect}
    className={`group relative cursor-pointer rounded-2xl border transition-all duration-200 overflow-hidden ${
      isSelected
        ? "border-violet-500/60 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
        : isActive
        ? "border-emerald-500/40 bg-emerald-500/5"
        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
    }`}
  >
    {/* Portrait */}
    <div className="aspect-[3/4] relative overflow-hidden">
      {character.portraitDataUrl ? (
        <img
          src={character.portraitDataUrl}
          alt={character.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center">
          <UserIcon className="w-10 h-10 text-white/15" />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Active badge */}
      {isActive && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold backdrop-blur-sm">
          <CheckCircle className="w-2.5 h-2.5" /> Active
        </div>
      )}

      {/* Seed lock badge — Bug 6 fix: seed 0 is valid, use explicit number check */}
      {typeof character.seed === "number" && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-[10px] text-violet-300 backdrop-blur-sm">
          <Lock className="w-2.5 h-2.5" />
        </div>
      )}

      {/* Hover actions */}
      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onSetActive(); }}
            className="flex-1 py-1.5 rounded-lg bg-violet-500/80 text-white text-[11px] font-bold hover:bg-violet-500 transition-colors backdrop-blur-sm"
          >
            <Zap className="w-3 h-3 inline mr-1" /> Forge
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="py-1.5 px-2.5 rounded-lg bg-white/10 text-white text-[11px] hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="py-1.5 px-2.5 rounded-lg bg-red-500/20 text-red-400 text-[11px] hover:bg-red-500/40 transition-colors backdrop-blur-sm"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    {/* Info */}
    <div className="p-3">
      <div className="font-bold text-sm truncate">{character.name}</div>
      <div className="text-[11px] text-white/40 truncate">
        {[character.heritage, character.age && `${character.age}yo`].filter(Boolean).join(" · ") || "No details"}
      </div>
      {character.loraName && (
        <div className="mt-1 text-[10px] text-violet-300/60 truncate">LoRA: {character.loraName}</div>
      )}
    </div>
  </motion.div>
);
