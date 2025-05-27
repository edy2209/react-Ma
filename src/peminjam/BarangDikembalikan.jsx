import React, { useEffect, useState, useRef } from 'react';
import SidebarP from './SidebarP';
import { FaUserCircle, FaSearch, FaBoxOpen, FaUndoAlt, FaCheckCircle } from 'react-icons/fa';

const BarangDikembalikan = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';

  // Fetch data pengembalian dari API
  useEffect(() => {
    fetch('http://localhost:8000/api/pengembalian')
      .then(res => res.json())
      .then(res => {
        // Filter hanya pengembalian milik user ini
        const userId = user?.id;
        const filtered = res.filter(
          d => d.peminjam_id === userId || d.peminjam?.id === userId
        );
        setData(filtered);
        setLoading(false);
      });
  }, [user]);

  // Dropdown profile logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // Filter data berdasarkan search
  const filteredData = data.filter((p) =>
    (p.barang?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <SidebarP />
      <div className="ml-64 w-full min-h-screen flex flex-col px-6 py-10">
        {/* Header profile dengan dropdown */}
        <div className="flex justify-end items-center mb-8">
          <div className="relative" ref={profileRef}>
            <button
              className="focus:outline-none"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg border border-blue-200 hover:scale-105 transition">
                <FaUserCircle className="text-4xl text-blue-500" />
              </div>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg z-10 animate-fade-in">
                <div className="px-4 py-3 border-b text-blue-700 font-semibold">{nama}</div>
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
        {/* Judul & Search */}
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-blue-700 flex items-center gap-3 drop-shadow-lg">
              <FaUndoAlt className="text-green-400" /> Barang Dikembalikan
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Daftar barang yang sudah kamu kembalikan beserta statusnya.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama barang..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-2xl border border-blue-200 bg-white shadow focus:ring-2 focus:ring-blue-300 text-lg min-w-[320px]"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 text-xl" />
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="w-full max-w-7xl mx-auto bg-white/90 rounded-3xl shadow-2xl border border-blue-100 overflow-x-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700">
                <th className="py-4 px-6 text-left font-bold">No</th>
                <th className="py-4 px-6 text-left font-bold">Nama Barang</th>
                <th className="py-4 px-6 text-left font-bold">Jumlah</th>
                <th className="py-4 px-6 text-left font-bold">Tanggal Pinjam</th>
                <th className="py-4 px-6 text-left font-bold">Tanggal Kembali</th>
                <th className="py-4 px-6 text-left font-bold">Kualitas</th>
                <th className="py-4 px-6 text-left font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-blue-400 text-lg font-bold">
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-lg">
                    Tidak ada barang yang sudah dikembalikan.
                  </td>
                </tr>
              ) : (
                filteredData.map((p, idx) => (
                  <tr key={p.id || idx} className="border-b hover:bg-blue-50/60 transition">
                    <td className="py-3 px-6 font-semibold">{idx + 1}</td>
                    <td className="py-3 px-6 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow">
                        {p.barang?.image ? (
                          <img
                            src={`http://localhost:8000/storage/${p.barang.image}`}
                            alt={p.barang?.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <FaBoxOpen className="text-blue-300 text-2xl" />
                        )}
                      </div>
                      <span className="font-bold text-blue-700">{p.barang?.name || '-'}</span>
                    </td>
                    <td className="py-3 px-6">{p.jumlah || '-'}</td>
                    <td className="py-3 px-6">{p.tanggal_pinjam || '-'}</td>
                    <td className="py-3 px-6">{p.tanggal_pengembalian || '-'}</td>
                    <td className="py-3 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 shadow">
                        {p.kualitas || p.kbarang?.name || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow
                        ${p.status === 'diproses' ? 'bg-yellow-100 text-yellow-700' :
                          p.status === 'selesai' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-500'}`}>
                        {p.status === 'selesai' ? (
                          <span className="flex items-center gap-1">
                            <FaCheckCircle className="text-green-400" /> Selesai
                          </span>
                        ) : p.status === 'diproses' ? 'Diproses' : (p.status || '-')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BarangDikembalikan;