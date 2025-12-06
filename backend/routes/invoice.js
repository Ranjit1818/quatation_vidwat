const express = require("express");
const { generateInvoicePDF } = require("../controllers/invoiceController");
const router = express.Router();

router.post("/generate-invoice", async (req, res) => {
  try {
    const invoiceData = req.body;
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    console.log("isBuffer:", Buffer.isBuffer(pdfBuffer));
    console.log("type:", typeof pdfBuffer);
    if (pdfBuffer) {
      console.log("length:", pdfBuffer.length);
    } else {
      console.log("pdfBuffer is null/undefined");
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice_${invoiceData.invoice_num}.pdf`,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    res.status(500).send("Failed to generate invoice");
  }
});

module.exports = router;
