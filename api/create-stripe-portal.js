import { getAppUrl, handleApiError, readJson, sendJson, stripeRequest } from "./_billing-shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

  try {
    const { customerId } = await readJson(req);
    if (!customerId) throw new Error("Missing customerId");

    const portal = await stripeRequest("/billing_portal/sessions", {
      customer: customerId,
      return_url: process.env.STRIPE_PORTAL_RETURN_URL || `${getAppUrl(req)}/?billing=portal-return`,
    });

    sendJson(res, 200, { url: portal.url });
  } catch (error) {
    handleApiError(res, error);
  }
}
