import { handleApiError, paypalAccessToken, readJson, sendJson } from "./_billing-shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) throw new Error("Missing PAYPAL_WEBHOOK_ID");

    const body = await readJson(req);
    const { token, baseUrl } = await paypalAccessToken();
    const verification = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: req.headers["paypal-auth-algo"],
        cert_url: req.headers["paypal-cert-url"],
        transmission_id: req.headers["paypal-transmission-id"],
        transmission_sig: req.headers["paypal-transmission-sig"],
        transmission_time: req.headers["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: body,
      }),
    });
    const result = await verification.json();
    if (result.verification_status !== "SUCCESS") return sendJson(res, 400, { error: "Invalid PayPal signature" });

    // Production hook: persist PayPal subscription entitlement state here.
    // Events to handle first: BILLING.SUBSCRIPTION.ACTIVATED,
    // BILLING.SUBSCRIPTION.CANCELLED, PAYMENT.SALE.COMPLETED.
    console.log("[paypal-webhook]", body.event_type, body.resource?.id);

    sendJson(res, 200, { received: true });
  } catch (error) {
    handleApiError(res, error);
  }
}
