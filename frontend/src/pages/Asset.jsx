import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Update from '../assets/update.png';
import Delete from '../assets/delete.png';
import { useSelector } from 'react-redux';


function Asset() {
  const [assetData, setAssetData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    asset_name: '',
    purchase_price: '',
    purchase_date: '',
    expected_usage_years: '',
    category: '',
  });
  const [categories, setCategories] = useState([
    'Electronics', 'Furniture', 'Vehicles', 'Real Estate', 'Others'
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";


  useEffect(() => {
    fetchAssetData();
  }, []);

  const fetchAssetData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/assets/get-all');
      setAssetData(response.data);
    } catch (error) {
      console.error('Error fetching asset data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, category: value });
    if (value === 'add_more') {
      setIsCustomCategory(true); // Show input field for custom category
    } else {
      setIsCustomCategory(false); // Hide custom category input
    }
  };

  const handleAddNewData = async () => {
    try {
      await axios.post('http://localhost:3000/assets/add', formData);
      setFormData({
        asset_name: '',
        purchase_price: '',
        purchase_date: '',
        expected_usage_years: '',
        category: '',
      });
      setShowAddForm(false);
      fetchAssetData();
    } catch (error) {
      console.error('Error adding new asset:', error);
    }
  };

  const handleUpdateData = async () => {
    try {
      await axios.put(`http://localhost:3000/assets/${formData.asset_id}`, {
        ...formData,
      });
  
      setShowUpdateForm(false);
      fetchAssetData();
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };
  

  const handleEditClick = (asset) => {
    setFormData({
      asset_id: asset.asset_id, // Ensure correct ID
      asset_name: asset.asset_name,
      purchase_price: asset.purchase_price,
      purchase_date: formatDateForInput(asset.purchase_date),
      expected_usage_years: asset.expected_usage_years,
      category: asset.category,
    });
    setShowUpdateForm(true);
  };
  

  const handleDeleteData = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/assets/${id}`);
      fetchAssetData();
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 10);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-4 max-w-[95%] mx-auto text-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-700">Assets</h1>
            <button
              onClick={() => isAdmin && setShowAddForm(!showAddForm)}
              disabled={!isAdmin}
              className={`px-2 py-1 text-xs font-semibold rounded-md ${
                isAdmin
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              + Add New Asset
            </button>
        </div>

        {showAddForm && (
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h1 className='mb-4 text-lg font-bold text-gray-700'>Add Asset</h1>
            <div className="grid grid-cols-6 gap-4">
              <div className="relative col-span-2">
                <label htmlFor="asset_name" className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  id="asset_name"
                  name="asset_name"
                  value={formData.asset_name}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="purchase_price" className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1">
                  Purchase Price
                </label>
                <input
                  type="number"
                  id="purchase_price"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="purchase_date" className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  id="purchase_date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="expected_usage_years" className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1">
                  Expected Usage (Years)
                </label>
                <input
                  type="number"
                  id="expected_usage_years"
                  name="expected_usage_years"
                  value={formData.expected_usage_years}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="category" className="absolute text-xs text-gray-500 -top-2 left-2 bg-white px-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                  <option value="add_more">+ Add More</option>
                </select>
              </div>


              {isCustomCategory && (
                <div className="relative col-span-2 mt-4">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="New category"
                  />
                  <button
                    onClick={() => {
                      if (newCategory && !categories.includes(newCategory)) {
                        setCategories([...categories, newCategory]);
                        setFormData({ ...formData, category: newCategory });
                        setNewCategory('');
                      }
                    }}
                    className="mt-2 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700"
                  >
                    Add Category
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button onClick={() => setShowAddForm(false)} className="px-2 py-1 bg-gray-300 text-xs text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
              <button onClick={handleAddNewData} className="px-2 py-1 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700">Save</button>
            </div>
          </div>
        )}

        {showUpdateForm && (
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h1 className='mb-4 text-lg font-bold text-gray-700'>Update Asset</h1>
            <div className="grid grid-cols-6 gap-4">
              <div className="relative col-span-2">
                <label htmlFor="asset_name" className="text-xs text-gray-500">Asset Name</label>
                <input
                  type="text"
                  id="asset_name"
                  name="asset_name"
                  value={formData.asset_name}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border rounded-md"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="purchase_price" className="text-xs text-gray-500">Purchase Price</label>
                <input
                  type="number"
                  id="purchase_price"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border rounded-md"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="purchase_date" className="text-xs text-gray-500">Purchase Date</label>
                <input
                  type="date"
                  id="purchase_date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border rounded-md"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="expected_usage_years" className="text-xs text-gray-500">Expected Usage (Years)</label>
                <input
                  type="number"
                  id="expected_usage_years"
                  name="expected_usage_years"
                  value={formData.expected_usage_years}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border rounded-md"
                />
              </div>

              <div className="relative col-span-2">
                <label htmlFor="category" className="text-xs text-gray-500">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-2 py-2 border rounded-md"
                >
                  <option value="">Select Category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button onClick={() => setShowUpdateForm(false)} className="px-2 py-1 bg-gray-300 rounded-md">Cancel</button>
              <button onClick={() => handleUpdateData(formData.asset_id)} className="px-2 py-1 bg-blue-600 text-white rounded-md">Update</button>
            </div>
          </div>
        )}

        {/* Render Asset Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-white shadow-md rounded-lg text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">No</th>
                <th className="px-2 py-1 border">Asset Name</th>
                <th className="px-2 py-1 border">Purchase Price</th>
                <th className="px-2 py-1 border">Purchase Date</th>
                <th className="px-2 py-1 border">Expected Usage</th>
                <th className="px-2 py-1 border">Annual Amortization</th>
                <th className="px-2 py-1 border">Monthly Amortization</th>
                <th className="px-2 py-1 border">Category</th>
                <th className="px-2 py-1 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assetData.map((asset, index) => (
                <tr key={asset.asset_id}>
                  <td className="px-2 py-1 border">{index + 1}</td>
                  <td className="px-2 py-1 border">{asset.asset_name}</td>
                  <td className="px-2 py-1 border">{formatCurrency(asset.purchase_price)}</td>
                  <td className="px-2 py-1 border">{formatDateForInput(asset.purchase_date)}</td>
                  <td className="px-2 py-1 border">{asset.expected_usage_years}</td>
                  <td className="px-2 py-1 border">{formatCurrency(asset.annual_amortization)}</td>
                  <td className="px-2 py-1 border">{formatCurrency(asset.monthly_amortization)}</td>
                  <td className="px-2 py-1 border">{asset.category}</td>
                  <td className="px-2 py-1 border text-right">
                    <div className="flex justify-center">
                      {/* Update Button */}
                      <div className="relative group">
                        <img
                          src={Update}
                          alt="update"
                          className={`h-6 w-6 mr-1 ${isAdmin ? "cursor-pointer" : "cursor-not-allowed"}`}
                          onClick={() => isAdmin && handleEditClick(asset)}
                        />
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
                          onClick={() => isAdmin && handleDeleteData(asset.asset_id)}
                        />
                        <span className="absolute left-1/2 bottom-6 mb-2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs px-2 py-1 rounded-md after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-full after:border-4 after:border-transparent after:border-t-gray-800">
                          Delete
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Asset;
