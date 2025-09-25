// index.js
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to create checkout session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const items = req.body.items; // array of items from frontend

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // price in cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'https://200iqaron.github.io/3d-store/success-file/success.html',
      cancel_url: 'https://200iqaron.github.io/3d-store/',
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 500, currency: 'eur' }, // example: €5 shipping
            display_name: 'Posti Standard',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1000, currency: 'eur' }, // example: €10 shipping
            display_name: 'Posti Express',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 2 },
            },
          },
        },
      ],
    });

    res.json({ url: session.url });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
