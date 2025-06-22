import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { FaUserCircle, FaTools, FaSearch, FaCalendarAlt, FaBoxOpen, FaClipboardList } from 'react-icons/fa';

const StatusMaintenance = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';

  const [dataMaintenance, setDataMaintenance] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [jumlahProses, setJumlahProses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/api/maintenance')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const sorted = [...data.data].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          setDataMaintenance(sorted);

          const totalProses = sorted
            .filter((item) => item.status?.toLowerCase().trim() === 'proses')
            .reduce((sum, item) => sum + Number(item.jumlah || 0), 0);

          setJumlahProses(totalProses);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const filteredData = dataMaintenance.filter((item) =>
    item.barang?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex justify-between items-center p-4 md:px-6">
            <div className="flex items-center gap-2">
              <FaTools className="text-blue-600 text-xl" />
              <h1 className="text-xl font-bold text-gray-800">Status Maintenance</h1>
            </div>
            
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center gap-2 focus:outline-none group"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shadow">
                  <FaUserCircle className="text-2xl text-blue-600" />
                </div>
                <span className="hidden md:block text-gray-700 font-medium">{nama}</span>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 overflow-hidden border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">Signed in as</p>
                    <p className="text-sm font-semibold truncate">{nama}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6">
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Total Maintenance</h3>
                  <p className="text-3xl font-bold mt-2">{dataMaintenance.length}</p>
                </div>
                <div className="bg-blue-400 rounded-lg p-3">
                  <FaTools className="text-2xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Dalam Proses</h3>
                  <p className="text-3xl font-bold mt-2">{jumlahProses}</p>
                </div>
                <div className="bg-amber-400 rounded-lg p-3">
                  <FaClipboardList className="text-2xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Selesai</h3>
                  <p className="text-3xl font-bold mt-2">
                    {dataMaintenance.filter(item => item.status?.toLowerCase() === 'selesai').length}
                  </p>
                </div>
                <div className="bg-green-400 rounded-lg p-3">
                  <FaBoxOpen className="text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari barang..."
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3 flex items-center">
                <p className="text-gray-700 font-medium">
                  Total maintenance: <span className="font-bold">{dataMaintenance.length}</span> | 
                  Dalam proses: <span className="font-bold text-amber-600">{jumlahProses}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Maintenance List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedData.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300"
                  >
                    <div className={`p-1 ${
                      item.status === 'selesai' 
                        ? 'bg-green-500' 
                        : item.status === 'pending' 
                          ? 'bg-yellow-500' 
                          : 'bg-orange-500'
                    }`}></div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h2 className="text-lg font-bold text-gray-800">
                          {item.barang?.name || 'N/A'} 
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            ({item.barang?.kode_barang || 'N/A'})
                          </span>
                        </h2>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'selesai'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {item.status || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            <FaBoxOpen className="text-gray-400" />
                          </div>
                          <p>
                            <span className="font-medium">Kategori:</span> {item.barang?.category_id || 'N/A'}
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            <FaClipboardList className="text-gray-400" />
                          </div>
                          <p>
                            <span className="font-medium">Keterangan:</span> {item.deskripsi || 'Tidak ada keterangan'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-700">{item.jumlah || 0}</span>
                            </div>
                            <span className="text-sm">Jumlah</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            <span className="text-sm">{formatDate(item.tanggal_mulai)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {paginatedData.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Data tidak ditemukan</h3>
                    <p className="text-gray-500">
                      Tidak ada maintenance yang cocok dengan pencarian "{searchQuery}"
                    </p>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="inline-flex items-center gap-1 bg-white rounded-lg shadow-sm p-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium ${
                          currentPage === page 
                            ? 'bg-blue-500 text-white' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusMaintenance;