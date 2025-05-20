import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux"; // Import Provider from react-redux
import "./index.css";
import axios from "axios";
import LoginSignUp from "./pages/LoginSignUp";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Order from "./pages/Order";
import OperationalExpense from "./pages/OperasionalExpense";
import Stock from "./pages/Stock";
import CashAccount from "./pages/CashAccount";
import Distributon from "./pages/Distribution";
import Payment from "./pages/Payment";
import Asset from "./pages/Asset";
import Users from "./pages/Users";
import { store } from "./store/store.jsx"; // Import the store from store.js

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginSignUp />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/cash-account",
    element: <CashAccount />,
  },
  {
    path: "/income",
    element: <Income />,
  },
  {
    path: "/order",
    element: <Order />,
  },
  {
    path: "/operational-expense",
    element: <OperationalExpense />,
  },
  {
    path: "/distribution",
    element: <Distributon />,
  },
  {
    path: "/payment",
    element: <Payment />,
  },
  {
    path: "/stock",
    element: <Stock />,
  },
  {
    path: "/assets",
    element: <Asset />,
  },
  {
    path: "/users",
    element: <Users />,
  },
  {
    path: "*", // Handle any undefined routes
    element: <Dashboard />, // Redirect to the dashboard or a 404 page
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}> {/* Wrap your app with Provider */}
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
