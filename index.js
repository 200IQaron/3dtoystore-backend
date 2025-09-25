import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ make sure Railway has STRIPE_SECRET_KEY set correctly
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Products mapping
const storeItems = new Map([
  [1, { priceInCents: 150, name: "Key Holder" }],
  [2, { priceInCents: 350, name: "Pen Holder" }],
  [3, { priceInCents: 350, name: "Desk Organizer" }],
  [4, { priceInCents: 250, name: "Phone Stand" }],
  [5, { priceInCents: 150, name: "Cable Clips" }],
  [6, { priceInCents: 450, name: "Clip to Desk Head Stand" }],
  [7, { priceInCents: 200, name: "Pocket Copter" }],
  [8, { priceInCents: 150, name: "BMW Keychain" }],
  [9, { priceInCents: 350, name: "SD & Micro SD Holder" }],
  [10, { priceInCents: 500, name: "Lehtisaari Keychain" }]
]);

// ✅ Checkout session route
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map(item => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "eur",
            product_data: { name: storeItem.name },
            unit_amount: storeItem.priceInCents,
          },
          quantity: 1,
        };
      }),
      success_url: "https://your-frontend-url.com/success",
      cancel_url: "https://your-frontend-url.com/cancel",
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
