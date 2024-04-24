const express = require("express");
const stripe = require("stripe")(process.env.secret_key);

const {
  addCustomer,
  addCard,
  createPayment,
  createPaymentIntent,
  renderPaymentIntent
} = require("../Controllers/payment.controller");
const paymentRoutes = express.Router();

paymentRoutes.post("/add-customer", addCustomer);
paymentRoutes.post("/add-card", addCard);
paymentRoutes.post("/create-charge", createPayment);
paymentRoutes.post("/create-payment-intent", createPaymentIntent);
paymentRoutes.get("/create-payment-intent", renderPaymentIntent);

module.exports = paymentRoutes;
