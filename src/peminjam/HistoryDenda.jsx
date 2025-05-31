import React, { useEffect, useState, useRef } from 'react';
import SidebarP from './SidebarP';
import { FaUserCircle } from 'react-icons/fa';

const DashboardPeminjam = () => {
  const profileRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyDenda, setHistoryDenda] = useState([]);

  // Ambil data user dari localStorage
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

        // Kalau pakai token, ambil dari localStorage juga
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <SidebarP />
      <div className="ml-64 p-8 w-full flex flex-col">
        {/* Profile Header */}
        <div className="flex justify-end items-center mb-8">
          <div className="relative" ref={profileRef}>
            <button
              className="focus:outline-none"
              onClick={() => setDropdownOpen(open => !open)}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-200 to-blue-400 flex items-center justify-center shadow-lg border-2 border-white">
                <FaUserCircle className="text-4xl text-blue-700" />
              </div>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10">
                <div className="px-4 py-3 border-b text-blue-700 font-bold text-lg">{nama}</div>
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

        {/* Title */}
        <h2 className="text-3xl font-bold mb-6 text-blue-700">History Denda</h2>

        {/* Loading, Error, and Table */}
        {loading && (
          <div className="text-center text-blue-600 font-semibold">Memuat data history denda...</div>
        )}
        {error && (
          <div className="text-center text-red-600 font-semibold">{error}</div>
        )}
        {!loading && !error && historyDenda.length === 0 && (
          <div className="text-center text-gray-600">Tidak ada data history denda.</div>
        )}
        {!loading && !error && historyDenda.length > 0 && (
          <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-300 bg-white">
            <table className="min-w-full text-left table-auto">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment Type</th>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Jumlah Denda</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {historyDenda.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-blue-50">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3 capitalize">{item.status}</td>
                    <td className="px-4 py-3">{item.payment_type}</td>
                    <td className="px-4 py-3 font-mono">{item.order_id}</td>
                    <td className="px-4 py-3 text-right">
                      {item.denda?.jumlah_denda
                        ? item.denda.jumlah_denda.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          })
                        : '-'}
                    </td>
                    <td className="px-4 py-3">{item.denda?.keterangan || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} MA-ERKK &mdash; Dashboard Peminjam. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default DashboardPeminjam;
