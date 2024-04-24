<!-- end point -->
http://localhost:3000/api/payment/create-payment-intent (post)

json =>
{
    "name": "test user",
    "email": "test@test.com",
    "phone": "03002888260",
    "address": {
        "line1": "chowk azam",
        "city": "Faisalabad",
        "postal_code": "54203",
        "country": "PK"
    },
    "amount": 900,
    "currency": "usd",
    "paymentMethodType": "card",
    "cardNumber": "4242424242424242",
    "expMonth": 12,
    "expYear": 2025,
    "cvc": "123"
}