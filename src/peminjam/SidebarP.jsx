import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaDatabase, FaClipboardCheck, FaBoxOpen, 
  FaUndo, FaMoneyBillWave, FaHistory 
} from 'react-icons/fa';

const SidebarP = () => {
  const location = useLocation();
  
  // Fungsi untuk menentukan apakah link aktif
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed flex flex-col shadow-2xl z-30">
      {/* Header dengan logo */}
      <div className="p-6 border-b border-gray-700 flex flex-col items-center">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <span className="text-2xl font-bold text-white">MA</span>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">MA-ERKK</h2>
          <p className="text-xs text-gray-400 mt-1">Asset Management System</p>
        </div>
      </div>
      
      {/* Menu Navigasi */}
      <nav className="mt-4 flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
        <Link 
          to="/dashboard-p" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/dashboard-p') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/dashboard-p') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaHome className="text-lg" />
          </div>
          <span className="text-base font-medium">Dashboard</span>
        </Link>
        
        <Link 
          to="/peminjam/data-aset" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/peminjam/data-aset') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/peminjam/data-aset') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaDatabase className="text-lg" />
          </div>
          <span className="text-base font-medium">Melihat Data Aset</span>
        </Link>
        
        <Link 
          to="/peminjam/ajukan-peminjaman" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/peminjam/ajukan-peminjaman') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/peminjam/ajukan-peminjaman') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaClipboardCheck className="text-lg" />
          </div>
          <span className="text-base font-medium">Mengajukan Peminjaman</span>
        </Link>
        
        <Link 
          to="/peminjam/barang-dipinjam" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/peminjam/barang-dipinjam') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/peminjam/barang-dipinjam') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaBoxOpen className="text-lg" />
          </div>
          <span className="text-base font-medium">Barang Dipinjam</span>
        </Link>
        
        <Link 
          to="/peminjam/barang-dikembalikan" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/peminjam/barang-dikembalikan') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/peminjam/barang-dikembalikan') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaUndo className="text-lg" />
          </div>
          <span className="text-base font-medium">Barang Dikembalikan</span>
        </Link>
        
        <Link 
          to="/peminjam/denda" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/peminjam/denda') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/peminjam/denda') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaMoneyBillWave className="text-lg" />
          </div>
          <span className="text-base font-medium">Melihat Denda</span>
        </Link>
        
        <Link 
          to="/peminjam/history-denda" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/peminjam/history-denda') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/peminjam/history-denda') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaHistory className="text-lg" />
          </div>
          <span className="text-base font-medium">History Denda</span>
        </Link>
      </nav>
      
      {/* Footer dengan copyright - ditempatkan di bagian paling bawah */}
      <div className="mt-auto p-4 border-t border-gray-700">
        <div className="text-center text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} MA-ERKK Asset Management</p>
          <p className="mt-1">All rights reserved</p>
        </div>
      </div>
      
      {/* Efek visual modern */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
    </div>
  );
};

export default SidebarP;