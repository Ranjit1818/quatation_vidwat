// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const quotationRoutes = require("./routes/quotationRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", quotationRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("Vidwat Quotation API is running...");
});

// Start server (only if not in Vercel production)
if (process.env.NODE_ENV !== "production") {
  connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  });
}

// Required for Vercel Serverless Functions
module.exports = app;
