const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");

// middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
const homeRoutes = require("./routes/home.routes");
const paymentRoutes = require("./routes/payment.routes");
app.use("/", homeRoutes);
app.use("/api/payment", paymentRoutes);

// server
app.listen(process.env.PORT, () => {
  console.log(`server running on port ${process.env.PORT}`);
});
