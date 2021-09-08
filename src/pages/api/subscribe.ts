import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";

import { stripe } from "@services/stripe";

export default async function Subscribe(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const stripeCostumer = await stripe.customers.create({
    email: String(session.user.email),
  });

  const stripeCheckoutSession = await stripe.checkout.sessions.create({
    customer: stripeCostumer.id,
    payment_method_types: ["card"],
    billing_address_collection: "required",
    line_items: [
      {
        price: "price_1JW3inEaAVsrQeqgifAubhQP",
        quantity: 1,
      },
    ],
    mode: "subscription",
    allow_promotion_codes: true,
    success_url: String(process.env.STRIPE_SUCCESS_URL),
    cancel_url: String(process.env.STRIPE_CANCEL_URL),
  });

  return res.status(200).json({ sessionId: stripeCheckoutSession.id });
}
