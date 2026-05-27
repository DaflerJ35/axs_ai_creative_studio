import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Crown, ExternalLink, ShieldCheck, WalletCards } from "lucide-react";
import { Button } from "../ui/button";
import { GlassCard } from "../ui/glass-card";
import { billingPlans, startBillingCheckout, type BillingPlanId, type BillingProvider } from "../../lib/billing";

export function BillingPanel() {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const checkout = async (provider: BillingProvider, plan: BillingPlanId) => {
    setLoading(`${provider}:${plan}`);
    try {
      await startBillingCheckout(provider, plan, email.trim() || undefined);
    } catch (error) {
      toast.error("Checkout is not ready yet", {
        description:
          error instanceof Error
            ? error.message
            : "Check your Stripe/PayPal environment variables and billing server.",
      });
      setLoading(null);
    }
  };

  return (
    <GlassCard className="overflow-hidden border-cyan-300/15 bg-gradient-to-br from-cyan-400/[0.06] via-white/[0.035] to-violet-500/[0.06]">
      <div className="border-b border-white/[0.07] p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Payments
            </div>
            <h2 className="text-3xl font-black tracking-[-0.04em]">Subscription command center</h2>
            <p className="mt-2 text-sm leading-6 text-white/48">
              Stripe handles debit and credit cards through hosted Checkout. PayPal runs as a separate
              subscription rail. AXS never touches raw card numbers.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/24 p-3 text-xs text-white/45">
            <div className="font-bold text-white/70">Local dev</div>
            <div>Set VITE_BILLING_API_URL when using the billing dev server.</div>
          </div>
        </div>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="customer@email.com (optional)"
          className="mt-5 h-12 w-full rounded-2xl border border-white/10 bg-black/24 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/35"
        />
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-3">
        {billingPlans.map((plan) => {
          const featured = plan.id === "studio";
          return (
            <div
              key={plan.id}
              className={`rounded-[1.6rem] border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${
                featured
                  ? "border-cyan-200/25 bg-cyan-200/[0.09]"
                  : "border-white/[0.08] bg-black/18"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
                  {plan.badge}
                </div>
                {featured ? <Crown className="h-5 w-5 text-cyan-200" /> : null}
              </div>
              <h3 className="mt-5 text-2xl font-black">{plan.name}</h3>
              <div className="mt-2 text-sm text-white/45">{plan.tagline}</div>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-5xl font-black tracking-[-0.06em]">${plan.price}</span>
                <span className="pb-2 text-sm font-bold text-white/35">/month</span>
              </div>
              <div className="mt-5 space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-white/58">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-200" />
                    {feature}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-2">
                <Button
                  onClick={() => checkout("stripe", plan.id)}
                  disabled={loading !== null}
                  className="h-11 rounded-2xl bg-cyan-100 font-black text-black hover:bg-white"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {loading === `stripe:${plan.id}` ? "Opening Stripe..." : "Card checkout"}
                </Button>
                <Button
                  onClick={() => checkout("paypal", plan.id)}
                  disabled={loading !== null}
                  className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] font-bold text-white/70 hover:bg-white/[0.08] hover:text-white"
                >
                  <WalletCards className="mr-2 h-4 w-4" />
                  {loading === `paypal:${plan.id}` ? "Opening PayPal..." : "PayPal checkout"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/[0.07] px-7 py-5 text-xs leading-6 text-white/42">
        Configure live products in Stripe and PayPal, then map their price/plan IDs through environment
        variables. Webhooks are included so production can grant and revoke access from subscription events.
        <a
          href="https://docs.stripe.com/billing/quickstart"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 inline-flex items-center gap-1 text-cyan-200 hover:text-white"
        >
          Stripe docs <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </GlassCard>
  );
}
