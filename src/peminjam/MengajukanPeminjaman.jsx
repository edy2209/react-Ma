import React, { useState, useRef, useEffect } from 'react';
import SidebarP from './SidebarP';
import { FaUserCircle, FaPlusCircle, FaSearch, FaBox } from 'react-icons/fa';

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

  // Loading state
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
    const fetchData = async () => {
      try {
        // Fetch data barang
        const barangResponse = await fetch('http://localhost:8000/api/barang');
        const barangResult = await barangResponse.json();
        
        // Filter hanya barang yang boleh dipinjam dan pastikan data valid
        const filtered = barangResult.data.filter(item => 
          item.status_pinjam === true && 
          item.id && 
          item.name && 
          item.jumlah_barang
        );
        
        setBarangList(filtered);

        // Fetch data kualitas dengan penanganan response yang benar
        const kualitasResponse = await fetch('http://localhost:8000/api/kbarang', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const kualitasResult = await kualitasResponse.json();
        
        // Perbaikan utama: Response langsung berupa array, tidak perlu .data
        if (Array.isArray(kualitasResult)) {
          setKualitasList(kualitasResult);
          console.log('Data kualitas loaded:', kualitasResult); // Debugging
        } else {
          console.error('Format data kualitas tidak valid:', kualitasResult);
          setKualitasList([]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setKualitasList([]); // Set empty array jika error
      }
    };

    fetchData();
  }, []);

  // Update form jika barang dipilih
  useEffect(() => {
    if (form.barang_id) {
      const barang = barangList.find(b => b.id === parseInt(form.barang_id));
      setSelectedBarang(barang);
      
      let kategori = '';
      if (barang) {
        kategori = barang.category || barang.kategori || '';
      }
      
      setForm(f => ({
        ...f,
        kategori: kategori,
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
    b.name && b.name.toLowerCase().includes(barangSearch.toLowerCase())
  );

  const handleSelectBarang = (barang) => {
    setForm(f => ({ ...f, barang_id: barang.id }));
    setBarangSearch(barang.name);
    setShowBarangList(false);
    setSelectedBarang(barang);
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
    if (!form.barang_id || !form.kbarang_id) {
      alert('Pilih barang dan kualitas terlebih dahulu!');
      return;
    }
    
    setLoading(true);

    const jumlahNum = Number(form.jumlah);
    if (form.tanggal_pengembalian < form.tanggal_pinjam) {
      alert('Tanggal pengembalian tidak boleh kurang dari tanggal pinjam!');
      setLoading(false);
      return;
    }
    
    if (selectedBarang && jumlahNum > Number(selectedBarang.jumlah_barang)) {
      alert('Jumlah barang tidak cukup!');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/peminjaman', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          peminjam_id,
          barang_id: form.barang_id,
          jumlah: form.jumlah,
          tanggal_pinjam: form.tanggal_pinjam,
          tanggal_pengembalian: form.tanggal_pengembalian,
          kbarang_id: form.kbarang_id,
        }),
      });
      
      const result = await res.json();
      
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
        alert(result.message || 'Gagal mengajukan peminjaman!');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Terjadi kesalahan saat mengajukan peminjaman');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <SidebarP />
      <div className="ml-64 flex flex-col items-center justify-center w-full">
        {/* Profile di pojok kanan atas */}
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
        
        {/* Main Content - Centered Form */}
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100 relative overflow-hidden">
            {/* Form Header */}
            <div className="relative z-10 mb-8">
              <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-3">
                <FaPlusCircle className="text-green-500" /> Form Pengajuan Peminjaman
              </h1>
              <p className="text-blue-400 mt-2">Isi form berikut untuk mengajukan peminjaman barang</p>
            </div>

            {/* Item Preview Section */}
            {selectedBarang && (
              <div className="relative z-10 mb-8 bg-blue-50 rounded-xl p-6 border border-blue-200 flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-lg bg-white border border-blue-200 flex items-center justify-center overflow-hidden">
                    {selectedBarang.image_url ? (
                      <img 
                        src={selectedBarang.image_url} 
                        alt={selectedBarang.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/96x96?text=No+Image';
                        }}
                      />
                    ) : (
                      <FaBox className="text-4xl text-blue-300" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-700">{selectedBarang.name}</h3>
                  <div className="flex gap-4 mt-2">
                    <div className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      Kategori: {form.kategori || '-'}
                    </div>
                    <div className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      Stok: {selectedBarang.jumlah_barang}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Nama Peminjam</label>
                    <input
                      type="text"
                      value={nama}
                      disabled
                      className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-blue-700 font-medium"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-blue-700 mb-1">Cari Barang</label>
                    <div className="relative">
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
                        className="w-full border border-blue-200 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-300 pl-12"
                        autoComplete="off"
                      />
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                    </div>
                    {showBarangList && barangSearch && (
                      <ul className="absolute z-20 bg-white border border-blue-200 rounded-lg mt-1 w-full max-h-64 overflow-auto shadow-xl">
                        {filteredBarang.length > 0 ? (
                          filteredBarang.map(barang => (
                            <li
                              key={barang.id}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition flex items-center gap-3"
                              onClick={() => handleSelectBarang(barang)}
                            >
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                {barang.image_url ? (
                                  <img 
                                    src={barang.image_url} 
                                    alt={barang.name}
                                    className="w-full h-full object-cover rounded"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/32x32?text=No+Img';
                                    }}
                                  />
                                ) : (
                                  <FaBox className="text-blue-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-blue-700">{barang.name}</div>
                                <div className="text-xs text-blue-400">
                                  {barang.category || '-'}
                                </div>
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-3 text-gray-400 text-center">Barang tidak ditemukan</li>
                        )}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Kategori</label>
                    <input
                      type="text"
                      value={form.kategori}
                      disabled
                      className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-blue-700"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Kualitas Barang</label>
                    <select
                      name="kbarang_id"
                      value={form.kbarang_id}
                      onChange={handleChange}
                      required
                      className="w-full border border-blue-200 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="">Pilih Kualitas</option>
                      {kualitasList.length > 0 ? (
                        kualitasList.map(k => (
                          <option key={k.id} value={k.id}>
                            {k.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Memuat data kualitas...</option>
                      )}
                    </select>
                    {kualitasList.length === 0 && (
                      <p className="text-xs text-blue-500 mt-1">Sedang memuat data kualitas...</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Jumlah Pinjam</label>
                    <input
                      type="number"
                      name="jumlah"
                      value={form.jumlah}
                      min={1}
                      max={selectedBarang?.jumlah_barang || 100}
                      onChange={handleChange}
                      required
                      className="w-full border border-blue-200 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-300"
                    />
                    {selectedBarang && (
                      <div className="text-xs text-blue-500 mt-1">
                        Maksimal: {selectedBarang.jumlah_barang} tersedia
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Tanggal Pinjam</label>
                    <input
                      type="date"
                      name="tanggal_pinjam"
                      value={form.tanggal_pinjam}
                      onChange={handleChange}
                      required
                      className="w-full border border-blue-200 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Tanggal Kembali</label>
                    <input
                      type="date"
                      name="tanggal_pengembalian"
                      value={form.tanggal_pengembalian}
                      onChange={handleChange}
                      required
                      min={form.tanggal_pinjam}
                      className="w-full border border-blue-200 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 text-lg flex items-center gap-2 tracking-wide"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <FaPlusCircle />
                      Ajukan Peminjaman
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MengajukanPeminjaman;