import React, { useState, useRef, useEffect } from 'react';
import SidebarP from './SidebarP';
import { FaUserCircle, FaPlusCircle, FaBoxOpen, FaSearch } from 'react-icons/fa';

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

    console.log('selectedBarang', selectedBarang);
    console.log('form.jumlah', form.jumlah);

    const jumlahNum = Number(form.jumlah); // convert ke number dulu
    // Validasi tanggal pengembalian tidak boleh kurang dari tanggal pinjam
    if (form.tanggal_pengembalian < form.tanggal_pinjam) {
      alert('Tanggal pengembalian tidak boleh kurang dari tanggal pinjam!');
      setLoading(false); // reset loading
      return; // hentikan submit
    }
    if (selectedBarang && jumlahNum > Number(selectedBarang.jumlah_barang)) {
      alert('Jumlah barang tidak cukup!');
      setLoading(false); // reset loading
      return;
    }

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
        {/* Main Content: Form + Daftar Barang */}
        <div className="w-full max-w-6xl mt-20">
          <div className="bg-white/90 rounded-3xl shadow-2xl p-0 border border-blue-100 relative overflow-hidden flex flex-col md:flex-row gap-10">
            {/* Decorative Gradient Circles */}
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full opacity-30 z-0"></div>
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-gradient-to-tr from-blue-100 to-blue-300 rounded-full opacity-20 z-0"></div>
            {/* Form Section - TAMPILAN FORMAL SEPERTI SISTEM KASIR/EXCEL */}
            <div className="relative z-10 flex-1 p-10">
              <h1 className="text-2xl font-bold mb-6 text-blue-700 border-b pb-4 flex items-center gap-3">
                <FaPlusCircle className="text-green-500" /> Form Pengajuan Peminjaman
              </h1>
              <form onSubmit={handleSubmit} className="w-full">
                <table className="w-full border border-blue-200 rounded-xl bg-white shadow-lg">
                  <tbody>
                    <tr className="border-b border-blue-100">
                      <td className="py-3 px-4 font-semibold text-blue-700 bg-blue-50 w-1/3">Nama Peminjam</td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={nama}
                          disabled
                          className="w-full bg-blue-50 border-none text-blue-700 font-semibold"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-blue-100">
                      <td className="py-3 px-4 font-semibold text-blue-700 bg-blue-50">Nama Barang</td>
                      <td className="py-3 px-4 relative">
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
                          className="w-full border border-blue-200 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-blue-300 pl-10"
                          autoComplete="off"
                        />
                        <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-300" />
                        {showBarangList && barangSearch && (
                          <ul className="absolute z-20 bg-white border border-blue-200 rounded-xl mt-1 w-full max-h-48 overflow-auto shadow-xl">
                            {filteredBarang.length > 0 ? (
                              filteredBarang.map(barang => (
                                <li
                                  key={barang.id}
                                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition"
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
                      </td>
                    </tr>
                    <tr className="border-b border-blue-100">
                      <td className="py-3 px-4 font-semibold text-blue-700 bg-blue-50">Kategori</td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={form.kategori}
                          disabled
                          className="w-full bg-blue-50 border-none text-blue-700"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-blue-100">
                      <td className="py-3 px-4 font-semibold text-blue-700 bg-blue-50">Kualitas Barang</td>
                      <td className="py-3 px-4">
                        <select
                          name="kbarang_id"
                          value={form.kbarang_id}
                          onChange={handleChange}
                          required
                          className="w-full border border-blue-200 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-blue-300"
                        >
                          <option value="">Pilih Kualitas</option>
                          {kualitasList.map(k => (
                            <option key={k.id} value={k.id}>
                              {k.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    <tr className="border-b border-blue-100">
                      <td className="py-3 px-4 font-semibold text-blue-700 bg-blue-50">Jumlah</td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          name="jumlah"
                          value={form.jumlah}
                          min={1}
                          onChange={handleChange}
                          required
                          className="w-full border border-blue-200 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-blue-300"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-blue-100">
                      <td className="py-3 px-4 font-semibold text-blue-700 bg-blue-50">Tanggal Pinjam</td>
                      <td className="py-3 px-4">
                        <input
                          type="date"
                          name="tanggal_pinjam"
                          value={form.tanggal_pinjam}
                          onChange={handleChange}
                          required
                          className="w-full border border-blue-200 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-blue-300"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-blue-700 bg-blue-50">Tanggal Kembali</td>
                      <td className="py-3 px-4">
                        <input
                          type="date"
                          name="tanggal_pengembalian"
                          value={form.tanggal_pengembalian}
                          onChange={handleChange}
                          required
                          className="w-full border border-blue-200 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-blue-300"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-extrabold shadow-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 text-lg flex items-center gap-2 tracking-wide"
                  >
                    {loading && (
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                    )}
                    {loading ? 'Memproses...' : 'Ajukan Peminjaman'}
                  </button>
                </div>
              </form>
            </div>
            {/* List Barang Section */}
            <div className="relative z-10 flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border border-blue-100 p-8 max-h-[700px] overflow-y-auto min-w-[320px]">
              <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                <FaBoxOpen className="text-yellow-500" /> Daftar Barang
              </h2>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari barang di daftar..."
                    value={barangSearch}
                    onChange={e => {
                      setBarangSearch(e.target.value);
                      setShowBarangList(true);
                    }}
                    className="border border-blue-200 rounded-lg px-3 py-2 w-full pl-10 focus:ring-2 focus:ring-blue-300"
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                </div>
              </div>
              <ul className="space-y-3">
                {filteredBarang.length > 0 ? (
                  filteredBarang.slice(0, 10).map(barang => (
                    <li
                      key={barang.id}
                      className={`flex items-center gap-3 p-3 rounded-xl shadow hover:bg-blue-100 cursor-pointer transition border border-blue-100 bg-white ${
                        form.barang_id === barang.id ? 'ring-2 ring-blue-400' : ''
                      }`}
                      onClick={() => handleSelectBarang(barang)}
                    >
                      <img
                        src={barang.image ? getImageUrl(barang.image) : 'https://via.placeholder.com/48x48?text=No+Img'}
                        alt={barang.name}
                        className="w-12 h-12 object-cover rounded-lg border border-blue-100 bg-white"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-blue-700">{barang.name}</div>
                        <div className="text-xs text-gray-500">{barang.category?.name || '-'}</div>
                      </div>
                      <div className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full font-bold">
                        {barang.stok} stok
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 text-center py-8">Barang tidak ditemukan.</li>
                )}
              </ul>
              <div className="mt-6 text-xs text-gray-400 text-center">
                Klik pada barang untuk memilih dan mengisi form otomatis.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MengajukanPeminjaman;