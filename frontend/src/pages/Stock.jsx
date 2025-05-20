import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { useSelector } from 'react-redux';


function Stock() {
  const [stockData, setStockData] = useState([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [formData, setFormData] = useState({
    total_quantity: "",
    last_invoice_number: "",
    plus_minus: "",
    last_updated: "",
  });
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";


  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/stock/get-all");
      setStockData(response.data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-"; // If date is null or empty, return "-"
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleEditClick = (stock) => {
    setSelectedStock(stock);
    setFormData({
      total_quantity: stock.total_quantity,
      last_invoice_number: stock.last_invoice_number || "",
      plus_minus: stock.plus_minus,
      last_updated: formatDate(stock.last_updated),
    });
    setShowUpdateForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const updatedStock = {
        ...selectedStock,
        ...formData,
        last_updated: new Date().toISOString(), // Update the timestamp when saving
      };

      await axios.put(`http://localhost:3000/stock/update/${selectedStock.stock_id}`, updatedStock);

      // Update the stock data locally
      setStockData(
        stockData.map((stock) =>
          stock.stock_id === selectedStock.stock_id ? updatedStock : stock
        )
      );

      setShowUpdateForm(false); // Close the form after saving
    } catch (error) {
      console.error("Error saving updated stock:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-4 max-w-[95%] mx-auto text-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-700">Stock</h1>
        </div>
        {showUpdateForm && (
          <div className="bg-white shadow-md rounded-lg p-6 mt-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">
              Update {selectedStock ? selectedStock.item : "Stock"} Stock
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Total Quantity</label>
                <input
                  type="number"
                  name="total_quantity"
                  value={formData.total_quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Last Invoice Number</label>
                <input
                  type="text"
                  name="last_invoice_number"
                  value={formData.last_invoice_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Plus/Minus Quantity</label>
                <input
                  type="number"
                  name="plus_minus"
                  value={formData.plus_minus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Last Update</label>
                <input
                  type="text"
                  name="last_updated"
                  value={formData.last_updated}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled
                />
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowUpdateForm(false)}
                className="px-2 py-1 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {stockData.length === 0 ? (
            <div className="w-full text-center py-2 text-gray-500">No data available</div>
          ) : (
            stockData.map((data, index) => (
              <div
                key={data.stock_id || index}
                className={`bg-white shadow-lg rounded-lg p-4 w-full transition duration-300 ${
                  isAdmin ? 'cursor-pointer hover:shadow-xl' : 'cursor-not-allowed opacity-80'
                }`}
                onClick={() => isAdmin && handleEditClick(data)}
              >
                <div className="font-semibold text-lg mb-3">{data.item}</div>
                <div className="grid grid-cols-2">
                  <div className="mb-2">
                    <span className="text-gray-500">Total Quantity:</span>
                    <span className="ml-2 font-semibold">{data.total_quantity}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-gray-500">Last Invoice Number:</span>
                    <span className="ml-2 font-semibold">{data.last_invoice_number || "N/A"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-gray-500">Plus/Minus Quantity:</span>
                    <span className="ml-2 font-semibold">{data.plus_minus}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-gray-500">Last Update:</span>
                    <span className="ml-2 font-semibold">{formatDate(data.last_updated)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Stock;
