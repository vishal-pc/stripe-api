import express from "express";
import bodyParser from "body-parser";
import envConfig from "../config/envConfig.js";
import Stripe from "stripe";

const router = express.Router();

const endpointSecret = envConfig.WEB_HOOK;
const stripe = new Stripe(envConfig.SECRET_KEY);
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    let session = "";
    const signature = req.headers["stripe-signature"];
    const payload = req.body;
    console.log("Receive sig ==>", signature);
    console.log("Receive payload ==>", payload);
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
      );
      console.log("Received Stripe webhook:", event);

      switch (event.type) {
        case "checkout.session.async_payment_failed":
          session = event.data.object;
          break;
        case "checkout.session.completed":
          session = event.data.object;
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.send();
    } catch (err) {
      console.error("Error processing Stripe webhook:", err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
