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
### command to make local tunnel for secure web request i-e (https)
**npx localtunnel --port 3000 --subdomain stripe-server**


<!-- {
    "message": "Payment successful with alternate card!",
    "paymentIntent": {
        "id": "pi_3PVWHwGi1bsyWjui0sd21Iw7",
        "object": "payment_intent",
        "amount": 1000,
        "amount_capturable": 0,
        "amount_details": {
            "tip": {}
        },
        "amount_received": 1000,
        "application": null,
        "application_fee_amount": null,
        "automatic_payment_methods": {
            "allow_redirects": "always",
            "enabled": true
        },
        "canceled_at": null,
        "cancellation_reason": null,
        "capture_method": "automatic_async",
        "client_secret": "pi_3PVWHwGi1bsyWjui0sd21Iw7_secret_mHt6qc3EhZ0zP0zf4leAlaLrE",
        "confirmation_method": "automatic",
        "created": 1719310068,
        "currency": "usd",
        "customer": "cus_QMEgwVnOjqwfqF",
        "description": null,
        "invoice": null,
        "last_payment_error": null,
        "latest_charge": "ch_3PVWHwGi1bsyWjui0tg8auRz",
        "livemode": false,
        "metadata": {},
        "next_action": null,
        "on_behalf_of": null,
        "payment_method": "card_1PVWDcGi1bsyWjuiIWrvSxi6",
        "payment_method_configuration_details": {
            "id": "pmc_1MlTwmGi1bsyWjuig2gj37cR",
            "parent": null
        },
        "payment_method_options": {
            "card": {
                "installments": null,
                "mandate_options": null,
                "network": null,
                "request_three_d_secure": "automatic"
            },
            "link": {
                "persistent_token": null
            }
        },
        "payment_method_types": [
            "card",
            "link"
        ],
        "processing": null,
        "receipt_email": null,
        "review": null,
        "setup_future_usage": null,
        "shipping": null,
        "source": null,
        "statement_descriptor": null,
        "statement_descriptor_suffix": null,
        "status": "succeeded",
        "transfer_data": null,
        "transfer_group": null
    }
} -->