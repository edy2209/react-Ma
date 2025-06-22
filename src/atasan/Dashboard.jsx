import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { FaUserCircle, FaBox, FaBoxOpen, FaChartBar, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';

  const [stat, setStat] = useState({
    totalBarang: 0,
    barangDipinjam: 0,
  });

  const [chartData, setChartData] = useState([
    { tanggal: 'Sen', jumlah: 5 },
    { tanggal: 'Sel', jumlah: 8 },
    { tanggal: 'Rab', jumlah: 4 },
    { tanggal: 'Kam', jumlah: 10 },
    { tanggal: 'Jum', jumlah: 7 },
    { tanggal: 'Sab', jumlah: 3 },
    { tanggal: 'Min', jumlah: 6 },
  ]);

  const [trend, setTrend] = useState({
    direction: 'up',
    percentage: 12,
  });

  // Warna untuk chart bars
  const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#3B82F6', '#60A5FA', '#93C5FD', '#3B82F6'];

  // Ambil data statistik peminjaman dari API
  useEffect(() => {
    fetch('http://localhost:8000/api/peminjaman')
      .then(res => res.json())
      .then(data => {
        // Kelompokkan berdasarkan tanggal_pinjam
        const perTanggal = {};
        data.forEach(item => {
          const tgl = item.tanggal_pinjam;
          if (!perTanggal[tgl]) perTanggal[tgl] = 0;
          perTanggal[tgl] += parseInt(item.jumlah) || 0;
        });
        // Ubah ke array untuk chart
        const chartArr = Object.entries(perTanggal).map(([tanggal, jumlah]) => ({
          tanggal,
          jumlah,
        }));
        setChartData(chartArr);
      });
  }, []);

  // Ambil total barang
  useEffect(() => {
    fetch('http://localhost:8000/api/statistik-barang')
      .then(res => res.json())
      .then(data => {
        setStat(stat => ({
          ...stat,
          totalBarang: data.totalBarang,
        }));
      });
  }, []);

  // Ambil total barang dipinjam dari API peminjaman
  useEffect(() => {
    fetch('http://localhost:8000/api/peminjaman')
      .then(res => res.json())
      .then(data => {
        // Jika data array, jumlahkan semua field jumlah
        const totalDipinjam = Array.isArray(data)
          ? data.reduce((sum, item) => sum + (parseInt(item.jumlah) || 0), 0)
          : 0;
        setStat(stat => ({
          ...stat,
          barangDipinjam: totalDipinjam,
        }));
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) =>
        prev.map((item) => ({
          ...item,
          jumlah: Math.max(0, item.jumlah + Math.floor(Math.random() * 3 - 1)),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Dropdown state & ref
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fungsi logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        {/* Header dengan profile bulat dan dropdown */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">Selamat datang kembali, {nama}!</p>
          </div>
          <div className="relative" ref={profileRef}>
            <button
              className="focus:outline-none flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-lg border border-blue-100"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow">
                <span className="text-white font-bold text-lg">
                  {nama.charAt(0)}
                </span>
              </div>
              <span className="font-medium text-gray-700">{nama}</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-10 overflow-hidden border border-gray-200">
                <div className="px-4 py-3 border-b text-gray-700 font-semibold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{nama.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-bold">{nama}</div>
                    <div className="text-xs text-gray-500">{user.email || 'user@example.com'}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-medium mb-2">Total Barang</p>
                <p className="text-4xl font-bold">{stat.totalBarang}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <FaBox className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                Semua aset tersedia
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-medium mb-2">Barang Dipinjam</p>
                <p className="text-4xl font-bold">{stat.barangDipinjam}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <FaBoxOpen className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <div className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
                {trend.direction === 'up' ? (
                  <FaArrowUp className="mr-1 text-green-300" />
                ) : (
                  <FaArrowDown className="mr-1 text-red-300" />
                )}
                <span>{trend.percentage}% dari minggu lalu</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-medium mb-2">Aktivitas Peminjaman</p>
                <p className="text-4xl font-bold">{chartData.reduce((sum, item) => sum + item.jumlah, 0)}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <FaChartBar className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                7 hari terakhir
              </div>
            </div>
          </div>
        </div>
        
        {/* Grafik */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Statistik Peminjaman per Hari</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                Minggu ini
              </button>
              <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-full text-sm font-medium">
                Bulan ini
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f8" />
                <XAxis 
                  dataKey="tanggal" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  allowDecimals={false} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f0f7ff' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e0e7ff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Ringkasan Aktivitas Terbaru */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Aktivitas Terbaru</h2>
          <div className="space-y-4">
            {chartData.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-blue-50/50 rounded-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <FaBoxOpen className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Peminjaman barang</h3>
                    <p className="text-gray-500 text-sm">{item.tanggal}</p>
                  </div>
                </div>
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {item.jumlah} item
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;