import { useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  Facebook,
  FileText,
  Globe2,
  Image as ImageIcon,
  Instagram,
  LayoutGrid,
  Link2,
  Linkedin,
  Megaphone,
  MoreHorizontal,
  MousePointerClick,
  Plus,
  Radio,
  Send,
  Settings2,
  Sparkles,
  TrendingUp,
  Users,
  Video,
  Youtube,
  Zap,
} from "lucide-react";
import { Button } from "../ui/button";
import { CommandPanel } from "../command/CommandDeck";

/* ─── Mock data ─── */
const kpiData = [
  { label: "Total Published", value: "1,248", delta: "+18.4% vs last 30 days", Icon: Send, tone: "cyan" as const },
  { label: "Total Reach", value: "23.7M", delta: "+22.1% vs last 30 days", Icon: Globe2, tone: "violet" as const },
  { label: "Engagement", value: "2.84M", delta: "+19.6% vs last 30 days", Icon: BarChart3, tone: "gold" as const },
  { label: "Clicks", value: "1.12M", delta: "+31.2% vs last 30 days", Icon: MousePointerClick, tone: "cyan" as const },
  { label: "Conversions", value: "186.2K", delta: "+24.6% vs last 30 days", Icon: CheckCircle2, tone: "violet" as const },
  { label: "Revenue Impact", value: "$412.8K", delta: "+16.9% vs last 30 days", Icon: DollarSign, tone: "gold" as const },
];

const platforms = [
  { name: "YouTube", handle: "@AXSStudio", followers: "1.38M Subscribers", health: "Excellent", color: "red" },
  { name: "TikTok", handle: "@axsstudio", followers: "812K Followers", health: "Excellent", color: "cyan" },
  { name: "Instagram", handle: "@axs.studio", followers: "652K Followers", health: "Good", color: "pink" },
  { name: "X (Twitter)", handle: "@AXS_Studio", followers: "432K Followers", health: "Good", color: "white" },
  { name: "LinkedIn", handle: "AXS Creative Studio", followers: "210K Followers", health: "Good", color: "blue" },
  { name: "Facebook", handle: "AXS Studio", followers: "188K Followers", health: "Good", color: "blue" },
  { name: "Vimeo", handle: "@axsstudio", followers: "45K Followers", health: "Healthy", color: "cyan" },
  { name: "Discord", handle: "AXS Community", followers: "42K Members", health: "Healthy", color: "violet" },
];

const scheduleQueue = [
  { title: "Cyberpunk 2077: District 9", platform: "YouTube", date: "May 15, 6:00 PM", status: "Scheduled" },
  { title: "Neon City #75", platform: "TikTok", date: "May 15, 9:30 PM", status: "Scheduled" },
  { title: "Combat Art Reveal", platform: "Instagram", date: "May 16, 12:30 PM", status: "Scheduled" },
  { title: "District 9 Vision", platform: "X (Twitter)", date: "May 16, 3:15 PM", status: "Scheduled" },
  { title: "Eclipse Protocol Teaser", platform: "LinkedIn", date: "May 17, 9:00 AM", status: "Scheduled" },
  { title: "YouTube Trailer", platform: "YouTube", date: "May 18, 12:00 PM", status: "Scheduled" },
];

const workflowSteps = [
  { label: "Content Packaging", status: "complete" as const },
  { label: "Platform Optimization", status: "complete" as const },
  { label: "Review & Approvals", status: "complete" as const },
  { label: "Scheduling", status: "active" as const },
  { label: "Publishing", status: "pending" as const },
];

const channelHealth = [
  { platform: "YouTube", score: 98, status: "Excellent", color: "bg-emerald-400" },
  { platform: "TikTok", score: 94, status: "Excellent", color: "bg-emerald-400" },
  { platform: "Instagram", score: 86, status: "Good", color: "bg-amber-400" },
  { platform: "X (Twitter)", score: 82, status: "Good", color: "bg-amber-400" },
  { platform: "LinkedIn", score: 78, status: "Good", color: "bg-amber-400" },
  { platform: "Facebook", score: 76, status: "Good", color: "bg-amber-400" },
];

const contentPackages = [
  { ratio: "16:9", label: "YouTube", dim: "1920 x 1080", status: "ready" },
  { ratio: "9:16", label: "TikTok / Reels", dim: "1080 x 1920", status: "ready" },
  { ratio: "1:1", label: "Instagram", dim: "1080 x 1080", status: "ready" },
  { ratio: "4:5", label: "LinkedIn / Facebook", dim: "1080 x 1350", status: "ready" },
  { ratio: "21:9", label: "Cinematic", dim: "2560 x 1080", status: "ready" },
];

const exportPresets = [
  { name: "YouTube 1080p", format: "MP4 / H.264", dim: "1920 x 1080", size: "~45 MB/min" },
  { name: "TikTok 1080x1920", format: "MP4 / H.264", dim: "1080 x 1920", size: "~28 MB/min" },
  { name: "Instagram 1080x1350", format: "MP4 / H.264", dim: "1080 x 1350", size: "~32 MB/min" },
];

const recentDeliveries = [
  { title: "Cyberpunk 2077: District 9", platform: "YouTube", date: "May 13, 12:00 PM", views: "12.4K" },
  { title: "Neon City Walkthrough #74", platform: "TikTok", date: "May 13, 10:30 AM", views: "8.2K" },
  { title: "Combat Art Reveal", platform: "Instagram", date: "May 12, 4:15 PM", views: "5.1K" },
  { title: "Eclipse Protocol Teaser", platform: "LinkedIn", date: "May 12, 9:00 AM", views: "3.8K" },
];

const weekDays = ["Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16", "Sat 17", "Sun 18"];
const timeSlots = ["9AM", "12PM", "3PM", "6PM", "9PM"];

const calendarItems: Record<string, Array<{ title: string; platform: string; color: string }>> = {
  "Mon 12-9AM": [{ title: "Teaser Drop", platform: "YouTube", color: "bg-red-500/80" }],
  "Mon 12-12PM": [{ title: "BTS Clip", platform: "TikTok", color: "bg-cyan-500/80" }],
  "Tue 13-9AM": [{ title: "Quote Thread", platform: "X", color: "bg-white/80" }],
  "Tue 13-3PM": [{ title: "Behind the Build", platform: "YouTube", color: "bg-red-500/80" }],
  "Wed 14-12PM": [{ title: "Character Drop", platform: "Instagram", color: "bg-pink-500/80" }],
  "Wed 14-6PM": [{ title: "Quote Thread", platform: "X", color: "bg-white/80" }],
  "Thu 15-9AM": [{ title: "BTS Clip", platform: "TikTok", color: "bg-cyan-500/80" }],
  "Thu 15-3PM": [{ title: "Creator Collab", platform: "Instagram", color: "bg-pink-500/80" }],
  "Fri 16-12PM": [{ title: "Top 10 List", platform: "YouTube", color: "bg-red-500/80" }],
  "Fri 16-6PM": [{ title: "Cinematic Cut", platform: "TikTok", color: "bg-cyan-500/80" }],
  "Sat 17-3PM": [{ title: "Community Poll", platform: "LinkedIn", color: "bg-blue-500/80" }],
};

/* ─── Sparkline SVG ─── */
function Sparkline({ color = "#00D4FF" }: { color?: string }) {
  const pts = [12, 18, 15, 22, 28, 24, 32, 30, 38, 42, 36, 48, 44, 52, 58, 54, 62, 68, 64, 72, 78, 74, 82, 88];
  const w = 120, h = 40;
  const max = Math.max(...pts), min = Math.min(...pts);
  const points = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} opacity="0.7" />
      <polygon fill={color} opacity="0.08" points={`0,${h} ${points} ${w},${h}`} />
    </svg>
  );
}

/* ─── Component ─── */
export function DistributeStudio() {
  const [selectedWeek] = useState("May 12 - May 18, 2025");

  return (
    <div className="axs-distribute-studio space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">DISTRIBUTION</h1>
          <p className="mt-1 text-sm text-white/50">Distribute to every platform. Engage every audience. Grow everywhere.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 rounded-lg border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white">
            <Calendar className="mr-2 h-4 w-4" /> {selectedWeek}
          </Button>
          <Button className="h-9 rounded-lg bg-cyan-500/20 text-cyan-100 border border-cyan-500/30 hover:bg-cyan-500/30">
            <Zap className="mr-2 h-4 w-4" /> Publish Now
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiData.map((kpi) => (
          <CommandPanel key={kpi.label} className="axs-kpi-card p-4">
            <div className="flex items-center justify-between">
              <kpi.Icon className={`h-5 w-5 ${kpi.tone === "cyan" ? "text-cyan-300" : kpi.tone === "violet" ? "text-violet-300" : "text-amber-300"}`} />
              <span className="text-[10px] font-semibold text-emerald-400">{kpi.delta}</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">{kpi.value}</div>
            <div className="text-[11px] font-medium text-white/40">{kpi.label}</div>
            <div className="mt-2">
              <Sparkline color={kpi.tone === "cyan" ? "#00D4FF" : kpi.tone === "violet" ? "#A855F7" : "#F59E0B"} />
            </div>
          </CommandPanel>
        ))}
      </section>

      {/* Main Dashboard Grid */}
      <section className="grid gap-4 xl:grid-cols-12">
        {/* Publishing Calendar — left, spans 7 cols */}
        <div className="xl:col-span-7 space-y-4">
          <CommandPanel className="axs-dist-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-300" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Publishing Calendar</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> YouTube</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-500" /> TikTok</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-pink-500" /> Instagram</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-white" /> X</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> LinkedIn</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" /> Facebook</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-8 gap-1 text-[10px]">
              {/* Header row */}
              <div className="p-2 text-white/30" />
              {weekDays.map((day) => (
                <div key={day} className={`p-2 text-center font-semibold ${day.includes("13") ? "text-cyan-300" : "text-white/50"}`}>
                  {day}
                </div>
              ))}

              {/* Time slots */}
              {timeSlots.map((time) => (
                <div key={time} className="contents">
                  <div className="p-2 text-white/30 font-medium">{time}</div>
                  {weekDays.map((day) => {
                    const key = `${day}-${time}`;
                    const items = calendarItems[key] || [];
                    return (
                      <div key={key} className="min-h-[52px] rounded-md border border-white/5 bg-white/[0.03] p-1">
                        {items.map((item, i) => (
                          <div key={i} className={`mb-1 rounded px-1.5 py-0.5 text-[9px] font-medium text-white truncate ${item.color}`}>
                            {item.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CommandPanel>

          {/* Bottom row: Scheduling + Workflow */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Scheduling Queue */}
            <CommandPanel className="axs-dist-panel p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-300" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Scheduling Queue</h2>
                </div>
                <button className="text-xs text-cyan-300 hover:text-cyan-200">View All</button>
              </div>
              <div className="space-y-2">
                {scheduleQueue.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">{item.title}</div>
                      <div className="text-[10px] text-white/40">{item.platform} • {item.date}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-3 h-8 w-full rounded-lg border-white/10 bg-white/5 text-xs text-white/60 hover:bg-white/10">
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Content to Queue
              </Button>
            </CommandPanel>

            {/* Distribution Workflow */}
            <CommandPanel className="axs-dist-panel p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-violet-300" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Distribution Workflow</h2>
              </div>
              <div className="space-y-3">
                {workflowSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold
                      ${step.status === "complete" ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300" :
                        step.status === "active" ? "border-cyan-500/30 bg-cyan-500/15 text-cyan-300" :
                        "border-white/10 bg-white/5 text-white/30"}`}>
                      {step.status === "complete" ? <Check className="h-3 w-3" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white">{step.label}</div>
                      {step.status === "active" && (
                        <div className="mt-1 h-1 rounded-full bg-white/10">
                          <div className="h-full w-[65%] rounded-full bg-cyan-400" />
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold ${step.status === "complete" ? "text-emerald-400" : step.status === "active" ? "text-cyan-400" : "text-white/30"}`}>
                      {step.status === "complete" ? "Complete" : step.status === "active" ? "In Progress" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </CommandPanel>
          </div>
        </div>

        {/* Right column — spans 5 cols */}
        <div className="xl:col-span-5 space-y-4">
          {/* Connected Platforms */}
          <CommandPanel className="axs-dist-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-cyan-300" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Connected Platforms</h2>
              </div>
              <button className="text-xs text-cyan-300 hover:text-cyan-200">Manage</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => (
                <div key={p.name} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] p-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    {p.name === "YouTube" ? <Youtube className="h-4 w-4 text-red-400" /> :
                     p.name === "TikTok" ? <Video className="h-4 w-4 text-cyan-400" /> :
                     p.name === "Instagram" ? <Instagram className="h-4 w-4 text-pink-400" /> :
                     p.name === "X (Twitter)" ? <span className="text-[10px] font-bold text-white">X</span> :
                     p.name === "LinkedIn" ? <Linkedin className="h-4 w-4 text-blue-400" /> :
                     p.name === "Facebook" ? <Facebook className="h-4 w-4 text-blue-400" /> :
                     p.name === "Vimeo" ? <Video className="h-4 w-4 text-cyan-300" /> :
                     <Users className="h-4 w-4 text-violet-300" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <div className="text-[11px] font-semibold text-white truncate">{p.name}</div>
                      <div className="shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[9px] text-white/40 truncate">{p.followers}</div>
                  </div>
                  <MoreHorizontal className="h-3.5 w-3.5 text-white/20 shrink-0" />
                </div>
              ))}
              <button className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-2.5 text-xs text-white/40 hover:text-white/60">
                <Plus className="h-3.5 w-3.5" /> Add Platform
              </button>
            </div>
          </CommandPanel>

          {/* Channel Health + Targets */}
          <div className="grid gap-4 md:grid-cols-2">
            <CommandPanel className="axs-dist-panel p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-emerald-300" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Channel Health</h2>
                </div>
                <button className="text-xs text-cyan-300 hover:text-cyan-200">View All</button>
              </div>
              <div className="space-y-2.5">
                {channelHealth.map((ch) => (
                  <div key={ch.platform} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70">{ch.platform}</span>
                      <span className="text-white/40">{ch.score}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${ch.color}`} style={{ width: `${ch.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CommandPanel>

            <CommandPanel className="axs-dist-panel p-5">
              <div className="flex items-center gap-2 mb-4">
                <TargetIcon />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Distribution Targets</h2>
              </div>
              <div className="flex flex-col items-center py-2">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00D4FF" strokeWidth="3" strokeDasharray="78, 100" />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-lg font-bold text-white">78%</div>
                    <div className="text-[9px] text-white/40">of monthly goal</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Reach", value: "25.0M", goal: "32M" },
                  { label: "Engagement", value: "3.0M", goal: "3.5M" },
                  { label: "Clicks", value: "1.2M", goal: "1.5M" },
                  { label: "Conversions", value: "250K", goal: "300K" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between text-xs">
                    <span className="text-white/50">{t.label}</span>
                    <span className="text-white/70">{t.value} <span className="text-white/30">/ {t.goal}</span></span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[10px] text-white/30">Goal resets in 14 days</div>
            </CommandPanel>
          </div>

          {/* Audience Timing */}
          <CommandPanel className="axs-dist-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-violet-300" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Audience Timing</h2>
              </div>
              <button className="text-xs text-cyan-300 hover:text-cyan-200">View All</button>
            </div>
            <div className="grid grid-cols-8 gap-0.5 text-[8px]">
              <div />
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="p-1 text-center text-white/30 font-medium">{d}</div>
              ))}
              {["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"].map((time) => (
                <div key={time} className="contents">
                  <div className="p-1 text-right text-white/20">{time}</div>
                  {Array.from({ length: 7 }).map((_, d) => {
                    const intensity = Math.random();
                    const bg = intensity > 0.7 ? "bg-violet-500/60" : intensity > 0.4 ? "bg-violet-500/30" : intensity > 0.2 ? "bg-violet-500/12" : "bg-white/[0.03]";
                    return <div key={d} className={`rounded-sm ${bg} h-5`} />;
                  })}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-white/40">
              <Zap className="h-3 w-3 text-cyan-300" />
              <span>Best time today: <span className="text-cyan-300">6:00 PM - 8:00 PM</span></span>
            </div>
          </CommandPanel>
        </div>
      </section>

      {/* Bottom Row */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Content Packaging */}
        <CommandPanel className="axs-dist-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <Copy className="h-4 w-4 text-cyan-300" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Content Packaging</h2>
          </div>
          <div className="space-y-2">
            {contentPackages.map((pkg) => (
              <div key={pkg.ratio} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-white/5 text-[10px] font-bold text-white/60">{pkg.ratio}</div>
                  <div>
                    <div className="text-[11px] font-medium text-white">{pkg.label}</div>
                    <div className="text-[9px] text-white/40">{pkg.dim}</div>
                  </div>
                </div>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-3 h-8 w-full rounded-lg border-white/10 bg-white/5 text-xs text-white/60 hover:bg-white/10">
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Variant
          </Button>
        </CommandPanel>

        {/* Export Presets */}
        <CommandPanel className="axs-dist-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-violet-300" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Export Presets</h2>
            </div>
            <button className="text-xs text-cyan-300 hover:text-cyan-200">Manage</button>
          </div>
          <div className="space-y-2">
            {exportPresets.map((preset) => (
              <div key={preset.name} className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white">{preset.name}</span>
                  <MoreHorizontal className="h-3.5 w-3.5 text-white/20" />
                </div>
                <div className="text-[9px] text-white/40">{preset.format} • {preset.dim} • {preset.size}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" className="h-8 flex-1 rounded-lg border-white/10 bg-white/5 text-xs text-white/60 hover:bg-white/10">
              <Plus className="mr-1 h-3.5 w-3.5" /> Add
            </Button>
            <Button variant="outline" className="h-8 flex-1 rounded-lg border-white/10 bg-white/5 text-xs text-white/60 hover:bg-white/10">
              <Settings2 className="mr-1 h-3.5 w-3.5" /> Manage
            </Button>
          </div>
        </CommandPanel>

        {/* Publish Now */}
        <CommandPanel className="axs-dist-panel p-5">
          <div className="flex flex-col items-center text-center py-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
              <Zap className="h-7 w-7 text-cyan-300" />
            </div>
            <h2 className="mt-3 text-lg font-bold text-white">PUBLISH NOW</h2>
            <p className="mt-1 text-xs text-white/50">Active Workflow: Neon City Launch</p>
            <Button className="mt-4 h-10 w-full rounded-lg bg-cyan-500/20 text-cyan-100 border border-cyan-500/30 hover:bg-cyan-500/30">
              <Zap className="mr-2 h-4 w-4" /> Publish Now
            </Button>
            <Button variant="outline" className="mt-2 h-8 w-full rounded-lg border-white/10 bg-white/5 text-xs text-white/50 hover:bg-white/10">
              Preview Before Publishing
            </Button>
          </div>
        </CommandPanel>

        {/* Batch Publish + Recent Deliveries */}
        <div className="space-y-4">
          <CommandPanel className="axs-dist-panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="h-4 w-4 text-amber-300" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Batch Publish</h2>
            </div>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-10 rounded-lg border border-white/10 bg-white/5" />
              ))}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-white/10 text-xs text-white/30">+3</div>
            </div>
            <div className="text-xs text-white/50 mb-3">3 items selected • 6 platforms</div>
            <Button className="h-9 w-full rounded-lg bg-cyan-500/20 text-cyan-100 border border-cyan-500/30 hover:bg-cyan-500/30 text-xs">
              Publish 3 Items
            </Button>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" className="h-8 flex-1 rounded-lg border-white/10 bg-white/5 text-xs text-white/50 hover:bg-white/10">
                Schedule
              </Button>
              <Button variant="outline" className="h-8 flex-1 rounded-lg border-white/10 bg-white/5 text-xs text-white/50 hover:bg-white/10">
                Clear All
              </Button>
            </div>
          </CommandPanel>

          <CommandPanel className="axs-dist-panel p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">Recent Deliveries</h2>
              </div>
              <button className="text-xs text-cyan-300 hover:text-cyan-200">View All</button>
            </div>
            <div className="space-y-2">
              {recentDeliveries.map((d, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5">
                  <div className="h-8 w-8 shrink-0 rounded bg-white/5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-white truncate">{d.title}</div>
                    <div className="text-[9px] text-white/40">{d.platform} • {d.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold text-white/60">{d.views}</div>
                    <div className="text-[9px] text-white/30">views</div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-white/20 shrink-0" />
                </div>
              ))}
            </div>
          </CommandPanel>
        </div>
      </section>
    </div>
  );
}

function TargetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
