import React, { useState, useRef, useEffect } from 'react';
import SidebarP from './SidebarP';
import { FaUserCircle, FaPlusCircle } from 'react-icons/fa';

const MengajukanPeminjaman = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nama = user?.name || 'User';
  const peminjam_id = user?.id;

  // State barang & kualitas
  const [barangList, setBarangList] = useState([]);
  const [kualitasList, setKualitasList] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);

  // Autocomplete barang
  const [barangSearch, setBarangSearch] = useState('');
  const [showBarangList, setShowBarangList] = useState(false);

  // Loading state untuk tombol submit
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    barang_id: '',
    jumlah: 1,
    tanggal_pinjam: '',
    tanggal_pengembalian: '',
    kategori: '',
    kbarang_id: '',
  });

  // Fetch barang & kualitas dari API
  useEffect(() => {
    fetch('http://localhost:8000/api/barang')
      .then(res => res.json())
      .then(data => setBarangList(data));
    fetch('http://localhost:8000/api/kbarang')
      .then(res => res.json())
      .then(data => setKualitasList(data));
  }, []);

  // Update form jika barang dipilih
  useEffect(() => {
    if (form.barang_id) {
      const barang = barangList.find(b => b.id === parseInt(form.barang_id));
      setSelectedBarang(barang);
      setForm(f => ({
        ...f,
        kategori: barang?.category?.name || '',
      }));
      setBarangSearch(barang?.name || '');
    } else {
      setSelectedBarang(null);
      setForm(f => ({ ...f, kategori: '' }));
      setBarangSearch('');
    }
  }, [form.barang_id, barangList]);

  // Dropdown profile logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete: filter barang
  const filteredBarang = barangList.filter(b =>
    b.name.toLowerCase().includes(barangSearch.toLowerCase())
  );

  const handleSelectBarang = (barang) => {
    setForm(f => ({ ...f, barang_id: barang.id }));
    setBarangSearch(barang.name);
    setShowBarangList(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.barang_id || !form.kbarang_id) return alert('Pilih barang dan kualitas terlebih dahulu!');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/peminjaman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peminjam_id,
          barang_id: form.barang_id,
          jumlah: form.jumlah,
          tanggal_pinjam: form.tanggal_pinjam,
          tanggal_pengembalian: form.tanggal_pengembalian,
          kbarang_id: form.kbarang_id,
        }),
      });
      if (res.ok) {
        alert('Pengajuan peminjaman berhasil dikirim!');
        setForm({
          barang_id: '',
          jumlah: 1,
          tanggal_pinjam: '',
          tanggal_pengembalian: '',
          kategori: '',
          kbarang_id: '',
        });
        setSelectedBarang(null);
        setBarangSearch('');
      } else {
        alert('Gagal mengajukan peminjaman!');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk path gambar
  const getImageUrl = (img) => {
    if (!img) return '';
    return `http://localhost:8000/storage/${img}`;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <SidebarP />
      <div className="ml-64 flex flex-col items-center justify-center w-full">
        {/* Profile tetap di pojok kanan atas */}
        <div className="fixed top-6 right-10 z-20">
          <div className="relative" ref={profileRef}>
            <button
              className="focus:outline-none"
              onClick={() => setDropdownOpen((open) => !open)}
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
        <div className="w-full max-w-3xl mt-20">
          <div className="bg-white rounded-2xl shadow-xl p-10 border border-blue-100">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-blue-700">
              <FaPlusCircle className="text-green-500" /> Mengajukan Peminjaman
            </h1>
            {/* Gambar barang tampil di atas form jika ada */}
            {selectedBarang && selectedBarang.image && (
              <div className="flex justify-center mb-8">
                <img
                  src={getImageUrl(selectedBarang.image)}
                  alt={selectedBarang.name}
                  className="rounded-xl shadow-lg border border-blue-100 object-contain w-[320px] h-[220px] bg-white"
                  style={{ maxHeight: 220 }}
                />
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block mb-1 font-semibold text-blue-700">Nama Peminjam</label>
                  <input
                    type="text"
                    value={nama}
                    disabled
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full bg-blue-50 text-blue-700 font-semibold"
                  />
                </div>
                <div className="relative">
                  <label className="block mb-1 font-semibold text-blue-700">Nama Barang</label>
                  <input
                    type="text"
                    value={barangSearch}
                    onChange={e => {
                      setBarangSearch(e.target.value);
                      setShowBarangList(true);
                      setForm(f => ({ ...f, barang_id: '' }));
                    }}
                    onFocus={() => setShowBarangList(true)}
                    placeholder="Ketik nama barang..."
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-300"
                    autoComplete="off"
                  />
                  {showBarangList && barangSearch && (
                    <ul className="absolute z-10 bg-white border border-blue-200 rounded-lg mt-1 w-full max-h-48 overflow-auto shadow-lg">
                      {filteredBarang.length > 0 ? (
                        filteredBarang.map(barang => (
                          <li
                            key={barang.id}
                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                            onClick={() => handleSelectBarang(barang)}
                          >
                            {barang.name}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-gray-400">Barang tidak ditemukan</li>
                      )}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-blue-700">Kategori</label>
                  <input
                    type="text"
                    value={form.kategori}
                    disabled
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full bg-blue-50 text-blue-700"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-blue-700">Kualitas Barang</label>
                  <select
                    name="kbarang_id"
                    value={form.kbarang_id}
                    onChange={handleChange}
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
                <div>
                  <label className="block mb-1 font-semibold text-blue-700">Jumlah</label>
                  <input
                    type="number"
                    name="jumlah"
                    value={form.jumlah}
                    min={1}
                    onChange={handleChange}
                    required
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-blue-700">Tanggal Pinjam</label>
                  <input
                    type="date"
                    name="tanggal_pinjam"
                    value={form.tanggal_pinjam}
                    onChange={handleChange}
                    required
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-blue-700">Tanggal Kembali</label>
                  <input
                    type="date"
                    name="tanggal_pengembalian"
                    value={form.tanggal_pengembalian}
                    onChange={handleChange}
                    required
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-fit px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-bold shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 text-base flex items-center justify-center gap-2"
                style={{ minWidth: 160 }}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                )}
                {loading ? 'Memproses...' : 'Ajukan Peminjaman'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MengajukanPeminjaman;