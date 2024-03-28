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
