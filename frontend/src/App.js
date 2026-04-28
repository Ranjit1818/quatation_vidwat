import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InvoiceForm from "./components/InvoiceForm";
import QuotationTable from "./components/QuotationTable";
import "./styles/App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<InvoiceForm />} />
          <Route path="/data" element={<QuotationTable />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
