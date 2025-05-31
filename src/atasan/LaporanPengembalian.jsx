import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import { FaUserCircle } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LaporanPengembalian = () => {
  const [pengembalian, setPengembalian] = useState([]);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const profileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';

  useEffect(() => {
    // Fetch pengembalian
    fetch('http://localhost:8000/api/pengembalian')
      .then(res => res.json())
      .then(data => setPengembalian(data));
  }, []);

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
  const filteredPengembalian = pengembalian
    .filter(p => (p.barang?.name || '').toLowerCase().includes(search.toLowerCase()));

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPengembalian.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPengembalian.length / itemsPerPage);

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
      doc.text('Laporan Pengembalian Aset', doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
      doc.setFontSize(10);
      doc.text(
        'Laporan ini berisi data pengembalian aset yang telah dikembalikan.',
        doc.internal.pageSize.getWidth() / 2,
        36,
        { align: 'center' }
      );

      autoTable(doc, {
        startY: 44,
        head: [['No', 'Nama Barang', 'Jumlah', 'Kondisi', 'Peminjam', 'Tanggal Pinjam', 'Tanggal Kembali']],
        body: filteredPengembalian.map((p, idx) => [
          idx + 1,
          p.barang?.name || '-',
          p.jumlah || '-',
          p.kbarang?.name || '-',
          p.peminjam?.name || '-',
          p.tanggal_pinjam || '-',
          p.tanggal_pengembalian || '-',
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

      doc.save('laporan-pengembalian-aset.pdf');
    } catch (err) {
      alert('Gagal export PDF!\n' + err.message);
    }
    setLoadingExport(false);
  };

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

        <h1 className="text-2xl font-bold mb-4">Laporan Pengembalian Aset</h1>

        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset ke halaman pertama saat mencari
            }}
            className="border rounded px-3 py-2 w-full md:w-1/3"
          />
          <button
            className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:opacity-60"
            onClick={handleExportPDF}
            disabled={loadingExport}
          >
            {loadingExport && (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            )}
            Export PDF
          </button>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">No</th>
                <th className="border border-gray-300 px-4 py-2">Nama Barang</th>
                <th className="border border-gray-300 px-4 py-2">Jumlah</th>
                <th className="border border-gray-300 px-4 py-2">Kondisi</th>
                <th className="border border-gray-300 px-4 py-2">Peminjam</th>
                <th className="border border-gray-300 px-4 py-2">Tanggal Pinjam</th>
                <th className="border border-gray-300 px-4 py-2">Tanggal Kembali</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((p, idx) => (
                <tr key={p.id} className="text-center hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{indexOfFirstItem + idx + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">{p.barang?.name || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{p.jumlah}</td>
                  <td className="border border-gray-300 px-4 py-2">{p.kbarang?.name || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{p.peminjam?.name || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{p.tanggal_pinjam}</td>
                  <td className="border border-gray-300 px-4 py-2">{p.tanggal_pengembalian}</td>
                </tr>
              ))}
              {filteredPengembalian.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Tidak ada data pengembalian yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredPengembalian.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
            >
              <FiChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`w-10 h-10 rounded ${currentPage === number ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanPengembalian;