import React, { useEffect, useState, useRef } from 'react';
import SidebarP from './SidebarP';
import { FaUserCircle, FaSearch, FaBoxOpen, FaUndoAlt, FaCheckCircle, FaCalendarAlt, FaLayerGroup, FaEllipsisV } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const BarangDikembalikan = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';

  useEffect(() => {
    fetch('http://localhost:8000/api/pengembalian')
      .then(res => res.json())
      .then(res => {
        const userId = user?.id;
        const filtered = res.filter(
          d => d.peminjam_id === userId || d.peminjam?.id === userId
        );
        setData(filtered);
        setLoading(false);
      });
  }, [user]);

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

  const filteredData = data.filter((p) =>
    (p.barang?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  // Fungsi untuk menentukan warna berdasarkan status
  const getStatusColor = (status) => {
    switch (status) {
      case 'diproses': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'selesai': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' };
    }
  };

  // Fungsi untuk menentukan warna berdasarkan kualitas
  const getQualityColor = (quality) => {
    const q = quality?.toLowerCase() || '';
    if (q.includes('baik')) return { bg: 'bg-green-100', text: 'text-green-800' };
    if (q.includes('rusak')) return { bg: 'bg-red-100', text: 'text-red-800' };
    if (q.includes('hilang')) return { bg: 'bg-orange-100', text: 'text-orange-800' };
    return { bg: 'bg-gray-100', text: 'text-gray-800' };
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SidebarP />
      
      <div className="ml-0 md:ml-64 w-full min-h-screen flex flex-col px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaUndoAlt className="text-blue-500" /> 
              <span>Barang Dikembalikan</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Daftar barang yang sudah kamu kembalikan beserta statusnya
            </p>
          </div>
          
          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              className="flex items-center gap-3 bg-white rounded-full pl-4 pr-2 py-1 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <span className="text-gray-700 font-medium hidden sm:block">{nama}</span>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <FaUserCircle className="text-blue-400 text-xl" />
              </div>
            </button>
            
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10 border border-gray-100"
                >
                  <div className="px-4 py-3 border-b text-gray-700 font-semibold">{nama}</div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-500 hover:bg-gray-50 rounded-b-xl transition-colors"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Cari barang yang dikembalikan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Total:</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                {filteredData.length} Barang
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <FaBoxOpen className="mx-auto text-gray-300 text-5xl mb-4" />
              <h3 className="text-xl font-medium text-gray-500 mb-2">Belum ada barang yang dikembalikan</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Barang yang sudah kamu kembalikan akan muncul di halaman ini
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredData.map((p, idx) => {
                  const statusColor = getStatusColor(p.status);
                  const qualityColor = getQualityColor(p.kualitas || p.kbarang?.name);
                  
                  return (
                    <motion.div
                      key={p.id || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                    >
                      {/* Item Header */}
                      <div className={`p-4 border-b ${statusColor.border}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                              {p.barang?.image ? (
                                <img
                                  src={`http://localhost:8000/storage/${p.barang.image}`}
                                  alt={p.barang?.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FaBoxOpen className="text-gray-300 text-xl" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800 line-clamp-1">{p.barang?.name || 'N/A'}</h4>
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${qualityColor.bg} ${qualityColor.text} mt-1`}>
                                {p.kualitas || p.kbarang?.name || '-'}
                              </div>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <FaEllipsisV className="text-sm" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Item Details */}
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Jumlah</span>
                            <span className="font-medium text-gray-700">{p.jumlah || '0'}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Status</span>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                              {p.status === 'selesai' ? (
                                <span className="flex items-center gap-1">
                                  <FaCheckCircle className="text-green-400" /> Selesai
                                </span>
                              ) : p.status === 'diproses' ? 'Diproses' : (p.status || '-')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm">
                            <FaCalendarAlt className="text-gray-400 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500">Tanggal Pinjam</div>
                              <div className="font-medium text-gray-700">{p.tanggal_pinjam || '-'}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm">
                            <FaCalendarAlt className="text-gray-400 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500">Tanggal Kembali</div>
                              <div className="font-medium text-gray-700">{p.tanggal_pengembalian || '-'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarangDikembalikan;