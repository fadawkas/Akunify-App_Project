import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

function Distribution() {
  const [usersData, setUsersData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [branchMismatch, setBranchMismatch] = useState(false);
  
  const [formData, setFormData] = useState({
    invoice_number: '',
    card_qty: '',
    fee: '',
    date: '',
    payment_date: '',
    payment_status: '',
    username: '',
    branch: '',
    card_price: '',
    chip_fee: '',
    card_fee: '',
    bni_fee: '',
    mdd_fee: '',
    marketing_fee_percent: '',
  });

  useEffect(() => {
    fetchUsersData();
    fetchDistributionData();
  }, []);

  const handleCancel = () => {
    // Clear all inputs and hide the form
    setFormData({
        invoice_number: '',
        card_qty: '',
        fee: '',
        date: '',
        payment_date: '',
        payment_status: '',
        username: '',
        branch: '',
        card_price: '',
        chip_fee: '',
        card_fee: '',
        bni_fee: '',
        mdd_fee: '',
        marketing_fee_percent: '',
    });
    setShowResult(false);
    setShowAddForm(false);
  };


  const calculateFee = () => {
      const { card_price, chip_fee, card_fee, bni_fee, mdd_fee, marketing_fee_percent } = formData;

      if (!card_price || !chip_fee || !card_fee || !bni_fee || !mdd_fee || !marketing_fee_percent) {
          return;
      }

      const afterBNI = card_price - chip_fee - card_fee - bni_fee;
      const after3Percent = afterBNI - (0.03 * afterBNI);
      const afterMDD = after3Percent - mdd_fee;
      const after5PercentMDD = afterMDD - (0.5 * mdd_fee) * 0.05;
      const afterMarketing = (marketing_fee_percent / 100) * after5PercentMDD;
      const finalFee = Math.floor(afterMarketing - (0.5 * afterMarketing) * 0.05);

      setFormData((prev) => ({
          ...prev,
          fee: finalFee.toFixed(2), // Update the fee in state
      }));
  };
  
  const fetchUsersData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/users/get-all');
      setUsersData(response.data);
    } catch (error) {
      console.error('Error fetching users data:', error);
    }
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

  const fetchUsersFee = async (username) => {
    try {
      const response = await axios.get(`http://localhost:3000/distribution/get-fee/${username}`);
      if (response.data) {
        setFormData((prevData) => ({
          ...prevData,
          fee: response.data.fee,
        }));
      }
    } catch (error) {
      console.error('Error fetching user fee:', error);
    }
  };

  const fetchDistributionData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/distribution/get-distribution');
      setDistributionData(response.data);
    } catch (error) {
      console.error('Error fetching distribution data:', error);
    }
  };

  const fetchIncomeDataByInvoice = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/distribution/get-income/${formData.invoice_number}`);
        
        if (response.data) {
            const user = usersData.find((u) => u.name === formData.username);
            
            if (user) {
                const userBranch = user.branch;
                
                // ✅ FIX: Ensure "all" is checked first before blocking access
                if (userBranch === "All" || userBranch === "all" || userBranch === response.data.branch) {
                    setBranchMismatch(false);
                } else {
                    setBranchMismatch(true);
                }
            }

            let updatedFormData = {
                ...formData,
                card_qty: response.data.quantity,
                date: response.data.payment_date,
                branch: response.data.branch,
            };

            if (user && user.branch === 'Acalapati') {
                updatedFormData.fee = formData.fee;
            }

            setFormData(updatedFormData);
        }
    } catch (error) {
        console.error('Error fetching income data:', error);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };

  const toggleUserDistributionTable = async (userId) => {
      const user = usersData.find((u) => u.user_id === userId);
      
      if (activeUser === userId) {
          setActiveUser(null);
          setShowAddForm(false);
      } else {
          setActiveUser(userId);
          setFormData({ 
              ...formData, 
              username: user ? user.name : '', 
              branch: user ? user.branch : ''  
          });

          try {
              // Fetch only the distribution data for the selected user
              const response = await axios.get(`http://localhost:3000/distribution/get-distribution?user=${user.name}`);

              setDistributionData(response.data);
          } catch (error) {
              console.error('Error fetching user-specific distribution data:', error);
          }

          fetchUsersFee(user?.name);
          setShowAddForm(true);
      }
  };



  const handleSaveData = async () => {
    try {
        const { card_qty, fee, branch, username, date, invoice_number } = formData;

        // Ensure required fields are present
        if (!card_qty || !fee || !branch || !username) {
            console.error('Error: Missing required fields.');
            return;
        }

        // Calculate total fee
        const total_fee = card_qty * fee;

        // Calculate tax and net fee based on branch
        let tax = 0;
        let net_fee = total_fee;

        if (branch.toLowerCase() === "acalapati") {
            tax = (total_fee * 0.5) * 0.05;
            net_fee = total_fee - tax;
        }

        // Data to send to backend
        const dataToSend = {
            ...formData,
            total_fee,
            tax,
            net_fee,
            payment_status: "Unpaid",  // Set payment_status to null
            payment_date: null,     // Set payment_date to null
        };

        // Upload data to the database
        await axios.post('http://localhost:3000/distribution/add-distribution', dataToSend);

        // Close form and refresh data
        setShowAddForm(false);
        fetchDistributionData();
    } catch (error) {
        console.error('Error saving distribution data:', error);
    }
  };


  const filteredUsersData = usersData.filter(
    (user) => selectedBranch === 'All' || user.branch === selectedBranch
  );


  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-4 max-w-[95%] mx-auto text-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-700">Distribution</h1>
          <select value={selectedBranch} onChange={handleBranchChange} className="px-2 py-1 bg-gray-200 rounded-md">
            <option value="All">All</option>
            <option value="Acalapati">Acalapati</option>
            <option value="Agregator">Agregator</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-white shadow-md rounded-lg text-xs text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">No</th>
                <th className="px-2 py-1 border">Username</th>
                <th className="px-2 py-1 border">Email</th>
                <th className="px-2 py-1 border">Branch</th>
                <th className="px-2 py-1 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsersData.map((user, index) => (
                <tr key={user.user_id}>
                  <td className="px-2 py-1 border">{index + 1}</td>
                  <td className="px-2 py-1 border">{user.name}</td>
                  <td className="px-2 py-1 border">{user.email}</td>
                  <td className="px-2 py-1 border">{user.branch}</td>
                  <td className="px-2 py-1 border">
                    <button onClick={() => toggleUserDistributionTable(user.user_id)}
                      className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddForm && (
          
          
          <div className="bg-white shadow-lg rounded-xl p-6 mb-6 mt-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Fetch Income Data for {usersData.find(user => user.user_id === activeUser)?.name || 'User'}
              </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
              <input
                type="text"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleInputChange}
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={fetchIncomeDataByInvoice} className="px-2 py-1 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700 mt-3 mb-2 transition">
                Get Data
              </button>
            </div>
            {branchMismatch && (
              <p className="text-red-600 text-sm font-semibold mb-6">
                ⚠️ Error: The income branch does not match the user's branch!
              </p>
            )}

            {/* Input Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label
                  htmlFor="card_qty"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Card Quantity
                </label>
                <input
                  type="text"
                  id="card_qty"
                  name="card_qty"
                  value={formData.card_qty}
                  onChange={handleInputChange}
                  disabled={branchMismatch}

                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="date"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Date
                </label>
                <input
                  type="text"
                  id="date"
                  name="date"
                  value={formatDate(formData.date)}
                  onChange={handleInputChange}
                  disabled={branchMismatch}

                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="fee"
                  className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                >
                  Fee
                </label>
                <input
                  type="text"
                  id="fee"
                  name="fee"
                  value={formatCurrency(formData.fee)}
                  onChange={handleInputChange}
                  disabled={branchMismatch}

                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

             
            </div>

            {/* Only show Agregator fields when branch is Agregator */}
            {formData.branch === "agregator" && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="relative col-span-2">
                  <h2 className="text-lg font-bold text-gray-800 mb-1">
                    Input Distribution Fee for {usersData.find(user => user.user_id === activeUser)?.name || 'User'}
                  </h2>
                  </div>
                <div className="relative">
                  <label
                    htmlFor="card_price"
                    className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                  >
                    Card Price
                  </label>
                  <input
                    type="text"
                    id="card_price"
                    name="card_price"
                    onChange={handleInputChange}
                    disabled={branchMismatch}

                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="chip_fee"
                    className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                  >
                    Chip Fee
                  </label>
                  <input
                    type="text"
                    id="chip_fee"
                    name="chip_fee"
                    onChange={handleInputChange}
                    disabled={branchMismatch}

                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="card_fee"
                    className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                  >
                    Card Fee
                  </label>
                  <input
                    type="text"
                    id="card_fee"
                    name="card_fee"
                    onChange={handleInputChange}
                    disabled={branchMismatch}

                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="bni_fee"
                    className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                  >
                    BNI Fee
                  </label>
                  <input
                    type="text"
                    id="bni_fee"
                    name="bni_fee"
                    onChange={handleInputChange}
                    disabled={branchMismatch}

                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="mdd_fee"
                    className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                  >
                    MDD Fee
                  </label>
                  <input
                    type="text"
                    id="mdd_fee"
                    name="mdd_fee"
                    onChange={handleInputChange}
                    disabled={branchMismatch}

                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="marketing_fee_percent"
                    className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1"
                  >
                    Marketing Fee %
                  </label>
                  <input
                    type="text"
                    id="marketing_fee_percent"
                    name="marketing_fee_percent"
                    onChange={handleInputChange}
                    disabled={branchMismatch}

                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative col-span-2">
                  <button
                    type="button"
                    onClick={() => {
                      calculateFee(); // Calculate the fee
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700 transition"
                  > 
                    Calculate
                  </button>
                </div>

              </div>
            )}

            <div className="relative col-span-2 flex justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={handleSaveData}
                className="px-2 py-1 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700"
              >
                Save Data
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="px-2 py-1 bg-gray-300 text-xs text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>

            {activeUser && (
              <div className="bg-white shadow-lg rounded-xl p-6 mt-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Distribution Data for {usersData.find(user => user.user_id === activeUser)?.name || 'User'}
                </h2>

                <div className="overflow-x-auto">
                  <table className="table-auto w-full bg-white shadow-md rounded-lg text-xs text-center">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1 border">Invoice Number</th>
                        <th className="px-2 py-1 border">Card Qty</th>
                        <th className="px-2 py-1 border">Fee</th>
                        <th className="px-2 py-1 border">Total Fee</th>
                        <th className="px-2 py-1 border">Tax</th>
                        <th className="px-2 py-1 border">Net Fee</th>
                        <th className="px-2 py-1 border">Payment Status</th>
                        <th className="px-2 py-1 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {distributionData
                        .filter((data) => data.username === usersData.find(user => user.user_id === activeUser)?.name)
                        .map((data, index) => (
                          <tr key={index} className="border">
                            <td className="px-2 py-1 border">{data.invoice_number}</td>
                            <td className="px-2 py-1 border">{data.card_qty}</td>
                            <td className="px-2 py-1 border">{formatCurrency(data.fee)}</td>
                            <td className="px-2 py-1 border">{formatCurrency(data.total_fee)}</td>
                            <td className="px-2 py-1 border">{formatCurrency(data.tax)}</td>
                            <td className="px-2 py-1 border">{formatCurrency(data.net_fee)}</td>
                            <td className="px-2 py-1 border">{data.payment_status}</td>
                            <td className="px-2 py-1 border">
                              <button className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 mr-1">
                                Edit
                              </button>
                              <button className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default Distribution;
