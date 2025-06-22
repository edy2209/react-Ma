import React, { useEffect, useState } from 'react';
import SidebarP from './SidebarP';
import { FaSearch, FaBoxOpen, FaTags, FaClipboardCheck, FaExchangeAlt } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';

const DataAset = () => {
  const [data, setData] = useState([]);
  const [peminjaman, setPeminjaman] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data barang
        const barangResponse = await fetch('http://localhost:8000/api/barang');
        if (!barangResponse.ok) {
          throw new Error(`HTTP error! status: ${barangResponse.status}`);
        }
        const barangResult = await barangResponse.json();
        
        // Validasi struktur data
        if (!barangResult.success || !Array.isArray(barangResult.data)) {
          throw new Error('Struktur data barang tidak valid');
        }

        // Filter hanya barang yang boleh dipinjam
        const filteredBarang = barangResult.data.filter(item => item.status_pinjam === true);

        // Fetch data peminjaman
        const peminjamanResponse = await fetch('http://localhost:8000/api/peminjaman');
        if (!peminjamanResponse.ok) {
          throw new Error(`HTTP error! status: ${peminjamanResponse.status}`);
        }
        const peminjamanResult = await peminjamanResponse.json();

        setData(filteredBarang);
        setPeminjaman(peminjamanResult.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDipinjam = (asetId) => {
    if (!Array.isArray(peminjaman)) return 0;
    
    return peminjaman
      .filter(p => 
        (p.status === 'dipinjam' || p.status === 'disetujui') &&
        p.barang_id === asetId
      )
      .reduce((sum, p) => sum + (parseInt(p.jumlah) || 0), 0);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <SidebarP />
        <div className="ml-0 lg:ml-64 flex-1 flex flex-col items-center justify-center p-6">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="mt-4 text-lg text-gray-600">Memuat data aset...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <SidebarP />
        <div className="ml-0 lg:ml-64 flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl shadow-md w-full max-w-2xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-medium text-red-800">Terjadi Kesalahan</h3>
                <div className="mt-2 text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                  >
                    <FiRefreshCw className="mr-2" />
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  // Hitung statistik
  const stats = {
    totalAset: data.reduce((sum, item) => sum + parseInt(item.jumlah_barang || 0), 0),
    dipinjam: data.reduce((sum, item) => sum + getDipinjam(item.id), 0),
  };
  stats.tersedia = stats.totalAset - stats.dipinjam;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <SidebarP />
      <div className="ml-0 lg:ml-64 flex-1 min-h-screen flex flex-col p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaBoxOpen className="text-blue-600" /> Data Aset
              </h1>
              <p className="text-gray-500 mt-1">
                Barang yang tersedia untuk dipinjam
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Cari nama atau kategori..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 w-full transition-all duration-300"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              
              <button 
                onClick={handleRefresh}
                className="p-3 bg-white rounded-xl shadow-sm hover:bg-blue-50 transition-all duration-300 hover:rotate-180"
                title="Refresh data"
              >
                <FiRefreshCw className="text-blue-500" />
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            <div className="bg-gradient-to-r from-green-100 to-green-50 border border-green-200 rounded-2xl shadow-sm p-5 flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <div className="bg-green-200 p-2 rounded-md">
                  <FaBoxOpen className="text-green-600 text-xl" />
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Tersedia</p>
                <p className="text-2xl font-bold text-green-700">{stats.tersedia}</p>
              </div>
            </div>
            
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {filteredData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center border border-gray-100">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mb-6 flex items-center justify-center">
                <FaBoxOpen className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Tidak ada barang</h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                {search ? `Tidak ditemukan aset dengan pencarian "${search}"` : 'Belum ada barang yang tersedia untuk dipinjam'}
              </p>
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-md"
                >
                  Reset pencarian
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item) => {
                const jumlahDipinjam = getDipinjam(item.id);
                const jumlahTersedia = item.jumlah_barang - jumlahDipinjam;
                const persentaseTersedia = (jumlahTersedia / item.jumlah_barang) * 100;
                
                return (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 group"
                  >
                    <div className="p-4 bg-gray-50 flex justify-center h-56 overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=Gambar+Tidak+Tersedia';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                          <FaBoxOpen className="text-gray-400 text-4xl" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h2>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                          {item.kode_barang}
                        </span>
                      </div>
                      
                      <div className="flex items-center mt-2 text-gray-500 text-sm">
                        <FaTags className="mr-2" /> 
                        <span>{item.category}</span>
                      </div>
                      
                      <div className="mt-5 mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Ketersediaan:</span>
                          <span className="font-medium">
                            {jumlahTersedia} / {item.jumlah_barang}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              persentaseTersedia > 50 ? 'bg-green-500' : 
                              persentaseTersedia > 20 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${persentaseTersedia}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FaClipboardCheck className="mr-1" /> Boleh Dipinjam
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataAset;