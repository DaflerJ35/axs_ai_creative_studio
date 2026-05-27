import crypto from "crypto";
import { readRawBody, sendJson } from "./_billing-shared.js";

function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;

  const timestamp = signatureHeader
    .split(",")
    .map((part) => part.split("="))
    .find(([key]) => key === "t")?.[1];
  const signatures = signatureHeader
    .split(",")
    .map((part) => part.split("="))
    .filter(([key, value]) => key === "v1" && Boolean(value))
    .map(([, value]) => value);

  if (!timestamp || signatures.length === 0) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody.toString("utf8")}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  return signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature, "hex");
    if (signatureBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

  const rawBody = await readRawBody(req);
  const signature = req.headers["stripe-signature"];
  const verified = verifyStripeSignature(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  if (!verified) return sendJson(res, 400, { error: "Invalid Stripe signature" });

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return sendJson(res, 400, { error: "Invalid Stripe payload" });
  }

  // Production hook: persist customer/subscription entitlement state here.
  // Events to handle first: checkout.session.completed, customer.subscription.updated,
  // customer.subscription.deleted, invoice.payment_failed.
  console.log("[stripe-webhook]", event.type, event.data?.object?.id);

  sendJson(res, 200, { received: true });
}
