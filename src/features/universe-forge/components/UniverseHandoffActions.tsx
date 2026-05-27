import { Clapperboard, Dna, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAxsStore } from "@/store/useAxsStore";
import { useSceneBuilderStore } from "@/features/scene-builder/store/useSceneBuilderStore";
import { cn } from "@/lib/utils";
import { buildUniversePrompt } from "../utils/buildUniversePrompt";

export function UniverseHandoffActions({
  compact,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const [handoffStatus, setHandoffStatus] = useState<"idle" | "sending" | "error">("idle");
  const [handoffMessage, setHandoffMessage] = useState("");
  const setActiveTab = useAxsStore((state) => state.setActiveTab);
  const setScenePrompt = useSceneBuilderStore((state) => state.setScenePrompt);
  const setDirectorsCutActive = useSceneBuilderStore((state) => state.setDirectorsCutActive);
  const setAiDirectorActive = useSceneBuilderStore((state) => state.setAiDirectorActive);
  const setActivePanelMode = useSceneBuilderStore((state) => state.setActivePanelMode);
  const runGeneration = useSceneBuilderStore((state) => state.runGeneration);

  const runHandoff = (target: "scene" | "directors-cut") => {
    try {
      setHandoffStatus("sending");
      const prompt = buildUniversePrompt();
      if (!prompt.trim()) throw new Error("Universe prompt is empty");

      setScenePrompt(prompt);
      setAiDirectorActive(true);
      if (target === "directors-cut") {
        setDirectorsCutActive(true);
        setActivePanelMode("directing");
        useSceneBuilderStore.getState().updateAdvanced({
          model: "ltx-video-2.3",
          resolution: "4K",
          aspectRatio: "16:9",
          quality: "master",
        });
        runGeneration("directors-cut");
      } else {
        setActivePanelMode("framing");
      }
      setActiveTab("scene");
      setHandoffMessage(target === "directors-cut" ? "Director's Cut queued" : "Scene Builder loaded");
      setHandoffStatus("idle");
    } catch {
      setHandoffMessage("Could not prepare this universe handoff yet");
      setHandoffStatus("error");
    }
  };

  const sendToSceneBuilder = () => runHandoff("scene");
  const sendToDirectorsCut = () => runHandoff("directors-cut");

  const openDna = () => setActiveTab("dna");

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        type="button"
        onClick={sendToSceneBuilder}
        disabled={handoffStatus === "sending"}
        size={compact ? "sm" : "default"}
        className="rounded-full bg-cyan-100 px-4 text-xs font-black text-black hover:bg-white"
      >
        <Send className="size-4" />
        {compact ? "Scene" : "Send to Scene Builder"}
      </Button>
      <Button
        type="button"
        onClick={sendToDirectorsCut}
        disabled={handoffStatus === "sending"}
        size={compact ? "sm" : "default"}
        className="rounded-full bg-violet-200 px-4 text-xs font-black text-black hover:bg-white"
      >
        <Clapperboard className="size-4" />
        {compact ? "Cut" : "Send to Director's Cut"}
      </Button>
      <Button
        type="button"
        onClick={openDna}
        size={compact ? "sm" : "default"}
        variant="outline"
        className="rounded-full border-white/12 bg-white/[0.05] px-4 text-xs font-black text-white/72 hover:bg-white/[0.10]"
      >
        {compact ? <Dna className="size-4" /> : <Sparkles className="size-4" />}
        {compact ? "DNA" : "Open Character DNA"}
      </Button>
      {handoffMessage && !compact && (
        <span className={cn("text-xs font-bold", handoffStatus === "error" ? "text-rose-200/72" : "text-cyan-50/52")}>
          {handoffMessage}
        </span>
      )}
    </div>
  );
}
