import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaUserCircle } from 'react-icons/fa';

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
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-6 w-full">
        {/* Header dengan profile bulat dan dropdown */}
        <div className="flex justify-end items-center mb-6">
          <div className="relative" ref={profileRef}>
            <button
              className="focus:outline-none"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shadow">
                <FaUserCircle className="text-3xl text-gray-600" />
              </div>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow z-10">
                <div className="px-4 py-2 border-b text-gray-700 font-semibold">{nama}</div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4">Selamat Datang! {nama}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded p-6">
            <p className="text-gray-500">Jumlah Barang</p>
            <p className="text-3xl font-bold">{stat.totalBarang}</p>
          </div>
          <div className="bg-white shadow rounded p-6">
            <p className="text-gray-500">Barang Dipinjam</p>
            <p className="text-3xl font-bold">{stat.barangDipinjam}</p>
          </div>
        </div>
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Statistik Peminjaman per Hari</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tanggal" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;