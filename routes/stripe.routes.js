const express = require("express");
const { createAccount, payoutStripe, createStripeCustomer } = require("../Controllers/stripe.controller");
const stripeRoutes = express.Router();

stripeRoutes.post("/account", createAccount);
stripeRoutes.post("/payout", payoutStripe);
stripeRoutes.post("/add-customer", createStripeCustomer);
module.exports = stripeRoutes