const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path")

// middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// template engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// routes
const homeRoutes = require("./routes/home.routes");
const paymentRoutes = require("./routes/payment.routes");
app.use("/", homeRoutes);
app.use("/api/payment", paymentRoutes);

// server
app.listen(process.env.PORT, () => {
  console.log(`server running on port ${process.env.PORT}`);
});
