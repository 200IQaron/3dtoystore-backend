import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Your Stripe secret key

app.use(cors());
app.use(express.json());

// Products catalog
const products = [
  { id: 1, name: "Key Holder", price: 150 },
  { id: 2, name: "Pen Holder", price: 350 },
  { id: 3, name: "Desk Organizer", price: 350 },
  { id: 4, name: "Phone Stand", price: 250 },
  { id: 5, name: "Cable Clips", price: 150 },
  { id: 6, name: "Clip to desk Head Stand", price: 450 },
  { id: 7, name: "Pocket Copter", price: 200 }
];

// Create Stripe Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body;

    const line_items = items.map(item => {
      const product = products.find(p => p.id === item.id);
      return {
        price_data: {
          currency: "eur",
          product_data: { name: product.name },
          unit_amount: product.price
        },
        quantity: 1
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "https://your-frontend-site.com/success.html",
      cancel_url: "https://your-frontend-site.com/cancel.html"
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
