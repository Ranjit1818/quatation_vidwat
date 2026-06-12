const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  item_desc: { type: String, required: true },
  hsn_sac: { type: String, default: "" },
  tax: { type: Number, required: true },
  qty: { type: Number, required: true },
  rate_item: { type: Number, required: true },
});

const quotationSchema = new mongoose.Schema(
  {
    invoice_num: { type: String, required: true },
    bill_to: { type: String, required: true },
    ship_to: { type: String, default: "" },
    gst_num: { type: String, required: true },
    items: [itemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);
  