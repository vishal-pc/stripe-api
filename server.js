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
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const signingSecret = envConfig.WEB_HOOK;
    const payload = req.body;
    const signature = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, signingSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // console.log("Event type ==>", event.type);
    // console.log("Event data ==>", event.data.object);
    // console.log("Event id ==>", event.data.object.id);
    return res.json({ success: true });
  }
);
app.listen(port, () => {
  console.log(`Server is running... 🚀`);
});
