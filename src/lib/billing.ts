export type BillingPlanId = "creator" | "studio" | "empire";
export type BillingProvider = "stripe" | "paypal";

export interface BillingPlan {
  id: BillingPlanId;
  name: string;
  tagline: string;
  price: number;
  badge: string;
  features: string[];
}

export const billingPlans: BillingPlan[] = [
  {
    id: "creator",
    name: "Creator",
    tagline: "Start building a serious content engine.",
    price: 49,
    badge: "Launch",
    features: ["Image Forge + Script Forge", "DNA Library", "Campaign templates", "Vault history"],
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "The obvious choice for serious creators.",
    price: 99,
    badge: "Best value",
    features: ["Universe Forge", "Scene Builder + AI Director", "LTX Motion Studio", "17-platform scheduling"],
  },
  {
    id: "empire",
    name: "Empire",
    tagline: "For teams building cinematic universes at scale.",
    price: 179,
    badge: "Scale",
    features: ["Director's Cut Studio", "Advanced continuity engine", "Team workflows", "Priority workflow drops"],
  },
];

function billingApiBase() {
  const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
  return meta.env?.VITE_BILLING_API_URL?.replace(/\/$/, "") ?? "";
}

async function billingPost<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${billingApiBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Billing request failed (${response.status})`);
  return data as T;
}

export async function startBillingCheckout(provider: BillingProvider, plan: BillingPlanId, email?: string) {
  const endpoint = provider === "stripe" ? "/api/create-stripe-checkout" : "/api/create-paypal-subscription";
  const { url } = await billingPost<{ url: string }>(endpoint, { plan, email });
  window.location.assign(url);
}

export async function openStripeCustomerPortal(customerId: string) {
  const { url } = await billingPost<{ url: string }>("/api/create-stripe-portal", { customerId });
  window.location.assign(url);
}
