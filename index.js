// index.js
const express = require("express");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  try {
    const items = req.body.items;

    const line_items = items.map(item => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // price in cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/index.html`,
      // Enable address collection
      shipping_address_collection: {
        allowed_countries: ["FI","SE","NO","DK","DE","FR","ES","IT","GB"]
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "eur" },
            display_name: "Free Shipping"
          }
        }
      ],
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred, please try again." });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
