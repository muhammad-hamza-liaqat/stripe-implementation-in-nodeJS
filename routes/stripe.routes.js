const express = require("express");
const { createAccount, payoutStripe } = require("../Controllers/stripe.controller");
const stripeRoutes = express.Router();

stripeRoutes.post("/account", createAccount);
stripeRoutes.post("/payout", payoutStripe);
module.exports = stripeRoutes