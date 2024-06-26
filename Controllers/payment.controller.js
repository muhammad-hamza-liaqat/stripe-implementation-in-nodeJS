const { application } = require("express");
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
//       .json({ message: "All fields are required!!" });
//   }
//   try {
//     const token = await stripe.tokens.create({
//       card: {
//         number: card_number,
//         // number: "4242424242424242",
//         exp_month: card_EXP_MONTH,
//         exp_year: card_EXP_YEAR,
//         cvc: card_CVC,
//       },
//     });

//     const card = await stripe.customers.createSource(customer_id, {
//       source: token.id,
//     });

//     return res
//       .status(statusCodes.OK)
//       .json({ message: "Card added successfully!", card: card });
//   } catch (error) {
//     console.log("An error occurred in addCard controller code", error);
//     return res.status(statusCodes.INTERNAL_SERVER_ERROR).json(error);
//   }
// };

const createPaymentIntent = async (req, res) => {
  const { amount, currency, name, email } = req.body;
  try {
    const customer = await stripe.customers.create({
      name: name,
      email: email,
    });
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2022-08-01" }
    );

    const paymentMethod = await stripe.paymentMethods.create({
      type: "card", // Set paymentMethodType to "card"
      card: {
        number: req.body.cardNumber,
        exp_month: req.body.expMonth,
        exp_year: req.body.expYear,
        cvc: req.body.cvc,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      // amount: amount * 100,
      amount: 1,
      currency: currency,
      customer: customer.id,
      payment_method: paymentMethod.id,
      confirmation_method: "manual",
      confirm: true,
      return_url: "https://example.com/checkout/success",
    });

    // console.log("PaymentIntent created:", paymentIntent.id);

    return res.status(statusCodes.StatusCodes.OK).json({
      clientSecret: paymentIntent.client_secret,
      customer_id: customer.id,
      ephemeralKey: ephemeralKey.secret,
    });
  } catch (error) {
    console.log("An error occurred at createPaymentIntent", error.code);
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.code || error });
  }
};

const productPage = async (req, res) => {
  res.render("page.pug");
};

const renderPaymentIntent = async (req, res) => {
  res.render("payment.pug");
};

// const checkoutSession = async (req, res) => {
// // wihtout custom object ecommerce
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card", "amazon_pay", "klarna", "us_bank_account"],
//       // payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: "node.js and express book",
//             },
//             unit_amount: 500 * 100,
//           },
//           quantity: 1,
//         },
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: "javascript t-shirt",
//             },
//             unit_amount: 20 * 100,
//           },
//           quantity: 2,
//         },
//       ],
//       mode: "payment",
//       success_url: `https://stripe-server.loca.lt/api/payment/complete?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: "https://stripe-server.loca.lt/api/payment/cancel",
//     });

//     // Redirect to Stripe Checkout page
//     return res.redirect(session.url);
//   } catch (error) {
//     console.error("Error creating checkout session:", error.message || error);
//     return res.status(500).json({ error: error.message || error });
//   }
// };

const checkoutSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "amazon_pay", "klarna", "us_bank_account"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "2D", // Or any relevant name
            },
            unit_amount: 500 * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://stripe-server.loca.lt/api/payment/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "https://stripe-server.loca.lt/api/payment/cancel",
      metadata: {
        lineItemsMetadata: JSON.stringify([
          {
            index: "0",
            chainID: "660a428a002938f126abfc83",
            nodeID: "660a428a002938f126abfc84",
          },
        ]),
      },
    });

    // Redirect to Stripe Checkout page
    return res.redirect(session.url);
  } catch (error) {
    console.error("Error creating checkout session:", error.message || error);
    return res.status(500).json({ error: error.message || error });
  }
};

const complete = async (req, res) => {
  try {
    const [session, lineItems] = await Promise.all([
      stripe.checkout.sessions.retrieve(req.query.session_id, {
        expand: ["payment_intent.payment_method"],
      }),
      stripe.checkout.sessions.listLineItems(req.query.session_id),
    ]);

    const customerDetails = session.customer_details;
    const email = customerDetails.email;

    if (!email) {
      throw new Error("Customer email not found in session");
    }

    let customer;
    const existingCustomers = await stripe.customers.list({ email: email });
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email,
        name: customerDetails.name,
      });
    }

    const customerId = customer.id;

    return res
      .status(statusCodes.OK)
      .json({ message: "Your payment was successful!", customerId });
  } catch (error) {
    console.error("Error completing payment:", error);
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const cancel = async (req, res) => {
  res.render("page.pug");
};

const webHookEvent = async (req, res) => {
  try {
    // console.log("Inside webhook handler...");

    const sig = req.headers["stripe-signature"];
    // const endpointSecret =
    //   process.env.endPointSecret || "whsec_ymriCxyZOQnCsZzmiz6iBMjQIjaJLwnZ";
    const endpointSecret = process.env.endpointSecret;
    // console.log("Signature:", sig);
    // console.log("Endpoint Secret:", endpointSecret);

    if (!sig || !endpointSecret) {
      console.error("Webhook Error: Signature or endpoint secret missing.");
      return res
        .status(400)
        .send("Webhook Error: Signature or endpoint secret missing.");
    }

    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    // console.log("Webhook event:", event);

    if (event.type === "checkout.session.completed") {
      console.log("Checkout session completed:", event.data.object);
    }

    res.status(200).end();
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// const transferFunds = async (req, res) => {
//   const { amount, destinationAccountId } = req.body;
//   if (!amount || !destinationAccountId) {
//     console.log("amount or destination missing!");
//     return res.status(400).json({ message: "amount or destination is required!" })
//   }
//   try {
//     const transfer = await stripe.transfers.create({
//       amount: amount * 100,
//       currency: "USD",
//       destination: destinationAccountId,
//     });
//     console.log("transfer is successfully made....", transfer);
//     return res.status(201).json({ message: "transfer is made", data: transfer });

//   } catch (error) {
//     console.error("an error occured: ", error);
//     return res.status(500).json({ message: error })
//   }
// };

const transferFunds = async (req, res) => {
  const { amount, destinationAccountId } = req.body;
  
  if (!amount || !destinationAccountId) {
    console.log("amount or destinationAccountId missing!");
    return res.status(400).json({ message: "amount or destinationAccountId is required!" });
  }

  try {
    const transfer = await stripe.transfers.create({
      amount: amount * 100, 
      currency: "USD",
      destination: destinationAccountId,
    });

    const balanceTransaction = await stripe.balanceTransactions.retrieve(transfer.balance_transaction);

    console.log("Transfer successfully made:", transfer);
    console.log("Balance transaction details:", balanceTransaction);

    const response = {
      message: "Transfer is made",
      data: {
        transfer: {
          id: transfer.id,
          amount: transfer.amount / 100, 
          currency: transfer.currency,
          destination: transfer.destination,
          created: transfer.created,
        },
        fees: {
          amount: balanceTransaction.fee / 100, 
          currency: balanceTransaction.currency,
          description: balanceTransaction.description,
        }
      }
    };

    return res.status(201).json(response);

  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
  // addCard,
  addCustomer,
  createPaymentIntent,
  renderPaymentIntent,
  checkoutSession,
  productPage,
  complete,
  cancel,
  webHookEvent,
  transferFunds,
};
