const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { logger, logRequestDuration } = require("./utils/logger");

// Middleware setup
app.use(express.json()); 
app.use(bodyParser.raw({ type: 'application/json' })); 
app.use(cors()); 
app.use(logRequestDuration); 

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

const homeRoutes = require("./routes/home.routes");
const paymentRoutes = require("./routes/payment.routes");
const stripeRoutes = require("./routes/stripe.routes");

app.use("/", homeRoutes); 
app.use("/api/payment", paymentRoutes); 
app.use("/api/stripe", stripeRoutes); 

 
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}/`);
});
