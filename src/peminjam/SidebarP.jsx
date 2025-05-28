import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaDatabase, FaClipboardCheck, FaBoxOpen, FaUndo, FaMoneyBillWave } from 'react-icons/fa';

const SidebarP = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed">
      <div className="p-4 font-bold text-xl border-b border-gray-700">MA-ERKK</div>
      <nav className="mt-4 flex flex-col gap-4 p-4">
        <Link to="/dashboard-p" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaHome className="text-xl" />
          <span className="text-lg">Dashboard</span>
        </Link>
        <Link to="/peminjam/data-aset" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaDatabase className="text-xl" />
          <span className="text-lg">Melihat Data Aset</span>
        </Link>
        <Link to="/peminjam/ajukan-peminjaman" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaClipboardCheck className="text-xl" />
          <span className="text-lg">Mengajukan Peminjaman</span>
        </Link>
        <Link to="/peminjam/barang-dipinjam" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaBoxOpen className="text-xl" />
          <span className="text-lg">Barang Dipinjam</span>
        </Link>
        <Link to="/peminjam/barang-dikembalikan" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaUndo className="text-xl" />
          <span className="text-lg">Barang Dikembalikan</span>
        </Link>
        <Link to="/peminjam/denda" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaMoneyBillWave className="text-xl" />
          <span className="text-lg">Melihat Denda</span>
        </Link>
      </nav>
    </div>
  );
};

export default SidebarP;
