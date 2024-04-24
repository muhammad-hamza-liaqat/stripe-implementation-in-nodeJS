const express = require("express");
const {
  addCustomer,
  addCard,
  createPayment,
  createPaymentIntent,
} = require("../Controllers/payment.controller");
const paymentRoutes = express.Router();

paymentRoutes.post("/add-customer", addCustomer);
paymentRoutes.post("/add-card", addCard);
paymentRoutes.post("/create-charge", createPayment);
paymentRoutes.post("/create-payment-intent", createPaymentIntent);

module.exports = paymentRoutes;
