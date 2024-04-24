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
// const addCard = async (req, res) => {
//   const {
//     customer_id,
//     card_name,
//     card_EXP_YEAR,
//     card_EXP_MONTH,
//     card_number,
//     card_CVC,
//   } = req.body;
//   console.log("body", req.body);
//   if (
//     !customer_id ||
//     !card_name ||
//     !card_EXP_MONTH ||
//     !card_EXP_YEAR ||
//     !card_number ||
//     !card_CVC
//   ) {
//     return res
//       .status(statusCodes.CONFLICT)
//       .json({ message: "all fields are required!!" });
//   }
//   try {
//     const card_token = await stripe.tokens.create({
//       card: {
//         customer: customer_id,
//         name: card_name,
//         number: card_number,
//         exp_year: card_EXP_YEAR,
//         exp_month: card_EXP_MONTH,
//         cvc: card_CVC,
//       },
//     });
//     const card = await stripe.customers.createSource({
//       customer: customer_id,
//       source: `${card_token.id}`,
//     });
//     return res
//       .status(statusCodes.OK)
//       .json({ message: "Card added successfully!", card: card });
//   } catch (error) {
//     console.log("an error occurred in addCard controller code", error);
//     return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(error);
//   }
// };

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
      .json({ message: "All fields are required!!" });
  }
  try {
    const token = await stripe.tokens.create({
      card: {
        number: card_number,
        // number: "4242424242424242",
        exp_month: card_EXP_MONTH,
        exp_year: card_EXP_YEAR,
        cvc: card_CVC,
      },
    });

    const card = await stripe.customers.createSource(customer_id, {
      source: token.id,
    });

    return res
      .status(statusCodes.OK)
      .json({ message: "Card added successfully!", card: card });
  } catch (error) {
    console.log("An error occurred in addCard controller code", error);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

const createPayment = async (req, res) => {};

// const createPaymentIntent = async (req, res) => {
//   const { amount, currency } = req.body;
//   console.log("req.body", req.body);

//   try {
//     const customer = await stripe.customers.create();
//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: customer.id },
//       { apiVersion: "2022-08-01" }
//     );
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount,
//       currency: currency,
//       customer: customer.id,
//       // automatic_payment_methods: { enabled: true }
//       payment_method_types: ["card"]
//     });
//     console.log("client_secret", paymentIntent.client_secret);
//     return res
//       .status(statusCodes.StatusCodes.OK)
//       .json({ clientSecret: paymentIntent.client_secret, customer_id: customer.id,ephemeralKey: ephemeralKey.secret});
//   } catch (error) {
//     console.log("an error occurred at createPaymentIntent", error);
//     return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(error);
//   }
// };

const createPaymentIntent = async (req, res) => {
  const { amount, currency, paymentMethodType } = req.body;
  console.log("req.body", req.body);

  try {
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2022-08-01" }
    );

    const paymentMethod = await stripe.paymentMethods.create({
      type: paymentMethodType,
      card: {
        number: req.body.cardNumber,
        exp_month: req.body.expMonth,
        exp_year: req.body.expYear,
        cvc: req.body.cvc
      }
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customer.id,
      payment_method: paymentMethod.id,
      confirmation_method: "manual", 
      confirm: true, 
      return_url: "https://example.com/checkout/success" 
    });

    console.log("PaymentIntent created:", paymentIntent.id);

    return res.status(statusCodes.StatusCodes.OK).json({
      clientSecret: paymentIntent.client_secret,
      customer_id: customer.id,
      ephemeralKey: ephemeralKey.secret
    });
  } catch (error) {
    console.log("An error occurred at createPaymentIntent", error);
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};





module.exports = {
  addCard,
  addCustomer,
  createPayment,
  createPaymentIntent,
};
