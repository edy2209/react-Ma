import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import { FaUserCircle } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // GANTI import ini!

const LaporanPeminjaman = () => {
  const [dataAset, setDataAset] = useState([]);
  const [peminjaman, setPeminjaman] = useState([]);
  const [stat, setStat] = useState({
    totalBarang: 0,
    tersedia: 0,
    dipinjam: 0,
    maintenance: 0,
  });
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const profileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';

  useEffect(() => {
    fetch('http://localhost:8000/api/barang')
      .then(res => res.json())
      .then(data => setDataAset(data));
    fetch('http://localhost:8000/api/peminjaman')
      .then(res => res.json())
      .then(data => setPeminjaman(data));
  }, []);

  useEffect(() => {
    const totalBarang = dataAset.reduce((sum, b) => sum + (parseInt(b.jumlah_barang) || 0), 0);
    const filteredPeminjaman = peminjaman.filter(
      p => p.status === 'dipinjam' || p.status === 'disetujui'
    );
    const dipinjam = filteredPeminjaman.reduce((sum, p) => sum + (parseInt(p.jumlah) || 0), 0);
    const tersedia = totalBarang - dipinjam;
    setStat(stat => ({
      ...stat,
      totalBarang,
      tersedia: tersedia < 0 ? 0 : tersedia,
      dipinjam,
    }));
  }, [dataAset, peminjaman]);

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

  const filteredPeminjaman = peminjaman
    .filter(p => (p.status === 'dipinjam' || p.status === 'disetujui'))
    .filter(p => (p.barang?.name || '').toLowerCase().includes(search.toLowerCase()));

  // Export PDF dengan loading dan fallback data
  // ...existing code...
const handleExportPDF = async () => {
  setLoadingExport(true);
  try {
    const doc = new jsPDF();

    // Header rata tengah
    doc.setFontSize(18);
    doc.text('MA-ERKK', doc.internal.pageSize.getWidth() / 2, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Laporan Peminjaman Aset', doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.text(
      'Laporan ini berisi data peminjaman aset yang masih aktif (status dipinjam/disetujui).',
      doc.internal.pageSize.getWidth() / 2,
      36,
      { align: 'center' }
    );

    autoTable(doc, {
      startY: 44,
      head: [[
        'No', 'Nama Barang', 'Jumlah', 'Tanggal Pinjam', 'Tanggal Kembali', 'Status'
      ]],
      body: filteredPeminjaman.map((p, idx) => [
        idx + 1,
        p.barang?.name || '-',
        p.jumlah || '-',
        p.tanggal_pinjam || '-',
        p.tanggal_pengembalian || '-',
        p.status || '-'
      ]),
      styles: { fontSize: 9 },
    });

    // Tanda tangan di kanan bawah
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginRight = 20;
    const ttdWidth = 60;
    const ttdX = doc.internal.pageSize.getWidth() - ttdWidth - marginRight;
    const ttdY = pageHeight - 90;

    doc.setFontSize(11);
    doc.text('Mengetahui,', ttdX, ttdY);
    doc.text('_________________________', ttdX, ttdY + 20);
    doc.text('Tanda Tangan', ttdX, ttdY + 27);

    doc.save('laporan-peminjaman-aset.pdf');
  } catch (err) {
    alert('Gagal export PDF!\n' + err.message);
  }
  setLoadingExport(false);
};
// ...existing code...

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
        <h1 className="text-2xl font-bold mb-4">Laporan Peminjaman Aset</h1>

        {/* Statistik Ringkas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow rounded p-4 text-center">
            <div className="text-gray-500">Total Barang</div>
            <div className="text-xl font-bold">{stat.totalBarang}</div>
          </div>
          <div className="bg-white shadow rounded p-4 text-center">
            <div className="text-gray-500">Tersedia</div>
            <div className="text-xl font-bold">{stat.tersedia}</div>
          </div>
          <div className="bg-white shadow rounded p-4 text-center">
            <div className="text-gray-500">Dipinjam</div>
            <div className="text-xl font-bold">{stat.dipinjam}</div>
          </div>
          <div className="bg-white shadow rounded p-4 text-center">
            <div className="text-gray-500">Maintenance</div>
            <div className="text-xl font-bold">{stat.maintenance}</div>
          </div>
        </div>

        {/* Fitur Pencarian & Export */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-full md:w-1/3"
          />
          <button
            className={`flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:opacity-60`}
            onClick={handleExportPDF}
            disabled={loadingExport}
          >
            {loadingExport && (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
            )}
            {loadingExport ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>

        {/* Tabel Data Peminjaman */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">No</th>
                <th className="py-2 px-4 text-left">Nama Barang</th>
                <th className="py-2 px-4 text-left">Jumlah</th>
                <th className="py-2 px-4 text-left">Tanggal Pinjam</th>
                <th className="py-2 px-4 text-left">Tanggal Kembali</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeminjaman.map((p, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2 px-4">{idx + 1}</td>
                  <td className="py-2 px-4">{p.barang?.name || '-'}</td>
                  <td className="py-2 px-4">{p.jumlah || '-'}</td>
                  <td className="py-2 px-4">{p.tanggal_pinjam || '-'}</td>
                  <td className="py-2 px-4">{p.tanggal_pengembalian || '-'}</td>
                  <td className="py-2 px-4">{p.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Tidak ada kolom tanda tangan di UI */}
      </div>
    </div>
  );
};

export default LaporanPeminjaman;