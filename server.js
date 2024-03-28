import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import envConfig from "./src/config/envConfig.js";
import userRoutes from "./src/routes/routes.js";
import stripePackage from "stripe";

const app = express();
const port = envConfig.PORT;
const stripe = stripePackage(envConfig.SECRET_KEY);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(cors({ origin: "*", methods: "GET, POST, PUT, DELETE" }));

app.use("/", userRoutes);

app.post(
  "/webhooks",
  express.raw({ type: "application/json" }),
  (request, response) => {
    let session = "";
    const payload = request.body;
    const sig = request.headers["stripe-signature"];
    const endpointSecret = envConfig.WEB_HOOK;

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        sig,
        endpointSecret
      );
      // Handle the event
      switch (event.type) {
        case "checkout.session.async_payment_failed":
          session = event.data.object;
          break;
        case "checkout.session.completed":
          session = event.data.object;
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      return response.send();
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  }
);
app.listen(port, () => {
  console.log(`Server is running... 🚀`);
});
