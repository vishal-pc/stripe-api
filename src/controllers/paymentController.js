import stripePackage from "stripe";
import envConfig from "../config/envConfig.js";

const stripe = stripePackage(envConfig.SECRET_KEY);
const endpointSecret = envConfig.WEB_HOOK;

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
  console.log("Received webhook request:", req.body);
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("PaymentIntent was successful!", paymentIntent);
      break;
    case "payment_method.attached":
      const paymentMethod = event.data.object;
      console.log("PaymentMethod was attached to a Customer!", paymentMethod);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return res.json({ received: true });
};
