import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import envConfig from "./src/config/envConfig.js";
import userRoutes from "./src/routes/routes.js";
import stripePackage from "stripe";

const app = express();
const port = envConfig.PORT;
const stripe = stripePackage(envConfig.SECRET_KEY);
// const endpointSecret =
//   "whsec_bd1b77afa3459ff996cb4e872a05eaba0b8781099825aec385939d201f279e7e";

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(cors({ origin: "*", methods: "GET, POST, PUT, DELETE" }));

app.use("/", userRoutes);

// app.post(
//   "/webhook",
//   bodyParser.raw({ type: "application/json" }),
//   (req, res) => {
//     handleStripeWebhook(req, res);
//   }
// );

// const handleStripeWebhook = async (req, res) => {
//   console.log("Received webhook request:", req.body);
//   const sig = req.headers["stripe-signature"];

//   let event;

//   try {
//     console.log("Enter the try block ==> ");
//     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     console.log("Received webhook event:", event);
//   } catch (err) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }
//   switch (event.type) {
//     case "payment_method.attached":
//       const paymentMethodAttached = event.data.object;
//       console.log("PaymentIntent attached ==>", paymentMethodAttached);
//       break;
//     case "payment_method.card_automatically_updated":
//       const paymentMethodCardAutomaticallyUpdated = event.data.object;
//       console.log(
//         "PaymentMethod method updated ==>",
//         paymentMethodCardAutomaticallyUpdated
//       );
//       break;
//     case "payment_method.detached":
//       const paymentMethodDetached = event.data.object;
//       console.log("Payment detached ==>", paymentMethodDetached);
//       break;
//     default:
//       console.log(`Unhandled event type: ${event.type}`);
//   }

//   response.send();
// };

app.post(
  "/webhooks",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    let signingSecret = "whsec_DczDhixKHy9cVhqCpOEL4n5QBPaszYvD";
    const payload = req.body;
    const signature = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, signingSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log("Event type ==>", event.type);
    console.log("Event data ==>", event.data.object);
    console.log("Event id ==>", event.data.object.id);
    res.json({ success: true });
  }
);
app.listen(port, () => {
  console.log(`Server is running... 🚀`);
});
