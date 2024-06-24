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
    const { email, paymentMethods, ...data } = req.body;

    try {
        const customer = await stripe.customers.create({
            email: email,
            ...data
        });

        for (const paymentMethodId of paymentMethods) {
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customer.id,
            });
        }

        if (paymentMethods.length > 0) {
            await stripe.customers.update(customer.id, {
                invoice_settings: {
                    default_payment_method: paymentMethods[0],
                }
            });
        }

        return res.status(201).json({ statusCode: 201, message: "Customer created successfully!", data: customer });

    } catch (error) {
        console.error("An error occurred: ", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



module.exports = { createAccount, payoutStripe, createStripeCustomer };
