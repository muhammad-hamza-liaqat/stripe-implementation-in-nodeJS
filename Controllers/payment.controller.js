const statusCodes = require("http-status-codes");
const stripe = require("stripe")(process.env.secret_key);

const addCustomer = async (req, res) => {
  const { name, email, phone, address } = req.body;
  console.log("req.body", req.body);
  if (!name) {
    return res
      .status(statusCodes.CONFLICT)
      .json({ message: "name is required!" });
  }
  if (!email) {
    return res
      .status(statusCodes.CONFLICT)
      .json({ message: "email is required!" });
  }
  if (!phone) {
    return res
      .status(statusCodes.CONFLICT)
      .json({ message: "name is required!" });
  }

  try {
    const customer = await stripe.customers.create({
      name,
      email,
      phone,
    });
    console.log("customer Data=>", customer);
    return res
      .status(statusCodes.OK)
      .json({ message: "customer added succesfully", newCustomer: customer });
  } catch (error) {
    console.log("error at addCustomer", error);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};
const addCard = async (req, res) => {};
const createPayment = async (req, res) => {};

module.exports = {
  addCard,
  addCustomer,
  createPayment,
};
