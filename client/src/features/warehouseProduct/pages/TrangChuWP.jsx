import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar.jsx';
import Header from '../components/header.jsx';
import Welcome from '../components/welcome.jsx';

export default function TrangChu() {
  const [activeMenu, setActiveMenu] = useState('home');
  const [orderCount, setOrderCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);

  useEffect(() => {
    // Dữ liệu cho sidebar, có thể fetch từ API
    setOrderCount(15); // ví dụ
    setApprovedCount(); // ví dụ
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        orderCount={orderCount}
        approvedCount={approvedCount}
      />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex flex-1 items-center justify-center">
  <Welcome />
</main>
      </div>
    </div>
  );
}