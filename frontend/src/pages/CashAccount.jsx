import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

function CashAccount() {
  const [totalBalance, setTotalBalance] = useState(0);
  const [acalapatiBalance, setAcalapatiBalance] = useState(0);
  const [agregatorBalance, setAgregatorBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(""); // Track which branch is selected for transactions

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

  useEffect(() => {
    fetchTotalBalance();
    fetchAcalapatiBalance();
    fetchAgregatorBalance();
  }, []);

  // Fetch total balance from the backend
  const fetchTotalBalance = async () => {
    try {
      const response = await axios.get("http://localhost:3000/cash/balance-all");
      setTotalBalance(response.data.total_balance);
    } catch (error) {
      console.error("Error fetching total balance:", error);
    }
  };

  // Fetch Acalapati balance from the backend
  const fetchAcalapatiBalance = async () => {
    try {
      const response = await axios.get("http://localhost:3000/cash/balance-acalapati");
      setAcalapatiBalance(response.data.total_balance);
    } catch (error) {
      console.error("Error fetching Acalapati balance:", error);
    }
  };

  // Fetch Agregator balance from the backend
  const fetchAgregatorBalance = async () => {
    try {
      const response = await axios.get("http://localhost:3000/cash/balance-agregator");
      setAgregatorBalance(response.data.total_balance);
    } catch (error) {
      console.error("Error fetching Agregator balance:", error);
    }
  };

  // Fetch recent transactions based on the selected branch
  const fetchRecentTransactions = async (branch) => {
    try {
      const response = await axios.get(`http://localhost:3000/cash/recent-transactions-${branch}`);
      setRecentTransactions(response.data);
      setSelectedBranch(branch);
    } catch (error) {
      console.error(`Error fetching ${branch} recent transactions:`, error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-4 max-w-[95%] mx-auto text-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-700">Cash Account</h1>
        </div>

        <div className="flex flex-col gap-6">
          {/* Static Cards for Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Balance Card */}
            <div
              className="bg-white shadow-lg rounded-lg p-4 w-full cursor-pointer hover:shadow-xl transition duration-300"
              onClick={() => fetchRecentTransactions("all")}
            >
              <div className="font-semibold text-lg mb-3">Total Balance</div>
              <div className="font-semibold text-xl">{formatCurrency(totalBalance)}</div>
            </div>

            {/* Acalapati Balance Card */}
            <div
              className="bg-white shadow-lg rounded-lg p-4 w-full cursor-pointer hover:shadow-xl transition duration-300"
              onClick={() => fetchRecentTransactions("acalapati")}
            >
              <div className="font-semibold text-lg mb-3">Acalapati Balance</div>
              <div className="font-semibold text-xl">{formatCurrency(acalapatiBalance)}</div>
            </div>

            {/* Agregator Balance Card */}
            <div
              className="bg-white shadow-lg rounded-lg p-4 w-full cursor-pointer hover:shadow-xl transition duration-300"
              onClick={() => fetchRecentTransactions("agregator")}
            >
              <div className="font-semibold text-lg mb-3">Agregator Balance</div>
              <div className="font-semibold text-xl">{formatCurrency(agregatorBalance)}</div>
            </div>
          </div>

          {/* Show the recent transactions table if data is available */}
          {recentTransactions.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6 mt-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">
                Recent Transactions for {selectedBranch.charAt(0).toUpperCase() + selectedBranch.slice(1)}
              </h2>
              <table className="table-auto w-full bg-white shadow-md rounded-lg text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1 border">Invoice Number</th>
                    <th className="px-2 py-1 border">Income</th>
                    <th className="px-2 py-1 border">Expense</th>
                    <th className="px-2 py-1 border">Net (Income - Expense)</th>
                    <th className="px-2 py-1 border">Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction, index) => (
                    <tr key={index}>
                      <td className="px-2 py-1 border">{transaction.invoice_number}</td>
                      <td className="px-2 py-1 border">{formatCurrency(transaction.income)}</td>
                      <td className="px-2 py-1 border">{formatCurrency(transaction.expense)}</td>
                      <td className="px-2 py-1 border">{formatCurrency(transaction.net)}</td>
                      <td className="px-2 py-1 border">{formatDate(transaction.payment_date)}</td>
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
}

export default CashAccount;
