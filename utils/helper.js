const listCustomerCards = async (customerId) => {
    try {
        const cards = await stripe.customers.listSources(customerId, {
            object: 'card',
            limit: 100
        });

        return cards.data;
    } catch (error) {
        console.error("Error retrieving customer cards:", error);
        return resizeBy.status(500).json({ message: "internal server error", error: error.message })
    }
};

module.exports ={
    listCustomerCards
}