import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";


const OrderLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <Header />
        <div className="p-8 flex-1">
            <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OrderLayout;
