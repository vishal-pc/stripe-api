import stripePackage from "stripe";
import envConfig from "../config/envConfig.js";

const stripe = stripePackage(envConfig.SECRET_KEY);

export const createPayment = async (req, res) => {
  try {
    const { priceId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: envConfig.SUCCESS_URL,
      cancel_url: envConfig.FAILURE_URL,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create product" });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, envConfig.WEB_HOOK);
  } catch (err) {
    console.error(err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      console.log("Payment succeeded:", event.data.object);
      break;
    case "payment_intent.payment_failed":
      console.log("Payment failed:", event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
