import React, { useEffect, useState, useRef } from 'react';
import SidebarP from './SidebarP';
import { FaUserCircle, FaSearch } from 'react-icons/fa';

const BarangDipinjam = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [kualitasList, setKualitasList] = useState([]);
  const [kbarang_id, setKbarangId] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [search, setSearch] = useState('');

  const profileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';

  // Ambil data peminjaman dari API
  useEffect(() => {
    fetch('http://localhost:8000/api/peminjaman')
      .then(res => res.json())
      .then(res => {
        const userId = user?.id;
        const filtered = res.filter(
          d =>
            (d.status === 'dipinjam' || d.status === 'disetujui') &&
            (d.peminjam_id === userId || d.peminjam?.id === userId)
        );
        setData(filtered);
        setLoading(false);
      });
    fetch('http://localhost:8000/api/kbarang')
      .then(res => res.json())
      .then(data => setKualitasList(data));
  }, [user]);

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

  // Handler tombol kembalikan: buka modal
  const handleKembalikan = (item) => {
    setSelected(item);
    setKbarangId('');
    setShowModal(true);
  };

  // Submit pengembalian
  const handleSubmitPengembalian = async (e) => {
    e.preventDefault();
    if (!kbarang_id) return alert('Pilih kualitas barang!');
    setModalLoading(true);
    const res = await fetch('http://localhost:8000/api/pengembalian', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        peminjam_id: selected.peminjam_id,
        barang_id: selected.barang_id,
        kbarang_id,
        jumlah: selected.jumlah,
        tanggal_pinjam: selected.tanggal_pinjam,
        tanggal_pengembalian: selected.tanggal_pengembalian,
        status: 'diproses',
      }),
    });
    setModalLoading(false);
    if (res.ok) {
      alert('Pengembalian berhasil diajukan!');
      setData(data.filter(d => d.id !== selected.id));
      setShowModal(false);
      setSelected(null);
    } else {
      alert('Gagal mengajukan pengembalian!');
    }
  };

  // Filter data berdasarkan search
  const filteredData = data.filter((p) =>
    (p.barang?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <SidebarP />
      <div className="ml-64 p-6 w-full min-h-screen bg-gray-50">
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <h2 className="text-2xl font-bold mb-2 md:mb-0 text-blue-700">Barang Dipinjam</h2>
          <div className="flex items-center gap-2 w-full md:w-1/3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Cari nama barang..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-blue-200 rounded-lg px-3 py-2 w-full pl-10 focus:ring-2 focus:ring-blue-300"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700">
                <th className="py-3 px-4 text-left font-semibold">No</th>
                <th className="py-3 px-4 text-left font-semibold">Nama Barang</th>
                <th className="py-3 px-4 text-left font-semibold">Jumlah</th>
                <th className="py-3 px-4 text-left font-semibold">Tanggal Pinjam</th>
                <th className="py-3 px-4 text-left font-semibold">Tanggal Kembali</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
                <th className="py-3 px-4 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-400">
                    Tidak ada barang yang sedang dipinjam.
                  </td>
                </tr>
              ) : (
                filteredData.map((p, idx) => (
                  <tr key={p.id || idx} className="border-b hover:bg-blue-50 transition">
                    <td className="py-2 px-4">{idx + 1}</td>
                    <td className="py-2 px-4">{p.barang?.name || '-'}</td>
                    <td className="py-2 px-4">{p.jumlah || '-'}</td>
                    <td className="py-2 px-4">{p.tanggal_pinjam || '-'}</td>
                    <td className="py-2 px-4">{p.tanggal_pengembalian || '-'}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold
                        ${p.status === 'dipinjam' ? 'bg-yellow-100 text-yellow-700' :
                          p.status === 'disetujui' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-500'}`}>
                        {p.status || '-'}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                        onClick={() => handleKembalikan(p)}
                      >
                        Kembalikan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Pengembalian */}
        {showModal && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={() => setShowModal(false)}
                disabled={modalLoading}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4 text-blue-700">Konfirmasi Pengembalian</h3>
              <div className="mb-4">
                <div className="mb-2"><b>Nama Barang:</b> {selected.barang?.name}</div>
                <div className="mb-2"><b>Jumlah:</b> {selected.jumlah}</div>
                <div className="mb-2"><b>Tanggal Pinjam:</b> {selected.tanggal_pinjam}</div>
                <div className="mb-2"><b>Tanggal Kembali:</b> {selected.tanggal_pengembalian}</div>
              </div>
              <form onSubmit={handleSubmitPengembalian}>
                <div className="mb-4">
                  <label className="block mb-1 font-semibold text-blue-700">Kualitas Barang Saat Dikembalikan</label>
                  <select
                    value={kbarang_id}
                    onChange={e => setKbarangId(e.target.value)}
                    required
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Pilih Kualitas</option>
                    {kualitasList.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 text-lg"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Memproses...' : 'Konfirmasi Pengembalian'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarangDipinjam;