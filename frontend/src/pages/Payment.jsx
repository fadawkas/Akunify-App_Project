import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Update from '../assets/update.png';
import {useSelector } from 'react-redux';

function Payment() {
  const [paymentData, setPaymentData] = useState([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    payment_id: '',
    invoice_number: '',
    payment_date: '', 
    payment_status: '', 
    amount: '',
    tax: '',
    grand_total: '',
    branch: '',
    bank_name: '',
  });
  
  const [branchFilter, setBranchFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/payment/get-payment');
      setPaymentData(response.data);
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
      "Acalapati": "Acalapati",
      "Agregator": "Aggregator",
    };
    return branchMapping[branch] || branch;
  };

  const resetFormData = () => {
    setFormData({
      invoice_number: '',
      payment_date: '', 
      payment_status: '', 
      amount: '',
      branch: '',
      bank_name: '',
    });
  };
  
  const handleAddNewDataClick = () => {
    resetFormData();        

    setShowUpdateForm(false); 
  };
  
  const handleUpdateData = async (id) => {
    try {
      await axios.put(`http://localhost:3000/payment/update-payment/${id}`, {
        ...formData,  // No need to map branch here as it is not included in the update form
      });
      
      // Reset the form data, removing fields that are no longer used
      setFormData({
        invoice_number: '',
        payment_date: '',
        payment_status: '',
        bank_account: '',  // Only keep fields that were part of the update form
        account_number: '',
      });
  
      setShowUpdateForm(false);
      fetchPaymentData();
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };
  

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 10);
  };
  
  const handleEditClick = (payment) => {
    setFormData({
      ...payment,
      payment_date: formatDateForInput(payment.payment_date), 
      payment_id: payment.payment_id || payment.id
    });
    setShowUpdateForm(true);
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
    fetchPaymentData();
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value);

  const formatDate = (dateString) => {
    if (!dateString) return "-"; // If date is null or empty, return "-"
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };


  const filteredData =
    branchFilter || bankFilter
      ? paymentData.filter(
          (data) =>
            (!branchFilter || data.branch === branchFilter) &&
            (!bankFilter || data.bank_name === bankFilter)
        )
      : paymentData;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-4 max-w-[95%] mx-auto text-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-700">Payment</h1>
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
          </div>
        </div>

        {showUpdateForm && (
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h1 className='mb-4 text-lg font-bold text-gray-700'>Update Data</h1>
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
                  disabled={formData.payment_status === 'Unpaid'} 
                />
              </div>

              <div className="relative col-span-2">
                <label
                  htmlFor="payment_status"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Payment Status
                </label>
                <select
                  id="payment_status"
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
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
              <button onClick={() => handleUpdateData(formData.payment_id)} className="px-2 py-1 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700">
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
                <th className="px-2 py-1 border">Invoice Number</th>
                <th className="px-2 py-1 border">Bank Account</th>
                <th className="px-2 py-1 border">Account Number</th>
                <th className="px-2 py-1 border">Payment Date</th>
                <th className="px-2 py-1 border">Payment Status</th>
                <th className="px-2 py-1 border">Amount</th>
                <th className="px-2 py-1 border">Tax</th>
                <th className="px-2 py-1 border">Grand Total</th>
                <th className="px-2 py-1 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-2">No data available</td>
                </tr>
              ) : (
                filteredData.map((data, index) => (
                  <tr key={data.id || index}>
                    <td className="px-2 py-1 border text-center">{index + 1}</td>
                    <td className="px-2 py-1 border truncate">{data.invoice_number}</td> {/* Displaying Invoice Number */}
                    <td className="px-2 py-1 border">{data.bank_account}</td> {/* Displaying Bank Account */}
                    <td className="px-2 py-1 border">{data.account_number}</td> {/* Displaying Account Number */}
                    <td className="px-2 py-1 border truncate">{formatDate(data.payment_date)}</td>
                    <td className="px-2 py-1 border truncate">{data.payment_status}</td>
                    <td className="px-2 py-1 border text-right">{formatCurrency(data.amount)}</td>
                    <td className="px-2 py-1 border text-right">{formatCurrency(data.tax)}</td>
                    <td className="px-2 py-1 border text-right">{formatCurrency(data.grand_total)}</td>
                    <td className="px-2 py-1 border text-right">
                      <div className="flex justify-center">
                        {/* Update Button */}
                        <div className="relative group">
                          <img src={Update} alt="update" 
                          className={`h-6 w-6 mr-1 ${isAdmin ? "cursor-pointer" : "cursor-not-allowed"}`}
                          onClick={() => isAdmin && handleEditClick(data)}/>
                          <span className="absolute left-1/2 bottom-6 mb-2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs px-2 py-1 rounded-md after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-full after:border-4 after:border-transparent after:border-t-gray-800">
                            Update
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

export default Payment;
