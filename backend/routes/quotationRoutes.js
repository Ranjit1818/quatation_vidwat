const express = require("express");
const router = express.Router();
const {
  generateInvoice,
  getAllQuotations,
  deleteQuotation,
} = require("../controllers/quotationController");

// Quotation Routes
router.post("/generate-invoice", generateInvoice);
router.get("/quotations", getAllQuotations);
router.delete("/quotations/:id", deleteQuotation);

module.exports = router;
