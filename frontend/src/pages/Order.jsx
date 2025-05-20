import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Update from '../assets/update.png';
import Delete from '../assets/delete.png';
import {useSelector } from 'react-redux';

function Order() {
  const [orderData, setOrderData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    po_number: '',
    invoice_number: '',
    order_date: '', 
    supplier: '', 
    item: '',
    description: '',
    quantity: '',
    unit_price: '',
    total_price: '',
    bank_name: '',
    bank_account: '',
    account_number: '',
  });
  
  const [branchFilter, setBranchFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchOrderData();
  }, []);

  const fetchOrderData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/order/get-order');
      setOrderData(response.data);
    } catch (error) {
      console.error('Error fetching orders data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const mapBranchName = (branch) => {
    const branchMapping = {
      "Acalapati": "acalapati",
      "Agregator": "aggregator",
    };
    return branchMapping[branch] || branch;
  };

  const handleAddNewData = async () => {
    const mappedBranch = mapBranchName(formData.branch);
  
    try {
      await axios.post('http://localhost:3000/order/add-order', {
        ...formData,
        branch: mappedBranch,
      });
      setFormData({
        invoice_number: '',
        order_date: '',
        payment_date: '',
        customer: '',
        item: '',
        description: '',
        quantity: '',
        unit_price: '',
        branch: '',
        bank_name: '',
        bank_account: '',
        account_number: '',
      });
      setShowAddForm(false);
      fetchOrderData();
    } catch (error) {
      console.error('Error adding new data:', error);
    }
  };  

  const resetFormData = () => {
    setFormData({
      po_number: '',
      invoice_number: '',
      order_date: '',
      supplier: '',
      item: '',
      description: '',
      quantity: '',
      unit_price: '',
      total_price: '',
      branch: '',
      bank_name: '',
      bank_account: '',
      account_number: '',
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
      await axios.put(`http://localhost:3000/order/update-order/${id}`, {
        ...formData,
        branch: mappedBranch,
      });
      setFormData({
        invoice_number: '',
        order_date: '',
        payment_date: '',
        customer: '',
        item: '',
        description: '',
        quantity: '',
        unit_price: '',
        branch: '',
        bank_name: '',
        bank_account: '',
        account_number: '',
      });
      setShowUpdateForm(false);
      fetchOrderData();
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 10);
  };
  
  const handleEditClick = (order) => {
    setFormData({
      ...order,
      order_date: formatDateForInput(order.order_date),
    });
    setShowUpdateForm(true);
  };

  const handleDeleteData = async (id) => {
    // Opsional: tambahkan konfirmasi sebelum menghapus
    if (!window.confirm('Apakah anda yakin ingin menghapus data ini?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:3000/order/delete-order/${id}`);
      // Setelah berhasil menghapus, perbarui data order
      fetchOrderData();
    } catch (error) {
      console.error('Error deleting order:', error);
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
    fetchOrderData();
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredData =
    branchFilter || bankFilter
      ? orderData.filter(
          (data) =>
            (!branchFilter || data.branch === branchFilter) &&
            (!bankFilter || data.bank_name === bankFilter)
        )
      : orderData;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-4 max-w-[95%] mx-auto text-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-700">Order</h1>
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
              onClick={() => isAdmin && handleAddNewDataClick()}
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
            <h1 className='mb-4 text-lg font-bold text-gray-700'>Add Order</h1>

            <div className="grid grid-cols-6 gap-4">
              <div className="relative col-span-2">
                <label
                  htmlFor="po_number"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  PO Number
                </label>
                <input
                  type="text"
                  id="po_number"
                  name="po_number"
                  value={formData.po_number}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                  htmlFor="supplier"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Supplier
                </label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
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

              <div className="relative col-span-2">
                  <label
                    htmlFor="bank_account"
                    className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                  >
                    Bank Account
                  </label>
                  <input
                    type="text"
                    id="bank_account"
                    name="bank_account"
                    value={formData.bank_account}
                    onChange={handleInputChange}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
              </div>

              <div className="relative col-span-2">
                  <label
                    htmlFor="account_number"
                    className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                  >
                    Account Number
                  </label>
                  <input
                    type="text"
                    id="account_number"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleInputChange}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
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
            <h1 className='mb-4 text-lg font-bold text-gray-700'>Update Data</h1>
            <div className="grid grid-cols-6 gap-4">
              <div className="relative col-span-2">
                <label
                  htmlFor="po_number"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  PO Number
                </label>
                <input
                  type="text"
                  id="po_number"
                  name="po_number"
                  value={formData.po_number}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                  htmlFor="supplier"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Supplier
                </label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
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
                <input
                  type="text"
                  id="item"
                  name="item"
                  value={formData.item}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative col-span-2">
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
                  <option value="acalapati">Acalapati</option>
                  <option value="aggregator">Agregator</option>
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

              <div className="relative col-span-2">
                  <label
                    htmlFor="bank_account"
                    className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                  >
                    Bank Account
                  </label>
                  <input
                    type="text"
                    id="bank_account"
                    name="bank_account"
                    value={formData.bank_account}
                    onChange={handleInputChange}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
              </div>

              <div className="relative col-span-2">
                <label
                  htmlFor="account_number"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Account Number
                </label>
                <input
                  type="text"
                  id="account_number"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button onClick={() => setShowUpdateForm(false)} className="px-2 py-1 bg-gray-300 text-xs text-gray-700 rounded-md hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={() => handleUpdateData(formData.order_id)} className="px-2 py-1 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700">
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
                <th className="px-2 py-1 border">PO Number</th>
                <th className="px-2 py-1 border">Invoice Number</th>
                <th className="px-2 py-1 border">Order Date</th>
                <th className="px-2 py-1 border">Supplier</th>
                <th className="px-2 py-1 border">Item</th>
                <th className="px-2 py-1 border">Description</th>
                <th className="px-2 py-1 border">Qty</th>
                <th className="px-2 py-1 border">Unit Price</th>
                <th className="px-2 py-1 border">Total</th>
                <th className="px-2 py-1 border">Bank</th>
                <th className="px-2 py-1 border">Bank Account</th>
                <th className="px-2 py-1 border">Account Number</th>
                <th className="px-2 py-1 border">Action</th>
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
                    <td className="px-2 py-1 border truncate">{data.po_number}</td>
                    <td className="px-2 py-1 border">{data.invoice_number}</td>
                    <td className="px-2 py-1 border">{formatDate(data.order_date)}</td>
                    <td className="px-2 py-1 border truncate">{data.supplier}</td>
                    <td className="px-2 py-1 border truncate">{data.item}</td>
                    <td className="px-2 py-1 border text-right">{data.description}</td>
                    <td className="px-2 py-1 border text-right">{data.quantity}</td>
                    <td className="px-2 py-1 border text-right">{formatCurrency(data.unit_price)}</td>
                    <td className="px-2 py-1 border text-right">{formatCurrency(data.total_price)}</td>
                    <td className="px-2 py-1 border text-right">{data.bank_name}</td>
                    <td className="px-2 py-1 border text-right">{data.bank_account}</td>
                    <td className="px-2 py-1 border text-right">{data.account_number}</td>

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
                          onClick={() => isAdmin && handleDeleteData(data.id || data.order_id)}/>
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

export default Order;
