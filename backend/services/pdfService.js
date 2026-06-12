const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generates a PDF buffer using pdfkit
 * @param {Object} data - The invoice data
 * @param {Object} res - Express response object (to pipe the PDF)
 * @returns {Promise} - Resolves when PDF generation is finished
 */
const generateInvoicePDF = (data, res) => {
  return new Promise((resolve, reject) => {
    try {
      const { invoice_num, bill_to, shipToSafe, gst_num, items, totalAmount, amountInWords, createdAt } = data;

      const doc = new PDFDocument({ margin: 50 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice_${invoice_num}.pdf`
      );

      doc.pipe(res);

      const pageWidth = 595;
      const margin = 50;
      const rowHeight = 25;
      const contentWidth = pageWidth - 2 * margin;

      // ========= HEADER =========
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("QUOTATION", margin + 30, 30, {
          width: contentWidth - 20,
          align: "center",
        });

      let addrY = 60;
      doc.fontSize(18).font("Helvetica-Bold").text("VIDWAT ASSOCIATES", margin, addrY);
      addrY += 18;
      doc.fontSize(10).font("Helvetica").text("#33, Arvind Nagar", margin, addrY);
      addrY += 13;
      doc.text("Near Veer Savarkar Circle", margin, addrY);
      addrY += 13;
      doc.text("Vijayapur 586101, Karnataka, India", margin, addrY);
      addrY += 13;
      doc.text("PAN: AAZFV2824J", margin, addrY);
      addrY += 13;
      doc.text("GST: 29AAZFV2824J1ZB", margin, addrY);
      addrY += 13;
      doc.text("Email: vidwatassociates@gmail.com", margin, addrY);
      addrY += 13;
      doc.text("Phone: 7892787054", margin, addrY);
      addrY += 10;

      const addressBottomY = addrY;

      const infoX = pageWidth - margin - 150;
      let infoY = 62;

      doc.fontSize(10).font("Helvetica-Bold").text("Quotation No:", infoX, infoY);
      doc.font("Helvetica").text(String(invoice_num || ""), infoX + 80, infoY);
      infoY += 14;

      doc.font("Helvetica-Bold").text("Quotation Date:", infoX, infoY);
      const displayDate = createdAt ? new Date(createdAt).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB");
      doc.font("Helvetica").text(displayDate, infoX + 80, infoY);

      const infoBottomY = infoY + 10;
      const headerBottomY = Math.max(addressBottomY, infoBottomY) + 10;
      doc.moveTo(margin, headerBottomY).lineTo(pageWidth - margin, headerBottomY).stroke();

      // ========= BILL TO BOX =========
      const billShipY = headerBottomY + 15;
      const boxWidth = pageWidth - 2 * margin;
      const boxHeight = 90;

      doc.rect(margin, billShipY - 10, boxWidth, boxHeight).stroke();

      doc.fontSize(12).font("Helvetica-Bold").text("To:", margin + 10, billShipY);
      doc.fontSize(10).font("Helvetica")
        .text(bill_to || "N/A", margin + 20, billShipY + 15)
        .text("Karnataka,", margin + 20, billShipY + 30)
        .text(gst_num || "", margin + 20, billShipY + 45);

      // ========= ITEMS TABLE =========
      const colWidths = [40, 160, 100, 100, 100];
      const drawRow = (columns, y, bold = false) => {
        let x = margin;
        if (bold) doc.font("Helvetica-Bold");
        else doc.font("Helvetica");

        const colHeights = columns.map((col, i) =>
          doc.heightOfString(col, { width: colWidths[i] - 10 })
        );
        const rowHeightDynamic = Math.max(...colHeights) + 10;

        columns.forEach((col, i) => {
          doc.rect(x, y, colWidths[i], rowHeightDynamic).stroke();
          doc.text(col, x + 5, y + 5, { width: colWidths[i] - 10 });
          x += colWidths[i];
        });
        return y + rowHeightDynamic;
      };

      let tableStartY = billShipY + boxHeight + 20;
      tableStartY = drawRow(["SL", "ITEM DESCRIPTION", "RATE/ITEM", "QUANTITY", "AMOUNT"], tableStartY, true);

      items.forEach((item, index) => {
        const qty = Number(item.qty);
        const rate = Number(item.rate_item);
        const amount = (qty * rate).toFixed(2);
        tableStartY = drawRow([`${index + 1}`, `${item.item_desc}`, `${rate.toFixed(2)}`, `${qty}`, `${amount}`], tableStartY);
      });

      tableStartY += 20;

      // ========= SUMMARY =========
      const summaryColWidths = [200, pageWidth - margin * 2 - 200];
      doc.rect(margin, tableStartY, summaryColWidths[0], rowHeight).stroke();
      doc.font("Helvetica-Bold").text("Amount Payable", margin + 5, tableStartY + 5);
      doc.rect(margin + summaryColWidths[0], tableStartY, summaryColWidths[1], rowHeight).stroke();
      doc.text(totalAmount.toFixed(2), margin + summaryColWidths[0] + 5, tableStartY + 5);

      tableStartY += rowHeight;
      doc.rect(margin, tableStartY, summaryColWidths[0], rowHeight).stroke();
      doc.text("In Words", margin + 5, tableStartY + 5);
      doc.rect(margin + summaryColWidths[0], tableStartY, summaryColWidths[1], rowHeight).stroke();
      doc.text(amountInWords, margin + summaryColWidths[0] + 5, tableStartY + 5, { width: summaryColWidths[1] - 10 });

      // ========= BANK DETAILS =========
      let bankDetailsY = tableStartY + rowHeight + 20;
      doc.fontSize(11).font("Helvetica-Bold").text("Bank Details:", margin, bankDetailsY);

      const bankDetailsX = margin + 80;
      doc.fontSize(11).font("Helvetica").text("VIDWAT ASSOCIATES", bankDetailsX, bankDetailsY);
      doc.text("Karnataka Bank", bankDetailsX, bankDetailsY + 16);
      doc.text("A/c No: ", bankDetailsX, bankDetailsY + 32);
      doc.text("0935202400004001", bankDetailsX + 42, bankDetailsY + 32);
      doc.text("IFSC: ", bankDetailsX, bankDetailsY + 48);
      doc.text("KARB0000935", bankDetailsX + 42, bankDetailsY + 48);

      // ========= FOOTER =========
      const footerY = Math.max(500, bankDetailsY + 20);
      doc.fontSize(10).font("Helvetica-Bold").text("Terms and Conditions:", margin, footerY + 96)
        .font("Helvetica")
        .text("1. All payments should be made electronically in the name of Vidwat Associates.", margin, footerY + 112)
        .text("2. All disputes shall be subjected to jurisdiction of Vijayapur.", margin, footerY + 127)
        .text("3. This invoice is subjected to the terms and conditions mentioned in the agreement or work order.", margin, footerY + 142);

      try {
        const signImagePath = path.join(__dirname, "..", "assets", "vidwat_sign.png");
        if (fs.existsSync(signImagePath)) {
          doc.image(signImagePath, pageWidth - margin - 150, footerY + 200, { width: 100, height: 50 });
        }
      } catch (imgError) {
        console.error("Error loading signature image:", imgError.message);
      }

      doc.end();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePDF,
};
