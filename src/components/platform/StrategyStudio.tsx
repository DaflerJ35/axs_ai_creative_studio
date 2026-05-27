import {
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  Flame,
  Lightbulb,
  Megaphone,
  MoreVertical,
  Network,
  PlaySquare,
  Send,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useAxsStore } from "../../store/useAxsStore";

const trendSignals = ["AI film diaries", "faceless luxury reels", "character serials", "LTX transformation clips", "virtual production BTS"];
const pillars = ["AI Storytelling", "Creator Behind the Scenes", "Cinematic Education", "Character Universe", "Tools & Workflows", "Community & Culture"];
const weeks = [
  ["Discovery", "Validate positioning and introduce core concept.", ["Who is this for?", "Why now is different", "The future, visualized"], ["Teaser Reel", "Explainer Carousel", "Founder Story"]],
  ["Build Traction", "Build trust, grow audience, and establish authority.", ["Behind the scenes", "Build in public", "Lessons that scale"], ["BTS Short", "Tips Thread", "Community Poll"]],
  ["Launch Push", "Create launch excitement and drive engagement.", ["Big reveal coming", "Limited access", "You're invited"], ["Launch Trailer", "Live Q&A", "Countdown Series"]],
  ["Conversion & Retention", "Convert audience and maximize retention.", ["Results & proof", "Exclusive benefits", "Join the movement"], ["Case Study", "Offer Post", "Onboarding Guide"]],
];

export function StrategyStudio() {
  const { brandVoice, setActiveTab, setDraftPrompt } = useAxsStore();
  const [concept, setConcept] = useState("Launch a cinematic AI creator brand built around consistent characters, short-form story arcs, and premium behind-the-scenes education.");

  const campaignRows = useMemo(() => [
    ["Teaser & Reveal", "Introduce the brand and spark curiosity.", "May 26 - Jun 1", "12"],
    ["Traction Builder", "Grow audience and build trust through value.", "Jun 2 - Jun 14", "28"],
    ["Launch Campaign", "Drive launch excitement and engagement.", "Jun 15 - Jun 21", "18"],
    ["Conversion Push", "Convert audience and maximize sign-ups.", "Jun 22 - Jun 30", "16"],
  ], []);

  const generateStrategy = () => setDraftPrompt(`${concept}\n\nBrand voice: ${brandVoice.tone}. Cadence: ${brandVoice.cadence}.`);

  return (
    <div className="axs-strategy-page pb-10 text-white">
      <section className="axs-strategy-hero">
        <div>
          <span className="axs-strategy-pill"><Brain className="size-3.5" /> Strategy Intelligence</span>
          <h1>30-day launch strategy that feels written by a growth studio.</h1>
          <p>Neural Strategist combines the AXS planning engine with your trained Creator Hub voice, brand signals, and production tools.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {["Data-Driven Insights", "Trend-Led Planning", "Voice-Aligned Output", "Studio-Ready Execution"].map((item) => <span key={item} className="axs-strategy-chip">{item}</span>)}
          </div>
        </div>
        <div className="axs-strategy-brief">
          <div className="axs-strategy-kicker">Concept Brief</div>
          <p>Brand voice: starter profile</p>
          <Textarea value={concept} onChange={(e) => setConcept(e.target.value)} />
          <Button onClick={generateStrategy} className="axs-strategy-main-btn"><Wand2 className="size-4" />Generate 30-Day Strategy</Button>
          <Button onClick={() => setActiveTab("scene")} className="axs-strategy-dark-btn"><Send className="size-4" />Send Best Idea to Studio</Button>
        </div>
      </section>

      <section className="axs-strategy-metrics">
        <Metric title="Launch Score" value="71" detail="Strong Potential" />
        <Metric title="Content Pillars" value="6" detail="Active Pillars" />
        <Metric title="Weekly Campaigns" value="4" detail="Planned This Month" bars />
        <Metric title="Estimated Outputs" value="142" detail="Pieces of Content" />
        <Metric title="Channel Fit" value="87%" detail="Optimal Fit" rings />
        <Metric title="Conversion Readiness" value="78%" detail="Sales & CTA Alignment" progress />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="axs-strategy-panel p-4">
          <div className="mb-4 flex items-center justify-between"><div><div className="axs-strategy-kicker">Strategy Planner</div><h2>30-Day Launch Planner</h2></div><button className="axs-strategy-select"><Filter className="size-3.5" />Filters</button></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{weeks.map((week, i) => <WeekCard key={String(week[0])} index={i} week={week} />)}</div>
        </div>
        <aside className="space-y-4"><TrendPanel /><StackPanel /></aside>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-4">
        <PillarsPanel />
        <AudiencePanel />
        <NarrativePanel />
        <PlatformPanel />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <FunnelPanel />
        <ListPanel title="Creative Angles" action="Generate More Angles" items={["Build an AI Film Studio from Scratch", "The Future of Filmmaking is AI", "Behind the Scenes of a Virtual World", "Your Story, Amplified by AI", "Cinematic Worlds, Real Results"]} />
        <ListPanel title="Hook Performance" action="Test More Hooks" items={["I built an AI movie in 7 days.", "This AI tool changed my workflow.", "The future of storytelling is here.", "I burned my idea into a world.", "From zero to cinematic."]} />
      </section>

      <section className="axs-strategy-panel mt-4 p-5">
        <div className="mb-4 flex items-center justify-between"><div><div className="axs-strategy-kicker">Campaign Blueprint</div><h2>Launch Sequence</h2></div><MoreVertical className="size-4 text-muted" /></div>
        <div className="space-y-2">{campaignRows.map((row, i) => <CampaignRow key={row[0]} index={i} row={row} />)}</div>
        <button onClick={() => setActiveTab("campaign")} className="axs-strategy-gold-btn mx-auto mt-4 flex">Add New Campaign</button>
      </section>

      <section className="axs-strategy-panel mt-4 p-5">
        <div className="mb-4 flex items-center justify-between"><div><div className="axs-strategy-kicker">Strategy Codex</div><h2>Your Playbook for Success</h2></div><Sparkles className="size-4 text-muted" /></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {[
            ["Playbook", ["Launch Checklist", "Content Playbook", "Growth Tactics", "Community Playbook"], "Open Playbook"],
            ["Brand Voice Rules", ["Voice Principles", "Tone Guidelines", "Do's & Don'ts", "Example Library"], "View Voice Rules"],
            ["Content Rules", ["Content Framework", "Format Guidelines", "Brand Guardrails", "Review Checklist"], "View Rules"],
            ["Offer Angles", ["Core Offer Ladder", "Value Propositions", "Bonus Ideas", "Scarcity & Urgency"], "View Offers"],
            ["Resource Vault", ["Swipe Library", "Hook Bank", "Template Hub", "Visual Assets"], "Open Vault"],
            ["Performance Insights", ["Top Performers", "Learnings", "Optimization Tips", "Benchmarks"], "View Insights"],
          ].map(([title, items, action]) => <CodexCard key={String(title)} title={String(title)} items={items as string[]} action={String(action)} />)}
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value, detail, bars, rings, progress }: { title: string; value: string; detail: string; bars?: boolean; rings?: boolean; progress?: boolean }) {
  return <div className="axs-strategy-metric"><span>{title}</span><strong>{value}<small>{title === "Launch Score" ? "/100" : ""}</small></strong><p>{detail}</p>{bars && <div className="axs-bars">{Array.from({length:12},(_,i)=><i key={i} style={{height:`${20+(i%5)*9}px`}} />)}</div>}{rings && <div className="flex gap-2">{[1,2,3].map(i=><b key={i} className="axs-mini-ring" />)}</div>}{progress && <div className="axs-progress"><i style={{width:"78%"}} /></div>}</div>;
}
function WeekCard({ index, week }: { index: number; week: unknown[] }) { return <div className="axs-week-card"><div className="axs-strategy-kicker">Week {index+1}</div><h3>{String(week[0])}</h3><p>{String(week[1])}</p><h4>Key Hooks</h4>{(week[2] as string[]).map(x=><span key={x}>{x}</span>)}<h4>Content Formats</h4><div className="flex gap-2">{[PlaySquare,FileText,BarChart3,Network].map((Icon,i)=><i key={i}><Icon className="size-3.5" /></i>)}</div><button>{12+index*2} Tasks</button></div>; }
function TrendPanel(){return <div className="axs-strategy-panel p-4"><div className="axs-strategy-kicker">Trend Analyzer</div>{trendSignals.map((s,i)=><div key={s} className="axs-trend-row"><span>{s}</span><b>{92-i*3}%</b></div>)}<button className="axs-strategy-gold-btn w-full">View Full Trends</button></div>}
function StackPanel(){return <div className="axs-strategy-panel p-4"><div className="axs-strategy-kicker">Strategy Stack</div>{["Neural Strategist","Idea Generator","Content Calendar","Campaign Bridge"].map(s=><div key={s} className="axs-stack-row"><strong>{s}</strong><span>AI and launch copy handoff</span></div>)}<button className="axs-strategy-gold-btn w-full">Open Neural Multiplier</button></div>}
function PillarsPanel(){return <div className="axs-strategy-panel p-4"><div className="axs-strategy-kicker">Content Pillars</div>{pillars.map(p=><div key={p} className="axs-pillar-row"><CheckCircle2 className="size-3.5" />{p}</div>)}<button className="axs-strategy-gold-btn w-full">Manage Pillars</button></div>}
function AudiencePanel(){return <div className="axs-strategy-panel p-4"><div className="axs-strategy-kicker">Audience Map</div><div className="axs-donut">87%<small>Core Fit</small></div>{["Creators 42%","Filmmakers 24%","AI Enthusiasts 18%","Entrepreneurs 10%"].map(x=><p key={x}>{x}</p>)}<button className="axs-strategy-gold-btn w-full">View Full Map</button></div>}
function NarrativePanel(){return <div className="axs-strategy-panel p-4"><div className="axs-strategy-kicker">Narrative Arc</div><div className="axs-arc-line" /><div className="flex justify-between text-xs text-muted"><span>Curiosity</span><span>Anticipation</span><span>Belief</span></div><button className="axs-strategy-gold-btn mt-7 w-full">Edit Narrative</button></div>}
function PlatformPanel(){return <ListPanel title="Platform Recommendations" action="Optimize Mix" items={["YouTube Shorts 94%","TikTok 91%","Instagram Reels 89%","X (Twitter) 70%","LinkedIn 62%"]} />}
function FunnelPanel(){return <div className="axs-strategy-panel p-4"><div className="axs-strategy-kicker">Funnel / Distribution Path</div><div className="axs-funnel"><span>Awareness</span><span>Consideration</span><span>Conversion</span><span>Loyalty</span></div><div className="grid grid-cols-4 gap-2 text-center"><b>1.2M+</b><b>8.7%</b><b>3.6%</b><b>41%</b></div><button className="axs-strategy-gold-btn w-full">Edit Funnel</button></div>}
function ListPanel({title,items,action}:{title:string;items:string[];action:string}){return <div className="axs-strategy-panel p-4"><div className="axs-strategy-kicker">{title}</div>{items.map((x,i)=><div key={x} className="axs-trend-row"><span>{x}</span><b>{94-i*6}%</b></div>)}<button className="axs-strategy-gold-btn w-full">{action}</button></div>}
function CampaignRow({index,row}:{index:number;row:string[]}){return <div className="axs-campaign-row"><b>{index+1}</b><strong>{row[0]}</strong><span>{row[1]}</span><em>YouTube TikTok IG</em><span>{row[2]}</span><span>{row[3]}</span><button>View Plan</button></div>}
function CodexCard({title,items,action}:{title:string;items:string[];action:string}){return <div className="axs-codex-card"><h3>{title}</h3>{items.map(i=><span key={i}>{i}</span>)}<button>{action}</button></div>}
