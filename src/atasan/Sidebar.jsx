import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaFileAlt, FaTools, FaClipboardList, FaUndo, FaMoneyBillAlt } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed font-sans">
      <div className="p-4 font-bold text-2xl border-b border-gray-700">MA-ERKK</div>
      <nav className="mt-4 flex flex-col gap-4 p-4">
        <Link to="/dashboard-a" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaHome className="text-xl" />
          <span className="text-lg">Dashboard</span>
        </Link>
        <Link to="/atasan/laporan-aset" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaFileAlt className="text-xl" />
          <span className="text-lg">Detail Aset</span>
        </Link>
        <Link to="/atasan/status-maintenance" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaTools className="text-xl" />
          <span className="text-lg">Status Maintenance</span>
        </Link>
        <Link to="/atasan/laporan-peminjaman" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaClipboardList className="text-xl" />
          <span className="text-lg">Laporan Peminjaman</span>
        </Link>
        {/* Tambahan fitur baru */}
        <Link to="/atasan/laporan-pengembalian" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaUndo className="text-xl" />
          <span className="text-lg">Laporan Pengembalian</span>
        </Link>
        <Link to="/atasan/denda-user" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaMoneyBillAlt className="text-xl" />
          <span className="text-lg">Denda User</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
