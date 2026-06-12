import React, { useState } from "react";
import axios from "axios";

const InvoiceForm = () => {
  const [formData, setFormData] = useState({
    invoice_num: "",
    bill_to: "",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white shadow-slate-200/50 overflow-hidden">
        {/* Top Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400" />

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-14 h-14 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shadow-md">
              VA
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-wide">
                VIDWAT ASSOCIATES
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Quotation &amp; Invoice Generator
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center text-sm text-slate-600">
            <p className="font-medium">#33, Arvind Nagar</p>
            <p>Near Veer Savarkar Circle</p>
            <p>Vijayapur 586101, Karnataka</p>
            <p className="mt-1 text-xs text-slate-500">
              GST: <span className="font-semibold text-slate-700">29AAZFV2824J1ZB</span>
            </p>
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* Card Body */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/60 border border-slate-100 shadow-sm rounded-2xl p-6 mt-4 space-y-6"
          >
            {/* Invoice & Client Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-sm font-bold tracking-wide text-slate-800 uppercase">
                  Quotation Details
                </h2>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Quotation Number
                  </label>
                  <input
                    type="text"
                    name="invoice_num"
                    value={formData.invoice_num}
                    onChange={handleChange}
                    placeholder="e.g. QTN-2025-001"
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    GST Number (Client)
                  </label>
                  <input
                    type="text"
                    name="gst_num"
                    value={formData.gst_num}
                    onChange={handleChange}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-bold tracking-wide text-slate-800 uppercase">
                  Client Details
                </h2>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Bill To
                  </label>
                  <input
                    type="text"
                    name="bill_to"
                    value={formData.bill_to}
                    onChange={handleChange}
                    placeholder="Client name / organization"
                    className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-wide text-slate-800 uppercase">
                  Line Items
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors shadow-sm"
                >
                  <span className="text-base leading-none">＋</span>
                  Add Item
                </button>
              </div>

              {/* Table-like header */}
              <div className="hidden md:grid grid-cols-[2.5fr,1.2fr,0.8fr,0.8fr,1fr,40px] gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide px-2">
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
                    className="bg-slate-50 border border-slate-200 hover:border-sky-200 transition-colors rounded-xl p-3 md:p-2 flex flex-col gap-3 md:grid md:grid-cols-[2.5fr,1.2fr,0.8fr,0.8fr,1fr,40px] shadow-sm"
                  >
                    <div>
                      <label className="md:hidden block text-xs font-semibold text-slate-600 mb-1">
                        Item Description
                      </label>
                      <input
                        type="text"
                        value={item.item_desc}
                        onChange={(e) =>
                          handleChange(e, index, "item_desc")
                        }
                        placeholder="Service / Product details"
                        className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-xs md:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="md:hidden block text-xs font-semibold text-slate-600 mb-1">
                        HSN / SAC
                      </label>
                      <input
                        type="text"
                        value={item.hsn_sac}
                        onChange={(e) =>
                          handleChange(e, index, "hsn_sac")
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-xs md:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="md:hidden block text-xs font-semibold text-slate-600 mb-1">
                        Tax (%)
                      </label>
                      <input
                        type="number"
                        value={item.tax}
                        onChange={(e) =>
                          handleChange(e, index, "tax")
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-xs md:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="md:hidden block text-xs font-semibold text-slate-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          handleChange(e, index, "qty")
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-xs md:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="md:hidden block text-xs font-semibold text-slate-600 mb-1">
                        Rate Per Item
                      </label>
                      <input
                        type="number"
                        value={item.rate_item}
                        onChange={(e) =>
                          handleChange(e, index, "rate_item")
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-xs md:text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>

                    <div className="flex items-start md:items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-full px-3 py-1.5 transition-colors border border-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-6 border-t border-slate-200 mt-6">
              <p className="text-xs font-medium text-slate-500">
                Review all line items and client details before generating the
                quotation PDF.
              </p>
              <button
                type="submit"
                className="inline-flex justify-center items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-sm font-bold shadow-lg shadow-sky-500/30 active:scale-[0.98] transition-all"
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
