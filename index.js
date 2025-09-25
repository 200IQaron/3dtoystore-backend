const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

const shippingRates = {
  FI: 250,
  SE: 350,
  DE: 400,
  DEFAULT: 500
};

app.post("/create-checkout-session", async (req, res) => {
  const { items, shippingCountry } = req.body;

  const line_items = items.map(item => ({
    price_data: {
      currency: "eur",
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: 1,
  }));

  const shippingFee = shippingRates[shippingCountry] || shippingRates.DEFAULT;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingFee, currency: "eur" },
            display_name: `Shipping (${(shippingFee/100).toFixed(2)}€)`,
          },
        },
      ],
      success_url: "https://YOUR_FRONTEND_URL_HERE/success.html",
      cancel_url: "https://YOUR_FRONTEND_URL_HERE",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Checkout session creation failed" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
