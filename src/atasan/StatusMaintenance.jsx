import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { FaUserCircle, FaTools } from 'react-icons/fa';

const StatusMaintenance = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';

  const [dataMaintenance, setDataMaintenance] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        }
      })
      .catch((err) => console.error('Error:', err));
  }, []);

  const filteredData = dataMaintenance.filter((item) =>
    item.barang.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-6 w-full">
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

        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaTools className="text-blue-500" /> Status Maintenance
        </h1>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari nama barang..."
            className="p-2 border border-gray-300 rounded w-full md:w-1/3"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedData.map((item) => (
            <div key={item.id} className="p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {item.barang.name} ({item.barang.kode_barang})
              </h2>
              <p><strong>Kategori:</strong> {item.barang.category_id}</p>
              <p>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      item.status === 'selesai'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </p>
              <p><strong>Keterangan:</strong> {item.deskripsi}</p>
              <p><strong>Jumlah:</strong> {item.jumlah}</p>
              <p><strong>Tanggal:</strong> {item.tanggal_mulai}</p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded border ${
                currentPage === page ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusMaintenance;