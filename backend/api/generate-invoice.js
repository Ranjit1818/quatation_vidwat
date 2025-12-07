const handleGenerateInvoice = async () => {
  try {
    const response = await axios.post(
      "https://quatation-vidwat-lkfs.vercel.app/api/generate-invoice",
      invoiceData,
      {
        responseType: "blob", // PDF
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "invoice.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating invoice:", error);

    // 🔍 Axios-specific logging
    if (axios.isAxiosError(error)) {
      console.log("Status:", error.response?.status);
      console.log("Response data:", error.response?.data);

      const message =
        error.response?.data?.error ||
        error.response?.data ||
        "Server error while generating invoice";
      alert(message);
    } else {
      alert("Unexpected error while generating invoice");
    }
  }
};
