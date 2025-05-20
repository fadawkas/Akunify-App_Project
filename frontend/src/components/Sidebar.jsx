import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice"; // Import logout action
import { useNavigate } from "react-router-dom"; // Import navigate to redirect user
import Logo from "../assets/akunify_bg.png";
import Dashboard from "../assets/dashboard-white.png";
import Cash from "../assets/cash-icon.png";
import Income from "../assets/income.png";
import Stock from "../assets/inventory.png";
import Expenditure from "../assets/expenditure.png";
import Assets from "../assets/assets_new.png";
import Users from "../assets/users.png";
import Logout from "../assets/logout.png";

function Sidebar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const expenditureRef = useRef(null); // Reference for Expenditure dropdown
  const profileRef = useRef(null); // Reference for Profile dropdown

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
  // Clear Redux state
  dispatch(logout());

  // Remove JWT token
  localStorage.removeItem("token");

  // Optionally clear Axios auth header (extra safety)
  delete axios.defaults.headers.common["Authorization"];

  // Redirect to login
  navigate("/");
};

  const toggleExpenditureDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the Expenditure dropdown
      if (expenditureRef.current && !expenditureRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      // Check if the click is outside the Profile dropdown
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="w-20 bg-blue-900 text-white flex flex-col h-screen"> 
        {/* Header Section */}
        <div className="relative">
          <div
            className="flex flex-col items-center py-3 px-2 bg-blue-900 shadow-md cursor-pointer"
            onClick={toggleProfileDropdown}
          >
            <div className="flex-shrink-0 bg-white h-10 w-10 rounded-full flex items-center justify-center">
              <img alt="Your Company" src={Logo} className="h-8 w-8" /> 
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col mt-2 space-y-1 px-1 flex-grow"> 
          <Link
            to="/dashboard"
            className="group flex justify-center items-center px-2 py-1 rounded-md hover:bg-blue-800 text-xs font-medium"
          >
            <div className="relative group">
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-14 px-3 py-2 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                whitespace-nowrap pointer-events-none
                before:content-[''] before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:border-y-[10px] before:border-y-transparent before:border-r-[10px] before:border-r-black z-[9999]"
              >
                Dashboard
              </div>
              <img src={Dashboard} alt="dashboard" className="w-10" /> 
            </div>
          </Link>
          <Link
            to="/cash-account"
            className="group flex justify-center items-center px-2 py-1 rounded-md hover:bg-blue-800 text-xs font-medium"
          >
            <div className="relative">
              <img src={Cash} alt="dashboard" className="w-8" /> 
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-14 px-3 py-2 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                whitespace-nowrap pointer-events-none z-[9999]"
              >
                Cash Account
              </div>
            </div>
          </Link>
          <Link
            to="/income"
            className="group flex justify-center items-center px-2 py-1 rounded-md hover:bg-blue-800 text-xs font-medium"
          >
            <div className="relative group">
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-14 px-3 py-2 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                whitespace-nowrap pointer-events-none z-[9999]"
              >
                Income
              </div>
              <img src={Income} alt="dashboard" className="w-8" /> 
            </div>
          </Link>
          <div className="py-2">
            {/* Button to toggle dropdown */}
            <button
              ref={expenditureRef}
              onClick={toggleExpenditureDropdown}
              className="flex justify-center px-2 py-1 rounded-md hover:bg-blue-800 text-xs font-medium w-full text-left"
            >
              <div className="relative group">
                {/* Tooltip-like box */}
                <div
                  className={`absolute left-full top-1/2 -translate-y-1/2 ml-14 px-4 py-2 bg-black text-white text-sm rounded-md transition-opacity whitespace-nowrap
                    before:content-[''] before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:border-y-[10px] before:border-y-transparent before:border-r-[10px] before:border-r-black z-[9999]
                    ${isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                  {/* Show "Expenditure" only on hover unless dropdown is open */}
                  {isDropdownOpen ? (
                    <div>
                      <div>Expenditure</div>
                      <div className="mt-1 space-y-1">
                        {[{ path: "/order", label: "Order" }, { path: "/payment", label: "Payment" }, { path: "/distribution", label: "Distribution" }, { path: "/operational-expense", label: "Operational" }]
                          .map(({ path, label }) => (
                            <Link
                              key={path}
                              to={path}
                              className="block text-white px-2 py-1 rounded-md hover:bg-blue-800 text-xs font-medium"
                            >
                              {label}
                            </Link>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <span>Expenditure</span>
                  )}
                </div>

                {/* Icon */}
                <img src={Expenditure} alt="expenditure" className="w-8" /> 
              </div>
            </button>
          </div>

          <Link
            to="/stock"
            className="group flex justify-center items-center px-2 py-1 rounded-md hover:bg-blue-800 text-xs font-medium"
          >
            <div className="relative group">
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-14 px-3 py-2 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                whitespace-nowrap pointer-events-none z-[9999]"
              >
                Stock
              </div>
              <img src={Stock} alt="dashboard" className="w-8" /> 
            </div>
          </Link>
          <Link
            to="/assets"
            className="group flex justify-center items-center px-2 py-3 rounded-md hover:bg-blue-800 text-xs font-medium"
          >
            <div className="relative group">
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-14 px-3 py-2 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                whitespace-nowrap pointer-events-none z-[9999]"
              >
                Assets
              </div>
              <img src={Assets} alt="dashboard" className="w-10" /> 
            </div>
          </Link>
          <Link
            to="/users"
            className="group flex justify-center items-center px-2 py-3 rounded-md hover:bg-blue-800 text-xs font-medium"
          >
            <div className="relative group">
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-14 px-3 py-2 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity
                whitespace-nowrap pointer-events-none z-[9999]"
              >
                Users
              </div>
              <img src={Users} alt="dashboard" className="w-8" /> 
            </div>
          </Link>
        </nav>

        {/* Settings and Logout positioned at the bottom */}
        <div className="mt-auto"> {/* Use mt-auto to push them to the bottom */}
          
          <Link
            to="/#"
            onClick={handleLogout} 
            className="flex justify-center px-2 py-4 rounded-md hover:bg-blue-800 text-xs font-medium"
          >
            <div className="relative group">
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-10 px-4 py-2 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity 
                whitespace-nowrap
                before:content-[''] before:absolute before:-left-4 before:top-1/2 before:-translate-y-1/2 before:border-y-[12px] before:border-y-transparent before:border-r-[12px] before:border-r-black z-[9999]"
              >
                Logout
              </div>
              <img src={Logout} alt="dashboard" className="w-8" /> 
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
