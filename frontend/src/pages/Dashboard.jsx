import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Sidebar from "../components/Sidebar";
import { useSelector } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Dashboard() {
  const barChartRef = useRef();
  const lineChartRef = useRef();
  const pieChartRef = useRef();
  const areaChartRef = useRef();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="flex">
      <Sidebar />
      <div>
      {isAuthenticated ? (
        <h1>Welcome, {user.role}</h1>
      ) : (
        <h1>Please log in</h1>
      )}
    </div>
    </div>
  );
}

export default Dashboard;
