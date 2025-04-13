import { config } from "dotenv";
config();

// Paypal
//export const PAYPAL_API_CLIENT = process.env.PAYPAL_API_CLIENT;
//export const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET;
export const PAYPAL_API_CLIENT = process.env.PAYPAL_API_CLIENT;
export const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET;
export const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // url sandbox or live for your app
