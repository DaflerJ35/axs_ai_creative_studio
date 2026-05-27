import React from 'react';
import { 
  Check, 
  Sparkles, 
  Cpu, 
  Layers, 
  Activity, 
  ChevronRight, 
  DollarSign, 
  ShieldCheck, 
  Coins, 
  ArrowRight,
  TrendingUp,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { FaqItem, RevenueCalculator, EarlyAccessForm } from './App';

// @ts-ignore
import axsGoldEmblem from './assets/images/axs_gold_emblem_1779633461494.png';

interface PitchPageProps {
  handleAnchorClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
  navigateTo: (path: string) => void;
}

export default function PitchPage({ handleAnchorClick, navigateTo }: PitchPageProps) {
  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col pt-32 space-y-24 relative z-10 w-full">
      {/* BACKGROUND CINEMA ATMOSPHERE */}
      <div className="absolute top-0 left-0 w-full h-[650px] bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      {/* 1. INVESTOR HERO HEADER */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto text-center space-y-6 relative flex flex-col items-center">
        
        {/* Pitch Branding Logo Hallmarks */}
        <div className="relative mb-4 flex flex-col items-center justify-center">
          <div className="absolute w-[180px] h-[180px] bg-gradient-to-tr from-[#D4AF37]/15 via-[#D4AF37]/5 to-transparent rounded-full filter blur-[50px] pointer-events-none" />
          <img 
            src={axsGoldEmblem} 
            alt="AXS - AI Creative Studio Logo" 
            className="w-24 h-24 object-contain rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.25)] border border-[#D4AF37]/20 relative z-10"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase animate-pulse">
          <Coins className="w-3.5 h-3.5" /> Backer & Founder Intel // Route: /pitch
        </div>
        
        <h1 className="text-4xl md:text-7xl font-black uppercase text-white tracking-tight leading-none">
          THE CAPITAL &<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F3E5AB]">
            GROWTH FORMULA
          </span>
        </h1>

        <p className="text-gray-300 text-sm md:text-lg max-w-3xl mx-auto leading-relaxed">
          AXS is transitioning built desktop prototypes into a secure, managed cloud execution ecosystem. This Pitch Deck details our strict budget allocation, micro-mechanic operational costs, and high-margin model.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <a
            href="#scotty-pitch"
            onClick={(e) => handleAnchorClick(e, 'scotty-pitch')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F3E5AB] text-black font-semibold text-xs tracking-wider uppercase hover:shadow-[0_0_15px_rgba(212,175,55,0.30)] transition-all"
          >
            Read Executive Pitch
          </a>
          <a
            href="#funding-ask"
            onClick={(e) => handleAnchorClick(e, 'funding-ask')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-gray-800 text-white font-semibold text-xs tracking-wider uppercase hover:bg-white/5 transition-all"
          >
            Launch Funding Metrics
          </a>
          <button
            onClick={() => navigateTo('/')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-dashed border-[#D4AF37]/35 text-[#D4AF37] font-semibold text-xs tracking-wider uppercase hover:bg-white/5 transition-all"
          >
            Exit to Public Homepage
          </button>
        </div>

        {/* HERO METRIC BADGERS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto font-mono text-left">
          {[
            { label: 'CAPITAL TARGET', val: '$6,000 BASE', sub: 'For code hardening & LLC' },
            { label: 'STRETCH CAPACITY', val: '$10,000 CAP', sub: 'Extended sandbox tokens' },
            { label: 'Calculated Margins', val: '82% PROJ.', sub: 'Excluding raw server costs' },
            { label: 'LAUNCH SEED', val: 'COHORT WAVE 1', sub: 'Closed alpha release pool' }
          ].map((stat, i) => (
            <div key={i} className="smoked-glass rounded-xl p-4 border border-gray-900 bg-black/40">
              <span className="text-[9px] text-gray-500 uppercase block">{stat.label}</span>
              <div className="text-white text-base font-black mt-1 uppercase">{stat.val}</div>
              <span className="text-[10px] text-gray-400 block mt-1">{stat.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. EXECUTIVE SCOTTY PITCH SUMMARY */}
      <section id="scotty-pitch" className="px-6 md:px-12 max-w-5xl mx-auto scroll-mt-28">
        <div className="smoked-glass rounded-2xl p-6 md:p-10 border border-[#D4AF37]/15 bg-[#080808]/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10 text-left">
            <div className="md:w-1/3 space-y-4">
              <span className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-widest block">// EXECUTIVE FOCUS</span>
              <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight leading-tight">
                SCOTTY / BACKER SUMMARY
              </h3>
              <div className="h-0.5 bg-gradient-to-r from-[#D4AF37] to-transparent w-24" />
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                A brief message outlining the immediate investment validity, operational leverage, and execution thesis driving the campaign.
              </p>
            </div>
            
            <div className="md:w-2/3 space-y-4 text-xs text-gray-300 leading-relaxed font-sans">
              <p>
                AXS is not standard SaaS. It builds a permanent, deep custom index—the <span className="text-[#D4AF37] font-semibold">Memory Layer</span>—retaining a full visual and historical record of a team’s creative identity. Standard tools are fleeting and reset context. AXS turns ephemeral assets into compound assets.
              </p>
              <p>
                Our core strategy is simple: secure early infrastructure capital to transition existing desktop code prototypes to isolated, reliable cloud servers. The $6,000 objective ensures legal organization, automated database migrations, structural system validation, and defensive generation limits.
              </p>
              <p className="border-l-2 border-[#D4AF37] pl-4 italic text-gray-400">
                "By anchoring content creators to their proprietary story vaults, AXS locks in loyalty. Higher usage yields smarter context vector nodes, turning early adapters into permanent infrastructure users."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE LAUNCH ASK & USE OF FUNDS */}
      <section id="funding-ask" className="px-6 md:px-12 max-w-7xl mx-auto scroll-mt-28">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono">BACKER ENGINE</h2>
          <h3 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight mt-1">
            CAMPAIGN TARGETS
          </h3>
          <p className="text-gray-400 text-sm mt-3">
            Your support finances secure, low-latency database arrays and GPU/token query buffer pools for active waves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Base Goal details */}
          <div className="smoked-glass rounded-2xl p-6 md:p-8 border-l-4 border-l-[#D4AF37] border-t border-r border-b border-[#D4AF37]/15 text-left">
            <span className="text-[#D4AF37] font-mono text-[10px] uppercase block font-bold">CORE OBJECTIVE</span>
            <h4 className="text-[#FFF] text-2xl font-black tracking-tight uppercase mt-1">Base Goal: $6,000</h4>
            <div className="h-px bg-gradient-to-r from-[#D4AF37]/20 to-transparent my-4" />
            <ul className="space-y-3.5 text-xs text-gray-300">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span><strong>Platform Code Hardening:</strong> Debug-proofing layout loops & security constraints.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span><strong>Security Integrations:</strong> Active database authentication and secure cloud servers.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span><strong>Walkthrough Media:</strong> High-definition workflow recordings and template sandbox runs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span><strong>Corporate Shelling:</strong> LLC setup, trademark protection, and official domain assets.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span><strong>Operational Buffer:</strong> Server, vector database, and rendering query pools.</span>
              </li>
            </ul>
          </div>

          {/* Stretch Goal details */}
          <div className="smoked-glass rounded-2xl p-6 md:p-8 border border-[#D4AF37]/10 bg-[#070707]/60 text-left">
            <span className="text-gray-400 font-mono text-[10px] uppercase block">SCALE TARGET</span>
            <h4 className="text-[#FFF] text-2xl font-black tracking-tight uppercase mt-1">Stretch Goal: $10,000</h4>
            <div className="h-px bg-gradient-to-r from-gray-800 to-transparent my-4" />
            <ul className="space-y-3.5 text-xs text-gray-400">
              <li className="flex items-start gap-2.5 text-gray-350">
                <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span><strong>Expanded Credits:</strong> Increased processing pools for the Wave 1 tester group.</span>
              </li>
              <li className="flex items-start gap-2.5 text-gray-350">
                <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span><strong>Load Simulators:</strong> Advanced pipeline simulation to withstand concurrency spikes.</span>
              </li>
              <li className="flex items-start gap-2.5 text-gray-350">
                <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span><strong>Premium Tutorials:</strong> High-definition developer onboarding guides and interactive scripts.</span>
              </li>
              <li className="flex items-start gap-2.5 text-gray-350">
                <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span><strong>Deep Archetypes:</strong> Double the preset lore templates and narrative structures.</span>
              </li>
              <li className="flex items-start gap-2.5 text-gray-350">
                <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span><strong>Extended Runway:</strong> 6 months of absolute server margin peace of mind.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* DETAILED USE OF FUNDS BUDGET GRID */}
        <div className="smoked-glass rounded-xl p-6 border border-gray-900 bg-[#070707]/80 text-left">
          <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-4">Detailed Use of Funds ($6,000 Base Breakup)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            {[
              { label: 'Product / code hardening', val: '$1,250', p: '20.8%' },
              { label: 'Supabase / backend / domain / tools', val: '$750', p: '12.5%' },
              { label: 'Demo video, walkthroughs & screenshots', val: '$1,000', p: '16.7%' },
              { label: 'GPU / API testing with defensive caps', val: '$750', p: '12.5%' },
              { label: 'Legal / Admin / LLC registrar setup', val: '$750', p: '12.5%' },
              { label: 'Early outreach & creator campaigns', val: '$500', p: '8.3%' },
              { label: 'Emergency launch margin buffer', val: '$1,000', p: '16.7%' }
            ].map((fund, i) => (
              <div key={i} className="bg-black/80 border border-gray-950 p-3.5 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-gray-400 font-medium">{fund.label}</div>
                  <div className="text-white font-black text-sm mt-1">{fund.val}</div>
                </div>
                <div className="text-[10px] text-[#D4AF37] font-mono mt-2 flex justify-between">
                  <span>SHARE:</span> <span>{fund.p}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-[10px] font-mono text-gray-400 border border-gray-950 bg-black/60 p-3 rounded">
            👉 BACKER NOTICE: Unlimited AI model calculations are not supported during active wave releases to prevent financial degradation. Bounded monthly quotas configure safety buffers around the backend hosting.
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE REVENUE MODEL & PROJECTIONS ENGINE */}
      <section id="revenue-calculator" className="px-6 md:px-12 max-w-7xl mx-auto scroll-mt-28">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono">FINANCIAL FORECAST</h2>
          <h3 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight mt-1">
            PROJECT EMPIRE ECONOMICS
          </h3>
          <p className="text-gray-300 text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
            Unlike classical heavy-headcount agencies, AXS runs an extremely lean operational template. Every subscriber pass represents substantial net operating margins.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start text-left">
          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg uppercase">System Subscription Strategy</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              We allocate subscriptions across three precise profiles, targeting an average blended ARPU (Average Revenue Per User) of ~$93/mo.
            </p>
            <div className="space-y-4">
              {[
                { name: 'Creator Pass', price: '$49/mo', desc: 'Crafted for solo filmmakers, artists, writers, and early builders.', ratio: '35% projected allocation.' },
                { name: 'Studio Pass', price: '$99/mo', desc: 'Our flagship choice. Higher priority limits, full campaign story databases & memory structures.', ratio: '50% projected allocation.' },
                { name: 'Empire Pass', price: '$179/mo', desc: 'Designed for high volume brand owners, cinematic teams, studios, and agencies.', ratio: '15% projected allocation.' }
              ].map((tier, idx) => (
                <div key={idx} className="smoked-glass rounded-xl p-5 border border-[#D4AF37]/10 bg-black/50">
                  <div className="flex justify-between items-center text-left">
                    <span className="text-[#FFF] text-sm font-bold tracking-wide uppercase">{tier.name}</span>
                    <span className="text-[#D4AF37] font-mono font-bold text-sm">{tier.price}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed text-left">{tier.desc}</p>
                  <div className="text-[10px] text-gray-500 mt-2 font-mono flex items-center justify-between">
                    <span>ALLOCATION PROFILE:</span>
                    <span>{tier.ratio}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-[10px] leading-relaxed text-gray-500 font-mono italic">
              * Note: Operating computations represents projected potential growth. Real financial success depends on active retention rates, transaction checkout fees, client onboarding speeds, and regional database structures.
            </p>
          </div>

          <div className="bg-[#080808] border border-gray-900 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full filter blur-2xl pointer-events-none" />
            <div className="border-b border-gray-900 pb-4">
              <span className="text-[#D4AF37] font-mono text-[10px] uppercase block">// FINANCIAL SIMULATOR MODE</span>
              <h4 className="text-white font-bold text-lg uppercase mt-1">Blended MRR Calculator</h4>
              <p className="text-xs text-gray-400 mt-1">Scale theoretical subscriber density to examine margins and ARR targets.</p>
            </div>

            <RevenueCalculator />
          </div>
        </div>
      </section>

      {/* 5. ROADMAP PROGRESS CALENDAR */}
      <section id="pitch-roadmap" className="px-6 md:px-12 max-w-7xl mx-auto scroll-mt-28">
        <div className="text-center mb-16 text-left max-w-3xl mx-auto">
          <h2 className="text-[#D4AF37] font-mono text-xs uppercase tracking-widest text-center">Development Delivery</h2>
          <h3 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight text-center mt-1">
            CAMPAIGN MILESTONES
          </h3>
          <p className="text-gray-400 text-xs text-center mt-3">
            Our operational target milestones prioritize core validation, wave releases, and platform optimizations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative text-left">
          <div className="hidden md:block absolute top-[28px] left-[50px] right-[50px] h-[1px] bg-gradient-to-r from-[#D4AF37]/40 via-[#D4AF37]/10 to-transparent" />
          {[
            { date: 'June 2026', title: 'Fund & Legalize', desc: 'Execute LLC filings, secure backend infrastructures, and activate public directories.' },
            { date: 'July 2026', title: 'Security Polish', desc: 'Secure database configurations, harden error loops, and optimize prompt pipelines.' },
            { date: 'August 2026', title: 'Wave 1 Alpha', desc: 'Controlled private keys gate opening. Restricting cohort 1 to test system load.' },
            { date: 'Sept 2026', title: 'Sandbox Renders', desc: 'Releasing official walkthrough video reels and expanded scenario builders.' },
            { date: 'October 2026', title: 'Cohort Expansion', desc: 'Opening registrations to Wave 2 candidates sequentially as API performance logs balance.' }
          ].map((mile, idx) => (
            <div key={idx} className="smoked-glass rounded-xl p-5 border border-gray-900 bg-[#080808]/70 relative z-10 transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37] flex items-center justify-center font-mono text-[9px] text-[#D4AF37] font-black uppercase">
                  M{idx+1}
                </div>
                <div className="text-[10px] text-[#D4AF37] font-mono tracking-widest uppercase">{mile.date}</div>
              </div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wide">{mile.title}</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed mt-1">{mile.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. KICKSTARTER / BACKER TRANSPARENCY SECTION */}
      <section className="px-6 md:px-12 max-w-5xl mx-auto">
        <div className="smoked-glass rounded-2xl p-6 md:p-8 border border-[#D4AF37]/20 bg-[#090909] text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="text-[9px] text-gray-500 font-mono uppercase block">// FUNDING COMPLIANCE MANUAL</span>
              <h3 className="text-white font-black uppercase tracking-tight text-lg">BACKER TRANSPARENCY & STATEMENTS</h3>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed space-y-3 font-sans">
            Please review our strict transparency declarations prior to joining:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-xs text-gray-400">
            <div className="space-y-3 border-r border-gray-900 pr-0 md:pr-6">
              <p>
                <strong>No Promises of Financial Gain:</strong> Support on our developer channel is strictly defined as developer sponsorship. Under no circumstances will your contributions match securities, credit models, stock options, loan contracts, or promises of equity payout.
              </p>
              <p>
                <strong>Unlocking Real Utility Blocks:</strong> Rather than simulated payouts, backers receive premium system credits, custom visual archetype parameters, and priority queue licenses directly valid upon active platform releases.
              </p>
            </div>
            <div className="space-y-3">
              <p>
                <strong>Risks & Pipeline Safeguards:</strong> High compute density on third-party APIs can cause spike costs. To buffer operations from exhaustion, we use rate throttlers and queue limitations. Supported systems are validated under close review.
              </p>
              <p>
                <strong>Productive Collaboration Model:</strong> Our development is structured dynamically. Regular reporting boards and progress briefings will keep backers briefed on the exact features and stabilization logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CAMPAIGN FAQS ACCORDION */}
      <section id="pitch-faq" className="px-6 md:px-12 max-w-4xl mx-auto scroll-mt-28">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono">BACKER INQUIRIES</h2>
          <h3 className="text-3xl font-black uppercase text-white tracking-tight mt-1">Campaign FAQ</h3>
        </div>

        <div className="space-y-4 text-left">
          {[
            { q: 'Is this an investment or stock offer?', a: 'No. Supporting AXS does not offer equity pools, corporate control structures, shared profit payouts, options, or debt obligations. Sponsorship yields product early-wave computing tokens and platform priority access.' },
            { q: 'How will the $6,000 base funding support AXS?', a: 'The base budget handles primary organizational steps: registering our legal LLC entity, hard-securing database connections, producing polished demonstration playthroughs, and establishing initial server runtime balances.' },
            { q: 'What is the stretch target set at $10,000?', a: 'Setting the scale filter at $10,000 allows us to double our GPU computation pools, add richer visual script archetypes, and secure 6 months of absolute database operational maintenance runway.' },
            { q: 'Can I request a direct walkthrough demo?', a: 'Absolutely. Backers who complete our early access list receive immediate notification once our development cohorts open sandbox gates.' },
            { q: 'What safeguards protect your system from collapsing?', a: 'To prevent uncontrolled operational fees, we run strict rate limit controls on third-party API routes, enforce monthly calculation limitations, and audit requests systematically.' },
            { q: 'When will Wave 1 Alpha keys get deployed?', a: 'We target active code validation during June 2026, aiming to deploy Wave 1 priority licenses directly in August 2026 to early registered sponsors.' }
          ].map((faq, i) => (
            <FaqItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* 8. EARLY ACCESS PITCH CONSOLE */}
      <section id="pitch-cta" className="px-6 md:px-12 max-w-4xl mx-auto text-center scroll-mt-28">
        <div className="smoked-glass rounded-2xl p-8 md:p-12 border border-[#D4AF37]/30 relative overflow-hidden bg-black flex flex-col items-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#D4AF37]/5 rounded-full filter blur-3xl pointer-events-none" />

          <span className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-widest">SUBMIT SPONSORSHIP INTEREST</span>
          <h3 className="text-2xl md:text-5xl font-black uppercase text-white tracking-tight mt-2 leading-none">
            Secure your wave spot
          </h3>
          <p className="text-gray-300 text-xs md:text-sm max-w-xl mx-auto mt-4 leading-relaxed">
            By registering inside this cohort portal, you receive early progress digests, specific build metrics, and priority scheduling.
          </p>

          <div className="w-full mt-10">
            <EarlyAccessForm />
          </div>

          <div className="mt-6 flex justify-center text-[9px] text-gray-500 font-mono tracking-widest uppercase gap-4">
            <span>SECURE ENCRYPTED REGISTRY</span>
            <span>•</span>
            <span>DATA STORED LOCALLY OR VIA SUPABASE</span>
          </div>
        </div>
      </section>

      {/* FOOTER MOMENT */}
      <section className="py-16 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full filter blur-[100px] pointer-events-none" />
        <img 
          src={axsGoldEmblem} 
          alt="AXS Shield" 
          className="w-20 h-20 mx-auto object-contain rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.2)] border border-[#D4AF37]/20" 
          referrerPolicy="no-referrer"
        />
        <h4 className="text-white text-xs font-mono uppercase tracking-widest mt-4">AXS INTEL GATEWAY</h4>
        <span className="text-[10px] text-gray-650 font-mono uppercase mt-1">LOCKED PORTAL • HIGH VALUE CHANNELS</span>
      </section>
    </div>
  );
}
