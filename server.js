import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import envConfig from "./src/config/envConfig.js";
import userRoutes from "./src/routes/routes.js";
import stripePackage from "stripe";

const app = express();
const port = envConfig.PORT;
const stripe = stripePackage(envConfig.SECRET_KEY);
const endpointSecret = "whsec_DczDhixKHy9cVhqCpOEL4n5QBPaszYvD";

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(cors({ origin: "*", methods: "GET, POST, PUT, DELETE" }));

app.use("/", userRoutes);

app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  handleStripeWebhook(req, res);
});

const handleStripeWebhook = async (req, res) => {
  console.log("Received webhook request:", req.body);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    console.log("Enter the try block ==> ");
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("Received webhook event:", event);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  switch (event.type) {
    case "payment_method.attached":
      const paymentMethodAttached = event.data.object;
      console.log("PaymentIntent attached ==>", paymentMethodAttached);
      break;
    case "payment_method.card_automatically_updated":
      const paymentMethodCardAutomaticallyUpdated = event.data.object;
      console.log(
        "PaymentMethod method updated ==>",
        paymentMethodCardAutomaticallyUpdated
      );
      break;
    case "payment_method.detached":
      const paymentMethodDetached = event.data.object;
      console.log("Payment detached ==>", paymentMethodDetached);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  response.send();
};

app.listen(port, () => {
  console.log(`Server is running... 🚀`);
});
