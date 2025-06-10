import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import { FaUserCircle } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LaporanPeminjaman = () => {
  const [dataAset, setDataAset] = useState([]);
  const [peminjaman, setPeminjaman] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [stat, setStat] = useState({
    totalBarang: 0,
    tersedia: 0,
    dipinjam: 0,
    maintenance: 0,
  });
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const profileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [barangRes, peminjamanRes, maintenanceRes] = await Promise.all([
          fetch('http://localhost:8000/api/barang'),
          fetch('http://localhost:8000/api/peminjaman'),
          fetch('http://localhost:8000/api/maintenance')
        ]);

        // Check all responses
        if (!barangRes.ok) throw new Error('Gagal mengambil data barang');
        if (!peminjamanRes.ok) throw new Error('Gagal mengambil data peminjaman');
        if (!maintenanceRes.ok) throw new Error('Gagal mengambil data maintenance');

        const [barangData, peminjamanData, maintenanceData] = await Promise.all([
          barangRes.json(),
          peminjamanRes.json(),
          maintenanceRes.json()
        ]);

        // Set data with proper structure checking
        setDataAset(barangData.data || []);
        setPeminjaman(peminjamanData.data || peminjamanData || []); // Handle both formats
        setMaintenanceData(maintenanceData.data || []);

      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (dataAset.length > 0 || peminjaman.length > 0 || maintenanceData.length > 0) {
      const totalBarang = dataAset.reduce((sum, b) => sum + (parseInt(b.jumlah_barang) || 0), 0);

      // Hitung yang sedang dipinjam (status disetujui saja)
      const dipinjamList = peminjaman.filter(p => p.status === 'disetujui');
      const dipinjam = dipinjamList.reduce((sum, p) => sum + (parseInt(p.jumlah) || 0), 0);

      // Hitung maintenance
      const maintenanceFromPeminjaman = peminjaman
        .filter(p => p.status === 'maintenance')
        .reduce((sum, p) => sum + (parseInt(p.jumlah) || 0), 0);

      const maintenanceFromAPI = maintenanceData
        .filter(m => m.status === 'proses')
        .reduce((sum, m) => sum + (parseInt(m.jumlah) || 0), 0);

      const maintenance = maintenanceFromPeminjaman + maintenanceFromAPI;
      const tersedia = totalBarang - dipinjam - maintenance;

      setStat({
        totalBarang,
        tersedia: tersedia < 0 ? 0 : tersedia,
        dipinjam,
        maintenance,
      });
    }
  }, [dataAset, peminjaman, maintenanceData]);

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

  const handleExportPDF = async () => {
    setLoadingExport(true);
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('MA-ERKK', doc.internal.pageSize.getWidth() / 2, 18, { align: 'center' });
      doc.setFontSize(12);
      doc.text('Laporan Peminjaman Aset', doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
      doc.setFontSize(10);
      doc.text(
        'Laporan ini berisi data peminjaman aset yang disetujui.',
        doc.internal.pageSize.getWidth() / 2,
        36,
        { align: 'center' }
      );

      const filteredPeminjaman = peminjaman
        .filter(p => p.status === 'disetujui')
        .filter(p => (p.barang?.name || '').toLowerCase().includes(search.toLowerCase()));

      autoTable(doc, {
        startY: 44,
        head: [['No', 'Peminjam', 'Nama Barang', 'Jumlah', 'Tanggal Pinjam', 'Tanggal Kembali', 'Status']],
        body: filteredPeminjaman.map((p, idx) => [
          idx + 1,
          p.peminjam?.name || '-',
          p.barang?.name || '-',
          p.jumlah || '-',
          p.tanggal_pinjam || '-',
          p.tanggal_pengembalian || '-',
          p.status || '-',
        ]),
        styles: { fontSize: 9 },
      });

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

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 w-full flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 w-full p-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-blue-500 hover:text-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredPeminjaman = peminjaman
    .filter(p => p.status === 'disetujui')
    .filter(p => (p.barang?.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-6 w-full">
        <div className="flex justify-end items-center mb-6">
          <div className="relative" ref={profileRef}>
            <button
              className="focus:outline-none"
              onClick={() => setDropdownOpen(open => !open)}
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

        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-full md:w-1/3"
          />
          <button
            className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:opacity-60"
            onClick={handleExportPDF}
            disabled={loadingExport || filteredPeminjaman.length === 0}
          >
            {loadingExport ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : (
              'Export PDF'
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">No</th>
                <th className="border border-gray-300 px-4 py-2">Peminjam</th>
                <th className="border border-gray-300 px-4 py-2">Nama Barang</th>
                <th className="border border-gray-300 px-4 py-2">Jumlah</th>
                <th className="border border-gray-300 px-4 py-2">Tanggal Pinjam</th>
                <th className="border border-gray-300 px-4 py-2">Tanggal Kembali</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeminjaman.length > 0 ? (
                filteredPeminjaman.map((p, idx) => (
                  <tr key={p.id} className="text-center hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{idx + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{p.peminjam?.name || '-'}</td>
                    <td className="border border-gray-300 px-4 py-2">{p.barang?.name || '-'}</td>
                    <td className="border border-gray-300 px-4 py-2">{p.jumlah}</td>
                    <td className="border border-gray-300 px-4 py-2">{p.tanggal_pinjam}</td>
                    <td className="border border-gray-300 px-4 py-2">{p.tanggal_pengembalian}</td>
                    <td className="border border-gray-300 px-4 py-2 capitalize">{p.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    {search ? 'Tidak ada data peminjaman yang sesuai dengan pencarian' : 'Tidak ada data peminjaman yang disetujui'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LaporanPeminjaman;