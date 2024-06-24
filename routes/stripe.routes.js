const express = require("express");
const { createAccount, payoutStripe, createStripeCustomer, addCardToCustomer, cardsListing } = require("../Controllers/stripe.controller");
const stripeRoutes = express.Router();

stripeRoutes.post("/account", createAccount);
stripeRoutes.post("/payout", payoutStripe);
stripeRoutes.post("/add-customer", createStripeCustomer);
stripeRoutes.post("/add-card/:customerId", addCardToCustomer);
stripeRoutes.get("/cards/:customerId", cardsListing)
module.exports = stripeRoutes