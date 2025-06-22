import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaFileAlt, FaTools, FaClipboardList, 
  FaUndo, FaMoneyBillAlt, FaCheckCircle, FaStar 
} from 'react-icons/fa';

const Sidebar = () => {
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
          to="/dashboard-a" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/dashboard-a') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/dashboard-a') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaHome className="text-lg" />
          </div>
          <span className="text-base font-medium">Dashboard</span>
        </Link>
        
        <Link 
          to="/atasan/konfirmasi-peminjaman" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/atasan/konfirmasi-peminjaman') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/atasan/konfirmasi-peminjaman') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaCheckCircle className="text-lg" />
          </div>
          <span className="text-base font-medium">Konfirmasi Peminjaman</span>
        </Link>
        
        <Link 
          to="/atasan/laporan-aset" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/atasan/laporan-aset') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/atasan/laporan-aset') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaFileAlt className="text-lg" />
          </div>
          <span className="text-base font-medium">Detail Aset</span>
        </Link>
        
        <Link 
          to="/atasan/status-maintenance" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/atasan/status-maintenance') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/atasan/status-maintenance') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaTools className="text-lg" />
          </div>
          <span className="text-base font-medium">Status Maintenance</span>
        </Link>
        
        <Link 
          to="/atasan/laporan-peminjaman" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/atasan/laporan-peminjaman') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/atasan/laporan-peminjaman') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaClipboardList className="text-lg" />
          </div>
          <span className="text-base font-medium">Laporan Peminjaman</span>
        </Link>
        
        <Link 
          to="/atasan/laporan-pengembalian" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/atasan/laporan-pengembalian') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/atasan/laporan-pengembalian') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaUndo className="text-lg" />
          </div>
          <span className="text-base font-medium">Laporan Pengembalian</span>
        </Link>
        
        <Link 
          to="/atasan/denda-user" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/atasan/denda-user') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/atasan/denda-user') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaMoneyBillAlt className="text-lg" />
          </div>
          <span className="text-base font-medium">Denda User</span>
        </Link>
        
        <Link 
          to="/atasan/rating" 
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
            isActive('/atasan/rating') 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
              : 'hover:bg-gray-700/60'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isActive('/atasan/rating') ? 'bg-blue-700' : 'bg-gray-700'
          }`}>
            <FaStar className="text-lg" />
          </div>
          <span className="text-base font-medium">Feedback Pengguna</span>
        </Link>
      </nav>
      
      {/* Footer dengan copyright */}
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

export default Sidebar;