const express = require("express");
const app = require("express");
const { homeGet } = require("../Controllers/home.controller");
const homeRoutes = express.Router();

homeRoutes.get("/", homeGet)

module.exports = homeRoutes