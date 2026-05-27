import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  FileText, Sparkles, Copy, Zap, Clock, CheckCircle,
  ChevronRight, RotateCcw, BookOpen, Target, TrendingUp,
  Play, Lightbulb, Download, Star, ArrowRight, Image, List, Megaphone,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { GlassCard } from "../ui/glass-card";
import { useAxsStore, useActiveCharacter } from "../../store/useAxsStore";
import { copyToClipboard } from "../../lib/safeClipboard";
import { useAxsProofSummary } from "../../lib/useAxsProofSummary";
import { ProofBadge } from "../platform/ProofBadge";

// ─── Framework Definitions ─────────────────────────────────────────────────

const FRAMEWORKS = [
  {
    id: "pas",
    name: "P·A·S",
    full: "Problem → Agitate → Solution",
    description: "Surface the pain. Twist the knife. Then save the day. Best hook-to-close ratio for high-ticket products.",
    color: "from-cyan-400/60 to-slate-600",
    glow: "shadow-[0_0_20px_rgba(34,211,238,0.08)]",
    border: "border-cyan-500/20",
    totalDuration: "45–60s",
    conversionRating: 5,
    bestFor: ["High-ticket products", "Problem-aware avatars", "Meta Feed", "YouTube Pre-roll"],
  },
  {
    id: "aida",
    name: "AIDA",
    full: "Attention → Interest → Desire → Action",
    description: "Classic direct-response funnel compressed into 60 seconds. Best for cold traffic who don't know they have the problem yet.",
    color: "from-slate-400 to-slate-600",
    glow: "shadow-[0_0_20px_rgba(100,116,139,0.08)]",
    border: "border-slate-500/20",
    totalDuration: "50–70s",
    conversionRating: 4,
    bestFor: ["Cold traffic", "Brand awareness to conversion", "Meta Feed", "YouTube Shorts"],
  },
  {
    id: "before_after",
    name: "Before/After",
    full: "Before → Bridge → After",
    description: "Show the transformation. Insanely effective for physical products where the result is visible. Let the result do the selling.",
    color: "from-slate-400 to-slate-600",
    glow: "shadow-[0_0_20px_rgba(100,116,139,0.08)]",
    border: "border-slate-500/20",
    totalDuration: "30–45s",
    conversionRating: 5,
    bestFor: ["Physical products", "Visible transformations", "TikTok Shop", "Instagram Reels"],
  },
  {
    id: "story",
    name: "Story",
    full: "Story → Teach → Offer",
    description: "Personal story builds trust. Teach one insight. Make the offer. Best for high-LTV products where trust matters more than impulse.",
    color: "from-slate-400 to-slate-600",
    glow: "shadow-[0_0_20px_rgba(100,116,139,0.08)]",
    border: "border-slate-500/20",
    totalDuration: "60–90s",
    conversionRating: 4,
    bestFor: ["High-LTV products", "Trust-dependent purchases", "YouTube long-form", "Meta retargeting"],
  },
  {
    id: "ugc",
    name: "Authentic UGC",
    full: "Hook → Context → Demo → Honest Review → CTA",
    description: "Unscripted-feeling, first-person review format. Highest trust signal on TikTok. Best for impulse-buy or consumable products.",
    color: "from-slate-400 to-slate-600",
    glow: "shadow-[0_0_20px_rgba(100,116,139,0.08)]",
    border: "border-slate-500/20",
    totalDuration: "30–60s",
    conversionRating: 5,
    bestFor: ["TikTok Shop affiliates", "Consumable products", "Young demographics (18–35)", "Impulse buys"],
  },
  {
    id: "hook_story",
    name: "Hook·Story·CTA",
    full: "Pattern Interrupt → Personal Story → Hard Close",
    description: "Short punchy hook, a 20-second personal story with stakes, then a confident CTA. Best ratio of length to conversion on short-form.",
    color: "from-cyan-400/60 to-slate-600",
    glow: "shadow-[0_0_20px_rgba(34,211,238,0.08)]",
    border: "border-cyan-500/20",
    totalDuration: "25–40s",
    conversionRating: 5,
    bestFor: ["TikTok Shop", "Impulse buys", "Cold traffic short-form", "Under-30 demographics"],
  },
  {
    id: "emotional_arc",
    name: "Emotional Arc",
    full: "Feel → Relate → Aspire → Act",
    description: "Lead with pure emotion. Validate the viewer's inner life. Paint the aspiration. Make the CTA feel inevitable. Best for lifestyle and identity purchases.",
    color: "from-slate-400 to-slate-600",
    glow: "shadow-[0_0_20px_rgba(100,116,139,0.08)]",
    border: "border-slate-500/20",
    totalDuration: "45–75s",
    conversionRating: 4,
    bestFor: ["Lifestyle brands", "Identity purchases", "Wellness & beauty", "Premium pricing"],
  },
  {
    id: "ugc_raw",
    name: "Raw UGC",
    full: "Unscripted · Real Reaction · No Polish",
    description: "Zero production value on purpose. Shaky cam, real room, real lighting. The algorithm rewards native-feeling content — this is native.",
    color: "from-slate-400 to-slate-600",
    glow: "shadow-[0_0_20px_rgba(100,116,139,0.08)]",
    border: "border-slate-500/20",
    totalDuration: "15–30s",
    conversionRating: 4,
    bestFor: ["Gen-Z audiences", "Viral organic reach", "Budget brands", "TikTok native"],
  },
] as const;

type FrameworkId = (typeof FRAMEWORKS)[number]["id"];

const PLATFORMS = [
  { id: "tiktok", label: "TikTok / TikTok Shop", maxSeconds: 60 },
  { id: "reels", label: "Instagram Reels", maxSeconds: 90 },
  { id: "shorts", label: "YouTube Shorts", maxSeconds: 60 },
  { id: "meta", label: "Meta Feed Ad", maxSeconds: 120 },
  { id: "youtube", label: "YouTube Pre-roll", maxSeconds: 30 },
] as const;

// ─── Script Generation Engine ──────────────────────────────────────────────

interface ScriptSection {
  title: string;
  timeCode: string;
  lines: string;
  tips: string[];
  visualPrompt: string;
}

interface GeneratedScript {
  id: string;
  framework: FrameworkId;
  frameworkName: string;
  platform: string;
  totalDuration: string;
  sections: ScriptSection[];
  hookVariations: string[];
  ctaVariations: string[];
}

function generatePAS(product: string, avatar: string, angle: string, platform: string): GeneratedScript {
  const duration = platform === "youtube" ? "25s" : "45–60s";
  return {
    id: crypto.randomUUID(),
    framework: "pas",
    frameworkName: "Problem · Agitate · Solution",
    platform,
    totalDuration: duration,
    sections: [
      {
        title: "Problem Hook",
        timeCode: "0 – 3s",
        lines: `"Stop scrolling if you've tried everything and ${product} still sounds too good to be true. Because I was exactly where you are."`,
        tips: [
          "Open mid-sentence, no greeting. 'Stop scrolling' is a proven pattern interrupt.",
          "Look directly into lens. Slight lean forward. 0.5s pause before the second sentence.",
          "Film in natural window light — ring lights scream 'ad'.",
        ],
        visualPrompt: `${avatar}, looking directly at camera with knowing expression, natural indoor lighting, authentic home environment, slightly leaning forward`,
      },
      {
        title: "Agitate the Pain",
        timeCode: "3 – 15s",
        lines: `"Here's what nobody says out loud — most people in your position have already wasted money on [cheaper alternative]. And the result is [consequence of problem]. Sound familiar? You're not doing it wrong. The [category] they sold you is just fundamentally broken."`,
        tips: [
          "Name the alternative they've tried. This proves you understand their journey.",
          "Pause after 'Sound familiar?' — let them feel it.",
          "Don't talk faster. Slower = more authority. This is where trust gets built.",
        ],
        visualPrompt: `${avatar}, thoughtful expression, relatable home setting, slightly frustrated but nodding, authentic candid moment`,
      },
      {
        title: "Solution Reveal",
        timeCode: "15 – 40s",
        lines: `"Then I tried ${product}. And I want to be honest — week one, I didn't notice much. Week two, [first sign]. By week four? [Specific transformation tied to angle: ${angle}]. I actually [specific proof moment]."`,
        tips: [
          "Show the product physically the moment you say its name.",
          "The 'week one, didn't notice much' line builds credibility — it sounds real, not scripted.",
          "The 'specific proof moment' should be something you can demonstrate on camera.",
          "Slow zoom or product B-roll here works well.",
        ],
        visualPrompt: `${avatar} holding ${product}, examining it with genuine curiosity and satisfaction, soft lifestyle background, warm lighting`,
      },
      {
        title: "CTA",
        timeCode: "40 – 60s",
        lines: `"If you're a ${avatar} who's done with [failing approach], ${product} is worth trying. Link's in my bio. Fair warning — they tend to sell out [by the weekend / before the next batch ships]."`,
        tips: [
          "The 'fair warning' framing adds urgency without sounding like a scammy countdown timer.",
          "Point to bio but don't make it the emotional climax. End on product, not the CTA.",
          "Consider ending with product in frame, not your face — ends on the 'star' of the video.",
        ],
        visualPrompt: `${avatar} with ${product} prominently visible, confident relaxed smile, finishing statement to camera, lifestyle environment`,
      },
    ],
    hookVariations: [
      `"Stop scrolling if you've wasted money on [alternative] that didn't work."`,
      `"POV: You finally tried ${product} after seeing it everywhere."`,
      `"I almost didn't try ${product}. Then this happened."`,
      `"Nobody's talking about what ${product} actually does to your [outcome area]."`,
      `"This is going to sound dramatic, but ${product} changed [specific aspect of life]."`,
    ],
    ctaVariations: [
      `"Link in my bio — I'll warn you, they're usually sold out by Thursday."`,
      `"Grab it through my link in bio. It's the same price, I just get a little credit."`,
      `"Comment '[KEYWORD]' and I'll send you the link directly."`,
    ],
  };
}

function generateAIDA(product: string, avatar: string, angle: string, platform: string): GeneratedScript {
  return {
    id: crypto.randomUUID(),
    framework: "aida",
    frameworkName: "Attention · Interest · Desire · Action",
    platform,
    totalDuration: "50–70s",
    sections: [
      {
        title: "Attention",
        timeCode: "0 – 3s",
        lines: `"What if I told you [bold claim related to ${angle}] was actually possible in [short timeframe]? Because it is. And most people have no idea."`,
        tips: [
          "The 'What if I told you' opener works because it creates a question the brain must resolve.",
          "Deliver this with calm confidence, not hype. Hype triggers ad-detection in viewers.",
          "High contrast background or unexpected environment helps stop the scroll.",
        ],
        visualPrompt: `${avatar}, confident and composed, striking visual environment, direct eye contact with camera, slight intrigue in expression`,
      },
      {
        title: "Interest",
        timeCode: "3 – 20s",
        lines: `"Most ${avatar}s spend [timeframe] dealing with [pain point], and they've accepted it as just 'how it is.' But here's what the industry doesn't want you to know: [insight related to ${angle}]. The reason your [current approach] isn't working is actually [root cause]."`,
        tips: [
          "The 'industry doesn't want you to know' pattern signals insider information — compulsive to watch.",
          "State the root cause clearly. This is your unique mechanism. Everything hangs on this.",
          "Cut to a close-up at 'here's what the industry...' — change in framing signals new information.",
        ],
        visualPrompt: `${avatar}, slightly leaning in as if sharing a secret, close-up framing, engaged expression, indoor candid setting`,
      },
      {
        title: "Desire",
        timeCode: "20 – 45s",
        lines: `"I've been using ${product} for [timeframe] and the difference is [specific metric or feeling]. [Specific result 1]. [Specific result 2]. And the thing that keeps me coming back: [emotional benefit tied to ${angle}]. [X] people have made the same switch. [Social proof stat or testimonial]."`,
        tips: [
          "Lead with the emotional benefit, not the feature. People buy feelings.",
          "The social proof stat should be real. If you don't have one, use a metaphor ('the reviews basically write themselves').",
          "Show the product in use here, not just held. Action beats posing.",
        ],
        visualPrompt: `${avatar} actively using or experiencing ${product}, candid moment of genuine satisfaction, lifestyle context showing the result`,
      },
      {
        title: "Action",
        timeCode: "45 – 60s",
        lines: `"If you're ready to [desired outcome related to ${angle}], try ${product}. Link in bio. They offer [guarantee/trial/free shipping] so there's literally no risk to trying it."`,
        tips: [
          "'Literally no risk' defuses the purchase hesitation. Make the path feel frictionless.",
          "Don't say 'click the link' on TikTok — just 'link in bio' or 'check my bio'.",
          "End on a warm, closed-mouth smile. Not a big grin — that reads fake.",
        ],
        visualPrompt: `${avatar}, warm and friendly closing expression, ${product} in frame, relaxed confident posture, pointing gesture toward camera`,
      },
    ],
    hookVariations: [
      `"What if [bold claim related to ${angle}] took less than [timeframe]?"`,
      `"The [category] industry doesn't want ${avatar}s to discover ${product}."`,
      `"I tested every [product category] out there. Only one actually works."`,
      `"This sounds too simple, but ${product} is the reason I [specific result]."`,
    ],
    ctaVariations: [
      `"Link in bio — [guarantee] so you have nothing to lose."`,
      `"Try it for [trial period]. If it doesn't work, [risk reversal]."`,
      `"They're offering [special deal] right now — link's in my bio."`,
    ],
  };
}

function generateBeforeAfter(product: string, avatar: string, angle: string, platform: string): GeneratedScript {
  return {
    id: crypto.randomUUID(),
    framework: "before_after",
    frameworkName: "Before → Bridge → After",
    platform,
    totalDuration: "30–45s",
    sections: [
      {
        title: "Before (The Struggle)",
        timeCode: "0 – 10s",
        lines: `"Six months ago I was [specific, relatable struggle connected to ${angle}]. I'd tried [list of failed alternatives]. Nothing worked. I'd basically accepted that this was just my life."`,
        tips: [
          "Be specific about the struggle. 'Six months ago' grounds it in real time.",
          "List failed alternatives — this mirrors what the viewer has also tried.",
          "'Accepted that was just my life' is emotional dynamite. Viewers will feel this.",
          "Film this in a neutral, slightly unflattering light to match the 'before' energy.",
        ],
        visualPrompt: `${avatar}, slightly tired and relatable expression, candid real-world setting, neutral lighting, conveying the 'before' emotional state`,
      },
      {
        title: "Bridge (The Discovery)",
        timeCode: "10 – 20s",
        lines: `"Then I came across ${product}. Honestly, I was skeptical — I'd been burned before. But something about [specific differentiator tied to ${angle}] made me think this was different."`,
        tips: [
          "The skepticism is CRITICAL. It makes the story believable.",
          "Name one specific thing that made you try it. Vague curiosity doesn't land.",
          "Transition: hold product up or cut to product B-roll exactly when you say its name.",
        ],
        visualPrompt: `${avatar} discovering or first holding ${product}, expression of cautious curiosity, transition moment, natural spontaneous feel`,
      },
      {
        title: "After (The Result)",
        timeCode: "20 – 40s",
        lines: `"After [timeframe]: [Specific result 1]. [Specific result 2]. The [angle outcome] I'd given up on actually happened. I [emotional payoff moment]. My [related life improvement]."`,
        tips: [
          "Lead with the most dramatic result. Most viewers watch the 'after' section and nothing else.",
          "Make the emotional payoff specific: 'my sister asked if I got [procedure done]' beats 'I felt better'.",
          "Film in your best light here. The after should look visibly better than the before.",
          "Show evidence if you can — before/after photos, measurement, concrete proof.",
        ],
        visualPrompt: `${avatar} in noticeably better state, confident glowing expression, improved lifestyle environment, tangible evidence of transformation`,
      },
      {
        title: "CTA",
        timeCode: "40 – 45s",
        lines: `"Link in bio if you want to see what your [after] looks like. I wish I'd tried it sooner."`,
        tips: [
          "The 'wish I'd tried it sooner' creates FOMO without hype.",
          "Short CTA after a strong after is more powerful than a long pitch.",
          "Don't over-explain how to get it. They know what 'link in bio' means.",
        ],
        visualPrompt: `${avatar} looking directly at camera, genuine warm smile, product subtly visible, closing frame with confidence`,
      },
    ],
    hookVariations: [
      `"Six months ago I couldn't [desired outcome]. Here's what changed."`,
      `"The difference between my life before and after ${product} is embarrassing."`,
      `"I used to [struggle]. Now [result]. The only thing that changed: ${product}."`,
      `"POV: You discover ${product} after years of [struggle]."`,
    ],
    ctaVariations: [
      `"Link in bio. I genuinely wish I'd found this sooner."`,
      `"You can grab it through my link — same price, I just get credit."`,
      `"Try it. If my before looked like yours, your after could look like mine."`,
    ],
  };
}

function generateStory(product: string, avatar: string, angle: string, platform: string): GeneratedScript {
  return {
    id: crypto.randomUUID(),
    framework: "story",
    frameworkName: "Story → Teach → Offer",
    platform,
    totalDuration: "60–90s",
    sections: [
      {
        title: "Story Opening",
        timeCode: "0 – 15s",
        lines: `"Three years ago, I was the kind of ${avatar} who [relatable wrong belief about ${angle}]. I genuinely thought that [common misconception]. Then one conversation changed everything."`,
        tips: [
          "Open with a specific time anchor ('three years ago'). Vague stories feel fake.",
          "The 'wrong belief' should mirror what your viewer currently believes. This makes them lean in.",
          "'One conversation changed everything' is a narrative hook that demands resolution.",
        ],
        visualPrompt: `${avatar}, thoughtful storytelling expression, warm intimate setting, nostalgic or reflective mood, candid and genuine`,
      },
      {
        title: "Teaching Moment",
        timeCode: "15 – 40s",
        lines: `"Here's what most people don't understand about [category]: [insight about ${angle}]. The reason [old approach] doesn't work is [specific mechanism]. And the reason ${product} does is [unique mechanism]. This isn't marketing — it's [science/logic/math]. [Brief proof of mechanism]."`,
        tips: [
          "The teaching moment is your credibility. Treat it like a mini-lesson, not a pitch.",
          "Use an analogy if the mechanism is technical. Make it stick.",
          "'This isn't marketing' is a powerful trust signal when followed by actual evidence.",
          "Slow down here. This section determines if they buy or not.",
        ],
        visualPrompt: `${avatar} in teaching mode, hands gesturing to explain concept, engaged educational expression, product nearby but not dominant`,
      },
      {
        title: "Offer Reveal",
        timeCode: "40 – 65s",
        lines: `"That's why I started using ${product}. It's the only [category] that [solves for ${angle}] through [mechanism]. [Time period] in, I have [specific result]. And unlike [alternative], it [key differentiator]."`,
        tips: [
          "The offer reveal should feel like the logical conclusion of your lesson, not a pivot.",
          "Lead with the mechanism, not the brand name. 'The only X that does Y' beats 'I tried this product'.",
          "Show the product in action during this section — demonstrate the mechanism if possible.",
        ],
        visualPrompt: `${avatar} actively demonstrating ${product}, showing how it works, educational demonstration energy, clear product visibility`,
      },
      {
        title: "Social Proof",
        timeCode: "65 – 75s",
        lines: `"[X] people have made the same switch. The reviews that get me every time: [real-sounding testimonial paraphrase]. And personally, [most compelling personal result]."`,
        tips: [
          "Paraphrase a real review — it sounds more authentic than reading word-for-word.",
          "Your most compelling personal result goes here, not in the offer reveal.",
          "If you can show a screenshot or review card on screen, do it.",
        ],
        visualPrompt: `${avatar} holding phone or tablet showing reviews, authentic happy expression, social proof visual moment`,
      },
      {
        title: "CTA",
        timeCode: "75 – 90s",
        lines: `"If any of this landed, ${product} is in my bio. They [guarantee/trial]. I'm not going to oversell it — the results speak."`,
        tips: [
          "'I'm not going to oversell it' is the best oversell. It lands with trust.",
          "After a long-form story, the CTA should be calm and confident, not hyped.",
          "End on product in frame. The last thing they see is what they need to find.",
        ],
        visualPrompt: `${avatar}, calm confident closing expression, ${product} prominently visible, genuine and unhurried closing energy`,
      },
    ],
    hookVariations: [
      `"The thing that changed how I think about [angle] completely."`,
      `"I spent [timeframe] getting [angle] wrong. Here's what I learned."`,
      `"Most ${avatar}s are solving [problem] backwards. Here's why."`,
      `"What nobody tells you about [angle] until you figure it out the hard way."`,
    ],
    ctaVariations: [
      `"Link in bio. The results genuinely speak for themselves."`,
      `"Check my bio if you want to skip the years of trial and error I went through."`,
      `"Bio link if this made sense. [Trial/guarantee] so you don't have to take my word for it."`,
    ],
  };
}

function generateUGC(product: string, avatar: string, angle: string, platform: string): GeneratedScript {
  return {
    id: crypto.randomUUID(),
    framework: "ugc",
    frameworkName: "Authentic UGC Review",
    platform,
    totalDuration: "30–60s",
    sections: [
      {
        title: "Pattern Interrupt",
        timeCode: "0 – 2s",
        lines: `"Okay so I've been using ${product} for [timeframe] and I have thoughts."`,
        tips: [
          "Start mid-action or mid-thought. Opening with 'Okay so' feels unscripted and natural.",
          "Film this like you're talking to a friend, not to an audience.",
          "Don't start with your name, a greeting, or context. Just start talking.",
        ],
        visualPrompt: `${avatar} in casual home environment, mid-activity natural moment, unguarded expression, handheld camera feel, candid energy`,
      },
      {
        title: "Personal Context",
        timeCode: "2 – 10s",
        lines: `"I'm a [authentic ${avatar} descriptor] and I've been looking for [solution to ${angle}] for literally [timeframe]. I'd already tried [list 2-3 alternatives] and none of them [specific failure]."`,
        tips: [
          "The personal context should sound like you're explaining yourself, not positioning yourself.",
          "List real alternatives. This proves to viewers you've done the research they haven't.",
          "Use 'literally' and other natural speech patterns — sounds human, not copywritten.",
        ],
        visualPrompt: `${avatar} relaxed and natural, explaining casually to camera, real home or everyday setting, no makeup or minimal styling depending on avatar`,
      },
      {
        title: "First Impression & Demo",
        timeCode: "10 – 35s",
        lines: `"When ${product} arrived, my first thought was [honest first impression]. The [packaging/first use/first result] was [unexpected element]. Then I actually tried it and — okay, [specific sensory or experiential detail]. By [milestone], I noticed [change tied to ${angle}]."`,
        tips: [
          "The 'honest first impression' should include one thing that surprised you — good or mildly odd.",
          "Sensory detail is what separates real UGC from scripted UGC. Smell, texture, sound, feel.",
          "Show yourself using it in real time during this section. Don't just describe — demonstrate.",
          "Natural stumbles and pauses are GOOD here. Edit around them, not out of them.",
        ],
        visualPrompt: `${avatar} genuinely using or trying ${product} for the first time, authentic discovery expression, close-up product detail shots mixed with reaction shots`,
      },
      {
        title: "Honest Review",
        timeCode: "35 – 50s",
        lines: `"What I actually like: [top benefit tied to ${angle}]. What took some getting used to: [minor honest con or learning curve]. Would I buy it again? [Yes/Absolutely/Without hesitation] — because [core reason]."`,
        tips: [
          "The 'what took some getting used to' is CRITICAL. Without it, you sound like an ad.",
          "One honest con makes your pros 10x more believable. Choose something minor.",
          "The 'Would I buy it again?' structure is native to reviews. Viewers trust this format.",
        ],
        visualPrompt: `${avatar}, thoughtful evaluating expression, balanced honest energy, product held naturally, real-person review credibility`,
      },
      {
        title: "Recommendation",
        timeCode: "50 – 60s",
        lines: `"If you're a ${avatar} dealing with [${angle} problem], I think you'd like it. It's in my bio if you want to check it out."`,
        tips: [
          "'I think you'd like it' is more trustworthy than 'you need this' — doesn't over-promise.",
          "No countdown timers, no FOMO. Authenticity is the whole point of this format.",
          "End the video on the product — don't cut away from it for the final CTA.",
        ],
        visualPrompt: `${avatar}, warm genuine recommendation energy, natural close of conversation, ${product} casually present, friendly and unforced ending`,
      },
    ],
    hookVariations: [
      `"Okay so ${product} arrived and I have a lot to say."`,
      `"Real talk about ${product} from someone who's tried everything."`,
      `"I've been using ${product} for [timeframe]. Here's what actually happened."`,
      `"Not an ad. Just my honest take on ${product} after [timeframe]."`,
      `"Things ${product} doesn't tell you in the marketing."`,
    ],
    ctaVariations: [
      `"It's linked in my bio if you want to try it yourself."`,
      `"Bio if you're curious — no pressure, just check the reviews."`,
      `"Link in bio. Definitely worth looking at if [angle problem] is something you deal with."`,
    ],
  };
}

function generateHookStory(product: string, avatar: string, angle: string, platform: string): GeneratedScript {
  return {
    id: crypto.randomUUID(),
    framework: "hook_story",
    frameworkName: "Hook · Story · CTA",
    platform,
    totalDuration: "25–40s",
    sections: [
      {
        title: "Pattern Interrupt Hook",
        timeCode: "0 – 3s",
        lines: `"I'm going to say something that's going to sound insane: [bold claim about ${angle}]. Stay with me."`,
        tips: [
          "Your opener must be a statement that cannot be ignored. It should feel slightly wrong until they hear the rest.",
          "No greeting. No intro. You have 1.5 seconds before they swipe.",
          "Deliver it mid-thought, like you're already in a conversation with them.",
        ],
        visualPrompt: `${avatar}, intense direct eye contact, leaning slightly toward camera, mid-sentence expression, real candid environment`,
      },
      {
        title: "The Story",
        timeCode: "3 – 25s",
        lines: `"Six weeks ago I was a ${avatar} who [pain tied to ${angle}]. I tried [failed alternative] — didn't work. Then I found ${product}. First week: [small sign]. Week three: [clear result]. Now [life changed]. The thing I keep coming back to: [emotional truth]."`,
        tips: [
          "The story has to move fast — you have 22 seconds. Every word earns its place or it's cut.",
          "Specificity is everything: week one, week three, not 'a while later'.",
          "The emotional truth at the end is the hinge — this is why they buy.",
          "Show the product in frame by the time you say its name.",
        ],
        visualPrompt: `${avatar} in natural storytelling mode, product visible, transitions from 'before' expression to 'after' energy mid-shot`,
      },
      {
        title: "Hard Close CTA",
        timeCode: "25 – 35s",
        lines: `"If you're a ${avatar} and [angle problem] is something you deal with — ${product} is in my bio. No gimmicks. I just wish I'd found it sooner."`,
        tips: [
          "The 'no gimmicks' line is your strongest close. It signals you're not trying to sell them.",
          "After a short story, a short CTA. Match the energy of the format.",
          "End with product in frame if you can. Last visual = strongest memory.",
        ],
        visualPrompt: `${avatar} with ${product} in hand or foreground, direct warm close, confident relaxed finish, product-forward framing`,
      },
    ],
    hookVariations: [
      `"The thing that actually fixed my [angle problem] isn't what anyone's recommending."`,
      `"I said I'd never film one of these. Then ${product} happened."`,
      `"Nobody talks about what [angle problem] actually feels like as a ${avatar}."`,
      `"Real talk: I almost didn't try ${product}. Here's why I'm glad I did."`,
    ],
    ctaVariations: [
      `"Link in bio. I don't pitch things I don't use."`,
      `"Bio link — worth 30 seconds of your time to look at it."`,
      `"Check my bio if any of this sounded like your life."`,
    ],
  };
}

function generateEmotionalArc(product: string, avatar: string, angle: string, platform: string): GeneratedScript {
  return {
    id: crypto.randomUUID(),
    framework: "emotional_arc",
    frameworkName: "Emotional Arc — Feel → Relate → Aspire → Act",
    platform,
    totalDuration: "45–75s",
    sections: [
      {
        title: "Feel — Lead with Emotion",
        timeCode: "0 – 5s",
        lines: `"There's this feeling that [specific emotional state tied to ${angle} problem]. You know it. It's the kind of feeling that shows up in the quiet moments."`,
        tips: [
          "Don't explain the feeling — evoke it. Use language that triggers the emotion directly.",
          "Speak slowly. This is the anchor point of the whole piece.",
          "The viewer must feel 'that's me' in the first 3 seconds or they're gone.",
        ],
        visualPrompt: `${avatar}, introspective emotional expression, quiet moment, soft atmospheric lighting, raw vulnerability without sadness`,
      },
      {
        title: "Relate — Validate Their Experience",
        timeCode: "5 – 20s",
        lines: `"If you're a ${avatar}, you've probably [specific common behavior or thought pattern]. You've [tried approach 1]. Maybe [tried approach 2]. And somewhere along the way you started wondering if [core doubt]."`,
        tips: [
          "You are narrating their inner experience back to them. This is the deepest form of marketing.",
          "The more specific the behavior patterns, the deeper the resonance.",
          "'Somewhere along the way you started wondering' is one of the most powerful phrases in emotional copywriting.",
          "Pause after each statement. Let them confirm internally.",
        ],
        visualPrompt: `${avatar}, relatable, nodding slightly, warm lit intimate setting, feeling-of-recognition expression`,
      },
      {
        title: "Aspire — Paint the Vision",
        timeCode: "20 – 45s",
        lines: `"What if [angle outcome] was actually available to you? Not hypothetically — actually. [Specific version of that life]. That's what changes when ${product} is part of the picture. [Transformation detail 1]. [Transformation detail 2]. [Emotional payoff — what the transformation feels like, not just looks like]."`,
        tips: [
          "The aspiration has to be specific. 'Feel better' is weak — 'wake up and not immediately feel [pain]' is strong.",
          "Tie the product to the aspiration naturally — it's the bridge, not the destination.",
          "Show the aspiration state visually here. Your expression, environment, and energy should embody the 'after'.",
        ],
        visualPrompt: `${avatar} in aspirational setting, elevated emotional state, ${product} integrated naturally into lifestyle context, glowing confident energy`,
      },
      {
        title: "Act — The Inevitable Close",
        timeCode: "45 – 60s",
        lines: `"That version of yourself is closer than you think. ${product} is in my bio. They offer [guarantee/risk reversal]. You've been [coping mechanism] long enough."`,
        tips: [
          "'You've been [coping] long enough' is the emotional permission slip to take action.",
          "After an emotional arc, the CTA should feel like relief, not pressure.",
          "The guarantee closes the rational brain that opened back up during the CTA.",
        ],
        visualPrompt: `${avatar}, calm resolved expression, ${product} visible, warm close, end on feeling of possibility not urgency`,
      },
    ],
    hookVariations: [
      `"There's a version of your life where [${angle} problem] isn't something you think about anymore."`,
      `"The feeling of [emotional state tied to ${angle}] is something most ${avatar}s just accept. You don't have to."`,
      `"What if the thing standing between you and [aspiration] was actually something fixable?"`,
      `"I want to talk to the ${avatar}s who've tried everything and still feel like [stuck state]."`,
    ],
    ctaVariations: [
      `"Link in bio. [Guarantee] — because you deserve to try without risk."`,
      `"Bio link. You've given other things a chance. Give yourself one."`,
      `"Check my bio. The version of you that tried it is waiting."`,
    ],
  };
}

function generateUGCRaw(product: string, avatar: string, angle: string, platform: string): GeneratedScript {
  return {
    id: crypto.randomUUID(),
    framework: "ugc_raw",
    frameworkName: "Raw UGC — Unscripted · Real · Native",
    platform,
    totalDuration: "15–30s",
    sections: [
      {
        title: "Raw Reaction Open",
        timeCode: "0 – 2s",
        lines: `"Okay I wasn't going to post this but—"  OR  "No one asked but I'm going to talk about ${product} anyway."`,
        tips: [
          "The opener must feel like you interrupted yourself to share something.",
          "No ring light. Film where you are. Natural mess in background = trust.",
          "Slightly unflattering angle is MORE trustworthy than perfectly framed.",
        ],
        visualPrompt: `${avatar}, completely candid real moment, home environment with real objects visible, no camera awareness, spontaneous energy`,
      },
      {
        title: "Quick Honest Take",
        timeCode: "2 – 18s",
        lines: `"Been using ${product} for [timeframe]. Here's the actual deal: [pro 1]. [Pro 2]. One thing I wish was different: [minor con]. But for [angle outcome]? [Decisive honest verdict]."`,
        tips: [
          "Under 20 seconds. Every extra word loses trust.",
          "The minor con is non-negotiable. Without it, you're an ad. With it, you're a person.",
          "Decisive verdict means committing: 'it works' not 'it's pretty good'.",
          "Hold the product however you actually hold it — not posed for camera.",
        ],
        visualPrompt: `${avatar} holding ${product} casually and naturally, real-time examination, unfiltered honest expression, handheld shaky realism`,
      },
      {
        title: "Soft Recommend",
        timeCode: "18 – 25s",
        lines: `"Anyway. If you're dealing with [${angle} problem], probably worth looking at. Bio."`,
        tips: [
          "'Probably worth looking at' is more persuasive than 'YOU NEED THIS'.",
          "One word CTA — 'Bio.' Not 'link in my bio click the link below' — just 'Bio.'",
          "Act like you're already moving on to the next thing. Disinterest is trust.",
        ],
        visualPrompt: `${avatar} already moving on, casual offhand gesture toward camera, ending mid-action, product still casually in frame`,
      },
    ],
    hookVariations: [
      `"Wasn't going to make this video but ${product} has been in my bag every day so."`,
      `"Okay real talk about ${product} from someone who doesn't do ads."`,
      `"I know everyone's posting about ${product} but I actually have thoughts."`,
      `"Posting this from my actual kitchen because this thing [result tied to ${angle}]."`,
    ],
    ctaVariations: [
      `"Bio."`,
      `"It's in my bio if you're curious."`,
      `"Check my bio or don't, just sharing."`,
    ],
  };
}

// ─── Shot List Generator ───────────────────────────────────────────────────

interface ShotListItem {
  shot: number;
  title: string;
  camera: string;
  duration: string;
  promptPreview: string;
}

const SHOT_CAMERA_MAP: Record<string, string> = {
  "Problem Hook": "ECU (Extreme Close-Up), direct to lens",
  "Agitate the Pain": "MCU (Medium Close-Up), slight push-in",
  "Solution Reveal": "MS (Medium Shot), product insert cut",
  "CTA": "MCU, slight zoom out on finish",
  "Attention": "WS → ECU fast cut",
  "Interest": "MCU, tilt-in",
  "Desire": "MS with product in-use B-roll",
  "Action": "MCU, warm close",
  "Before (The Struggle)": "MCU, slightly low angle",
  "Bridge (The Discovery)": "MS, product reveal cut",
  "After (The Result)": "MCU → MS, elevated framing",
  "Story Opening": "MCU, static",
  "Teaching Moment": "MS, hands-in-frame",
  "Offer Reveal": "MS with product B-roll cut",
  "Social Proof": "MCU, phone/screen insert",
  "Pattern Interrupt": "ECU, handheld",
  "Personal Context": "MS, candid",
  "First Impression & Demo": "CU product + MS reaction intercut",
  "Honest Review": "MCU, evaluating",
  "Recommendation": "MCU, soft close",
  "Pattern Interrupt Hook": "ECU to lens, static",
  "The Story": "MCU, push-in mid-story",
  "Hard Close CTA": "MCU product-forward",
  "Feel — Lead with Emotion": "ECU soft, atmospheric",
  "Relate — Validate Their Experience": "MCU, gentle nod",
  "Aspire — Paint the Vision": "MS elevated, bright",
  "Act — The Inevitable Close": "MCU, resolved",
  "Raw Reaction Open": "Handheld MS, unposed",
  "Quick Honest Take": "MS product-in-hand, real",
  "Soft Recommend": "MS already moving off-camera",
};

function buildShotList(script: GeneratedScript): ShotListItem[] {
  return script.sections.map((s, i) => ({
    shot: i + 1,
    title: s.title,
    camera: SHOT_CAMERA_MAP[s.title] ?? "MCU, standard",
    duration: s.timeCode,
    promptPreview: s.visualPrompt.slice(0, 80) + "…",
  }));
}

function generateScript(
  framework: FrameworkId,
  product: string,
  avatar: string,
  angle: string,
  platform: string
): GeneratedScript {
  switch (framework) {
    case "pas": return generatePAS(product, avatar, angle, platform);
    case "aida": return generateAIDA(product, avatar, angle, platform);
    case "before_after": return generateBeforeAfter(product, avatar, angle, platform);
    case "story": return generateStory(product, avatar, angle, platform);
    case "ugc": return generateUGC(product, avatar, angle, platform);
    case "hook_story": return generateHookStory(product, avatar, angle, platform);
    case "emotional_arc": return generateEmotionalArc(product, avatar, angle, platform);
    case "ugc_raw": return generateUGCRaw(product, avatar, angle, platform);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ScriptForge = () => {
  const { setDraftPrompt, setActiveTab, brandVoice } = useAxsStore();
  const character = useActiveCharacter();
  const proof = useAxsProofSummary();

  const [framework, setFramework] = useState<FrameworkId>("pas");
  const [platform, setPlatform] = useState("tiktok");
  const [product, setProduct] = useState("");
  const [avatar, setAvatar] = useState("");
  const [angle, setAngle] = useState("");
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState<GeneratedScript[]>([]);
  const [activeScript, setActiveScript] = useState(0);
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [outputTab, setOutputTab] = useState<"script" | "shotlist" | "storyboard">("script");

  const activeFramework = FRAMEWORKS.find((f) => f.id === framework)!;
  const currentScript = scripts[activeScript] ?? null;
  const brandVoiceDetail = proof.categories.brandVoice.signals[0]?.detail;
  const distributionDetail = proof.categories.distribution.signals[0]?.detail;

  const handleGenerate = async () => {
    if (!product.trim()) return toast.error("Enter a product or brand name.");
    if (!avatar.trim()) return toast.error("Describe your target avatar.");
    if (!angle.trim()) return toast.error("Add a core angle or key benefit.");

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));

      const voiceDirection = brandVoice.trained
        ? `${angle.trim()} Voice: ${brandVoice.tone}; cadence: ${brandVoice.cadence}; signature phrases: ${brandVoice.signaturePhrases.join(", ")}.`
        : angle.trim();

      const generated = [
        generateScript(framework, product.trim(), avatar.trim(), voiceDirection, platform),
        generateScript(framework, product.trim(), avatar.trim(), voiceDirection, platform),
      ];

      setScripts(generated);
      setActiveScript(0);
      setExpandedSection(0);
      toast.success("Scripts generated", { description: `${generated.length} ${activeFramework.full} variations ready.` });
    } catch (error) {
      toast.error("Script generation failed", {
        description: error instanceof Error ? error.message : "Unknown generation error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    const copied = await copyToClipboard(text);
    if (copied) toast.success(`${label} copied`);
    else toast.error("Clipboard unavailable");
  };

  const handleForgeVisual = (section: ScriptSection) => {
    setDraftPrompt(section.visualPrompt + (character ? ` featuring ${character.name}` : ""));
    setActiveTab("images");
    toast.success("Prompt loaded into Image Forge");
  };

  const handleExportScript = (script: GeneratedScript) => {
    const text = [
      `SCRIPT: ${script.frameworkName} — ${script.platform}`,
      `Total Duration: ${script.totalDuration}`,
      "",
      ...script.sections.map((s) => [
        `[${s.title} — ${s.timeCode}]`,
        s.lines,
        "",
        "TIPS:",
        ...s.tips.map((t) => `• ${t}`),
        "",
      ].join("\n")),
      "HOOK VARIATIONS:",
      ...script.hookVariations.map((h) => `• ${h}`),
      "",
      "CTA VARIATIONS:",
      ...script.ctaVariations.map((c) => `• ${c}`),
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `script-${script.framework}-${Date.now()}.txt`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    toast.success("Script exported");
  };

  const scriptText = currentScript?.sections.map((section) => `[${section.title}]\n${section.lines}`).join("\n\n") ?? "";
  const scoreCards = [
    ["Brand Voice Match", proof.categories.brandVoice.score, brandVoice.trained ? "On-brand & trained" : "Starter voice"],
    ["Distribution Readiness", proof.categories.distribution.score, proof.categories.distribution.status],
    ["Hook Strength", currentScript ? 91 : 72, currentScript ? "Generated hooks ready" : "Waiting on script"],
    ["Conversion Fit", currentScript ? 85 : 68, activeFramework.name],
  ] as const;

  return (
    <div className="axs-module-page text-slate-100">
      <div className="hidden" />
      <div className="hidden" />
      <svg className="hidden" viewBox="0 0 1400 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="scriptForgeArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="40%" stopColor="#22d3ee" stopOpacity=".7" />
            <stop offset="70%" stopColor="#a855f7" stopOpacity=".72" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          <filter id="scriptForgeGlow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path d="M-80 260 C 280 160, 470 360, 730 300 S 1080 150, 1510 230" stroke="url(#scriptForgeArc)" strokeWidth="3" fill="none" filter="url(#scriptForgeGlow)" />
        <path d="M-90 760 C 260 620, 470 790, 760 705 S 1120 540, 1510 620" stroke="url(#scriptForgeArc)" strokeWidth="2.5" fill="none" filter="url(#scriptForgeGlow)" />
      </svg>

      <main className="relative grid w-full min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,22%)]">
        <div className="min-w-0 space-y-5">
          <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-black/30 backdrop-blur-xl md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(34,211,238,0.05),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(100,116,139,0.06),transparent_34%),radial-gradient(circle_at_50%_85%,rgba(212,160,23,0.04),transparent_35%)]" />
            <div className="relative grid gap-8 xl:grid-cols-[1.1fr_.9fr]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200/60">
                  <Sparkles className="size-3.5" /> Script Forge
                </div>
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  Scripts that <span className="bg-gradient-to-r from-cyan-200/70 to-slate-200 bg-clip-text text-transparent">stop the scroll.</span>
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                  Turn any product, story, or universe idea into hooks, ad scripts, voiceovers, shot lists, captions, and campaign-ready creative.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {["Brand voice locked", "Platform-ready", "Scene-aware", "Conversion scored"].map((pill) => (
                    <span key={pill} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200">{pill}</span>
                  ))}
                </div>
              </div>
              <GlassCard className="rounded-2xl border-white/10 bg-slate-950/72 p-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.34em] text-slate-400">Selected Framework</p>
                <h2 className="text-3xl font-black text-white">{activeFramework.name}</h2>
                <p className="mt-2 text-sm text-cyan-200/60">{activeFramework.full}</p>
                <p className="mt-4 text-sm leading-6 text-slate-300">{activeFramework.description}</p>
                <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div><p className="text-xs text-slate-400">Predicted Fit</p><p className="text-2xl font-black text-white">{currentScript ? "92" : "84"}%</p></div>
                  <Button onClick={handleGenerate} disabled={loading} className={`rounded-xl bg-gradient-to-r ${activeFramework.color} px-5 py-3 text-sm font-black text-white`}>
                    {loading ? "Writing..." : "Use Framework"}
                  </Button>
                </div>
              </GlassCard>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {scoreCards.map(([label, value, detail]) => (
              <GlassCard key={label} className="rounded-2xl border-white/10 bg-slate-950/72 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-2 text-sm text-slate-300">{detail}</p>
                <div className="mt-4 flex items-end gap-3"><span className="text-3xl font-bold text-white">{value}%</span><div className="mb-2 h-1.5 flex-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300/50 to-cyan-400/30" style={{ width: `${value}%` }} /></div></div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="rounded-2xl border-white/10 bg-slate-950/72 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.34em] text-slate-400">Script Framework Library</p><h2 className="mt-1 text-lg font-semibold text-white">Pick the engine that matches the job</h2></div>
              <button className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-slate-200">View all frameworks</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {FRAMEWORKS.map((f) => (
                <button key={f.id} onClick={() => setFramework(f.id)} className={`min-h-[152px] rounded-2xl border bg-slate-950/65 p-4 text-left shadow-xl shadow-black/20 transition hover:-translate-y-0.5 ${framework === f.id ? `${f.border} bg-white/[0.07] ${f.glow}` : "border-white/10 hover:border-cyan-300/25"}`}>
                  <div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-extrabold text-white">{f.name}</h3><p className="mt-1 text-xs text-slate-400">{f.full}</p></div><span className="grid size-12 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-sm font-black text-white">{f.conversionRating * 18}</span></div>
                  <p className="mt-4 text-xs leading-5 text-slate-300">{f.bestFor[0]}</p>
                  <div className="mt-3 flex gap-1 text-white/25">{Array.from({ length: f.conversionRating }).map((_, i) => <Star key={i} className="size-3" fill="currentColor" />)}</div>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="rounded-2xl border-white/10 bg-slate-950/72 p-5">
            <div className="mb-4"><p className="text-[10px] font-bold uppercase tracking-[0.34em] text-slate-400">Script Creation Workspace</p><h2 className="mt-1 text-lg font-semibold text-white">Brief in, production script out</h2></div>
            <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
              <GlassCard className="rounded-2xl border-white/10 bg-black/25 p-5">
                <div className="space-y-3">
                  <Label>Product / Brand</Label><Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Aurora Silk Serum" className="bg-black/35" />
                  <Label>Target Audience</Label><Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="Women 28-45, skincare obsessed..." className="bg-black/35" />
                  <Label>Core Angle / Key Benefit</Label><Textarea value={angle} onChange={(e) => setAngle(e.target.value)} rows={4} placeholder="The only serum that penetrates the dermis layer..." className="resize-none bg-black/35" />
                </div>
              </GlassCard>
              <GlassCard className="rounded-2xl border-white/10 bg-black/25 p-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.34em] text-slate-400">Platform & Duration</p>
                <div className="space-y-3">
                  {PLATFORMS.map((p) => (
                    <button key={p.id} onClick={() => setPlatform(p.id)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${platform === p.id ? "border-cyan-300/30 bg-cyan-300/5 text-white" : "border-white/10 text-white/55 hover:border-white/20"}`}>
                      <span className="font-medium">{p.label}</span><span className="text-xs text-white/40">max {p.maxSeconds}s</span>
                    </button>
                  ))}
                </div>
              </GlassCard>
            </div>
            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <Button onClick={handleGenerate} disabled={loading} className={`flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r ${activeFramework.color} px-6 py-4 text-sm font-black text-white shadow-xl shadow-cyan-500/10`}>
                <FileText className="size-4" /> {loading ? "Writing your scripts..." : `Write ${activeFramework.name} Script`} <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" onClick={() => toast.success("Preset saved")} className="rounded-xl border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-slate-200 hover:border-cyan-300/20">Save as Preset</Button>
            </div>
          </GlassCard>

          {currentScript && (
            <GlassCard className="rounded-2xl border-white/10 bg-slate-950/72 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.34em] text-slate-400">Script Output</p><h2 className="mt-1 text-lg font-semibold text-white">Holy-shit script package</h2></div>
                <div className="flex gap-2">{scripts.map((_, i) => <button key={i} onClick={() => setActiveScript(i)} className={`size-8 rounded-lg border text-xs font-bold ${activeScript === i ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-200/60" : "border-white/10 bg-white/5 text-slate-400"}`}>{i + 1}</button>)}</div>
              </div>
              <div className="grid gap-4 xl:grid-cols-[.85fr_1.35fr_.8fr]">
                <GlassCard className="rounded-2xl border-white/10 bg-black/25 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white"><Zap className="size-4 text-cyan-300/60" /> Hook Options</h3>
                  {currentScript.hookVariations.slice(0, 3).map((hook) => <button key={hook} onClick={() => handleCopy(hook, "Hook")} className="mb-2 block w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-sm text-slate-200">{hook}</button>)}
                </GlassCard>
                <GlassCard className="rounded-2xl border-white/10 bg-black/25 p-5">
                  <div className="mb-4 flex items-center gap-2"><FileText className="size-4 text-cyan-300/60" /><h3 className="text-base font-bold text-white">{currentScript.frameworkName}</h3><span className="text-xs text-slate-500">• {currentScript.totalDuration}</span></div>
                  <div className="space-y-4 text-sm leading-6 text-slate-300">
                    {currentScript.sections.map((section, i) => (
                      <button key={section.title} onClick={() => setExpandedSection(expandedSection === i ? null : i)} className="block w-full rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left">
                        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-200/60">{section.title} <span className="text-white/35">{section.timeCode}</span></p>
                        <p className="mt-2">{expandedSection === i ? section.lines : `${section.lines.slice(0, 170)}...`}</p>
                        <div className="mt-3 flex gap-2"><span onClick={(event) => { event.stopPropagation(); handleCopy(section.lines, section.title); }} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs">Copy</span><span onClick={(event) => { event.stopPropagation(); handleForgeVisual(section); }} className={`rounded-lg bg-gradient-to-r ${activeFramework.color} px-3 py-1.5 text-xs font-bold text-white`}>Forge Visual</span></div>
                      </button>
                    ))}
                  </div>
                </GlassCard>
                <GlassCard className="rounded-2xl border-white/10 bg-black/25 p-4">
                  <h3 className="mb-3 text-sm font-bold text-white">Scene / Beat Structure</h3>
                  {buildShotList(currentScript).map((shot) => <div key={shot.shot} className="mb-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300"><span>{shot.shot}. {shot.title}</span><ChevronRight className="size-3.5" /></div>)}
                  <Button onClick={() => setOutputTab(outputTab === "shotlist" ? "script" : "shotlist")} className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-semibold text-slate-200">Auto-Structure Scenes</Button>
                </GlassCard>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Button onClick={() => handleCopy(scriptText, "Full script")} variant="outline"><Copy className="size-4" />Copy Script</Button>
                <Button onClick={() => handleExportScript(currentScript)} variant="outline"><Download className="size-4" />Export Pack</Button>
                <Button onClick={() => { setActiveTab("campaign"); toast.success("Script staged for Campaigns"); }} variant="outline"><Megaphone className="size-4" />Add to Campaign</Button>
                <Button onClick={() => { setDraftPrompt(scriptText); setActiveTab("videos"); toast.success("Script sent to Video Forge"); }} variant="outline"><Play className="size-4" />Send to Video</Button>
                <Button onClick={() => toast.success("Script saved")} variant="outline"><Star className="size-4 text-white/30" />Save Script</Button>
              </div>
            </GlassCard>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <GlassCard className="rounded-2xl border-white/10 bg-slate-950/72 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-400">Production Memory</p>
            <p className="mt-1 text-xs text-slate-400">Memory Core Online</p>
            <div className="mt-4 grid grid-cols-[72px_1fr] items-center gap-4">
              <div className="grid size-16 place-items-center rounded-full border border-cyan-300/20 bg-cyan-500/10 text-xl font-black text-white">{proof.overallScore}</div>
              <div><p className="text-sm font-bold text-white">Script Intelligence</p><p className="text-xs text-slate-400">{proof.status}</p></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[["Identity", proof.categories.identity.score], ["Continuity", proof.categories.continuity.score], ["Workflow", proof.categories.workflow.score], ["Brand Voice", proof.categories.brandVoice.score], ["Distribut.", proof.categories.distribution.score], ["Hooks", currentScript ? 91 : 64]].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</p><p className="text-sm font-bold text-white">{v}%</p></div>
              ))}
            </div>
            <button className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 text-xs font-bold text-slate-200">Why this score?</button>
          </GlassCard>
          <GlassCard className="rounded-2xl border-white/10 bg-slate-950/72 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-400">Quick Tools</p>
            <h3 className="mt-1 mb-4 text-lg font-semibold text-white">Script accelerators</h3>
            {["Hook Generator", "CTA Generator", "Rewrite for Platform", "Shorten Script", "Expand with Scenes"].map((label) => (
              <button key={label} className="mb-2 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-left text-sm text-slate-200 hover:border-cyan-300/25"><span>{label}</span><ChevronRight className="size-3.5" /></button>
            ))}
          </GlassCard>
          <GlassCard className="rounded-2xl border-white/10 bg-slate-950/72 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-400">Proof Details</p>
            <div className="mt-4 space-y-3">
              <ProofBadge label="Brand Voice" score={proof.categories.brandVoice.score} status={proof.categories.brandVoice.status} detail={brandVoiceDetail} variant="full" />
              <ProofBadge label="Distribution" score={proof.categories.distribution.score} status={proof.categories.distribution.status} detail={distributionDetail} variant="full" />
            </div>
          </GlassCard>
        </aside>
      </main>
    </div>
  );
};

export default ScriptForge;
