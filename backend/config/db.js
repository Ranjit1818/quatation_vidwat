const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/vidwat_quotation"
    );
    isConnected = db.connections[0].readyState === 1;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};

module.exports = connectDB;
