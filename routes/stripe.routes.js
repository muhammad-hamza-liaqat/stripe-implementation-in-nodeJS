const express = require("express");
const { createAccount, payoutStripe, createStripeCustomer, addCardToCustomer } = require("../Controllers/stripe.controller");
const stripeRoutes = express.Router();

stripeRoutes.post("/account", createAccount);
stripeRoutes.post("/payout", payoutStripe);
stripeRoutes.post("/add-customer", createStripeCustomer);
stripeRoutes.post("/add-card/:customerId", addCardToCustomer)
module.exports = stripeRoutes