import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import { FaUserCircle, FaBoxOpen, FaSearch, FaInfoCircle, FaClipboardCheck, FaTags, FaTimes } from 'react-icons/fa';

const LaporanAset = () => {
  const [dataAset, setDataAset] = useState([]);
  const [peminjaman, setPeminjaman] = useState([]);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailAset, setDetailAset] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
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

  // Fungsi untuk menampilkan detail barang
  const handleShowDetail = async (id) => {
    setShowDetail(true);
    setDetailAset(null);
    
    try {
      const res = await fetch(`http://localhost:8000/api/barang/${id}`);
      if (!res.ok) throw new Error('Gagal mengambil detail barang');
      const json = await res.json();
      
      if (json.success && json.data) {
        setDetailAset(json.data);
      } else {
        throw new Error('Struktur data detail tidak valid');
      }
    } catch (err) {
      console.error('Detail fetch error:', err);
      setDetailAset({ error: 'Gagal mengambil detail barang.' });
    }
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
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="ml-64 w-full flex flex-col items-center justify-center p-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <h2 className="text-xl font-medium text-gray-700">Memuat Data Aset...</h2>
            <p className="text-gray-500 mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="ml-64 w-full p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-2xl mx-auto text-center">
            <FaInfoCircle className="text-4xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Terjadi Kesalahan</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium transition"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        {/* Header dengan profil */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaBoxOpen className="text-blue-500" /> Laporan Data Aset
            </h1>
            <p className="text-gray-600 mt-2">
              Daftar lengkap aset perusahaan dengan status ketersediaan
            </p>
          </div>
          
          <div className="relative" ref={profileRef}>
            <button
              className="focus:outline-none flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow border border-gray-200 hover:shadow-md transition"
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
        
        {/* Statistik Ringkas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium mb-1">Total Aset</p>
                <p className="text-3xl font-bold">{dataAset.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FaBoxOpen className="text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium mb-1">Aset Tersedia</p>
                <p className="text-3xl font-bold">
                  {dataAset.reduce((sum, aset) => {
                    const dipinjam = getDipinjam(aset.id);
                    const tersedia = (parseInt(aset.jumlah_barang) || 0) - dipinjam;
                    return sum + (tersedia > 0 ? 1 : 0);
                  }, 0)}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium mb-1">Aset Dipinjam</p>
                <p className="text-3xl font-bold">
                  {dataAset.reduce((sum, aset) => {
                    const dipinjam = getDipinjam(aset.id);
                    return sum + (dipinjam > 0 ? 1 : 0);
                  }, 0)}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Fitur Pencarian */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Cari nama, kode, atau kategori barang..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-full px-5 py-3 pl-12 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            </div>
            
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FaInfoCircle className="text-blue-500" />
              <span>{filteredAset.length} aset ditemukan</span>
            </div>
          </div>
        </div>

        {/* Card List Aset */}
        {filteredAset.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAset.map((aset) => {
              const dipinjam = getDipinjam(aset.id);
              const tersedia = (parseInt(aset.jumlah_barang) || 0) - dipinjam;
              const categoryName = aset.category?.name || aset.category || '-';
              
              // Perbaikan utama: Penanganan URL gambar yang lebih baik
              const imageUrl = aset.image_url 
                ? aset.image_url.startsWith('http') 
                  ? aset.image_url 
                  : `http://localhost:8000/storage/${aset.image_url}`
                : aset.image
                  ? aset.image.startsWith('http')
                    ? aset.image
                    : `http://localhost:8000/storage/${aset.image}`
                  : null;

              return (
                <div
                  key={aset.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Header card */}
                  <div className={`p-4 ${
                    aset.status_pinjam 
                      ? 'bg-gradient-to-r from-green-50 to-green-100' 
                      : 'bg-gradient-to-r from-red-50 to-red-100'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        aset.status_pinjam 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {aset.status_pinjam ? 'Bisa dipinjam' : 'Tidak bisa dipinjam'}
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        Kode: {aset.kode_barang || '-'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Gambar aset */}
                  <div className="flex justify-center p-4 h-48">
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
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <FaBoxOpen className="text-4xl text-gray-400 mb-2" />
                        <span className="text-gray-500 text-sm">Tidak ada gambar</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Detail aset */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{aset.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Tersedia</p>
                        <p className="text-xl font-bold text-blue-600">{tersedia < 0 ? 0 : tersedia}</p>
                      </div>
                      
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Dipinjam</p>
                        <p className="text-xl font-bold text-amber-600">{dipinjam}</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-xl font-bold text-gray-700">{aset.jumlah_barang}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                      <span className="text-sm text-gray-500">Kategori: {categoryName}</span>
                      <button 
                        onClick={() => handleShowDetail(aset.id)}
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"
                      >
                        <FaInfoCircle className="text-sm" />
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FaBoxOpen className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {search ? 'Aset tidak ditemukan' : 'Belum ada aset'}
              </h3>
              <p className="text-gray-500 mb-6">
                {search 
                  ? `Tidak ditemukan aset yang sesuai dengan pencarian "${search}"` 
                  : 'Belum ada data aset yang tersedia saat ini'}
              </p>
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition"
                >
                  Reset Pencarian
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Detail Barang */}
        {showDetail && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FaBoxOpen className="text-white text-xl" />
                  <h2 className="text-xl font-bold text-white">Detail Barang</h2>
                </div>
                <button
                  className="text-white hover:text-blue-200 transition"
                  onClick={() => setShowDetail(false)}
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              
              {/* Body Modal */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {detailAset ? (
                  detailAset.error ? (
                    <div className="text-red-500 p-4 text-center">
                      {detailAset.error}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Header Detail */}
                      <div className="border-b pb-4">
                        <h1 className="text-2xl font-bold text-gray-800">{detailAset.name}</h1>
                        <div className="flex items-center text-gray-500 mt-1">
                          <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            {detailAset.kode_barang}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center">
                            <FaTags className="mr-1 text-sm" /> 
                            {detailAset.category?.name || detailAset.category || '-'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Statistik */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-2xl font-bold text-blue-600">{detailAset.jumlah_barang}</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                          <p className="text-sm text-gray-500">Tersedia</p>
                          <p className="text-2xl font-bold text-green-600">
                            {detailAset.jumlah_barang - getDipinjam(detailAset.id)}
                          </p>
                        </div>
                        
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                          <p className="text-sm text-gray-500">Dipinjam</p>
                          <p className="text-2xl font-bold text-amber-600">
                            {getDipinjam(detailAset.id)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500 mb-2">Status Pinjam</p>
                        <p className="text-xl font-bold">
                          {detailAset.status_pinjam ? (
                            <span className="text-green-600 flex items-center gap-2">
                              <FaClipboardCheck className="text-green-500" />
                              Boleh Dipinjam
                            </span>
                          ) : (
                            <span className="text-red-600">Tidak Bisa Dipinjam</span>
                          )}
                        </p>
                      </div>
                      
                      {/* Informasi Tambahan */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                          Informasi Tambahan
                        </h3>
                        
                        {detailAset.custom_fields && detailAset.custom_fields.length > 0 ? (
                          <div className="space-y-3">
                            {detailAset.custom_fields.map((field, index) => (
                              <div key={index} className="flex border-b pb-3 last:border-0">
                                <div className="w-1/3 font-medium text-gray-700">{field.key}</div>
                                <div className="w-2/3 text-gray-600">{field.value || '-'}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                            Tidak ada informasi tambahan
                          </div>
                        )}
                      </div>
                      
                      {/* Metadata */}
                      <div className="text-sm text-gray-500 mt-6">
                        <div className="flex justify-between">
                          <span>Ditambahkan pada:</span>
                          <span className="font-medium">
                            {new Date(detailAset.created_at).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Terakhir diupdate:</span>
                          <span className="font-medium">
                            {new Date(detailAset.updated_at).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              
              {/* Footer Modal */}
              <div className="border-t p-4 bg-gray-50 flex justify-end">
                <button
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                  onClick={() => setShowDetail(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanAset;