import express from "express";
import {
  createStripeProduct,
  getProductById,
  getProducts,
} from "../controllers/stripeController.js";
import { createPayment } from "../controllers/paymentController.js";

const router = express.Router();

//Frontend routes
router.get("/payment", (req, res) => {
  res.render("index");
});
router.get("/success", (req, res) => {
  res.render("success");
});
router.get("/cancel", (req, res) => {
  res.render("cancel");
});

//Product routes
router.post("/product", createStripeProduct);
router.get("/product/:productId", getProductById);
router.get("/product", getProducts);

//Payment routes
router.post("/payment", createPayment);

export default router;
