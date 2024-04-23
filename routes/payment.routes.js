const express = require("express");
const {
  addCustomer,
  addCard,
  createPayment,
} = require("../Controllers/payment.controller");
const paymentRoutes = express.Router();

paymentRoutes.post("/add-customer", addCustomer);
paymentRoutes.post("/add-card", addCard);
paymentRoutes.post("/create-charge", createPayment);

module.exports = paymentRoutes;
