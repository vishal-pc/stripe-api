import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import envConfig from "./src/config/envConfig.js";
import userRoutes from "./src/routes/routes.js";
import Stripe from "stripe";

const app = express();
const port = envConfig.PORT;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(cors({ origin: "*", methods: "GET, POST, PUT, DELETE" }));

app.use("/", userRoutes);

const endpointSecret = envConfig.WEB_HOOK;
const stripe = new Stripe(envConfig.SECRET_KEY);

app.post(
  "/webhooks",
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

      res.json({ received: true });
    } catch (err) {
      console.error("Error processing Stripe webhook:", err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running... 🚀`);
});
