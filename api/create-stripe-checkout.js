import {
  getAppUrl,
  getPlan,
  handleApiError,
  normalizeEmail,
  readJson,
  sendJson,
  stripeRequest,
} from "./_billing-shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

  try {
    const { plan: planId, email } = await readJson(req);
    const plan = getPlan(planId);
    const customerEmail = normalizeEmail(email);
    const priceId = process.env[plan.stripePriceEnv];
    if (!priceId) throw new Error(`Missing ${plan.stripePriceEnv}`);

    const appUrl = getAppUrl(req);
    const session = await stripeRequest("/checkout/sessions", {
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": 1,
      success_url: `${appUrl}/?checkout=success&provider=stripe&plan=${plan.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?checkout=cancelled&provider=stripe&plan=${plan.id}`,
      customer_email: customerEmail,
      allow_promotion_codes: "true",
      billing_address_collection: "auto",
      "automatic_tax[enabled]": "true",
      "metadata[plan]": plan.id,
      "subscription_data[metadata][plan]": plan.id,
    });

    sendJson(res, 200, { url: session.url, id: session.id });
  } catch (error) {
    handleApiError(res, error);
  }
}
