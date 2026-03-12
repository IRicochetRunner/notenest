import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;

  if (event.type === "checkout.session.completed") {
    const userId = session.metadata?.userId;
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    if (userId) {
      await supabase.from("profiles").update({
        is_pro: true,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
      }).eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const customerId = session.customer;
    await supabase.from("profiles")
      .update({ is_pro: false, stripe_subscription_id: null })
      .eq("stripe_customer_id", customerId);
  }

  if (event.type === "customer.subscription.updated") {
    const customerId = session.customer;
    const isActive = ["active", "trialing"].includes(session.status);
    await supabase.from("profiles")
      .update({ is_pro: isActive })
      .eq("stripe_customer_id", customerId);
  }

  res.status(200).json({ received: true });
}