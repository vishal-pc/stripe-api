import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import envConfig from "./src/config/envConfig.js";
import userRoutes from "./src/routes/routes.js";
import webhookRoutes from "./src/routes/webhook.routes.js";

const app = express();
const port = envConfig.PORT;

app.use("/api", webhookRoutes);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(cors({ origin: "*", methods: "GET, POST, PUT, DELETE" }));

app.use("/", userRoutes);

app.get("/", (req, res) => {
  res.send("Web Hook Server");
});

app.listen(port, () => {
  console.log(`Server is running... 🚀`);
});
