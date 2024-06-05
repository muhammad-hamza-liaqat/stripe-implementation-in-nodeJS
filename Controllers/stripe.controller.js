const stripe = require("stripe")(process.env.secret_key)

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



const fetchAndUpdateTerms = async (accountId, ipAddress) => {
    try {
        await stripe.accounts.update(accountId, {
            tos_acceptance: {
                date: Math.floor(Date.now() / 1000),
                ip: ipAddress,
            },
        });
        console.log("Terms and conditions acceptance updated successfully.");
    } catch (error) {
        console.error("Failed to update terms and conditions acceptance:", error.message);
        throw error;
    }
}

const createAccount = async (req, res) => {
    try {
        const acceptedTerms = true;

        console.log("secretKey", process.env.secret_key);
        const account = await stripe.accounts.create({
            type: "custom",
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true }
            }
        });
        console.log("account ", account);

        const userIpAddress = "127.0.0.1";

        await fetchAndUpdateTerms(account.id, userIpAddress);

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: 'https://google.com/',
            return_url: 'https://yahoo.com/',
            type: "account_onboarding",
        });

        return res.status(200).json({ accountID: account.id, url: accountLink.url });
    } catch (error) {
        console.error("an error occurred", error.message);
        return res.status(500).json({ message: "internal server error", error: error.message });
    }
}

module.exports = { createAccount };
