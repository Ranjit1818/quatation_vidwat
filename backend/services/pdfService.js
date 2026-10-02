const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generates a PDF buffer using pdfkit.
 * Fully dynamic layout — content flows across pages automatically.
 *
 * @param {Object} data - The invoice data
 * @param {Object} res - Express response object (to pipe the PDF)
 * @returns {Promise} - Resolves when PDF generation is finished
 */
const generateInvoicePDF = (data, res) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        invoice_num, bill_to, shipToSafe, gst_num, items,
        totalAmount, gstPercent, gstAmount, grandTotal,
        amountInWords, terms_conditions, createdAt
      } = data;

      const doc = new PDFDocument({ 
        margins: { top: 50, bottom: 0, left: 50, right: 50 } 
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice_${invoice_num}.pdf`
      );

      doc.pipe(res);

      // ── Page constants ──
      const pageWidth = 595;
      const pageHeight = 842;
      const margin = 50;
      const contentWidth = pageWidth - 2 * margin;
      const bottomLimit = pageHeight - 60; // stop drawing 60px from bottom

      // ── Single flowing cursor ──
      let Y = margin;

      /**
       * Ensure there is enough room for `needed` px on the current page.
       * If not, add a new page and reset Y to the top margin.
       */
      const ensureSpace = (needed) => {
        if (Y + needed > bottomLimit) {
          doc.addPage({ margins: { top: 50, bottom: 0, left: 50, right: 50 } });
          Y = margin;
        }
      };

      // =========================================================
      //  HEADER
      // =========================================================
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("QUOTATION", margin + 30, 30, {
          width: contentWidth - 20,
          align: "center",
        });

      Y = 60;
      doc.fontSize(18).font("Helvetica-Bold").text("VIDWAT ASSOCIATES", margin, Y);
      Y += 20;
      doc.fontSize(10).font("Helvetica");
      const addressLines = [
        "#33, Arvind Nagar",
        "Near Veer Savarkar Circle",
        "Vijayapur 586101, Karnataka, India",
        "PAN: AAZFV2824J",
        "GST: 29AAZFV2824J1ZB",
        "Email: vidwatassociates@gmail.com",
        "Phone: 7892787054",
      ];
      addressLines.forEach((line) => {
        doc.text(line, margin, Y);
        Y += 13;
      });
      Y += 2;

      const addressBottomY = Y;

      // Right-side quotation info
      const infoX = pageWidth - margin - 150;
      let infoY = 62;
      doc.fontSize(10).font("Helvetica-Bold").text("Quotation No:", infoX, infoY);
      doc.font("Helvetica").text(String(invoice_num || ""), infoX + 80, infoY);
      infoY += 14;
      doc.font("Helvetica-Bold").text("Quotation Date:", infoX, infoY);
      const displayDate = createdAt
        ? new Date(createdAt).toLocaleDateString("en-GB")
        : new Date().toLocaleDateString("en-GB");
      doc.font("Helvetica").text(displayDate, infoX + 80, infoY);

      const headerBottomY = Math.max(addressBottomY, infoY + 10) + 10;
      doc.moveTo(margin, headerBottomY).lineTo(pageWidth - margin, headerBottomY).stroke();

      // =========================================================
      //  BILL TO BOX
      // =========================================================
      const billShipY = headerBottomY + 15;
      const boxHeight = 90;

      doc.rect(margin, billShipY - 10, contentWidth, boxHeight).stroke();
      doc.fontSize(12).font("Helvetica-Bold").text("To:", margin + 10, billShipY);
      doc.fontSize(10).font("Helvetica")
        .text(bill_to || "N/A", margin + 20, billShipY + 15)
        .text("Karnataka,", margin + 20, billShipY + 30)
        .text(gst_num || "", margin + 20, billShipY + 45);

      Y = billShipY + boxHeight + 20;

      // =========================================================
      //  ITEMS TABLE
      // =========================================================
      const colWidths = [40, 160, 100, 100, 100];

      /** Measure the height a row needs (without drawing). */
      const measureRow = (cols, bold) => {
        doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10);
        const heights = cols.map((c, i) =>
          doc.heightOfString(c, { width: colWidths[i] - 10 })
        );
        return Math.max(...heights) + 10;
      };

      /** Draw a table row at current Y, return height consumed. */
      const drawRow = (cols, bold) => {
        const h = measureRow(cols, bold);
        let x = margin;
        doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10);
        cols.forEach((c, i) => {
          doc.rect(x, Y, colWidths[i], h).stroke();
          doc.text(c, x + 5, Y + 5, { width: colWidths[i] - 10 });
          x += colWidths[i];
        });
        Y += h;
      };

      // Table header
      const headerCols = ["SL", "ITEM DESCRIPTION", "RATE/ITEM", "QUANTITY", "AMOUNT"];
      ensureSpace(measureRow(headerCols, true));
      drawRow(headerCols, true);

      // Item rows
      items.forEach((item, idx) => {
        const qty = Number(item.qty);
        const rate = Number(item.rate_item);
        const amount = (qty * rate).toFixed(2);
        const cols = [
          `${idx + 1}`,
          `${item.item_desc}`,
          `${rate.toFixed(2)}`,
          `${qty}`,
          `${amount}`,
        ];
        ensureSpace(measureRow(cols, false));
        drawRow(cols, false);
      });

      Y += 20;

      // =========================================================
      //  SUMMARY ROWS
      // =========================================================
      const sumLabelW = 200;
      const sumValueW = contentWidth - sumLabelW;
      const rowH = 25;

      const drawSummaryRow = (label, value, valueBold = false) => {
        ensureSpace(rowH);
        // label cell
        doc.rect(margin, Y, sumLabelW, rowH).stroke();
        doc.font("Helvetica-Bold").fontSize(10).text(label, margin + 5, Y + 5);
        // value cell
        doc.rect(margin + sumLabelW, Y, sumValueW, rowH).stroke();
        doc.font(valueBold ? "Helvetica-Bold" : "Helvetica").fontSize(10);
        doc.text(value, margin + sumLabelW + 5, Y + 5, { width: sumValueW - 10 });
        Y += rowH;
      };

      drawSummaryRow("Subtotal", totalAmount.toFixed(2));
      drawSummaryRow(`GST (${gstPercent}%)`, gstAmount.toFixed(2));
      drawSummaryRow("Grand Total (Incl. GST)", grandTotal.toFixed(2), true);
      drawSummaryRow("In Words", amountInWords);

      // =========================================================
      //  BANK DETAILS  (fully dynamic, line-by-line)
      // =========================================================
      Y += 15;

      const bankLines = [
        { label: "Bank Details:", value: "VIDWAT ASSOCIATES", labelBold: true },
        { label: "", value: "Karnataka Bank" },
        { label: "A/c No:", value: "0935202400004001" },
        { label: "IFSC:", value: "KARB0000935" },
      ];

      const lineH = 16;
      const bankBlockH = bankLines.length * lineH;
      ensureSpace(bankBlockH);

      bankLines.forEach((bLine) => {
        ensureSpace(lineH);
        doc.fontSize(11);
        if (bLine.labelBold) {
          doc.font("Helvetica-Bold").text(bLine.label, margin, Y);
          doc.font("Helvetica").text(bLine.value, margin + 80, Y);
        } else if (bLine.label) {
          doc.font("Helvetica-Bold").text(bLine.label, margin + 80, Y);
          doc.font("Helvetica").text(bLine.value, margin + 80 + doc.widthOfString(bLine.label + " "), Y);
        } else {
          doc.font("Helvetica").text(bLine.value, margin + 80, Y);
        }
        Y += lineH;
      });

      // =========================================================
      //  TERMS AND CONDITIONS  (dynamic, line-by-line)
      // =========================================================
      Y += 20;
      ensureSpace(30);
      doc.fontSize(10).font("Helvetica-Bold").text("Terms and Conditions:", margin, Y);
      Y += 16;

      const termsLines = (terms_conditions && terms_conditions.trim() !== "")
        ? terms_conditions.split("\n").filter((l) => l.trim() !== "")
        : [
            "1. All payments should be made electronically in the name of Vidwat Associates.",
            "2. All disputes shall be subjected to jurisdiction of Vijayapur.",
            "3. This invoice is subjected to the terms and conditions mentioned in the agreement or work order.",
          ];

      doc.font("Helvetica").fontSize(10);
      termsLines.forEach((line) => {
        const h = doc.heightOfString(line.trim(), { width: contentWidth }) + 4;
        ensureSpace(h);
        doc.text(line.trim(), margin, Y, { width: contentWidth });
        Y += h;
      });

      // =========================================================
      //  SIGNATURE
      // =========================================================
      try {
        const signImagePath = path.join(__dirname, "..", "assets", "vidwat_sign.png");
        if (fs.existsSync(signImagePath)) {
          Y += 20;
          ensureSpace(60);
          doc.image(signImagePath, pageWidth - margin - 150, Y, {
            width: 100,
            height: 50,
          });
          Y += 55;
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
