# Stripe Payment Integration

## Endpoints

### Checkout Session

**Endpoint:** `GET http://localhost:3000/api/payment/product`

**Description:** This endpoint allows you to redirect to the Stripe-hosted checkout page when accessed in the browser.

### Create Payment Intent

**Endpoint:** `POST /api/payment/create-payment-intent`

**Description:** Creates a payment intent for a given user and amount.

**Request Body:**

```json
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
```
