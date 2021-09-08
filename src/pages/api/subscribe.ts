import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";

import { stripe } from "@services/stripe";
import { fauna } from "@services/fauna";
import { query } from "faunadb";

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

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

  const user = await fauna.query<User>(
    query.Get(
      query.Match(
        query.Index("user_by_email"),
        query.Casefold(String(session.user.email))
      )
    )
  );

  let customerId = user.data.stripe_customer_id;
  if (!customerId) {
    const stripeCostumer = await stripe.customers.create({
      email: String(session.user.email),
    });

    await fauna.query(
      query.Update(query.Ref(query.Collection("users", user.ref.id)), {
        data: {
          stripe_costumer_id: stripeCostumer.id,
        },
      })
    );

    customerId = stripeCostumer.id;
  }

  const stripeCheckoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
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
