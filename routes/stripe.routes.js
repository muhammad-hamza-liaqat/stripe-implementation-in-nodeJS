const express = require("express");
const { createAccount } = require("../Controllers/stripe.controller");
const stripeRoutes = express.Router();

stripeRoutes.post("/account", createAccount)

module.exports = stripeRoutes