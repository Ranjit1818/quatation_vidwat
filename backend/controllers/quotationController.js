const Quotation = require("../models/Quotation");
const { numberToWordsIndian } = require("../utils/formatters");
const { generateInvoicePDF } = require("../services/pdfService");
const connectDB = require("../config/db");

// Generate Invoice
const generateInvoice = async (req, res) => {
  try {
    await connectDB();
    const { invoice_num, bill_to, ship_to, gst_num, items, isRegenerate, createdAt } = req.body;

    // Basic validation
    if (!invoice_num || !bill_to || !gst_num || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    const shipToSafe = ship_to && ship_to.trim() !== "" ? ship_to : bill_to;

    for (const item of items) {
      if (!item.item_desc || isNaN(Number(item.qty)) || isNaN(Number(item.rate_item)) || isNaN(Number(item.tax))) {
        return res.status(400).json({ error: "Invalid item data: ensure all fields are correct" });
      }
    }

    const totalAmount = items.reduce((sum, item) => {
      const qty = Number(item.qty);
      const rate = Number(item.rate_item);
      return sum + qty * rate;
    }, 0);

    const amountInWords = numberToWordsIndian(Math.round(totalAmount)) + " Rupees Only";

    // Save to DB only if it's a new quotation
    if (!isRegenerate) {
      const newQuotation = new Quotation({
        invoice_num,
        bill_to,
        ship_to,
        gst_num,
        items,
      });
      await newQuotation.save();
    }

    // Generate PDF
    await generateInvoicePDF({
      invoice_num,
      bill_to,
      shipToSafe,
      gst_num,
      items,
      totalAmount,
      amountInWords,
      createdAt
    }, res);

  } catch (error) {
    console.error("Error generating invoice:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to generate invoice", details: error.message });
    }
  }
};

// Get All Quotations
const getAllQuotations = async (req, res) => {
  try {
    await connectDB();
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    console.error("Error fetching quotations:", error);
    res.status(500).json({ error: "Failed to fetch quotations", details: error.message });
  }
};

// Delete Quotation
const deleteQuotation = async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    await Quotation.findByIdAndDelete(id);
    res.json({ message: "Quotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    res.status(500).json({ error: "Failed to delete quotation", details: error.message });
  }
};

module.exports = {
  generateInvoice,
  getAllQuotations,
  deleteQuotation,
};
