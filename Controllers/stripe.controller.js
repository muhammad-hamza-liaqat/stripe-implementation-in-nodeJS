const stripe = require("stripe")(process.env.secret_key)

// this code will generate user connected account and generate the link to fill all the other required information
// const createAccount = async (req, res) => {
//     try {
//         console.log("secretKey",process.env.secret_key)
//         const account = await stripe.accounts.create({
//             type: "custom",
//             capabilities: {
//                 card_payments: { requested: true },
//                 transfers: { requested: true }
//             }
//         });
//         console.log("account ", account);

//         const accountLink = await stripe.accountLinks.create({
//             account: account.id,
//             refresh_url: 'https://google.com/',
//             return_url: 'https://yahoo.com/',
//             type: "account_onboarding",
//         });

//         return res.status(200).json({ accountID: account.id, url: accountLink.url });
//     } catch (error) {
//         console.error("an error occurred", error.message);
//         return res.status(500).json({ message: "internal server error", error: error.message });
//     }
// }


const createAccount = async (req, res) => {
    // this code will create the connected account and fill all the required information static.
    try {
        const user = {
            firstName: "Muhammad",
            lastName: "Hamza",
            email: "m.hamza1782@gmail.com",
            country: "US",
            stripeAccountId: null,
            ip: "127.0.0.1",
            prefill: true,
            type: "individual"
        }

        if (user.type !== 'individual') {
            return res.status(400).send({ error: 'User type must be individual' });
        }

        let accountId = user.stripeAccountId;
        const shouldPrefill = user.prefill;

        if (!accountId) {
            let bankAccount;
            if (shouldPrefill) {
                bankAccount = await stripe.tokens.create({
                    bank_account: {
                        country: 'US',
                        currency: 'usd',
                        account_holder_name: `${user.firstName} ${user.lastName}`,
                        account_holder_type: 'individual',
                        routing_number: '110000000',
                        account_number: '000123456789',
                    },
                });
            }

            const accountParams = {
                type: 'express',
                country: user.country || 'US',
                email: user.email || undefined,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: 'individual',
                individual: {
                    first_name: user.firstName || undefined,
                    last_name: user.lastName || undefined,
                    email: user.email || undefined,
                    ...(shouldPrefill ? {
                        id_number: '000000000',
                        address: {
                            line1: 'address_full_match',
                            city: 'South San Francisco',
                            country: 'US',
                            state: 'CA',
                            postal_code: '94080',
                        },
                        dob: {
                            day: 1,
                            month: 1,
                            year: 1901,
                        },
                        phone: '8888675309',
                        ssn_last_4: '0000',
                    } : {}),
                },
                ...(bankAccount ? { external_account: bankAccount.id } : {}),
            };

            const account = await stripe.accounts.create(accountParams);
            accountId = account.id;
            user.stripeAccountId = accountId;

            console.log("user after creation -------------------------------------->", user);

        }

        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: 'https://google.com/',
            return_url: 'https://main.d3gzu5jixwdx96.amplifyapp.com/',
            type: 'account_onboarding',
        });

        return res.status(200).json({ accountId, url: accountLink.url });
    } catch (error) {
        console.error(`Failed to create a Stripe account: ${error}`);
        res.status(500).send({ message: "internal server error", error: error.message });
    }
}


const payoutStripe = async (req, res) => {
    try {
        const { amount, accountId } = req.body;

        if (!amount || !accountId) {
            console.log("Missing required fields: amount or accountId");
            return res.status(400).json({ message: "Missing required fields: amount or accountId" });
        }

        if (typeof amount !== 'number' || amount <= 0) {
            console.log("Invalid amount!");
            return res.status(400).json({ message: "Invalid amount!" });
        }

        const payout = await stripe.payouts.create({
            amount: amount * 100,
            currency: "USD"
        }, {
            stripeAccount: accountId
        });

        console.log("Payout created successfully...", payout);

        const response = {
            payoutId: payout.id,
            amount: payout.amount / 100,
            status: payout.status,
            arrival_date: payout.arrival_date,
            method: payout.method
        };

        return res.status(201).json({ message: "Payout created", data: response });

    } catch (error) {
        console.error("Error:", error);
        if (error.code === 'payouts_not_allowed') {
            return res.status(400).json({ message: "Payouts are not allowed for this account. Please contact Stripe support for assistance." });
        }
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const createStripeCustomer = async (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) {
        return res.status(400).json({ message: "all fields are required" })
    }
    try {
        const customer = await stripe.customers.create({
            email: email,
            name: name
        });
        res.status(201).json({ message: "customer created", data: customer })
    } catch (err) {
        console.error('Error creating customer:', err);
        return res.status(500).json({ message: "internal server error", error: err.message })
    }
};


const addCardToCustomer = async (req, res) => {
    const { card } = req.body;
    const customerId = req.params.customerId;

    try {
        if (!card) {
            return res.status(400).json({ message: "Card information is required" });
        }

        const token = await stripe.tokens.create({
            card: {
                number: card.number,
                exp_month: card.exp_month,
                exp_year: card.exp_year,
                cvc: card.cvc,
                name: card.name || null,
            }
        });

        const customer = await stripe.customers.retrieve(customerId, {
            expand: ['sources']
        });

        const isDefault = customer.sources.data.length === 0;

        const cardSource = await stripe.customers.createSource(
            customerId,
            { source: token.id }
        );

        if (isDefault) {
            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: cardSource.id
                }
            });
        }

        const updatedCustomer = await stripe.customers.retrieve(customerId, {
            expand: ['sources']
        });

        const defaultSourceId = updatedCustomer.default_source;
        const cards = updatedCustomer.sources.data.map(source => ({
            ...source,
            isDefault: source.id === defaultSourceId
        }));

        return res.status(201).json({ message: "Card added successfully!", data: cards });
    } catch (error) {
        console.error("An error occurred:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};




const cardsListing = async (req, res) => {
    const { customerId } = req.params;
    if (!customerId) {
        return res.status(400).json({ message: "customerId not found in params! required!" });
    }

    try {
        const customer = await stripe.customers.retrieve(customerId, {
            expand: ['sources']
        });

        const defaultSourceId = customer.default_source;
        const cards = customer.sources.data
            .filter(source => source.object === "card")
            .map(card => ({
                ...card,
                isDefault: card.id === defaultSourceId
            }));

        return res.status(200).json({
            message: "All cards fetched",
            data: cards
        });
    } catch (error) {
        console.error("An error occurred while retrieving customer cards: ", error);

        return res.status(500).json({
            message: "internal server error",
            error: error.message
        });
    }
};



const makeDefaultCard = async (req, res) => {
    const { customerId, cardId } = req.params;
    if (!customerId || !cardId) {
        return res.status(400).json({ message: "customerId and cardId are required!" });
    }

    try {
        await stripe.customers.update(customerId, {
            default_source: cardId
        });

        const updatedCustomer = await stripe.customers.retrieve(customerId, {
            expand: ['sources']
        });

        const defaultSourceId = updatedCustomer.default_source;
        const cards = updatedCustomer.sources.data
            .filter(source => source.object === "card")
            .map(card => ({
                ...card,
                isDefault: card.id === defaultSourceId
            }));

        return res.status(200).json({
            message: "Default card updated",
            data: cards
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update default card' });
    }
};




const makePayment = async (req, res) => {
    const customerId = req.params.customerId;

    try {
        const customer = await stripe.customers.retrieve(customerId);
        console.log('Retrieved customer:', customer);

        const amount = 10 * 100;
        const currency = 'usd';

        let paymentIntent;

        if (customer.invoice_settings && customer.invoice_settings.default_payment_method) {
            console.log('Default payment method:', customer.invoice_settings.default_payment_method);

            try {
                paymentIntent = await stripe.paymentIntents.create({
                    amount,
                    currency,
                    customer: customerId,
                    payment_method: customer.invoice_settings.default_payment_method,
                    off_session: true,
                    confirm: true,
                });

                if (paymentIntent.status === 'succeeded') {
                    return res.status(200).json({ message: 'Payment successful!', paymentIntent });
                }
            } catch (error) {
                console.error('Default payment method failed:', error.message);
                return res.status(500).json({ message: "internal server error", error: error.message })
            }
        }

        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });

        for (const paymentMethod of paymentMethods.data) {
            try {
                paymentIntent = await stripe.paymentIntents.create({
                    amount,
                    currency,
                    customer: customerId,
                    payment_method: paymentMethod.id,
                    off_session: true,
                    confirm: true,
                });

                if (paymentIntent.status === 'succeeded') {
                    return res.status(200).json({ message: 'Payment successful', paymentIntent });
                }
            } catch (error) {
                console.error('Alternate payment method failed:', paymentMethod.id, error.message);
            }
        }

        return res.status(400).json({ message: 'Payment failed with all cards.' });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};


// const paymentIntentWithoutCardSaving = async (req, res) => {
//     const { amount, currency, number, exp_month, exp_year, cvc } = req.body;

//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: amount * 100,
//             currency: currency,
//             payment_method_types: ['card'],
//             payment_method_data: {
//                 type: 'card',
//                 card: {
//                     number: number,
//                     exp_month: exp_month,
//                     exp_year: exp_year,
//                     cvc: cvc,
//                 },
//             },
//         });

//         console.log("PaymentIntent created:", paymentIntent);
//         return res.status(201).json({ message: "Payment recorded successfully", data: paymentIntent });
//     } catch (error) {
//         console.error("An error occurred:", error);
//         return res.status(500).json({ message: "Internal server error", error: error.message });
//     }
// };


const paymentIntentWithoutCardSaving = async (req, res) => {
    const { amount, currency, number, exp_month, exp_year, cvc } = req.body;
  
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, 
        currency: currency,
        payment_method_types: ['card'],
        payment_method_data: {
          type: 'card',
          card: {
            number: number,
            exp_month: exp_month,
            exp_year: exp_year,
            cvc: cvc,
          },
        },
      });
  
      console.log("PaymentIntent created:", paymentIntent);
  
      if (paymentIntent.status === 'requires_confirmation') {
        const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id);
  
        return res.status(200).json({ message: 'Payment Intent confirmed', paymentIntent: confirmedIntent });
      } else {
        return res.status(200).json({ message: 'Payment recorded successfully', data: paymentIntent });
      }
  
    } catch (error) {
      console.error("An error occurred:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  


module.exports = { createAccount, payoutStripe, createStripeCustomer, addCardToCustomer, cardsListing, makeDefaultCard, makePayment, paymentIntentWithoutCardSaving };
