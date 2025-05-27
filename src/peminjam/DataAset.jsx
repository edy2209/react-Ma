import React, { useEffect, useState } from 'react';
import SidebarP from './SidebarP';
import { FaSearch, FaBoxOpen, FaCubes, FaTags, FaWarehouse, FaClipboardCheck } from 'react-icons/fa';

const DataAset = () => {
  const [data, setData] = useState([]);
  const [peminjaman, setPeminjaman] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch data aset dan peminjaman dari API
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/barang').then(res => res.json()),
      fetch('http://localhost:8000/api/peminjaman').then(res => res.json())
    ]).then(([barang, pinjam]) => {
      setData(barang);
      setPeminjaman(pinjam);
      setLoading(false);
    });
  }, []);

  // Filter data berdasarkan search
  const filtered = data.filter(
    d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.category?.name || '').toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <SidebarP />
      <div className="ml-64 w-full min-h-screen flex flex-col items-center px-6 py-12">
        {/* Header */}
        <div className="w-full max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-3 drop-shadow-lg">
              <FaBoxOpen className="text-yellow-400" /> Data Aset
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Lihat seluruh aset/barang yang tersedia dan detailnya.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama aset atau kategori..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-2xl border border-blue-200 bg-white shadow focus:ring-2 focus:ring-blue-300 text-lg min-w-[320px]"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 text-xl" />
            </div>
          </div>
        </div>
        {/* Table/Card List */}
        <div className="w-full max-w-7xl">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <svg className="animate-spin h-10 w-10 text-blue-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filtered.length > 0 ? (
                filtered.map(aset => {
                  const dipinjam = getDipinjam(aset.id);
                  const tersedia = (parseInt(aset.jumlah_barang) || 0) - dipinjam;
                  return (
                    <div
                      key={aset.id}
                      className="group bg-white/90 rounded-3xl shadow-2xl border border-blue-100 p-6 flex flex-col gap-4 relative overflow-hidden hover:scale-[1.03] transition-transform duration-300"
                    >
                      {/* Decorative background */}
                      <div className="absolute -top-8 -right-8 opacity-10 group-hover:opacity-20 transition">
                        <svg width="120" height="120"><circle cx="60" cy="60" r="60" fill="#3b82f6" /></svg>
                      </div>
                      {/* Gambar aset */}
                      <div className="flex justify-center">
                        <img
                          src={aset.image ? `http://localhost:8000/storage/${aset.image}` : 'https://via.placeholder.com/120x120?text=No+Img'}
                          alt={aset.name}
                          className="w-28 h-28 object-cover rounded-2xl border-2 border-blue-100 bg-white shadow"
                        />
                      </div>
                      {/* Info stok & dipinjam */}
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-gray-500">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                            <b className="text-green-700">Tersedia</b>
                          </span>
                          <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-lg shadow">
                            {tersedia < 0 ? 0 : tersedia}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-gray-500">
                            <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mr-1"></span>
                            <b className="text-orange-600">Dipinjam</b>
                          </span>
                          <span className="bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full text-lg shadow">
                            {dipinjam}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-gray-500">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
                            <b className="text-blue-700">Total</b>
                          </span>
                          <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-lg shadow">
                            {aset.jumlah_barang}
                          </span>
                        </div>
                      </div>
                      {/* Nama dan kategori */}
                      <div className="flex flex-col items-center gap-1 mt-2">
                        <div className="font-extrabold text-xl text-blue-700 text-center">{aset.name}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FaTags className="text-blue-300" /> {aset.category?.name || '-'}
                        </div>
                      </div>
                      {/* Deskripsi */}
                      <div className="mt-3 text-gray-500 text-sm text-center min-h-[40px]">
                        {aset.deskripsi || <span className="italic text-gray-300">Tidak ada deskripsi</span>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-gray-400 py-24 text-xl">
                  Tidak ada aset ditemukan.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataAset;