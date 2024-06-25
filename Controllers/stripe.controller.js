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


// const addCardToCustomer = async (req, res) => {
//     const { card } = req.body;
//     const customerId = req.params.customerId

//     try {
//         if (!card || !customerId) {
//             return res.status(400).json({ message: "Card information and customerId are required" });
//         }

//         const cards = Array.isArray(card) ? card : [card];

//         const addedCards = [];
//         for (const cardDetails of cards) {
//             const token = await stripe.tokens.create({
//                 card: {
//                     number: cardDetails.number,
//                     exp_month: cardDetails.exp_month,
//                     exp_year: cardDetails.exp_year,
//                     cvc: cardDetails.cvc
//                 }
//             });

//             const cardSource = await stripe.customers.createSource(
//                 customerId,
//                 { source: token.id }
//             );

//             addedCards.push(cardSource);
//         }

//         return res.status(201).json({ message: "Cards added successfully!", data: addedCards });
//     } catch (error) {
//         console.error("An error occurred:", error);
//         return res.status(500).json({ message: "Internal server error", error: error.message });
//     }
// };


const addCardToCustomer = async (req, res) => {
    const { card } = req.body;
    const customerId = req.params.customerId;

    try {
        if (!card || !customerId) {
            return res.status(400).json({ message: "Card information and customerId are required" });
        }

        const cards = Array.isArray(card) ? card : [card];

        const addedCards = [];
        let defaultCardId;

        for (const cardDetails of cards) {
            const token = await stripe.tokens.create({
                card: {
                    number: cardDetails.number,
                    exp_month: cardDetails.exp_month,
                    exp_year: cardDetails.exp_year,
                    cvc: cardDetails.cvc
                }
            });

            const cardSource = await stripe.customers.createSource(
                customerId,
                { source: token.id }
            );

            addedCards.push(cardSource);

            if (cardDetails.default) {
                console.log("card default")
                defaultCardId = cardSource.id;
            }
        }

        if (defaultCardId) {
            console.log("default 2")
            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: defaultCardId
                }
            });
        }

        return res.status(201).json({ message: "Card added successfully!", data: cardSource });
    } catch (error) {
        console.error("An error occurred:", error);
        return res.status(500).json({ message: "internal server error", error: error.message })
    }
}

const cardsListing = async (req, res) => {
    const customerId = req.params.customerId;
    if (!customerId) {
        return res.status(400).json({ message: "customerId not found in params! required!" });
    }
    try {
        const customers = await stripe.customers.retrieve(customerId, {
            expand: ['sources']
        })
        const cards = customers.sources.data.filter(source => source.object === "card")
        return res.status(200).json({ message: " all cards fetched", data: cards })

    } catch (error) {
        console.log("an error occured: ", error);
        return res.status(500).json({ message: "internal server error", error: error.message })
    }
}

const makeDefaultCard = async (req, res) => {
    const customerId = req.params.customerId;
    const cardId = req.params.cardId;
    if (!customerId || !cardId) {
        return res.status(400).json({ message: "customerId, cardId are required!" })
    }
    try {


        const customer = await stripe.customers.retrieve(customerId);

        await stripe.customers.update(customerId, {
            default_source: cardId
        });

        const updatedCustomer = await stripe.customers.retrieve(customerId);

        return res.status(200).json({
            message: "Default card updated",
            data: updatedCustomer
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update default card' });
    }
}


const makePayment = async (req, res) => {
    const customerId = req.params.customerId;

    try {
        const customer = await stripe.customers.retrieve(customerId);
        console.log('Retrieved customer:', customer);

        if (customer.invoice_settings && customer.invoice_settings.default_payment_method) {
            console.log('Default payment method:', customer.invoice_settings.default_payment_method);

            const paymentIntent = await stripe.paymentIntents.create({
                amount: 10 * 100,
                currency: 'usd',
                customer: customerId,
                payment_method: customer.invoice_settings.default_payment_method,
                off_session: true,
                confirm: true,
            });

            if (paymentIntent.status === 'succeeded') {
                res.status(200).json({ message: 'Payment successful!', paymentIntent });
            } else {
                for (const card of customer.sources.data) {
                    const altPaymentIntent = await stripe.paymentIntents.create({
                        amount: 10 * 100,
                        currency: 'usd',
                        customer: customerId,
                        payment_method: card.id,
                        off_session: true,
                        confirm: true,
                    });

                    if (altPaymentIntent.status === 'succeeded') {
                        return res.status(200).json({ message: 'Payment successful with alternate card!', paymentIntent: altPaymentIntent });
                    }
                }

                return res.status(400).json({ message: 'Payment failed with all cards.' });
            }
        } else {
            console.log('No default payment method found for customer:', customerId);
            return res.status(400).json({ message: 'No default payment method found.' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error', error: error.message });
    }
}



module.exports = { createAccount, payoutStripe, createStripeCustomer, addCardToCustomer, cardsListing, makeDefaultCard, makePayment };
