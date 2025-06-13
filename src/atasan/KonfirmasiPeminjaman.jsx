import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

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
          // headers: {
          //   'Authorization': `Bearer ${token}`
          // }
        });

        if (!response.ok) throw new Error('Gagal mengambil data');

        const data = await response.json();
        const pendingPeminjaman = data.filter(item => item.status === 'pending');
        setPeminjamanList(pendingPeminjaman);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Gagal memuat data peminjaman');
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
          user_id: user.id, // pastikan ada user.id dari localStorage
          catatan: status === 'ditolak' ? 'Ditolak oleh atasan' : null
        })

      });

      if (!response.ok) throw new Error('Gagal mengupdate status peminjaman');

      setPeminjamanList(prev => prev.filter(item => item.id !== id));
      alert(`Peminjaman berhasil ${status === 'disetujui' ? 'disetujui' : 'ditolak'}`);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Terjadi kesalahan saat memproses konfirmasi');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-6 w-full">
        <h1 className="text-2xl font-bold mb-6">Konfirmasi Peminjaman Barang</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : peminjamanList.length === 0 ? (
          <div className="bg-white shadow rounded p-6 text-center">
            <p>Tidak ada peminjaman yang perlu dikonfirmasi</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Peminjam</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barang</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pinjam</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {peminjamanList.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{item.peminjam?.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.barang?.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.jumlah || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.tanggal_pinjam || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${item.status === 'disetujui' ? 'bg-green-100 text-green-800' :
                            item.status === 'ditolak' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                          {item.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleKonfirmasi(item.id, 'disetujui')}
                              disabled={processingId === item.id}
                              className={`flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded ${processingId === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {processingId === item.id ? <FaSpinner className="animate-spin" /> : <><FaCheck /> Setujui</>}
                            </button>
                            <button
                              onClick={() => handleKonfirmasi(item.id, 'ditolak')}
                              disabled={processingId === item.id}
                              className={`flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded ${processingId === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {processingId === item.id ? <FaSpinner className="animate-spin" /> : <><FaTimes /> Tolak</>}
                            </button>
                          </div>
                        )}
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
  );
};

export default KonfirmasiPeminjaman;
