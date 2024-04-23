const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser")

// middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// server
app.listen(process.env.PORT, () => {
  console.log(`server running on port ${process.env.PORT}`);
});
