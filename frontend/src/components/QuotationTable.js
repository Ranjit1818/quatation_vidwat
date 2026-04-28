import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Trash2, ArrowLeft, Loader2, FileText } from "lucide-react";

const QuotationTable = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuotations = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await axios.get(`${API_URL}/api/quotations`);
      setQuotations(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quotation?")) return;
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      await axios.delete(`${API_URL}/api/quotations/${id}`);
      setQuotations(quotations.filter((q) => q._id !== id));
    } catch (err) {
      alert("Failed to delete quotation.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col h-[calc(100vh-4rem)]">
        {/* Top Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 shrink-0" />

        {/* Header */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-md">
              <FileText className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-wide">
                Quotation History
              </h1>
              <p className="text-sm text-slate-300">
                View and manage complete quotation data
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Form
          </Link>
        </div>

        {/* Body - Scrollable Table */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {error && (
            <div className="bg-red-500/20 text-red-300 px-4 py-3 rounded-lg mb-6 border border-red-500/50">
              {error}
            </div>
          )}

          {quotations.length === 0 && !error ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300">No Quotations Found</h3>
              <p className="text-sm text-slate-500 mt-2">Generate a quotation to see it here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 shadow-lg bg-slate-900/50">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-white/10 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <th className="p-4 rounded-tl-xl">Invoice No</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Bill To</th>
                    <th className="p-4">GST Number</th>
                    <th className="p-4 text-center">Items</th>
                    <th className="p-4 text-right rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                  {quotations.map((q) => (
                    <tr
                      key={q._id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="p-4 font-medium text-white">{q.invoice_num}</td>
                      <td className="p-4">{new Date(q.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 truncate max-w-[200px]" title={q.bill_to}>
                        {q.bill_to}
                      </td>
                      <td className="p-4">{q.gst_num}</td>
                      <td className="p-4 text-center">
                        <span className="bg-sky-500/20 text-sky-300 py-1 px-3 rounded-full text-xs font-semibold border border-sky-500/30">
                          {q.items.length}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationTable;
