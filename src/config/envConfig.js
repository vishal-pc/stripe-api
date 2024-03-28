import * as dotenv from "dotenv";
dotenv.config();

const envConfig = {
  PORT: process.env.PORT,
  SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
  WEB_HOOK: process.env.STRIPE_WEB_HOOK_SECRET_KEY,
  SUCCESS_URL: process.env.SUCCESS_URL,
  FAILURE_URL: process.env.FALURE_URL,
};

export default envConfig;
