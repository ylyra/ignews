import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";

import { stripe } from "@services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantsEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export default async function WebHooks(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method not allowed");
  }

  const buf = await buffer(req);
  const secret = req.headers["stripe-signature"];
  if (!secret) {
    return res.status(400).json({ error: true });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      secret,
      String(process.env.STRIPE_WEBHOOK_SECRET)
    );
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(400).send(`Webhook error ${e.message}`);
    }
    return res.status(400).send("Webhook error");
  }

  const { type } = event;
  if (relevantsEvents.has(type)) {
    try {
      switch (type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          const subscription = event.data.object as Stripe.Subscription;

          await saveSubscription(
            String(subscription.id),
            String(subscription.customer),
            type === "customer.subscription.created"
          );

          break;
        case "checkout.session.completed":
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          await saveSubscription(
            String(checkoutSession.subscription),
            String(checkoutSession.customer),
            true
          );
          break;

        default:
          throw new Error("Unhandled event.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.json({ error: "Webhook handler failed." });
      }
    }
  }

  return res.json({ received: true });
}
