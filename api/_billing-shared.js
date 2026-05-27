const STRIPE_API = "https://api.stripe.com/v1";
const PAYPAL_APIS = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
};

export const billingPlans = {
  creator: {
    id: "creator",
    label: "Creator",
    stripePriceEnv: "STRIPE_PRICE_CREATOR",
    paypalPlanEnv: "PAYPAL_PLAN_CREATOR",
  },
  studio: {
    id: "studio",
    label: "Studio",
    stripePriceEnv: "STRIPE_PRICE_STUDIO",
    paypalPlanEnv: "PAYPAL_PLAN_STUDIO",
  },
  empire: {
    id: "empire",
    label: "Empire",
    stripePriceEnv: "STRIPE_PRICE_EMPIRE",
    paypalPlanEnv: "PAYPAL_PLAN_EMPIRE",
  },
};

export function getPlan(planId) {
  const plan = billingPlans[planId];
  if (!plan) throw httpError(400, `Unknown billing plan: ${planId}`);
  return plan;
}

export function normalizeEmail(email) {
  if (email === undefined || email === null || email === "") return undefined;
  if (typeof email !== "string") throw httpError(400, "Email must be a string");

  const value = email.trim();
  if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw httpError(400, "Invalid email address");
  }
  return value;
}

export function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function getAppUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  return `${proto}://${host}`;
}

export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw httpError(400, "Invalid JSON request body");
  }
}

export async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);

  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export function handleApiError(res, error) {
  const status = error.status || 500;
  sendJson(res, status, {
    error: error.message || "Unexpected billing error",
  });
}

export async function stripeRequest(path, form) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw httpError(500, "Missing STRIPE_SECRET_KEY");

  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(form)) {
    if (value !== undefined && value !== null && value !== "") body.append(key, String(value));
  }

  const response = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await response.json();
  if (!response.ok) throw httpError(response.status, data.error?.message || "Stripe request failed");
  return data;
}

export async function paypalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw httpError(500, "Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");

  const env = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
  const response = await fetch(`${PAYPAL_APIS[env]}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  if (!response.ok) throw httpError(response.status, data.error_description || "PayPal auth failed");
  return { token: data.access_token, baseUrl: PAYPAL_APIS[env] };
}
