import Stripe from "stripe";
import envConfig from "../config/envConfig.js";

const stripe = new Stripe(envConfig.SECRET_KEY);

export const createStripeProduct = async (req, res) => {
  try {
    const product = await stripe.products.create({
      name: req.body.name,
      description: req.body.description,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: req.body.default_price_data.unit_amount,
      currency: "usd",
      recurring: {
        interval: "day",
      },
    });

    return res.status(200).json({ message: "Product created", product, price });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create product" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const products = await stripe.products.list({ limit: 10 });
    const product = products.data.find((item) => item.id === productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res
      .status(200)
      .json({ message: "Successfully get the product", product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to get products" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await stripe.products.list({ limit: 10 });

    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          limit: 1,
        });
        return { ...product, price: prices.data[0]?.id };
      })
    );
    return res.status(200).json({
      message: "Successfully get the products",
      products: productsWithPrices,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to get products" });
  }
};
