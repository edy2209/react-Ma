import React from 'react';
import SidebarP from './SidebarP'; // Import SidebarP component

const DashboardPeminjam = () => {
  return (
    <div>
      <SidebarP /> 
      <div className="ml-64 p-6 w-full">
        <h1 className="text-2xl font-bold">Ini dashboard Peminjam</h1>
        <p>Gunakan menu di sidebar untuk navigasi.</p>
      </div>
    </div>
  );
};

export default DashboardPeminjam;