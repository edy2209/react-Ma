import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import { FaUserCircle, FaBoxOpen } from 'react-icons/fa';

const LaporanAset = () => {
  const [dataAset, setDataAset] = useState([]);
  const [peminjaman, setPeminjaman] = useState([]);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const profileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';

  // Fetch data aset dan peminjaman dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data barang
        const barangResponse = await fetch('http://localhost:8000/api/barang');
        if (!barangResponse.ok) throw new Error('Gagal mengambil data barang');
        const barangData = await barangResponse.json();
        
        // Fetch data peminjaman
        const peminjamanResponse = await fetch('http://localhost:8000/api/peminjaman');
        if (!peminjamanResponse.ok) throw new Error('Gagal mengambil data peminjaman');
        const peminjamanData = await peminjamanResponse.json();

        setDataAset(barangData.data || []);
        setPeminjaman(peminjamanData.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Filter aset berdasarkan search nama/kode/kategori
  const filteredAset = dataAset.filter(aset => {
    const searchTerm = search.toLowerCase();
    return (
      (aset.name || '').toLowerCase().includes(searchTerm) ||
      (aset.kode_barang || '').toLowerCase().includes(searchTerm) ||
      (aset.category?.name || '').toLowerCase().includes(searchTerm)
    );
  });

  // Hitung jumlah dipinjam untuk setiap aset
  const getDipinjam = (asetId) => {
    return peminjaman
      .filter(
        p =>
          (p.status === 'dipinjam' || p.status === 'disetujui') &&
          p.barang_id === asetId
      )
      .reduce((sum, p) => sum + (parseInt(p.jumlah) || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Sidebar />
        <div className="ml-64 w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Sidebar />
        <div className="ml-64 w-full p-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Sidebar />
      <div className="ml-64 p-6 w-full">
        {/* Header profile dengan dropdown */}
        <div className="flex justify-end items-center mb-6">
          <div className="relative" ref={profileRef}>
            <button
              className="focus:outline-none"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow border border-blue-200 hover:scale-105 transition">
                <FaUserCircle className="text-3xl text-blue-500" />
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
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-blue-700">
          <FaBoxOpen className="text-blue-400" /> Laporan Data Aset
        </h1>

        {/* Fitur Pencarian */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2">
          <input
            type="text"
            placeholder="Cari nama/kode/kategori barang..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-blue-200 rounded-lg px-4 py-2 w-full md:w-1/3 bg-white shadow focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Card List Aset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAset.map((aset) => {
            const dipinjam = getDipinjam(aset.id);
            const tersedia = (parseInt(aset.jumlah_barang) || 0) - dipinjam;
            const categoryName = aset.category?.name || aset.category || '-';
            const imageUrl = aset.image 
              ? aset.image.startsWith('http') 
                ? aset.image 
                : `http://localhost:8000/storage/${aset.image}`
              : null;

            return (
              <div
                key={aset.id}
                className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 flex flex-col gap-3 hover:shadow-xl transition"
              >
                {/* Gambar aset */}
                <div className="flex justify-center mb-2 h-32">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={aset.name}
                      className="rounded-lg object-contain w-full h-full bg-gray-50 border"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                      <FaBoxOpen className="text-4xl text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 rounded-full p-2">
                    <FaBoxOpen className="text-2xl text-blue-400" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-blue-700">{aset.name}</div>
                    <div className="text-xs text-gray-400">Kode: {aset.kode_barang}</div>
                    <div className="text-xs mt-1">
                      <span className={`px-2 py-1 rounded-full ${
                        aset.status_pinjam 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {aset.status_pinjam ? 'Bisa dipinjam' : 'Tidak bisa dipinjam'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tersedia</span>
                    <span className="font-bold text-green-600">{tersedia < 0 ? 0 : tersedia}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dipinjam</span>
                    <span className="font-bold text-orange-500">{dipinjam}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total</span>
                    <span className="font-bold text-blue-700">{aset.jumlah_barang}</span>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  Kategori: {categoryName}
                </div>
              </div>
            );
          })}
        </div>

        {filteredAset.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            {search ? 'Tidak ada aset yang sesuai dengan pencarian' : 'Tidak ada aset ditemukan'}
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanAset;