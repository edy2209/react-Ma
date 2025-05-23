import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { FaUserCircle, FaTools } from 'react-icons/fa';

const dataMaintenance = [
  { kode: 'A003', nama: 'Printer', kategori: 'Elektronik', status: 'Maintenance', keterangan: 'Tinta habis', tanggal: '2024-06-01' },
  { kode: 'A005', nama: 'AC', kategori: 'Elektronik', status: 'Maintenance', keterangan: 'Tidak dingin', tanggal: '2024-06-02' },
  // ...data lain
];

const StatusMaintenance = () => {
  // Dropdown profile logic
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';

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

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-6 w-full">
        {/* Header profile dengan dropdown */}
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

        {/* Tabel Data Maintenance */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Kode</th>
                <th className="py-2 px-4 text-left">Nama</th>
                <th className="py-2 px-4 text-left">Kategori</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Keterangan</th>
                <th className="py-2 px-4 text-left">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {dataMaintenance.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2 px-4">{item.kode}</td>
                  <td className="py-2 px-4">{item.nama}</td>
                  <td className="py-2 px-4">{item.kategori}</td>
                  <td className="py-2 px-4">{item.status}</td>
                  <td className="py-2 px-4">{item.keterangan}</td>
                  <td className="py-2 px-4">{item.tanggal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatusMaintenance;