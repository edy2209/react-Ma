import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';

const KonfirmasiPeminjaman = () => {
  const [peminjamanList, setPeminjamanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchPeminjaman = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/peminjaman?status=pending', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Gagal mengambil data');

        const data = await response.json();
        const pendingPeminjaman = data.filter(item => item.status === 'pending');
        setPeminjamanList(pendingPeminjaman);
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Data',
          text: 'Terjadi kesalahan saat memuat data peminjaman',
          confirmButtonColor: '#EF4444',
          confirmButtonText: 'Mengerti'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPeminjaman();
  }, []);

  const handleKonfirmasi = async (id, status) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/peminjaman/${id}/konfirmasi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          user_id: user.id,
          catatan: status === 'ditolak' ? 'Ditolak oleh atasan' : null
        })
      });

      if (!response.ok) throw new Error('Gagal mengupdate status peminjaman');

      setPeminjamanList(prev => prev.filter(item => item.id !== id));
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        html: `
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h3 class="text-xl font-bold text-gray-800 mt-4">Konfirmasi Berhasil!</h3>
            <p class="text-gray-600 mt-2">Peminjaman telah ${
              status === 'disetujui' ? 'disetujui' : 'ditolak'
            }</p>
          </div>
        `,
        showConfirmButton: true,
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Selesai',
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memproses',
        text: error.message || 'Terjadi kesalahan saat memproses konfirmasi',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Coba Lagi'
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Tampilkan loading spinner dengan animasi yang lebih menarik
  const renderLoading = () => (
    <div className="flex justify-center items-center h-64">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-8 border-blue-200 border-t-blue-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-blue-500 font-bold text-lg">Memuat...</span>
        </div>
      </div>
    </div>
  );

  // Tampilan ketika tidak ada data peminjaman
  const renderNoData = () => (
    <div className="bg-white shadow-lg rounded-xl p-8 text-center border border-gray-100">
      <div className="mx-auto bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">Tidak Ada Peminjaman</h3>
      <p className="text-gray-500">Semua permintaan peminjaman telah diproses</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Konfirmasi Peminjaman Barang</h1>
            <p className="text-gray-600 mt-2">Kelola dan konfirmasi permintaan peminjaman barang dari pengguna</p>
          </div>

          {loading ? (
            renderLoading()
          ) : peminjamanList.length === 0 ? (
            renderNoData()
          ) : (
            <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">Nama Peminjam</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">Barang</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">Jumlah</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">Tanggal Pinjam</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {peminjamanList.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-700 font-medium">{item.peminjam?.name?.charAt(0) || '-'}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.peminjam?.name || '-'}</div>
                              <div className="text-sm text-gray-500">{item.peminjam?.email || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                              {item.barang?.image ? (
                                <img 
                                  src={`http://localhost:8000/storage/${item.barang.image}`} 
                                  alt={item.barang?.name} 
                                  className="h-8 w-8 object-cover"
                                />
                              ) : (
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.barang?.name || '-'}</div>
                              <div className="text-sm text-gray-500">{item.barang?.category || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">{item.jumlah || '-'}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">{item.tanggal_pinjam || '-'}</td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold
                            ${item.status === 'disetujui' ? 'bg-green-100 text-green-800' :
                              item.status === 'ditolak' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}`}>
                            {item.status === 'pending' ? 'Menunggu Konfirmasi' : item.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleKonfirmasi(item.id, 'disetujui')}
                              disabled={processingId === item.id}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                processingId === item.id 
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                  : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                              }`}
                            >
                              {processingId === item.id ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <>
                                  <FaCheck /> Setujui
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleKonfirmasi(item.id, 'ditolak')}
                              disabled={processingId === item.id}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                processingId === item.id 
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                  : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
                              }`}
                            >
                              {processingId === item.id ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <>
                                  <FaTimes /> Tolak
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KonfirmasiPeminjaman;