import React, { useEffect, useState, useRef } from 'react';
import SidebarP from './SidebarP';
import { FaUserCircle, FaSearch, FaBoxOpen, FaUndoAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

const BarangDipinjam = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [kualitasList, setKualitasList] = useState([]);
  const [kbarangId, setKbarangId] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [search, setSearch] = useState('');

  const profileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';

  // Ambil data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const peminjamanRes = await fetch('http://localhost:8000/api/peminjaman');
        const peminjamanData = await peminjamanRes.json();
        const userId = user?.id;

        const filtered = peminjamanData.filter(
          d =>
            ['dipinjam', 'disetujui'].includes(d.status) &&
            (d.peminjam_id === userId || d.peminjam?.id === userId)
        );

        setData(filtered);
        setLoading(false);
      } catch (err) {
        console.error('Gagal mengambil data peminjaman:', err);
      }

      try {
        const kualitasRes = await fetch('http://localhost:8000/api/kbarang');
        const kualitasData = await kualitasRes.json();
        setKualitasList(kualitasData);
      } catch (err) {
        console.error('Gagal mengambil data kualitas barang:', err);
      }
    };

    fetchData();
  }, [user]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleKembalikan = (item) => {
    setSelected(item);
    setKbarangId('');
    setShowModal(true);
  };

  const handleSubmitPengembalian = async (e) => {
    e.preventDefault();

    if (!kbarangId) {
      Swal.fire({
        title: 'Peringatan!',
        text: 'Pilih kualitas barang!',
        icon: 'error'
      });
      return;
    }

    setModalLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/pengembalian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peminjam_id: selected.peminjam_id,
          barang_id: selected.barang_id,
          kbarang_id: kbarangId,
          jumlah: selected.jumlah,
          tanggal_pinjam: selected.tanggal_pinjam,
          tanggal_pengembalian: selected.tanggal_pengembalian,
          status: 'diproses'
        })
      });

      setModalLoading(false);

      if (res.ok) {
        Swal.fire({
          title: 'Info',
          text: 'Pengembalian berhasil diajukan!',
          icon: 'success'
        });

        setData(data.filter(d => d.id !== selected.id));
        setShowModal(false);
        setSelected(null);
      } else {
        Swal.fire({
          title: 'Info',
          text: 'Gagal mengajukan pengembalian!',
          icon: 'error'
        });
      }
    } catch (err) {
      setModalLoading(false);
      Swal.fire({
        title: 'Error',
        text: 'Terjadi kesalahan saat mengirim data!',
        icon: 'error'
      });
    }
  };

  // Filter data berdasarkan pencarian
  const filteredData = data.filter((item) =>
    (item.barang?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <SidebarP />
      <div className="ml-64 w-full min-h-screen flex flex-col px-6 py-10">
        {/* Header User */}
        <div className="flex justify-end items-center mb-8">
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="focus:outline-none"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg border border-blue-200 hover:scale-105 transition">
                <FaUserCircle className="text-4xl text-blue-500" />
              </div>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg z-10 animate-fade-in">
                <div className="px-4 py-3 border-b text-blue-700 font-semibold">{nama}</div>
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

        {/* Header & Search */}
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-blue-700 flex items-center gap-3 drop-shadow-lg">
              <FaBoxOpen className="text-yellow-400" /> Barang Dipinjam
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Daftar barang yang sedang kamu pinjam dan statusnya.
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-2xl border border-blue-200 bg-white shadow focus:ring-2 focus:ring-blue-300 text-lg min-w-[320px]"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 text-xl" />
          </div>
        </div>

        {/* Tabel Barang Dipinjam */}
        <div className="w-full max-w-7xl mx-auto bg-white/90 rounded-3xl shadow-2xl border border-blue-100 overflow-x-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700">
                <th className="py-4 px-6 text-left font-bold">No</th>
                <th className="py-4 px-6 text-left font-bold">Nama Barang</th>
                <th className="py-4 px-6 text-left font-bold">Jumlah</th>
                <th className="py-4 px-6 text-left font-bold">Tanggal Pinjam</th>
                <th className="py-4 px-6 text-left font-bold">Tanggal Kembali</th>
                <th className="py-4 px-6 text-left font-bold">Status</th>
                <th className="py-4 px-6 text-left font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-blue-400 text-lg font-bold">
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-lg">
                    Tidak ada barang yang sedang dipinjam.
                  </td>
                </tr>
              ) : (
                filteredData.map((p, idx) => (
                  <tr key={p.id || idx} className="border-b hover:bg-blue-50/60 transition">
                    <td className="py-3 px-6 font-semibold">{idx + 1}</td>
                    <td className="py-3 px-6 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow">
                        {p.barang?.image ? (
                          <img
                            src={`http://localhost:8000/storage/${p.barang.image}`}
                            alt={p.barang?.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <FaBoxOpen className="text-blue-300 text-2xl" />
                        )}
                      </div>
                      <span className="font-bold text-blue-700">{p.barang?.name || '-'}</span>
                    </td>
                    <td className="py-3 px-6">{p.jumlah || '-'}</td>
                    <td className="py-3 px-6">{p.tanggal_pinjam || '-'}</td>
                    <td className="py-3 px-6">{p.tanggal_pengembalian || '-'}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                          p.status === 'dipinjam'
                            ? 'bg-yellow-100 text-yellow-700'
                            : p.status === 'disetujui'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.status || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <button
                        onClick={() => handleKembalikan(p)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white px-5 py-2 rounded-full font-bold shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 text-base"
                      >
                        <FaUndoAlt /> Kembalikan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Konfirmasi Pengembalian */}
        {showModal && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg relative border border-blue-100">
              <button
                className="absolute top-4 right-6 text-gray-400 hover:text-blue-700 text-3xl"
                onClick={() => setShowModal(false)}
                disabled={modalLoading}
              >
                &times;
              </button>
              <h3 className="text-2xl font-extrabold mb-6 text-blue-700 flex items-center gap-2">
                <FaUndoAlt className="text-blue-400" /> Konfirmasi Pengembalian
              </h3>

              {/* Detail Barang */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <Detail label="Nama Barang" value={selected.barang?.name} />
                <Detail label="Jumlah" value={selected.jumlah} />
                <Detail label="Tanggal Pinjam" value={selected.tanggal_pinjam} />
                <Detail label="Tanggal Kembali" value={selected.tanggal_pengembalian} />
              </div>

              {/* Form Pengembalian */}
              <form onSubmit={handleSubmitPengembalian}>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold text-blue-700">
                    Kualitas Barang Saat Dikembalikan
                  </label>
                  <select
                    value={kbarangId}
                    onChange={(e) => setKbarangId(e.target.value)}
                    required
                    className="border border-blue-200 rounded-xl px-4 py-3 w-full bg-white focus:ring-2 focus:ring-blue-300 text-base"
                  >
                    <option value="">Pilih Kualitas</option>
                    {kualitasList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-full font-extrabold shadow-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 text-lg flex items-center justify-center gap-2"
                >
                  {modalLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : (
                    <>
                      <FaUndoAlt /> Konfirmasi Pengembalian
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Komponen kecil untuk menampilkan detail di modal
const Detail = ({ label, value }) => (
  <div>
    <div className="text-gray-500 text-sm">{label}</div>
    <div className="font-bold text-blue-700">{value}</div>
  </div>
);

export default BarangDipinjam;
