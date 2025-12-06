import React, { useState } from "react";
import axios from "axios";

const InvoiceForm = () => {
  const [formData, setFormData] = useState({
    invoice_num: "",
    bill_to: "",
    ship_to: "",
    gst_num: "",
    items: [
      {
        item_desc: "",
        hsn_sac: "",
        tax: "",
        qty: "",
        rate_item: "",
      },
    ],
  });

  const handleChange = (e, index = null, field = null) => {
    if (index !== null && field !== null) {
      const updatedItems = [...formData.items];
      updatedItems[index][field] = e.target.value;
      setFormData({ ...formData, items: updatedItems });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { item_desc: "", hsn_sac: "", tax: "", qty: "", rate_item: "" },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://quatation-vidwat-lkfs.vercel.app/api/generate-invoice",
        formData,
        {
          responseType: "blob", // for PDF download
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `quotation_${formData.invoice_num || "invoice"}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating invoice: ", error);
      alert("Error generating quotation. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Top Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400" />

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Make sure logo is in /public and path is correct */}
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-md">
              VA
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-white tracking-wide">
                VIDWAT ASSOCIATES
              </h1>
              <p className="text-sm text-slate-300">
                Quotation &amp; Invoice Generator
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center text-sm text-slate-200">
            <p className="font-medium">#33, Arvind Nagar</p>
            <p>Near Veer Savarkar Circle</p>
            <p>Vijayapur 586101, Karnataka</p>
            <p className="mt-1 text-xs">
              GST: <span className="font-medium">29AAZFV2824J1ZB</span>
            </p>
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* Card Body */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 mt-4 space-y-6"
          >
            {/* Invoice & Client Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">
                  Quotation Details
                </h2>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Quotation Number
                  </label>
                  <input
                    type="text"
                    name="invoice_num"
                    value={formData.invoice_num}
                    onChange={handleChange}
                    placeholder="e.g. QTN-2025-001"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800/80 text-slate-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    GST Number (Client)
                  </label>
                  <input
                    type="text"
                    name="gst_num"
                    value={formData.gst_num}
                    onChange={handleChange}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800/80 text-slate-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">
                  Client Details
                </h2>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Bill To
                  </label>
                  <input
                    type="text"
                    name="bill_to"
                    value={formData.bill_to}
                    onChange={handleChange}
                    placeholder="Client name / organization"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800/80 text-slate-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">
                  Line Items
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 shadow-md transition"
                >
                  <span className="text-base leading-none">＋</span>
                  Add Item
                </button>
              </div>

              {/* Table-like header */}
              <div className="hidden md:grid grid-cols-[2.5fr,1.2fr,0.8fr,0.8fr,1fr,40px] gap-3 text-[11px] font-semibold text-slate-300 uppercase tracking-wide px-2">
                <span>Description</span>
                <span>HSN / SAC</span>
                <span>Tax %</span>
                <span>Qty</span>
                <span>Rate / Item</span>
                <span></span>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 md:p-2 flex flex-col gap-3 md:grid md:grid-cols-[2.5fr,1.2fr,0.8fr,0.8fr,1fr,40px]"
                  >
                    <div>
                      <label className="md:hidden block text-xs font-medium text-slate-300 mb-1">
                        Item Description
                      </label>
                      <input
                        type="text"
                        value={item.item_desc}
                        onChange={(e) =>
                          handleChange(e, index, "item_desc")
                        }
                        placeholder="Service / Product details"
                        className="w-full rounded-lg border border-slate-600 bg-slate-900/80 text-slate-100 text-xs md:text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="md:hidden block text-xs font-medium text-slate-300 mb-1">
                        HSN / SAC
                      </label>
                      <input
                        type="text"
                        value={item.hsn_sac}
                        onChange={(e) =>
                          handleChange(e, index, "hsn_sac")
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-900/80 text-slate-100 text-xs md:text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="md:hidden block text-xs font-medium text-slate-300 mb-1">
                        Tax (%)
                      </label>
                      <input
                        type="number"
                        value={item.tax}
                        onChange={(e) =>
                          handleChange(e, index, "tax")
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-900/80 text-slate-100 text-xs md:text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="md:hidden block text-xs font-medium text-slate-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          handleChange(e, index, "qty")
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-900/80 text-slate-100 text-xs md:text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="md:hidden block text-xs font-medium text-slate-300 mb-1">
                        Rate Per Item
                      </label>
                      <input
                        type="number"
                        value={item.rate_item}
                        onChange={(e) =>
                          handleChange(e, index, "rate_item")
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-900/80 text-slate-100 text-xs md:text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>

                    <div className="flex items-start md:items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 rounded-full px-2.5 py-1 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-4 border-t border-slate-700/80 mt-4">
              <p className="text-xs text-slate-400">
                Review all line items and client details before generating the
                quotation PDF.
              </p>
              <button
                type="submit"
                className="inline-flex justify-center items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-semibold shadow-lg hover:from-sky-400 hover:to-indigo-400 active:scale-[0.98] transition"
              >
                Generate Quotation PDF
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
