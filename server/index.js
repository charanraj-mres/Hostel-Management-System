// server/index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Your frontend URL
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the build folder if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../build")));
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: "rzp_test_8aH00A2lwqJjW5",
  key_secret: "cNBKnOEVTLHUeB8ioeAbGNl7",
});

// API Routes
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount, // amount in the smallest currency unit (paise for INR)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    });

    res.status(200).json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res
      .status(500)
      .json({ error: "Error creating payment order", details: error.message });
  }
});

app.post("/api/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters",
      });
    }

    // Create a signature to verify the payment
    const generatedSignature = crypto
      .createHmac("sha256", "cNBKnOEVTLHUeB8ioeAbGNl7")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Verify signature
    if (generatedSignature === razorpay_signature) {
      // Payment is verified
      // Here you could update your database to mark the payment as verified
      return res.status(200).json({
        success: true,
        message: "Payment has been verified",
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid signature",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      error: "Error verifying payment",
      details: error.message,
    });
  }
});

// Get payment details
app.get("/api/payment/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    const payment = await razorpay.payments.fetch(paymentId);
    res.status(200).json(payment);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      error: "Error fetching payment details",
      details: error.message,
    });
  }
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Fallback route for SPA in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Razorpay API initialized with key: ${"rzp_test_8aH00A2lwqJjW5".substring(
      0,
      4
    )}...`
  );
  console.log(`Server environment: ${process.env.NODE_ENV || "development"}`);
});

// Error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});
