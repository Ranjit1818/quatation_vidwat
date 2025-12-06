// server.js
const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors());

// Number → words (Indian format)
function numberToWordsIndian(num) {
  const belowTwenty = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const convertTwoDigits = (n) => {
    if (n < 20) return belowTwenty[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + belowTwenty[n % 10] : "");
  };

  const convertThreeDigits = (n) => {
    let word = "";
    if (Math.floor(n / 100) > 0) {
      word += belowTwenty[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 0) word += convertTwoDigits(n);
    return word.trim();
  };

  if (num === 0) return "Zero";

  let result = "";
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  if (crore) result += convertThreeDigits(crore) + " Crore ";
  if (lakh) result += convertThreeDigits(lakh) + " Lakh ";
  if (thousand) result += convertThreeDigits(thousand) + " Thousand ";
  if (hundred) result += convertThreeDigits(hundred);

  return result.trim();
}

// ============ MAIN ENDPOINT ============

app.post("/api/generate-invoice", (req, res) => {
  const { invoice_num, bill_to, ship_to, gst_num, items } = req.body;

  // Basic validation
  if (
    !invoice_num ||
    !bill_to ||
    !ship_to ||
    !gst_num ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Missing or invalid required fields" });
  }

  for (const item of items) {
    if (
      !item.item_desc ||
      isNaN(Number(item.qty)) ||
      isNaN(Number(item.rate_item)) ||
      isNaN(Number(item.tax))
    ) {
      return res
        .status(400)
        .json({ error: "Invalid item data: ensure all fields are correct" });
    }
  }

  const totalAmount = items.reduce((sum, item) => {
    const qty = Number(item.qty);
    const rate = Number(item.rate_item);
    return sum + qty * rate;
  }, 0);

  const amountInWords =
    numberToWordsIndian(Math.round(totalAmount)) + " Rupees Only";

  // Create PDF
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

  // Heading at top, center
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("QUOTATION", margin + 30, 30, {
      // +10 pushes right, 40 moves up
      width: contentWidth - 20, // keep centered visually
      align: "center",
    });

  // Left side: company name + address
  let addrY = 60;

  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("VIDWAT ASSOCIATES", margin, addrY);
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

  // Right side: Quotation No & Date (moved more right + slightly down)
  const infoBlockWidth = 220; // Wider block
  const infoX = pageWidth - margin - 150; // Moves more RIGHT
  let infoY = 62;

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Quotation No:", infoX, infoY, { continued: false });
  doc.font("Helvetica").text(String(invoice_num || ""), infoX + 80, infoY);

  infoY += 14;

  doc
    .font("Helvetica-Bold")
    .text("Quotation Date:", infoX, infoY, { continued: false });
  doc
    .font("Helvetica")
    .text(new Date().toLocaleDateString("en-GB"), infoX + 80, infoY);

  const infoBottomY = infoY + 10;

  // Separator line under header block
  const headerBottomY = Math.max(addressBottomY, infoBottomY) + 10;
  doc
    .moveTo(margin, headerBottomY)
    .lineTo(pageWidth - margin, headerBottomY)
    .stroke();

  // ========= BILL TO / SHIP TO BOX =========

  const billShipY = headerBottomY + 15;
  const boxWidth = pageWidth - 2 * margin;
  const boxHeight = 90;
  const columnWidth = boxWidth / 2;

  doc.rect(margin, billShipY - 10, boxWidth, boxHeight).stroke();
  doc
    .moveTo(margin + columnWidth, billShipY - 10)
    .lineTo(margin + columnWidth, billShipY - 10 + boxHeight)
    .stroke();

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Bill To:", margin + 10, billShipY);
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(bill_to || "N/A", margin + 20, billShipY + 15)
    .text("Karnataka,", margin + 20, billShipY + 30)
    .text(gst_num || "", margin + 20, billShipY + 45);

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Ship To:", margin + columnWidth + 10, billShipY);
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(ship_to || "N/A", margin + columnWidth + 20, billShipY + 15)
    .text("Karnataka,", margin + columnWidth + 20, billShipY + 30)
    .text(gst_num || "", margin + columnWidth + 20, billShipY + 45);

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

  // Table Header
  let tableStartY = billShipY + boxHeight + 20;
  tableStartY = drawRow(
    ["SL", "ITEM DESCRIPTION", "RATE/ITEM", "QUANTITY", "AMOUNT"],
    tableStartY,
    true
  );

  // Table rows
  items.forEach((item, index) => {
    const qty = Number(item.qty);
    const rate = Number(item.rate_item);
    const amount = (qty * rate).toFixed(2);
    tableStartY = drawRow(
      [
        `${index + 1}`,
        `${item.item_desc}`,
        `${rate.toFixed(2)}`,
        `${qty}`,
        `${amount}`,
      ],
      tableStartY
    );
  });

  tableStartY += 20;

  // ========= SUMMARY =========

  const thirdTableColWidths = [200, pageWidth - margin * 2 - 200];

  doc.rect(margin, tableStartY, thirdTableColWidths[0], rowHeight).stroke();
  doc
    .font("Helvetica-Bold")
    .text("Amount Payable", margin + 5, tableStartY + 5);
  doc
    .rect(
      margin + thirdTableColWidths[0],
      tableStartY,
      thirdTableColWidths[1],
      rowHeight
    )
    .stroke();
  doc.text(
    totalAmount.toFixed(2),
    margin + thirdTableColWidths[0] + 5,
    tableStartY + 5
  );

  tableStartY += rowHeight;

  doc.rect(margin, tableStartY, thirdTableColWidths[0], rowHeight).stroke();
  doc.text("In Words", margin + 5, tableStartY + 5);
  doc
    .rect(
      margin + thirdTableColWidths[0],
      tableStartY,
      thirdTableColWidths[1],
      rowHeight
    )
    .stroke();
  doc.text(
    amountInWords,
    margin + thirdTableColWidths[0] + 5,
    tableStartY + 5,
    {
      width: thirdTableColWidths[1] - 10,
    }
  );

  // ========= FOOTER =========

  const footerY = 500;
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Terms and Conditions:", margin, footerY + 96)
    .font("Helvetica")
    .text(
      "1. All payments should be made electronically in the name of Vidwat Associates.",
      margin,
      footerY + 112
    )
    .text(
      "2. All disputes shall be subjected to jurisdiction of Vijayapur.",
      margin,
      footerY + 127
    )
    .text(
      "3. This invoice is subjected to the terms and conditions mentioned in the agreement or work order.",
      margin,
      footerY + 142
    );

  const signImagePath = path.join(__dirname, "assets", "vidwat_sign.png");
  if (fs.existsSync(signImagePath)) {
    doc.image(signImagePath, pageWidth - margin - 150, footerY + 200, {
      width: 100,
      height: 50,
    });
  }

  doc.end();
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
