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
const addCard = async (req, res) => {
  const {
    customer_id,
    card_name,
    card_EXP_YEAR,
    card_EXP_MONTH,
    card_number,
    card_CVC,
  } = req.body;
  console.log("body", req.body);
  if (
    !customer_id ||
    !card_name ||
    !card_EXP_MONTH ||
    !card_EXP_YEAR ||
    !card_number ||
    !card_CVC
  ) {
    return res
      .status(statusCodes.CONFLICT)
      .json({ message: "all fields are required!!" });
  }
  try {
    const card_token = await stripe.tokens.create({
      card: {
        customer: customer_id,
        name: card_name,
        number: card_number,
        exp_year: card_EXP_YEAR,
        exp_month: card_EXP_MONTH,
        cvc: card_CVC,
      },
    });
    const card = await stripe.customers.createSource({
      customer: customer_id,
      source: `${card_token.id}`,
    });
    return res
      .status(statusCodes.OK)
      .json({ message: "Card added successfully!", card: card });
  } catch (error) {
    console.log("an error occurred in addCard controller code", error);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

const createPayment = async (req, res) => {};

module.exports = {
  addCard,
  addCustomer,
  createPayment,
};
