import React, { useRef, useState } from 'react';
import SidebarP from './SidebarP';
import { FaUserCircle, FaDatabase, FaClipboardCheck, FaBoxOpen, FaHistory, FaChartBar } from 'react-icons/fa';
import PopupRating from '../popup/PopupRating';

const DashboardPeminjam = () => {
  const profileRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';
  const [stats] = useState({
    peminjamanAktif: 3,
    peminjamanSelesai: 7,
    asetTersedia: 24
  });

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SidebarP />
      
      <div className="ml-0 lg:ml-64 flex-1 p-4 md:p-6 transition-all duration-300">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="flex justify-between items-center p-4 md:px-6">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-800">Dashboard Peminjam</h1>
            </div>
            
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center gap-2 focus:outline-none group"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-200 to-blue-400 flex items-center justify-center shadow">
                  <FaUserCircle className="text-2xl text-blue-700" />
                </div>
                <span className="hidden md:block text-gray-700 font-medium">{nama}</span>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 overflow-hidden border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">Signed in as</p>
                    <p className="text-sm font-semibold truncate">{nama}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-3">
                Selamat Datang, <span className="text-yellow-300">{nama}</span>!
              </h1>
              <p className="text-blue-100 mb-4 max-w-2xl">
                Anda masuk sebagai <span className="font-semibold text-white">Peminjam</span>. 
                Gunakan menu di sidebar untuk mengelola aset, mengajukan peminjaman, dan melihat riwayat barang Anda.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="bg-blue-500 rounded-full p-2">
                    <FaUserCircle className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-100">Email Anda</p>
                    <p className="text-sm font-medium">{user?.email || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
                  alt="Dashboard Illustration"
                  className="w-full max-w-xs rounded-xl shadow-lg border-4 border-white/30"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartBar className="text-blue-500" /> Akses Cepat
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <a 
              href="/peminjam/data-aset" 
              className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <FaDatabase className="text-blue-600 text-2xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Data Aset</h3>
              <p className="text-gray-500 text-sm mb-4">Lihat seluruh aset yang tersedia untuk dipinjam</p>
              <div className="mt-auto w-full">
                <button className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition">
                  Akses
                </button>
              </div>
            </a>
            
            <a 
              href="/peminjam/ajukan-peminjaman" 
              className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <FaClipboardCheck className="text-green-600 text-2xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Ajukan Peminjaman</h3>
              <p className="text-gray-500 text-sm mb-4">Ajukan peminjaman barang dengan mudah dan cepat</p>
              <div className="mt-auto w-full">
                <button className="w-full py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition">
                  Ajukan
                </button>
              </div>
            </a>
            
            <a 
              href="/peminjam/barang-dipinjam" 
              className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <FaBoxOpen className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Barang Dipinjam</h3>
              <p className="text-gray-500 text-sm mb-4">Pantau status barang yang sedang Anda pinjam</p>
              <div className="mt-auto w-full">
                <button className="w-full py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition">
                  Lihat
                </button>
              </div>
            </a>
            
            <a 
              href="/peminjam/riwayat-peminjaman" 
              className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <FaHistory className="text-purple-600 text-2xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Riwayat Peminjaman</h3>
              <p className="text-gray-500 text-sm mb-4">Lihat semua riwayat peminjaman Anda</p>
              <div className="mt-auto w-full">
                <button className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition">
                  Riwayat
                </button>
              </div>
            </a>
          </div>
        </div>
        
        {/* Popup Rating */}
        <PopupRating userId={user?.id} />
        
        {/* Footer */}
        <div className="mt-10 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} MA-ERKK &mdash; Dashboard Peminjam. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default DashboardPeminjam;