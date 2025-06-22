import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import { FaUserCircle, FaFilePdf, FaSearch, FaMoneyBillWave, FaCreditCard, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LaporanHistoryDenda = () => {
  const [historyDenda, setHistoryDenda] = useState([]);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const profileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';
  const userId = user?.id || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return;
        
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:8000/api/history-denda/${userId}`);
        if (!response.ok) throw new Error('Gagal mengambil data history denda');
        
        const data = await response.json();
        if (data.status === 'success') {
          setHistoryDenda(data.data);
        } else {
          throw new Error(data.message || 'Gagal mengambil data');
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

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

  // Filter data berdasarkan pencarian
  const filteredHistory = historyDenda
    .filter(h => 
      (h.denda?.keterangan || '').toLowerCase().includes(search.toLowerCase()) ||
      (h.order_id || '').toLowerCase().includes(search.toLowerCase())
    );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage(prev => (prev > 1 ? prev - 1 : prev));

  const handleExportPDF = async () => {
    setLoadingExport(true);
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('MA-ERKK', doc.internal.pageSize.getWidth() / 2, 18, { align: 'center' });
      doc.setFontSize(12);
      doc.text('Laporan History Pembayaran Denda', doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
      doc.setFontSize(10);
      doc.text(
        'Laporan ini berisi history pembayaran denda yang telah dilakukan.',
        doc.internal.pageSize.getWidth() / 2,
        36,
        { align: 'center' }
      );

      autoTable(doc, {
        startY: 44,
        head: [['No', 'Order ID', 'Jumlah Denda', 'Keterangan', 'Metode Pembayaran', 'Status', 'Tanggal Pembayaran']],
        body: filteredHistory.map((h, idx) => [
          idx + 1,
          h.order_id || '-',
          formatCurrency(h.denda?.jumlah_denda || 0),
          h.denda?.keterangan || '-',
          h.payment_type || '-',
          h.status === 'lunas' ? 'Lunas' : 'Belum Lunas',
          formatDate(h.created_at) || '-',
        ]),
        styles: { fontSize: 9 },
        columnStyles: {
          2: { cellWidth: 'auto', halign: 'right' }
        }
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

      doc.save('laporan-history-denda.pdf');
    } catch (err) {
      alert('Gagal export PDF!\n' + err.message);
    }
    setLoadingExport(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex justify-between items-center p-4 md:px-6">
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-blue-600 text-xl" />
              <h1 className="text-xl font-bold text-gray-800">Laporan History Pembayaran Denda</h1>
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
          {error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
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
          ) : (
            <>
              {/* Search and Export */}
              <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari order ID atau keterangan..."
                      value={search}
                      onChange={e => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <button
                    className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg transition disabled:opacity-60"
                    onClick={handleExportPDF}
                    disabled={loadingExport || filteredHistory.length === 0}
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
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              No
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Jumlah Denda
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Keterangan
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Metode Pembayaran
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tanggal Pembayaran
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentItems.length > 0 ? (
                            currentItems.map((h, idx) => (
                              <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {indexOfFirstItem + idx + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                  {h.order_id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                  {formatCurrency(h.denda?.jumlah_denda || 0)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {h.denda?.keterangan || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <FaCreditCard className="text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600 capitalize">{h.payment_type || '-'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {h.status === 'lunas' ? (
                                      <FaCheckCircle className="text-green-500 mr-2" />
                                    ) : (
                                      <FaTimesCircle className="text-red-500 mr-2" />
                                    )}
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      h.status === 'lunas' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {h.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <FaCalendarAlt className="text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">{formatDate(h.created_at)}</span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="px-6 py-8 text-center">
                                <div className="flex flex-col items-center justify-center">
                                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                                  <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada data</h3>
                                  <p className="text-gray-500">Tidak ditemukan history pembayaran denda</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  {filteredHistory.length > itemsPerPage && (
                    <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
                      <div className="text-sm text-gray-700">
                        Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> -{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastItem, filteredHistory.length)}
                        </span> dari{' '}
                        <span className="font-medium">{filteredHistory.length}</span> pembayaran
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-full ${
                            currentPage === 1 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <FiChevronLeft size={20} />
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                              key={number}
                              onClick={() => paginate(number)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                currentPage === number 
                                  ? 'bg-blue-500 text-white' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {number}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-full ${
                            currentPage === totalPages 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <FiChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaporanHistoryDenda;