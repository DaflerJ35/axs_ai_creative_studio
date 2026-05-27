import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Megaphone, Sparkles, Download, User as UserIcon,
  Building2, ShoppingBag, TrendingUp, Plus, X,
  DollarSign, Target, BarChart3, ArrowRight,
  CheckCircle, Layers, FileText, Star, Zap,
  ChevronDown, ChevronRight, RotateCcw, Package,
  Copy, ExternalLink, Cpu,
} from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { GlassCard } from "../ui/glass-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useNyxStore, useActiveCharacter } from "../../store/useNyxStore";
import { forgeImage } from "../../lib/workflows";

// ─── Constants ───────────────────────────────────────────────────────────────

const BUSINESS_MODES = [
  {
    id: "agency",
    icon: Megaphone,
    title: "Ad Creative Agency",
    tagline: "25–30 variations. 48 hours. $2k–$3k/client.",
    description:
      "Generate full campaign batches for clients burning $20k–$100k/month on ads. Proven hooks × multiple formats = unstoppable creative velocity. You deliver. They renew.",
    gradient: "from-cyan-400 via-violet-500 to-pink-500",
    glowColor: "shadow-[0_0_40px_rgba(139,92,246,0.35)]",
    borderColor: "border-violet-500/30",
    economics: {
      charge: "$2,500 / mo",
      cost: "$200 / mo",
      margin: "92%",
      clientsFor10k: 4,
    },
    checklist: [
      "25–30 proven-hook variations",
      "Multiple ad formats (Meta, TikTok, Story)",
      "Unique UGC AI spokesperson per client",
      "Delivered in under 48 hours",
      "Godfather offer: redo until satisfied",
    ],
    placeholder: {
      product: "Aurora Silk Serum",
      avatar: "Women 28–45, skincare-obsessed, $80k+ HHI",
      budget: "50000",
    },
  },
  {
    id: "local_biz",
    icon: Building2,
    title: "Local Business AI",
    tagline: "AI receptionist. 24/7. Never calls in sick.",
    description:
      "Bolt AI onto plumbers, dentists, cleaners. 40% of calls go unanswered — that's revenue walking out the door. Show them the demo, let the AI sell itself.",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    glowColor: "shadow-[0_0_40px_rgba(20,184,166,0.35)]",
    borderColor: "border-teal-500/30",
    economics: {
      charge: "$1,500 / mo",
      cost: "$100 / mo",
      margin: "93%",
      clientsFor10k: 7,
    },
    checklist: [
      "AI answering service demo ads",
      "Before/after call-answer rate visuals",
      "Revenue-recapture calculator creative",
      "Personalized to business type",
      "Cold-email ready hero images",
    ],
    placeholder: {
      product: "Smith Family Dental Practice",
      avatar: "Local dental practice, 2–10 staff, missing after-hours calls",
      budget: "3000",
    },
  },
  {
    id: "ecom",
    icon: ShoppingBag,
    title: "Ecom Launch Stack",
    tagline: "Validate → Build → Launch. One afternoon.",
    description:
      "Crawl TikTok Shop & Amazon data to find winning products, generate studio-quality shots, write all copy, spin up ads — in hours not weeks. Exit at 3–5× EBITDA.",
    gradient: "from-orange-400 via-rose-500 to-pink-500",
    glowColor: "shadow-[0_0_40px_rgba(251,113,133,0.35)]",
    borderColor: "border-rose-500/30",
    economics: {
      charge: "3–5× EBITDA exit",
      cost: "Near zero",
      margin: "Brand equity",
      clientsFor10k: 1,
    },
    checklist: [
      "Studio-quality product hero shots",
      "UGC unboxing & lifestyle visuals",
      "Split-test variant creatives",
      "Multiple platforms (Meta, TikTok, Google)",
      "Store-ready product imagery",
    ],
    placeholder: {
      product: "ProGlow LED Face Mask",
      avatar: "Health-conscious women 25–40, skincare enthusiasts",
      budget: "10000",
    },
  },
  {
    id: "tiktok",
    icon: TrendingUp,
    title: "TikTok Shop Affiliate",
    tagline: "30% commission. No product. No team. Just AI.",
    description:
      "Build a faceless AI influencer, post 3–6× daily, collect commissions. Find one viral product, triple down. One winning video can pull 50M views and print cash.",
    gradient: "from-pink-400 via-fuchsia-500 to-purple-500",
    glowColor: "shadow-[0_0_40px_rgba(217,70,239,0.35)]",
    borderColor: "border-fuchsia-500/30",
    economics: {
      charge: "30% commission",
      cost: "Near zero",
      margin: "Volume play",
      clientsFor10k: 0,
    },
    checklist: [
      "AI influencer UGC-style content",
      "Hook-optimized short-form scripts",
      "3–6 daily content pieces",
      "Proven hook variations from top creators",
      "Consumable/high-reorder products",
    ],
    placeholder: {
      product: "VibeStick LED Aromatherapy Diffuser",
      avatar: "Gen Z & Millennials, wellness & home decor, impulse buyers",
      budget: "0",
    },
  },
] as const;

type BusinessMode = (typeof BUSINESS_MODES)[number]["id"];

const FORMATS = [
  { id: "9:16", w: 768, h: 1344, label: "9:16 Story / TikTok", icon: "▯" },
  { id: "4:5", w: 896, h: 1152, label: "4:5 Feed Post", icon: "▭" },
  { id: "1:1", w: 1024, h: 1024, label: "1:1 Square", icon: "□" },
  { id: "16:9", w: 1344, h: 768, label: "16:9 Banner", icon: "▬" },
] as const;

const AD_STYLES = [
  { id: "ugc", label: "UGC / Testimonial", prompt: "authentic user-generated content style, casual, real person using product, natural lighting, handheld camera feel" },
  { id: "lifestyle", label: "Lifestyle Moment", prompt: "aspirational lifestyle photography, golden hour, natural authentic mood, editorial quality" },
  { id: "product_hero", label: "Product Hero", prompt: "commercial product photography, clean background, dramatic studio lighting, professional brand shoot" },
  { id: "street_candid", label: "Street Candid", prompt: "urban street photography, candid authentic moment, city backdrop, real-world context" },
  { id: "before_after", label: "Before / After", prompt: "split-screen transformation visual, clear contrast, aspirational result, clean composition" },
] as const;

// Proven hook frameworks per mode
const HOOK_TEMPLATES: Record<BusinessMode, string[]> = {
  agency: [
    "I was spending $15k/month on ad creative and getting nothing. Then this happened...",
    "Why your competitors are getting 10× the results with half the spend",
    "POV: Your ad account finally has unlimited creative firepower",
    "Stop paying $5k for ad creatives you hate",
    "The only metric that matters in 2026: creative velocity",
  ],
  local_biz: [
    "Your phone rings. Nobody answers. That's your competitor's new customer.",
    "We called 50 dental practices. 40% never picked up.",
    "What if you could hire a receptionist for $2/hour who never sleeps?",
    "The $70,000 problem most small businesses don't know they have",
    "I tried to book a dentist at 9pm. What happened changed everything.",
  ],
  ecom: [
    "I found a product doing $2M/month on TikTok and copied it",
    "From idea to first sale in one afternoon — here's the exact stack",
    "The AI ecom playbook nobody is talking about in 2026",
    "Why this $30 product has 847 five-star reviews and zero competition",
    "I built a 6-figure ecom brand without filming a single video",
  ],
  tiktok: [
    "POV: You wake up to $3,000 in commissions you made while you slept",
    "This product went viral 3 weeks ago. Here's what happened next.",
    "I posted 6 times a day for 30 days. Here's what I learned.",
    "The faceless TikTok account making $12k/month from one niche",
    "Nobody told me TikTok Shop affiliates get 30% commission on this",
  ],
};

// Copy generation templates
function generateAdCopy(
  mode: BusinessMode,
  productName: string,
  avatar: string,
  hookIndex: number
): { hook: string; headline: string; cta: string } {
  const hooks = HOOK_TEMPLATES[mode];
  const hook = hooks[hookIndex % hooks.length];

  const headlines: Record<BusinessMode, string[]> = {
    agency: [
      `${productName} — 30 ads. 48 hours. Guaranteed.`,
      `Creative velocity that feeds your ad machine`,
      `The ad studio that never misses a deadline`,
    ],
    local_biz: [
      `Never Miss Another ${productName} Customer`,
      `Your 24/7 AI Receptionist Is Ready`,
      `Capture Every Call. Book Every Lead.`,
    ],
    ecom: [
      `${productName} — The Brand That Prints`,
      `Join 10,000+ customers obsessed with ${productName}`,
      `Finally. A product that actually works.`,
    ],
    tiktok: [
      `${productName} changed the game`,
      `Everyone is buying this right now`,
      `I can't believe this is only $X`,
    ],
  };

  const ctas: Record<BusinessMode, string[]> = {
    agency: ["Get 30 Ads Free →", "Book a Demo →", "See Campaign Samples →"],
    local_biz: ["Hear Your AI Receptionist →", "Get Your Demo →", "Calculate Your Lost Revenue →"],
    ecom: ["Shop Now — Free Shipping →", "Claim Your Discount →", "See Why Everyone's Buying →"],
    tiktok: ["Link in Bio →", "Shop Now →", "Get Yours Before It's Gone →"],
  };

  const hIdx = hookIndex % headlines[mode].length;
  return {
    hook,
    headline: headlines[mode][hIdx],
    cta: ctas[mode][hIdx],
  };
}

function buildCampaignPrompt(
  mode: BusinessMode,
  productName: string,
  productDesc: string,
  adStyle: string,
  hook: string
): string {
  const styleEntry = AD_STYLES.find((s) => s.id === adStyle);
  const stylePrompt = styleEntry?.prompt || "professional commercial photography";

  const modeContext: Record<BusinessMode, string> = {
    agency: "high-performance direct response ad creative, conversion-optimized, premium brand aesthetic",
    local_biz: "trustworthy local business imagery, approachable professional, community-focused",
    ecom: "product-centric e-commerce photography, desire-building, high-quality product showcase",
    tiktok: "scroll-stopping social media content, authentic and relatable, trending aesthetic",
  };

  return `${stylePrompt}, ${modeContext[mode]}. Product: ${productName}. ${productDesc}. Hook concept: "${hook}". Natural product placement, authentic mood, no text overlays, no watermarks.`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CampaignResult {
  id: string;
  url: string;
  seed: number;
  hook: string;
  headline: string;
  cta: string;
  format: string;
  adStyle: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const MarketingStudio = () => {
  const { settings, addToGallery } = useNyxStore();
  const character = useActiveCharacter();

  // Mode
  const [businessMode, setBusinessMode] = useState<BusinessMode>("agency");
  const activeMode = BUSINESS_MODES.find((m) => m.id === businessMode)!;

  // Campaign brief
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [customerAvatar, setCustomerAvatar] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");

  // Hooks
  const [customHooks, setCustomHooks] = useState<string[]>([]);
  const [hookInput, setHookInput] = useState("");
  const [useTemplateHooks, setUseTemplateHooks] = useState(true);

  // Generation config
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["9:16", "4:5"]);
  const [adStyle, setAdStyle] = useState("ugc");
  const [batchCount, setBatchCount] = useState(10);

  // Progress & results
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<CampaignResult[]>([]);
  const [expandBrief, setExpandBrief] = useState(true);

  // Computed hooks list
  const activeHooks = useMemo(() => {
    const templates = useTemplateHooks ? HOOK_TEMPLATES[businessMode] : [];
    return [...customHooks, ...templates];
  }, [customHooks, useTemplateHooks, businessMode]);

  const toggleFormat = useCallback((id: string) => {
    setSelectedFormats((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }, []);

  const handleAddHook = () => {
    const h = hookInput.trim();
    if (!h) return;
    setCustomHooks((prev) => [...prev, h]);
    setHookInput("");
  };

  const estimatedCount = useMemo(
    () => Math.min(batchCount, activeHooks.length * selectedFormats.length),
    [batchCount, activeHooks.length, selectedFormats.length]
  );

  const handleGenerateCampaign = async () => {
    if (!productName.trim()) {
      return toast.error("Enter a product or business name.");
    }
    if (!character) {
      return toast.error("Create and lock a character in Studio first.");
    }
    if (selectedFormats.length === 0) {
      return toast.error("Select at least one ad format.");
    }
    if (activeHooks.length === 0) {
      return toast.error("Add at least one hook or enable template hooks.");
    }

    // Build job queue: round-robin hooks × formats up to batchCount
    const jobs: { hook: string; hookIndex: number; format: (typeof FORMATS)[number] }[] = [];
    let h = 0;
    while (jobs.length < batchCount) {
      const hookStr = activeHooks[h % activeHooks.length];
      const fmt = FORMATS.find((f) => f.id === selectedFormats[jobs.length % selectedFormats.length])!;
      jobs.push({ hook: hookStr, hookIndex: h, format: fmt });
      h++;
      if (jobs.length >= activeHooks.length * selectedFormats.length && jobs.length >= estimatedCount) break;
    }

    setGenerating(true);
    setProgress({ current: 0, total: jobs.length });
    const newResults: CampaignResult[] = [];

    for (let i = 0; i < jobs.length; i++) {
      const { hook, hookIndex, format } = jobs[i];
      setProgress({ current: i + 1, total: jobs.length });

      const prompt = buildCampaignPrompt(businessMode, productName, productDesc, adStyle, hook);
      const copy = generateAdCopy(businessMode, productName, customerAvatar, hookIndex);

      try {
        const out = await forgeImage({
          prompt,
          character,
          stylePreset: "editorial",
          settings: { ...settings, width: format.w, height: format.h, batchSize: 1 },
        });

        if (out.status === "success" && out.images?.length) {
          const img = out.images[0];
          const url = `data:image/png;base64,${img.image}`;
          const result: CampaignResult = {
            id: crypto.randomUUID(),
            url,
            seed: img.seed,
            hook: copy.hook,
            headline: copy.headline,
            cta: copy.cta,
            format: format.id,
            adStyle,
          };
          newResults.push(result);
          setResults((prev) => [...prev, result]);
          addToGallery({
            id: result.id,
            type: "image",
            url,
            prompt,
            seed: img.seed,
            characterId: character.id,
            stylePreset: "editorial",
            width: format.w,
            height: format.h,
            createdAt: Date.now() + i,
            favorite: false,
          });
        }
      } catch {
        // continue generating remaining jobs
      }
    }

    setGenerating(false);
    if (newResults.length > 0) {
      toast.success(`Campaign ready — ${newResults.length} variations generated`, {
        description: "All assets saved to Gallery.",
      });
    } else {
      toast.error("Generation failed. Check your RunPod settings.");
    }
  };

  const handleExportAll = () => {
    results.forEach((r, i) => {
      const a = document.createElement("a");
      a.href = r.url;
      a.download = `campaign-${businessMode}-${i + 1}-${r.seed}.png`;
      a.click();
    });
  };

  const handleCopyHook = (hook: string) => {
    navigator.clipboard.writeText(hook);
    toast.success("Hook copied to clipboard");
  };

  return (
    <div className="space-y-10">
      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">
          Campaign Studio
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
          Build campaigns{" "}
          <span
            className={`bg-gradient-to-r ${activeMode.gradient} bg-clip-text text-transparent transition-all duration-500`}
          >
            that print.
          </span>
        </h1>
        <p className="text-white/50 mt-4 max-w-2xl text-lg">
          $250M in agency-tested playbooks. Four business models. One studio.
          Generate 25–30 ad variations in hours, not weeks.
        </p>

        {/* Economics badge */}
        <motion.div
          className="inline-flex items-center gap-3 mt-6 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">
            Charge{" "}
            <span className="text-white font-bold">{activeMode.economics.charge}</span>
          </span>
          <span className="w-px h-4 bg-white/10" />
          <span className="text-sm font-medium">
            Cost{" "}
            <span className="text-white font-bold">{activeMode.economics.cost}</span>
          </span>
          <span className="w-px h-4 bg-white/10" />
          <span className="text-sm font-medium">
            Margin{" "}
            <span className="text-emerald-400 font-bold">{activeMode.economics.margin}</span>
          </span>
        </motion.div>
      </div>

      {/* ── Business Mode Selector ───────────────────────────────────────────── */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
          Select Business Model
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {BUSINESS_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = businessMode === mode.id;
            return (
              <motion.button
                key={mode.id}
                onClick={() => setBusinessMode(mode.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer
                  ${isActive
                    ? `${mode.borderColor} bg-white/[0.08] ${mode.glowColor}`
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="mode-glow"
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${mode.gradient} opacity-10`}
                  />
                )}
                <div className="relative z-10">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${mode.gradient}`}
                  >
                    <Icon className="w-5 h-5 text-black" />
                  </div>
                  <div className="font-black text-sm mb-1">{mode.title}</div>
                  <div className="text-xs text-white/50 leading-snug">{mode.tagline}</div>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 flex items-center gap-1 text-xs font-medium text-white/70"
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> Selected
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Mode Description ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={businessMode}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <GlassCard className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${activeMode.gradient}`}
              >
                <Target className="w-4 h-4 text-black" />
              </div>
              <div>
                <div className="font-bold text-sm">{activeMode.title}</div>
                <div className="text-white/50 text-xs mt-1">{activeMode.description}</div>
              </div>
            </div>
            <div className="space-y-2">
              {activeMode.checklist.map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-white/70">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-white/40" />
              <div className="text-xs uppercase tracking-wider text-white/40">Economics</div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-white/60 text-sm">You charge</span>
                <span className="font-black text-lg bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  {activeMode.economics.charge}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-white/60 text-sm">Your hard cost</span>
                <span className="font-bold text-white">{activeMode.economics.cost}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-baseline">
                <span className="text-white/60 text-sm">Margin</span>
                <span className="font-black text-2xl text-emerald-400">
                  {activeMode.economics.margin}
                </span>
              </div>
              {activeMode.economics.clientsFor10k > 0 && (
                <div className="text-xs text-white/40 text-right">
                  {activeMode.economics.clientsFor10k} clients = $10k/mo
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* ── Campaign Brief ───────────────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => setExpandBrief((v) => !v)}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40 mb-4 hover:text-white/60 transition-colors"
        >
          {expandBrief ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Campaign Brief
        </button>

        <AnimatePresence>
          {expandBrief && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>
                      {businessMode === "local_biz" ? "Business name" : "Product name"}
                    </Label>
                    <Input
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder={activeMode.placeholder.product}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Customer avatar</Label>
                    <Input
                      value={customerAvatar}
                      onChange={(e) => setCustomerAvatar(e.target.value)}
                      placeholder={activeMode.placeholder.avatar}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>
                      {businessMode === "local_biz"
                        ? "Business description & pain points"
                        : "Product description"}
                    </Label>
                    <Textarea
                      rows={3}
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      placeholder={
                        businessMode === "local_biz"
                          ? "Describe the business, their biggest pain point (missed calls, no follow-up, spreadsheet chaos), and what outcome they want."
                          : "Describe the product visually: packaging, colors, textures, size. The richer the detail, the better the visual output."
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>
                      {businessMode === "agency"
                        ? "Monthly ad spend ($)"
                        : businessMode === "local_biz"
                        ? "Approximate annual revenue ($)"
                        : businessMode === "ecom"
                        ? "Target launch budget ($)"
                        : "Commission rate (%)"}
                    </Label>
                    <Input
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      placeholder={activeMode.placeholder.budget}
                      type="number"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Ad visual style</Label>
                    <Select value={adStyle} onValueChange={setAdStyle}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AD_STYLES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Spokesperson ─────────────────────────────────────────────────────── */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">
          Spokesperson
        </div>
        {character ? (
          <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.03] w-fit">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0">
              {character.portraitDataUrl ? (
                <img
                  src={character.portraitDataUrl}
                  className="w-full h-full object-cover"
                  alt={character.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white/30" />
                </div>
              )}
            </div>
            <div>
              <div className="text-xs text-white/40 uppercase tracking-wider">AI Spokesperson</div>
              <div className="font-bold">{character.name}</div>
              <div className="text-xs text-white/40">
                {character.age && `${character.age} · `}
                {character.heritage}
              </div>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-400 ml-2" />
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-amber-200/80 p-4 rounded-xl border border-amber-400/20 bg-amber-400/5">
            <UserIcon className="w-4 h-4 text-amber-400" />
            <span>
              Create and lock a synthetic character in{" "}
              <strong>Studio</strong> to use as your AI spokesperson.
              No real people — fully synthetic, legally clean.
            </span>
          </div>
        )}
      </div>

      {/* ── Hook Library ─────────────────────────────────────────────────────── */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
          Hook Matrix
        </div>
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-white/60 text-sm mb-4">
                Hooks are the first 3 seconds. Proven hooks × multiple formats = your variation matrix.
                Add winning hooks from your niche or use our battle-tested templates below.
              </p>

              {/* Template toggle */}
              <button
                onClick={() => setUseTemplateHooks((v) => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all mb-4 ${
                  useTemplateHooks
                    ? "bg-violet-500/20 border border-violet-500/40 text-violet-300"
                    : "bg-white/[0.04] border border-white/10 text-white/40 hover:text-white/60"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Template hooks ({HOOK_TEMPLATES[businessMode].length})
                {useTemplateHooks ? " — ON" : " — OFF"}
              </button>

              {/* Template hooks preview */}
              <AnimatePresence>
                {useTemplateHooks && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 mb-4"
                  >
                    {HOOK_TEMPLATES[businessMode].map((h, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] group"
                      >
                        <FileText className="w-3.5 h-3.5 text-white/30 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-white/70 flex-1">{h}</span>
                        <button
                          onClick={() => handleCopyHook(h)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-3 h-3 text-white/40 hover:text-white/70" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Custom hook input */}
              <div className="flex gap-2">
                <Input
                  value={hookInput}
                  onChange={(e) => setHookInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddHook()}
                  placeholder="Paste a winning hook from a competitor's top ad..."
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleAddHook}
                  variant="outline"
                  className="px-3 border-white/20"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Custom hooks */}
              {customHooks.length > 0 && (
                <div className="mt-3 space-y-2">
                  {customHooks.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-cyan-400/[0.06] border border-cyan-400/20"
                    >
                      <Star className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-white/80 flex-1">{h}</span>
                      <button onClick={() => setCustomHooks((prev) => prev.filter((_, j) => j !== i))}>
                        <X className="w-3 h-3 text-white/40 hover:text-white/70" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <div className="flex items-center gap-3 text-sm text-white/50">
            <Zap className="w-4 h-4 text-violet-400" />
            <span>
              <span className="text-white font-bold">{activeHooks.length}</span> hooks active ×{" "}
              <span className="text-white font-bold">{selectedFormats.length}</span> formats ={" "}
              <span className="text-white font-bold">
                {activeHooks.length * selectedFormats.length}
              </span>{" "}
              possible variations
            </span>
          </div>
        </GlassCard>
      </div>

      {/* ── Generation Config ────────────────────────────────────────────────── */}
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
          Campaign Config
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Format selector */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-white/40" />
              <div className="text-sm font-medium">Ad Formats</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => toggleFormat(f.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs transition-all ${
                    selectedFormats.includes(f.id)
                      ? "border-violet-500/50 bg-violet-500/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20"
                  }`}
                >
                  <span className="text-base leading-none">{f.icon}</span>
                  <span>{f.label}</span>
                  {selectedFormats.includes(f.id) && (
                    <CheckCircle className="w-3 h-3 text-violet-400 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Batch count */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-white/40" />
              <div className="text-sm font-medium">Variations to Generate</div>
            </div>
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-white/50 text-sm">Count</span>
                <span className="font-black text-3xl bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  {batchCount}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {[5, 10, 15, 25, 30].map((n) => (
                  <button
                    key={n}
                    onClick={() => setBatchCount(n)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 ${
                      batchCount === n
                        ? "bg-gradient-to-r from-cyan-400 to-violet-500 text-black"
                        : "bg-white/[0.05] text-white/50 hover:bg-white/[0.08]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="text-xs text-white/40 space-y-1">
                <div>≈ {Math.ceil(batchCount / (selectedFormats.length || 1))} hooks used</div>
                <div>Delivered to Gallery automatically</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ── Local GPU Note ───────────────────────────────────────────────────── */}
      <GlassCard intensity="light" className="p-5">
        <div className="flex items-start gap-3">
          <Cpu className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold text-sm mb-1">
              RTX 3080 10GB detected path — Local generation
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Your GPU can run <strong className="text-white">SDXL</strong>,{" "}
              <strong className="text-white">FLUX.1-schnell</strong> at 512–768px, and{" "}
              <strong className="text-white">SD3.5 Medium</strong> locally via{" "}
              <strong className="text-white">ComfyUI</strong> (free). FLUX.1-dev at 1024px
              needs 16GB+ VRAM — RunPod stays the best call for full-res campaigns.
              Your 64GB RAM means aggressive CPU offloading works well.{" "}
              <a
                href="https://github.com/comfyanonymous/ComfyUI"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
              >
                Set up ComfyUI <ExternalLink className="w-3 h-3" />
              </a>
              {" · "}
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
              >
                Ollama for local LLM <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </GlassCard>

      {/* ── Generate Button ──────────────────────────────────────────────────── */}
      <div>
        <Button
          onClick={handleGenerateCampaign}
          disabled={generating || !character || selectedFormats.length === 0}
          className={`
            w-full h-16 text-lg font-black rounded-2xl transition-all duration-300
            bg-gradient-to-r ${activeMode.gradient} text-black
            hover:brightness-110 active:scale-[0.99]
            ${activeMode.glowColor}
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
          `}
        >
          {generating ? (
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span>Rendering variation {progress.current} of {progress.total}…</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6" />
              <span>
                Generate {batchCount} Ad Variations
              </span>
              <ArrowRight className="w-5 h-5 ml-auto" />
            </div>
          )}
        </Button>

        {/* Progress bar */}
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${activeMode.gradient}`}
                  animate={{
                    width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                  }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/40">
                <span>Generating campaign…</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Results Wall ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-1">
                  Campaign Output
                </div>
                <div className="font-black text-2xl">
                  {results.length}{" "}
                  <span className="text-white/40 font-normal text-base">variations ready</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setResults([])}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white/60"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Clear
                </Button>
                <Button
                  onClick={handleExportAll}
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 border border-white/20"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export All
                </Button>
              </div>
            </div>

            <div className="columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
              {results.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="break-inside-avoid relative rounded-2xl overflow-hidden border border-white/10 group"
                >
                  <img
                    src={r.url}
                    className="w-full h-auto block"
                    alt={r.headline}
                  />

                  {/* Hover overlay with copy */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                    <div className="text-xs text-white/60 mb-1 uppercase tracking-wider">
                      {FORMATS.find((f) => f.id === r.format)?.label}
                    </div>
                    <div className="font-bold text-sm leading-tight mb-2">{r.headline}</div>
                    <div className="text-xs text-white/70 mb-3 line-clamp-2">{r.hook}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 flex-1 text-center truncate">
                        {r.cta}
                      </span>
                      <button
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = r.url;
                          a.download = `ad-${businessMode}-${r.seed}.png`;
                          a.click();
                        }}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopyHook(r.hook)}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Format badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white/70 border border-white/10">
                    {r.format}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Campaign Report */}
            <GlassCard className="mt-8 p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
                Campaign Report
              </div>
              <div className="grid sm:grid-cols-4 gap-4">
                {[
                  {
                    label: "Variations",
                    value: results.length,
                    icon: Layers,
                    color: "text-violet-400",
                  },
                  {
                    label: "Formats",
                    value: [...new Set(results.map((r) => r.format))].length,
                    icon: Package,
                    color: "text-cyan-400",
                  },
                  {
                    label: "Unique Hooks",
                    value: [...new Set(results.map((r) => r.hook))].length,
                    icon: FileText,
                    color: "text-pink-400",
                  },
                  {
                    label: "Campaign Value",
                    value: activeMode.economics.charge,
                    icon: DollarSign,
                    color: "text-emerald-400",
                  },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                    <div className="font-black text-xl">{value}</div>
                    <div className="text-xs text-white/40 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketingStudio;
