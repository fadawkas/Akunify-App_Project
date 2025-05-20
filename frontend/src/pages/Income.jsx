import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Update from '../assets/update.png';
import Delete from '../assets/delete.png';
import {useSelector } from 'react-redux';

function Income() {
  const [incomeData, setIncomeData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: '',
    order_date: '', // Renamed
    payment_date: '', // New column
    customer: '',
    item: '',
    quantity: '',
    unit_price: '',
    branch: '',
    bank_name: '',
  });
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";
  
  const [branchFilter, setBranchFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');

  useEffect(() => {
    fetchIncomeData();
  }, []);

  const fetchIncomeData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/income/get-all');
      setIncomeData(response.data);
    } catch (error) {
      console.error('Error fetching income data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const mapBranchName = (branch) => {
    const branchMapping = {
      "Acalapati": "acalapati",
      "Agregator": "agregator",
    };
    return branchMapping[branch] || branch;
  };

  const handleAddNewData = async () => {
    const mappedBranch = mapBranchName(formData.branch);
    const total_price = formData.quantity * formData.unit_price;
    const tax = total_price * 0.11;
    const grand_total = total_price + tax;
  
    try {
      await axios.post('http://localhost:3000/income/add', {
        ...formData,
        branch: mappedBranch,
        total_price,
        tax,
        grand_total,
      });
      setFormData({
        invoice_number: '',
        order_date: '',
        payment_date: '',
        customer: '',
        item: '',
        quantity: '',
        unit_price: '',
        branch: '',
        bank_name: '',
      });
      setShowAddForm(false);
      fetchIncomeData();
    } catch (error) {
      console.error('Error adding new data:', error);
    }
  };  

  const handleDeleteData = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }
  
    try {
      await axios.delete(`http://localhost:3000/income/delete/${id}`);
      fetchIncomeData(); // Refresh data after delete
    } catch (error) {
      console.error('Error deleting income data:', error);
    }
  };
  

  const handleEditClick = (income) => {
    setFormData({
      ...income,
      order_date: formatDateForInput(income.order_date),
      payment_date: formatDateForInput(income.payment_date),
      income_id: income.id || income.income_id, // Ensure correct ID
    });
    setShowUpdateForm(true);
  };
  

  const handleUpdateData = async () => {
    try {
      await axios.put(`http://localhost:3000/income/update/${formData.income_id}`, {
        ...formData,
      });
  
      setShowUpdateForm(false);
      fetchIncomeData();
    } catch (error) {
      console.error('Error updating income data:', error);
    }
  }; 
  
  

  const handleFilterByBranch = (branch) => {
    const mappedBranch = mapBranchName(branch);
    setBranchFilter(mappedBranch);
  };

  const handleFilterByBank = (bankName) => {
    setBankFilter(bankName);
  };

  const resetFilters = () => {
    setBranchFilter('');
    setBankFilter('');
    fetchIncomeData();
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value);

  const formatDate = (dateString) => {
    if (!dateString) return "-"; // Handle null or undefined dates
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
    

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 10);
  };
  

  const filteredData =
    branchFilter || bankFilter
      ? incomeData.filter(
          (data) =>
            (!branchFilter || data.branch === branchFilter) &&
            (!bankFilter || data.bank_name === bankFilter)
        )
      : incomeData;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-4 max-w-[95%] mx-auto text-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-700">Income</h1>
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
              onClick={() => isAdmin && setShowAddForm(!showAddForm)}
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
            <h1 className='mb-4 text-lg font-bold text-gray-700'>Add Income</h1>
            <div className="grid grid-cols-6 gap-4">
              <div className="relative col-span-2">
                <label
                  htmlFor="invoice_number"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Invoice Number
                </label>
                <input
                  type="text"
                  id="invoice_number"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative col-span-2">
                <label
                  htmlFor="order_date"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Order Date
                </label>
                <input
                  type="date"
                  id="order_date"
                  name="order_date"
                  value={formData.order_date}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative col-span-2">
                <label
                  htmlFor="payment_date"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Payment Date
                </label>
                <input
                  type="date"
                  id="payment_date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative col-span-2">
                <label
                  htmlFor="customer"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Customer
                </label>
                <input
                  type="text"
                  id="customer"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative col-span-2">
                <label
                  htmlFor="item"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Item
                </label>
                <select
                  id="item"
                  name="item"
                  value={formData.item}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Item</option>
                  <option value="Chip">Chip</option>
                  <option value="Tapcash">Tapcash</option>
                  <option value="eMoney">eMoney</option>
                </select>
      
              </div>

              <div className="relative col-span-2">
                <label
                  htmlFor="quantity"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative col-span-2">
                <label
                  htmlFor="unit_price"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Unit Price
                </label>
                <input
                  type="number"
                  id="unit_price"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative col-span-2">
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

              <div className="relative col-span-2">
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
              <button onClick={() => setShowAddForm(false)} className="px-2 py-1 bg-gray-300 text-xs text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
              <button onClick={handleAddNewData} className="px-2 py-1 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700">Save</button>
            </div>
          </div>
        )}

        {showUpdateForm && (
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h1 className='mb-4 text-lg font-bold text-gray-700'>Update Income</h1>
            <div className="grid grid-cols-6 gap-4">
              <div className="relative col-span-2">
                <label htmlFor="invoice_number" className="text-xs text-gray-500">Invoice Number</label>
                <input
                  type="text"
                  id="invoice_number"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border rounded-md"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="order_date" className="text-xs text-gray-500">Order Date</label>
                <input
                  type="date"
                  id="order_date"
                  name="order_date"
                  value={formData.order_date}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border rounded-md"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="payment_date" className="text-xs text-gray-500">Payment Date</label>
                <input
                  type="date"
                  id="payment_date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border rounded-md"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="customer" className="text-xs text-gray-500">Customer</label>
                <input
                  type="text"
                  id="customer"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border rounded-md"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="item" className="text-xs text-gray-500">Item</label>
                <select
                  id="item"
                  name="item"
                  value={formData.item}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Item</option>
                  <option value="Chip">Chip</option>
                  <option value="Tapcash">Tapcash</option>
                  <option value="eMoney">eMoney</option>
                </select>
              </div>

              <div className="relative col-span-2">
                <label htmlFor="quantity" className="text-xs text-gray-500">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border rounded-md"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="unit_price" className="text-xs text-gray-500">Unit Price</label>
                <input
                  type="number"
                  id="unit_price"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border rounded-md"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="branch" className="text-xs text-gray-500">Branch</label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border rounded-md"
                >
                  <option value="">Select Branch</option>
                  <option value="Acalapati">Acalapati</option>
                  <option value="Agregator">Agregator</option>
                </select>
              </div>

              <div className="relative col-span-2">
                <label htmlFor="bank_name" className="text-xs text-gray-500">Bank Name</label>
                <select
                  id="bank_name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border rounded-md"
                >
                  <option value="">Select Bank</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BNI">BNI</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button onClick={() => setShowUpdateForm(false)} className="px-2 py-1 bg-gray-300 rounded-md">Cancel</button>
              <button onClick={() => handleUpdateData(formData.income_id)} className="px-2 py-1 bg-blue-600 text-white rounded-md">Update</button>
            </div>
          </div>
        )}


        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-white shadow-md rounded-lg text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">No</th>
                <th className="px-2 py-1 border">Invoice Number</th>
                <th className="px-2 py-1 border">Order Date</th>
                <th className="px-2 py-1 border">Payment Date</th>
                <th className="px-2 py-1 border">Customer</th>
                <th className="px-2 py-1 border">Item</th>
                <th className="px-2 py-1 border">Qty</th>
                <th className="px-2 py-1 border">Unit Price</th>
                <th className="px-2 py-1 border">Total</th>
                <th className="px-2 py-1 border">PPN</th>
                <th className="px-2 py-1 border">Grand Total</th>
                <th className="px-2 py-1 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-2">No data available</td>
                </tr>
              ) : (
                filteredData.map((data, index) => (
                  <tr key={data.id || index}>
                    <td className="px-2 py-1 border text-center">{index + 1}</td>
                    <td className="px-2 py-1 border truncate">{data.invoice_number}</td>
                    <td className="px-2 py-1 border">{formatDate(data.order_date)}</td>
                    <td className="px-2 py-1 border">{formatDate(data.payment_date)}</td>
                    <td className="px-2 py-1 border truncate">{data.customer}</td>
                    <td className="px-2 py-1 border truncate">{data.item}</td>
                    <td className="px-2 py-1 border text-right">{data.quantity}</td>
                    <td className="px-2 py-1 border text-right">{formatCurrency(data.unit_price)}</td>
                    <td className="px-2 py-1 border text-right">{formatCurrency(data.total_price)}</td>
                    <td className="px-2 py-1 border text-right">{formatCurrency(data.tax)}</td>
                    <td className="px-2 py-1 border text-right">{formatCurrency(data.grand_total)}</td>
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
                          onClick={() => isAdmin && handleDeleteData(data.income_id)} />
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

export default Income;
