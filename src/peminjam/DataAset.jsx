import React, { useEffect, useState } from 'react';
import SidebarP from './SidebarP';
import { FaSearch, FaBoxOpen, FaTags, FaClipboardCheck } from 'react-icons/fa';

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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <SidebarP />
        <div className="ml-64 w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <SidebarP />
        <div className="ml-64 w-full flex items-center justify-center p-8">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 w-full max-w-2xl">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <p className="mt-2 text-sm">Silakan refresh halaman atau coba lagi nanti.</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <SidebarP />
      <div className="ml-64 w-full min-h-screen flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-3">
              <FaBoxOpen className="text-yellow-400" /> Data Aset
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Barang yang tersedia untuk dipinjam
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-2xl border border-blue-200 bg-white shadow focus:ring-2 focus:ring-blue-300 text-lg min-w-[320px]"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 text-xl" />
          </div>
        </div>

        <div className="w-full max-w-7xl">
          {filteredData.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-xl">Tidak ada barang yang dapat dipinjam</p>
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="mt-4 text-blue-500 hover:text-blue-700"
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

                return (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="p-4 flex justify-center bg-gray-50">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-40 w-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Gambar+Tidak+Tersedia';
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {item.kode_barang}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-500 flex items-center">
                        <FaTags className="mr-2" /> {item.category}
                      </p>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-medium">{item.jumlah_barang}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dipinjam:</span>
                          <span className="font-medium text-orange-600">{jumlahDipinjam}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tersedia:</span>
                          <span className="font-medium text-green-600">
                            {jumlahTersedia > 0 ? jumlahTersedia : 0}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <FaClipboardCheck className="mr-1" /> Boleh Dipinjam
                        </span>
                        <span className="text-xs text-gray-500">
                          Ditambahkan: {new Date(item.created_at).toLocaleDateString()}
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