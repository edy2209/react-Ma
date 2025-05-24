import React, { useRef, useState } from 'react';
import SidebarP from './SidebarP';
import { FaUserCircle } from 'react-icons/fa';

const DashboardPeminjam = () => {
  const profileRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <SidebarP />
      <div className="ml-64 p-8 w-full flex flex-col">
        {/* Profile Header */}
        <div className="flex justify-end items-center mb-8">
          <div className="relative" ref={profileRef}>
            <button
              className="focus:outline-none"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-200 to-blue-400 flex items-center justify-center shadow-lg border-2 border-white">
                <FaUserCircle className="text-4xl text-blue-700" />
              </div>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10">
                <div className="px-4 py-3 border-b text-blue-700 font-bold text-lg">{nama}</div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-blue-50 rounded-b-xl"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl shadow-2xl p-8 mb-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg">
              Selamat Datang, <span className="text-yellow-300">{nama}</span>!
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-4">
              Anda masuk sebagai <span className="font-semibold text-white">Peminjam</span>.<br />
              Silakan gunakan menu di sidebar untuk mengelola aset, mengajukan peminjaman, dan melihat riwayat barang Anda.
            </p>
            <div className="flex gap-4 mt-6">
              <div className="bg-white/80 rounded-xl px-6 py-4 shadow flex flex-col items-center">
                <span className="text-blue-700 font-bold text-2xl">
                  <FaUserCircle className="inline mr-2" />
                  {user?.email || '-'}
                </span>
                <span className="text-xs text-blue-500 mt-1">Email Anda</span>
              </div>
              {/* Tambah info lain jika perlu */}
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
              alt="Dashboard Illustration"
              className="w-72 md:w-96 drop-shadow-xl rounded-2xl"
              draggable={false}
            />
          </div>
        </div>

        {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="relative bg-gradient-to-br from-blue-100 via-white to-blue-200 rounded-2xl shadow-2xl p-8 flex flex-col items-center group overflow-hidden hover:scale-[1.03] transition-transform duration-300">
          <div className="absolute -top-8 -right-8 opacity-20 group-hover:opacity-40 transition">
            <svg width="120" height="120"><circle cx="60" cy="60" r="60" fill="#3b82f6" /></svg>
          </div>
          <div className="bg-blue-600 text-white rounded-full p-4 mb-4 shadow-lg group-hover:scale-110 transition">
            <i className="fas fa-database text-3xl"></i>
          </div>
          <span className="font-extrabold text-xl mb-1 text-blue-700 tracking-wide">Data Aset</span>
          <span className="text-gray-500 text-sm text-center mb-4">Lihat seluruh aset yang tersedia untuk dipinjam.</span>
          <a
            href="/peminjam/data-aset"
            className="mt-auto px-5 py-2 rounded-full bg-blue-500 text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            Lihat Data
          </a>
        </div>
        <div className="relative bg-gradient-to-br from-green-100 via-white to-green-200 rounded-2xl shadow-2xl p-8 flex flex-col items-center group overflow-hidden hover:scale-[1.03] transition-transform duration-300">
          <div className="absolute -top-8 -right-8 opacity-20 group-hover:opacity-40 transition">
            <svg width="120" height="120"><circle cx="60" cy="60" r="60" fill="#22c55e" /></svg>
          </div>
          <div className="bg-green-500 text-white rounded-full p-4 mb-4 shadow-lg group-hover:scale-110 transition">
            <i className="fas fa-clipboard-check text-3xl"></i>
          </div>
          <span className="font-extrabold text-xl mb-1 text-green-700 tracking-wide">Ajukan Peminjaman</span>
          <span className="text-gray-500 text-sm text-center mb-4">Ajukan peminjaman barang dengan mudah dan cepat.</span>
          <a
            href="/peminjam/ajukan-peminjaman"
            className="mt-auto px-5 py-2 rounded-full bg-green-500 text-white font-semibold shadow hover:bg-green-700 transition"
          >
            Ajukan
          </a>
        </div>
        <div className="relative bg-gradient-to-br from-yellow-100 via-white to-yellow-200 rounded-2xl shadow-2xl p-8 flex flex-col items-center group overflow-hidden hover:scale-[1.03] transition-transform duration-300">
          <div className="absolute -top-8 -right-8 opacity-20 group-hover:opacity-40 transition">
            <svg width="120" height="120"><circle cx="60" cy="60" r="60" fill="#facc15" /></svg>
          </div>
          <div className="bg-yellow-400 text-white rounded-full p-4 mb-4 shadow-lg group-hover:scale-110 transition">
            <i className="fas fa-box-open text-3xl"></i>
          </div>
          <span className="font-extrabold text-xl mb-1 text-yellow-700 tracking-wide">Barang Dipinjam</span>
          <span className="text-gray-500 text-sm text-center mb-4">Pantau status barang yang sedang Anda pinjam.</span>
          <a
            href="/peminjam/barang-dipinjam"
            className="mt-auto px-5 py-2 rounded-full bg-yellow-400 text-white font-semibold shadow hover:bg-yellow-500 transition"
          >
            Lihat Barang
          </a>
        </div>
      </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} MA-ERKK &mdash; Dashboard Peminjam. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default DashboardPeminjam;