import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import envConfig from "./src/config/envConfig.js";
import userRoutes from "./src/routes/routes.js";
import stripePackage from "stripe";

const app = express();
const port = envConfig.PORT;
// const stripe = stripePackage(envConfig.SECRET_KEY);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(cors({ origin: "*", methods: "GET, POST, PUT, DELETE" }));

app.use("/", userRoutes);

// app.post(
//   "/webhooks",
//   express.raw({ type: "application/json" }),
//   (request, response) => {
//     let session = "";
//     const payload = request.body;
//     const sig = request.headers["stripe-signature"];
//     const endpointSecret = envConfig.WEB_HOOK;

//     try {
//       const event = stripe.webhooks.constructEvent(
//         payload,
//         sig,
//         endpointSecret
//       );
//       // Handle the event
//       switch (event.type) {
//         case "checkout.session.async_payment_failed":
//           session = event.data.object;
//           break;
//         case "checkout.session.completed":
//           session = event.data.object;
//           break;
//         default:
//           console.log(`Unhandled event type ${event.type}`);
//       }
//       return response.send();
//     } catch (err) {
//       response.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }
//   }
// );
let signingSecret = "whsec_ETGe17n8Dyx4eyjIBzfXbbBLHlwCHiWN";
const stripe = stripePackage(envConfig.SECRET_KEY);
app.post("/webhooks", async (req, res) => {
  let data;
  let eventType;
  let payload = req.body;
  if (signingSecret) {
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(payload, signature, signingSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    data = event.data;
    eventType = event.type;
  } else {
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === "checkout.session.completed") {
    console.log(`🔔  Payment received!`);
  }

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server is running... 🚀`);
});
