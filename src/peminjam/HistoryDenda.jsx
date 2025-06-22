import React, { useEffect, useState, useRef } from 'react';
import SidebarP from './SidebarP';
import { FaUserCircle, FaHistory, FaMoneyBillWave, FaClock, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';

const DashboardPeminjam = () => {
  const profileRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyDenda, setHistoryDenda] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';
  const userId = user?.id;

  useEffect(() => {
    const fetchHistoryDenda = async () => {
      try {
        if (!userId) {
          throw new Error('User ID tidak ditemukan, silakan login ulang');
        }
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:8000/api/history-denda/${userId}`, {
          headers: {
            'Accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Gagal mengambil data history denda: ${text}`);
        }

        const data = await response.json();
        setHistoryDenda(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistoryDenda();
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // Fungsi untuk menentukan warna berdasarkan status
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'settlement':
      case 'capture':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'deny':
      case 'expire':
      case 'cancel':
      case 'failure':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fungsi untuk menentukan ikon berdasarkan status
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'settlement':
      case 'capture':
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'deny':
      case 'expire':
      case 'cancel':
      case 'failure':
        return <FaExclamationCircle className="text-red-500" />;
      default:
        return <FaHistory className="text-gray-500" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SidebarP />
      <div className="ml-0 md:ml-64 w-full min-h-screen flex flex-col px-4 md:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaHistory className="text-blue-500" />
              <span>History Pembayaran Denda</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Riwayat pembayaran denda yang telah Anda lakukan
            </p>
          </div>
          
          {/* Profile Section */}
          <div className="relative" ref={profileRef}>
            <button
              className="flex items-center gap-3 bg-white rounded-full pl-4 pr-2 py-1 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setDropdownOpen(open => !open)}
            >
              <span className="text-gray-700 font-medium hidden sm:block">{nama}</span>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <FaUserCircle className="text-blue-400 text-xl" />
              </div>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10 border border-gray-100 animate-fade-in">
                <div className="px-4 py-3 border-b text-gray-700 font-semibold">{nama}</div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-500 hover:bg-gray-50 rounded-b-xl transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
              <span className="text-gray-600 font-medium">Memuat data history denda...</span>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <FaExclamationCircle className="text-red-500 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-700 mb-1">Terjadi Kesalahan</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          ) : historyDenda.length === 0 ? (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-12 text-center shadow-sm">
              <FaMoneyBillWave className="mx-auto text-blue-300 text-5xl mb-4" />
              <h3 className="text-xl font-medium text-gray-500 mb-2">Belum Ada Riwayat Pembayaran</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Riwayat pembayaran denda Anda akan muncul di sini setelah Anda melakukan pembayaran
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {historyDenda.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-50 p-3 rounded-xl">
                            {getStatusIcon(item.status)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                              {item.denda?.keterangan || 'Pembayaran Denda'}
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </h3>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Order ID</p>
                                <p className="font-mono text-sm font-medium text-gray-700">{item.order_id}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Metode Pembayaran</p>
                                <p className="text-sm font-medium text-gray-700">{item.payment_type || '-'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Tanggal Pembayaran</p>
                                <p className="text-sm font-medium text-gray-700">
                                  {new Date(item.created_at).toLocaleString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 min-w-[180px]">
                        <p className="text-xs text-gray-500 mb-1">Jumlah Denda</p>
                        <p className="font-bold text-xl text-blue-700">
                          {item.denda?.jumlah_denda 
                            ? `Rp ${item.denda.jumlah_denda.toLocaleString('id-ID')}` 
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} MA-ERKK &mdash; Dashboard Peminjam. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default DashboardPeminjam;