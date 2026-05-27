import express from "express";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import createStripeCheckout from "../api/create-stripe-checkout.js";
import createStripePortal from "../api/create-stripe-portal.js";
import createPaypalSubscription from "../api/create-paypal-subscription.js";
import paypalWebhook from "../api/paypal-webhook.js";
import stripeWebhook from "../api/stripe-webhook.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

for (const envFile of [".env.local", ".env"]) {
  const filePath = join(ROOT, envFile);
  if (!existsSync(filePath)) continue;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s][^=]*?)\s*=\s*(.*)$/);
    if (match && !(match[1] in process.env)) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

const app = express();
const port = Number(process.env.BILLING_PORT || 4242);

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.APP_URL || "http://127.0.0.1:3000");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Stripe-Signature, Paypal-Auth-Algo, Paypal-Cert-Url, Paypal-Transmission-Id, Paypal-Transmission-Sig, Paypal-Transmission-Time");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  next();
});
app.options("*", (_, res) => res.sendStatus(204));

app.post("/api/stripe-webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use(express.json());
app.post("/api/create-stripe-checkout", createStripeCheckout);
app.post("/api/create-stripe-portal", createStripePortal);
app.post("/api/create-paypal-subscription", createPaypalSubscription);
app.post("/api/paypal-webhook", paypalWebhook);

app.listen(port, () => {
  console.log(`AXS billing dev server ready at http://127.0.0.1:${port}`);
  console.log("Set VITE_BILLING_API_URL=http://127.0.0.1:4242 for local Vite checkout calls.");
});
