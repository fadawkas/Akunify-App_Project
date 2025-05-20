import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Update from '../assets/update.png';
import Delete from '../assets/delete.png';
import {useSelector } from 'react-redux';

function OperationalExpense() {
  const [expenseData, setExpenseData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: "",
    status: "Unpaid", 
    paid_date: "",
    branch: "",
    bank_name: "",
  });

  const [categoryFilter, setCategoryFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [bankFilter, setBankFilter] = useState("");
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchExpenseData();
  }, []);

  const fetchExpenseData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/operational/get-all");
      setExpenseData(response.data);
    } catch (error) {
      console.error("Error fetching expense data:", error);
    }
  };

  const mapBranchName = (branch) => {
    const branchMapping = {
      "Acalapati": "Acalapati",
      "Agregator": "Aggregator",
    };
    return branchMapping[branch] || branch;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddNewData = async () => {
    try {
      const mappedBranch = mapBranchName(formData.branch);
      await axios.post("http://localhost:3000/operational/add", {
        ...formData,
        branch: mappedBranch,
      });
      setFormData({
        description: "",
        amount: "",
        category: "",
        date: "",
        status: "Unpaid",
        paid_date: "",
        branch: "",
        bank_name: "",
      });
      setShowAddForm(false);
      fetchExpenseData();
    } catch (error) {
      console.error("Error adding new data:", error);
    }
  };

  const handleFilterByCategory = (category) => {
    setCategoryFilter(category);
  };

  const resetFormData = () => {
    setFormData({
      description: "",
      amount: "",
      category: "",
      date: "",
      status: "Unpaid",
      paid_date: "",
      branch: "",
      bank_name: "",
    });
  };
  
  
  const handleAddNewDataClick = () => {
    resetFormData();        
    setShowAddForm(true);     
    setShowUpdateForm(false); 
  };

  const handleUpdateData = async (id) => {
    const mappedBranch = mapBranchName(formData.branch);
  
    try {
      await axios.put(`http://localhost:3007/update-expense/${id}`, {
        ...formData,
        branch: mappedBranch,
      });
      setFormData({
        description: "",
        amount: "",
        category: "",
        date: "",
        status: "Unpaid",
        paid_date: "",
        branch: "",
        bank_name: "",
      });
      setShowUpdateForm(false);
      fetchExpenseData();
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 10);
  };
  
  const handleEditClick = (expense) => {
    setFormData({
      ...expense,
      date: formatDateForInput(expense.date),
      paid_date: formatDateForInput(expense.paid_date)
    });
    setShowUpdateForm(true);
  };

  const handleDeleteData = async (id) => {
    // Opsional: tambahkan konfirmasi sebelum menghapus
    if (!window.confirm('Apakah anda yakin ingin menghapus data ini?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:3007/delete-expense/${id}`);
      // Setelah berhasil menghapus, perbarui data order
      fetchExpenseData();
    } catch (error) {
      console.error('Error deleting operational:', error);
    }
  };

  const handleFilterByBranch = (branch) => {
    const mappedBranch = mapBranchName(branch);
    setBranchFilter(mappedBranch);
  };

  const handleFilterByBank = (bank) => {
    setBankFilter(bank);
  };

  const resetFilters = () => {
    setCategoryFilter("");
    setBranchFilter("");
    setBankFilter("");
    fetchExpenseData();
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredData = expenseData.filter(
    (data) =>
      (!categoryFilter || data.category === categoryFilter) &&
      (!branchFilter || data.branch === branchFilter) &&
      (!bankFilter || data.bank_name === bankFilter)
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-4 max-w-[95%] mx-auto text-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-700">Operational Expenses</h1>
          <div className="flex space-x-2">
            <select
              value={branchFilter}
              onChange={(e) => handleFilterByBranch(e.target.value)}
              className="px-2 py-1 bg-gray-200 text-xs font-semibold rounded-md hover:bg-gray-300"
            >
              <option value="">Select Branch</option>
              <option value="Acalapati">Acalapati</option>
              <option value="Agregator">Agregator</option>
            </select>
            <select
              value={bankFilter}
              onChange={(e) => handleFilterByBank(e.target.value)}
              className="px-2 py-1 bg-gray-200 text-xs font-semibold rounded-md hover:bg-gray-300"
            >
              <option value="">Filter by Bank</option>
              <option value="Mandiri">Mandiri</option>
              <option value="BNI">BNI</option>
            </select>
            <button
              onClick={resetFilters}
              className="px-2 py-1 bg-gray-800 text-white text-xs font-semibold rounded-md hover:bg-gray-900"
            >
              Show All
            </button>
            <button
              onClick={isAdmin && handleAddNewDataClick}
              className={`px-2 py-1 text-xs font-semibold rounded-md ${
                isAdmin
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              + Add New Data
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h1 className='mb-4 text-lg font-bold text-gray-700'>Add Expenses</h1>
            <div className="grid grid-cols-3 gap-4">
              <div className="relative">
                <label
                  htmlFor="description"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="amount"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="category"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="Jasa Pihak Tiga">Jasa Pihak Tiga</option>
                  <option value="Jamuan Eksternal">Jamuan Eksternal</option>
                  <option value="Jamuan Internal">Jamuan Internal</option>
                  <option value="Administrasi & Umum">Administrasi & Umum</option>
                  <option value="Pajak">Pajak</option>
                  <option value="Perdin Hotel">Perdin Hotel</option>
                  <option value="Perdin Tiket">Perdin Tiket</option>
                  <option value="Biaya Kedukaan">Biaya Kedukaan</option>
                  <option value="Perkap Kantor">Perkap Kantor</option>
                  <option value="Talangan Agregator">Talangan Agregator</option>
                  <option value="Inventaris kantor">Inventaris kantor</option>
                  <option value="Biaya Lain-Lain">Biaya Lain-Lain</option>
                </select>
              </div>

              <div className="relative">
                <label
                  htmlFor="date"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="status"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div className="relative">
                <label
                  htmlFor="paid_date"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Paid Date
                </label>
                <input
                  type="date"
                  id="paid_date"
                  name="paid_date"
                  value={formData.paid_date}
                  onChange={handleInputChange}
                  disabled={formData.status === "Unpaid"}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>


              <div className="relative">
                <label
                  htmlFor="branch"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Branch
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Branch</option>
                  <option value="Acalapati">Acalapati</option>
                  <option value="Agregator">Agregator</option>
                </select>
              </div>

              <div className="relative">
                <label
                  htmlFor="bank_name"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Bank Name
                </label>
                <select
                  id="bank_name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Bank</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BNI">BNI</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-2 py-1 bg-gray-300 text-xs text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewData}
                className="px-2 py-1 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {showUpdateForm && (
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h1 className='mb-4 text-lg font-bold text-gray-700'>Update Data</h1>
            <div className="grid grid-cols-6 gap-4">
            <div className="relative">
                <label
                  htmlFor="description"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="amount"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="category"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="Jasa Pihak Tiga">Jasa Pihak Tiga</option>
                  <option value="Jamuan Eksternal">Jamuan Eksternal</option>
                  <option value="Jamuan Internal">Jamuan Internal</option>
                  <option value="Administrasi & Umum">Administrasi & Umum</option>
                  <option value="Pajak">Pajak</option>
                  <option value="Perdin Hotel">Perdin Hotel</option>
                  <option value="Perdin Tiket">Perdin Tiket</option>
                  <option value="Biaya Kedukaan">Biaya Kedukaan</option>
                  <option value="Perkap Kantor">Perkap Kantor</option>
                  <option value="Talangan Agregator">Talangan Agregator</option>
                  <option value="Inventaris kantor">Inventaris kantor</option>
                  <option value="Biaya Lain-Lain">Biaya Lain-Lain</option>
                </select>
              </div>

              <div className="relative">
                <label
                  htmlFor="date"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="status"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div className="relative">
                <label
                  htmlFor="paid_date"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Paid Date
                </label>
                <input
                  type="date"
                  id="paid_date"
                  name="paid_date"
                  value={formData.paid_date}
                  onChange={handleInputChange}
                  disabled={formData.status === "Unpaid"}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>


              <div className="relative">
                <label
                  htmlFor="branch"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Branch
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Branch</option>
                  <option value="Acalapati">Acalapati</option>
                  <option value="Agregator">Agregator</option>
                </select>
              </div>

              <div className="relative">
                <label
                  htmlFor="bank_name"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Bank Name
                </label>
                <select
                  id="bank_name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Bank</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BNI">BNI</option>
                </select>
              </div>

            </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button onClick={() => setShowUpdateForm(false)} className="px-2 py-1 bg-gray-300 text-xs text-gray-700 rounded-md hover:bg-gray-400">
                  Cancel
                </button>
                <button onClick={() => handleUpdateData(formData.expense_id)} className="px-2 py-1 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700">
                  Update
                </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-white shadow-md rounded-lg text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">No</th>
                <th className="px-2 py-1 border">Description</th>
                <th className="px-2 py-1 border">Amount</th>
                <th className="px-2 py-1 border">Category</th>
                <th className="px-2 py-1 border">Date</th>
                <th className="px-2 py-1 border">Status</th>
                <th className="px-2 py-1 border">Branch</th>
                <th className="px-2 py-1 border">Paid Date</th>
                <th className="px-2 py-1 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-2">
                    No data available
                  </td>
                </tr>
              ) : (
                filteredData.map((data, index) => (
                  <tr key={data.expense_id || index}>
                    <td className="px-2 py-1 border text-center">{index + 1}</td>
                    <td className="px-2 py-1 border truncate">{data.description}</td>
                    <td className="px-2 py-1 border text-right">{formatCurrency(data.amount)}</td>
                    <td className="px-2 py-1 border truncate">{data.category}</td>
                    <td className="px-2 py-1 border">{formatDate(data.date)}</td>
                    <td className="px-2 py-1 border truncate">{data.status}</td>
                    <td className="px-2 py-1 border truncate">{data.branch}</td>
                    <td className="px-2 py-1 border">
                      {data.paid_date ? formatDate(data.paid_date) : "-"}
                    </td>
                    <td className="px-2 py-1 border text-right">
                      <div className="flex justify-center">
                      {/* Update Button */}
                        <div className="relative group">
                          <img 
                          src={Update} 
                          alt="update" 
                          className={`h-6 w-6 mr-1 ${isAdmin ? "cursor-pointer" : "cursor-not-allowed"}`}
                          onClick={() => isAdmin && handleEditClick(data)} />
                          <span className="absolute left-1/2 bottom-6 mb-2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs px-2 py-1 rounded-md after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-full after:border-4 after:border-transparent after:border-t-gray-800">
                            Update
                          </span>
                        </div>
                    
                      {/* Delete Button */}
                        <div className="relative group">
                          <img 
                          src={Delete} 
                          alt="delete" 
                          className={`h-7 w-7 ${isAdmin ? "cursor-pointer" : "cursor-not-allowed"}`}
                          onClick={() => isAdmin && handleDeleteData(data.id || data.expense_id)}/>
                          <span className="absolute left-1/2 bottom-6 mb-2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs px-2 py-1 rounded-md after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-full after:border-4 after:border-transparent after:border-t-gray-800">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OperationalExpense;
