import {
  getAppUrl,
  getPlan,
  handleApiError,
  normalizeEmail,
  paypalAccessToken,
  readJson,
  sendJson,
} from "./_billing-shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

  try {
    const { plan: planId, email } = await readJson(req);
    const plan = getPlan(planId);
    const subscriberEmail = normalizeEmail(email);
    const paypalPlanId = process.env[plan.paypalPlanEnv];
    if (!paypalPlanId) throw new Error(`Missing ${plan.paypalPlanEnv}`);

    const appUrl = getAppUrl(req);
    const { token, baseUrl } = await paypalAccessToken();
    const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        plan_id: paypalPlanId,
        custom_id: plan.id,
        subscriber: subscriberEmail ? { email_address: subscriberEmail } : undefined,
        application_context: {
          brand_name: "AXS Creative Studio",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${appUrl}/?checkout=success&provider=paypal&plan=${plan.id}`,
          cancel_url: `${appUrl}/?checkout=cancelled&provider=paypal&plan=${plan.id}`,
        },
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "PayPal subscription failed");

    const approve = data.links?.find((link) => link.rel === "approve")?.href;
    if (!approve) throw new Error("PayPal did not return an approval URL");

    sendJson(res, 200, { url: approve, id: data.id });
  } catch (error) {
    handleApiError(res, error);
  }
}
