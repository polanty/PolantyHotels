// utils/stripe.js
import Stripe from "stripe";

//loading environment variables
import dotenv from "dotenv";
dotenv.config({ quiet: true });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;
