const express = require("express");
const {
  addCustomer,
  // addCard,
  createPaymentIntent,
  renderPaymentIntent,
  checkoutSession,
  productPage,
  complete,
  cancel,
  webHookEvent,
  transferFunds,
} = require("../Controllers/payment.controller");
const paymentRoutes = express.Router();

paymentRoutes.post("/add-customer", addCustomer);
// paymentRoutes.post("/add-card", addCard);
paymentRoutes.post("/create-payment-intent", createPaymentIntent);
paymentRoutes.get("/create-payment-intent", renderPaymentIntent);
paymentRoutes.post("/checkout-session", checkoutSession);
paymentRoutes.get("/product", productPage);
paymentRoutes.get("/complete", complete);
paymentRoutes.get("/cancel", cancel);
paymentRoutes.post("/webhook", webHookEvent);
paymentRoutes.post("/transfer", transferFunds)
module.exports = paymentRoutes;
