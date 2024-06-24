const express = require("express");
const { createAccount, payoutStripe, createStripeCustomer, addCardToCustomer, cardsListing, makeDefaultCard } = require("../Controllers/stripe.controller");
const stripeRoutes = express.Router();

stripeRoutes.post("/account", createAccount);
stripeRoutes.post("/payout", payoutStripe);
stripeRoutes.post("/add-customer", createStripeCustomer);
stripeRoutes.post("/add-card/:customerId", addCardToCustomer);
stripeRoutes.get("/cards/:customerId", cardsListing)
stripeRoutes.patch("/default-card/:customerId/:cardId", makeDefaultCard)
module.exports = stripeRoutes