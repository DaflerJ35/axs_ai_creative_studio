import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  FileUp,
  Fingerprint,
  Mic2,
  PenLine,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { getSliderTuple } from "../../lib/sliderValue";
import { useAxsProofSummary } from "../../lib/useAxsProofSummary";
import { useAxsStore } from "../../store/useAxsStore";
import { ProofBadge } from "./ProofBadge";

const voiceTargets = ["Studio prompts", "Script Forge", "Campaign ads", "Distribute captions", "Strategy plans"];

export function CreatorHub() {
  const { brandVoice, updateBrandVoice, setActiveTab } = useAxsStore();
  const proof = useAxsProofSummary();
  const [sample, setSample] = useState("I want the writing to feel cinematic, confident, emotionally sharp, premium, and creator-first. No generic guru talk.");
  const [energy, setEnergy] = useState([78]);
  const [training, setTraining] = useState(false);
  const energyValue = getSliderTuple(energy, 78, 0, 100)[0];

  const voiceScore = useMemo(() => Math.max(34, Math.round((brandVoice.confidence * 100 + energyValue) / 2)), [brandVoice.confidence, energyValue]);
  const brandVoiceDetail = proof.categories.brandVoice.signals[0]?.detail;
  const distributionDetail = proof.categories.distribution.signals[0]?.detail;

  const trainVoice = () => {
    setTraining(true);
    window.setTimeout(() => {
      updateBrandVoice({
        trained: true,
        confidence: Math.min(0.98, Math.max(0.74, energyValue / 100 + 0.12)),
        sampleCount: brandVoice.sampleCount + 1,
        lastTrainedAt: Date.now(),
        tone: "cinematic, bold, emotionally intelligent, premium creator voice",
        cadence: "fast hooks, crisp lines, vivid payoffs, minimal filler",
        signaturePhrases: ["cinematic production", "premium creator engine", "built to ship"],
      });
      setTraining(false);
    }, 900);
  };

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(6,14,35,0.92),rgba(35,16,60,0.86),rgba(8,7,24,0.94))] p-7 shadow-[0_30px_120px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.13)] backdrop-blur-3xl lg:p-9">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(0,212,255,0.18),transparent_30%),radial-gradient(circle_at_78%_2%,rgba(168,85,247,0.24),transparent_32%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-100/75">
              <Mic2 className="h-3.5 w-3.5 text-cyan-200" />
              Creator Hub
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
              Train the voice that powers the entire platform.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/52">
              Upload samples, tune your cadence, and MOMENTUM carries that exact voice into Strategy, Studio prompts, Scripts, Campaign, and Distribute.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ProofBadge label="Brand Voice" score={proof.categories.brandVoice.score} status={proof.categories.brandVoice.status} />
              <ProofBadge label="Distribution" score={proof.categories.distribution.score} status={proof.categories.distribution.status} />
            </div>
            <div className="mt-4 grid max-w-2xl gap-3 md:grid-cols-2">
              <ProofBadge
                label="Voice Training Proof"
                score={proof.categories.brandVoice.score}
                status={proof.categories.brandVoice.status}
                detail={brandVoiceDetail}
                variant="full"
              />
              <ProofBadge
                label="Distribution Reach"
                score={proof.categories.distribution.score}
                status={proof.categories.distribution.status}
                detail={distributionDetail}
                variant="full"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Voice confidence", value: `${voiceScore}%`, Icon: Sparkles },
              { label: "Samples learned", value: `${brandVoice.sampleCount}`, Icon: FileUp },
              { label: "Active surfaces", value: `${voiceTargets.length}`, Icon: Fingerprint },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="rounded-[1.45rem] border border-white/10 bg-black/24 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.11)] backdrop-blur-2xl">
                <Icon className="h-5 w-5 text-cyan-200" />
                <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-white/32">{label}</p>
                <p className="mt-2 text-3xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div className="rounded-[1.85rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_26px_90px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.11)] backdrop-blur-3xl">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[1.5rem] border border-dashed border-cyan-200/18 bg-black/24 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/12 bg-white/8">
                <Upload className="h-6 w-6 text-cyan-200" />
              </div>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-white">Upload your voice DNA</h2>
              <p className="mt-3 text-sm leading-6 text-white/48">
                Paste captions, emails, scripts, ad copy, or strategy docs. The trainer extracts tone, rhythm, vocabulary, and creative rules.
              </p>
              <div className="mt-6 grid gap-3">
                {["Caption samples", "Sales pages", "Scripts", "Newsletter tone"].map((item) => (
                  <button key={item} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-3 text-left transition hover:bg-white/8">
                    <span className="text-sm font-bold text-white/72">{item}</span>
                    <Upload className="h-4 w-4 text-white/32" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <Label className="text-xs font-black uppercase tracking-[0.22em] text-white/40">Voice sample</Label>
                <Textarea
                  value={sample}
                  onChange={(event) => setSample(event.target.value)}
                  className="mt-3 min-h-[190px] resize-none rounded-2xl border-white/10 bg-black/30 text-base leading-7 text-white placeholder:text-white/25 focus-visible:ring-cyan-300/25"
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/22 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-white">Voice energy</p>
                    <p className="text-xs text-white/42">Controls punch, urgency, and creator charisma.</p>
                  </div>
                  <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-sm font-black text-cyan-100">{energyValue}%</span>
                </div>
                <Slider value={[energyValue]} onValueChange={(nextValue) => setEnergy(getSliderTuple(nextValue, energyValue, 0, 100))} min={0} max={100} step={1} className="mt-5" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs font-black uppercase tracking-[0.22em] text-white/40">Tone</Label>
                  <Input value={brandVoice.tone} onChange={(event) => updateBrandVoice({ tone: event.target.value })} className="mt-2 rounded-2xl border-white/10 bg-black/28 text-white" />
                </div>
                <div>
                  <Label className="text-xs font-black uppercase tracking-[0.22em] text-white/40">Audience</Label>
                  <Input value={brandVoice.audience} onChange={(event) => updateBrandVoice({ audience: event.target.value })} className="mt-2 rounded-2xl border-white/10 bg-black/28 text-white" />
                </div>
              </div>
              <Button
                onClick={trainVoice}
                disabled={training || sample.trim().length < 10}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 text-base font-black text-black shadow-[0_0_42px_rgba(168,85,247,0.42)]"
              >
                {training ? "Training creator voice..." : "Train Brand Voice"} <Wand2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-fuchsia-200" />
              <h3 className="text-xl font-black text-white">Voice fingerprint</h3>
            </div>
            <div className="mt-5 space-y-3">
              {[
                ["Tone", brandVoice.tone],
                ["Cadence", brandVoice.cadence],
                ["Audience", brandVoice.audience],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-black/24 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/32">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-white/68">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl">
            <h3 className="text-lg font-black text-white">Auto-applies to</h3>
            <div className="mt-4 space-y-2">
              {voiceTargets.map((target) => (
                <div key={target} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/22 px-4 py-3">
                  <span className="text-sm font-bold text-white/70">{target}</span>
                  <CheckCircle2 className="h-4 w-4 text-cyan-200" />
                </div>
              ))}
            </div>
          </div>

          <motion.div className="rounded-[1.7rem] border border-cyan-200/15 bg-cyan-200/8 p-5 shadow-[0_0_50px_rgba(0,212,255,0.10)]">
            <PenLine className="h-5 w-5 text-cyan-200" />
            <h3 className="mt-4 text-lg font-black text-white">Next best action</h3>
            <p className="mt-2 text-sm leading-6 text-white/52">Generate scripts or a 30-day calendar with the trained voice applied automatically.</p>
            <div className="mt-4 grid gap-2">
              <Button onClick={() => setActiveTab("scripts")} className="rounded-2xl bg-white text-black hover:bg-cyan-100">
                Open Script Forge <ArrowRight className="h-4 w-4" />
              </Button>
              <Button onClick={() => setActiveTab("strategy")} variant="outline" className="rounded-2xl border-white/12 bg-white/8 text-white hover:bg-white/12">
                Open Strategy
              </Button>
            </div>
          </motion.div>
        </aside>
      </section>
    </div>
  );
}
