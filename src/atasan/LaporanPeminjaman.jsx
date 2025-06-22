import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import { FaUserCircle, FaFilePdf, FaSearch, FaChartBar, FaBox, FaExchangeAlt, FaTools, FaPrint } from 'react-icons/fa';
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
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-0 lg:ml-64 flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-0 lg:ml-64 flex-1 p-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                  <button 
                    onClick={() => window.location.reload()}
                    className="ml-1 text-sm font-medium text-red-700 hover:text-red-600 underline"
                  >
                    Coba Lagi
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredPeminjaman = peminjaman
    .filter(p => p.status === 'disetujui')
    .filter(p => (p.barang?.name || '').toLowerCase().includes(search.toLowerCase()));

  const formatDate = (dateString) => {
    if (!dateString) return '-';
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
              <FaChartBar className="text-blue-600 text-xl" />
              <h1 className="text-xl font-bold text-gray-800">Laporan Peminjaman Aset</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Total Aset</h3>
                  <p className="text-3xl font-bold mt-2">{stat.totalBarang}</p>
                </div>
                <div className="bg-blue-400 rounded-lg p-3">
                  <FaBox className="text-2xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Tersedia</h3>
                  <p className="text-3xl font-bold mt-2">{stat.tersedia}</p>
                </div>
                <div className="bg-green-400 rounded-lg p-3">
                  <FaBox className="text-2xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Dipinjam</h3>
                  <p className="text-3xl font-bold mt-2">{stat.dipinjam}</p>
                </div>
                <div className="bg-amber-400 rounded-lg p-3">
                  <FaExchangeAlt className="text-2xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Maintenance</h3>
                  <p className="text-3xl font-bold mt-2">{stat.maintenance}</p>
                </div>
                <div className="bg-purple-400 rounded-lg p-3">
                  <FaTools className="text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Export */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama barang..."
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              
              <button
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg transition disabled:opacity-60"
                onClick={handleExportPDF}
                disabled={loadingExport || filteredPeminjaman.length === 0}
              >
                {loadingExport ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : (
                  <>
                    <FaFilePdf className="text-lg" />
                    <span>Export PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peminjam
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Barang
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Pinjam
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Kembali
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPeminjaman.length > 0 ? (
                    filteredPeminjaman.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {p.peminjam?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {p.barang?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {p.jumlah}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(p.tanggal_pinjam)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(p.tanggal_pengembalian)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-green-100 text-green-800">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        {search ? 'Tidak ada data peminjaman yang sesuai dengan pencarian' : 'Tidak ada data peminjaman yang disetujui'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanPeminjaman;