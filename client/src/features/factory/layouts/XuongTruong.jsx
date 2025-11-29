import React from "react";
import SidebarXuongTruong from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { Outlet } from "react-router-dom";

export default function LayoutXuongTruong() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <SidebarXuongTruong />
      <div className="ml-64 flex-1 flex flex-col">
        <Header />
        <main className="p-8 flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
