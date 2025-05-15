import React from 'react';
import { Link } from 'react-router-dom';
import { FaDatabase, FaClipboardCheck, FaHistory } from 'react-icons/fa';

const SidebarP = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed">
      <div className="p-4 font-bold text-xl border-b border-gray-700">MA-ERKK</div>
      <nav className="mt-4 flex flex-col gap-4 p-4">
        <Link to="/peminjam/data-aset" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaDatabase className="text-xl" />
          <span className="text-lg">Melihat Data Aset</span>
        </Link>
        <Link to="/peminjam/ajukan-peminjaman" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaClipboardCheck className="text-xl" />
          <span className="text-lg">Mengajukan Peminjaman</span>
        </Link>
        <Link to="/peminjam/riwayat-peminjaman" className="flex items-center gap-3 hover:bg-gray-700 p-2 rounded">
          <FaHistory className="text-xl" />
          <span className="text-lg">Riwayat Peminjaman Pribadi</span>
        </Link>
      </nav>
    </div>
  );
};

export default SidebarP;