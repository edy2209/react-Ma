import React, { useState, useRef, useEffect } from 'react';
import SidebarP from './SidebarP';
import { FaUserCircle, FaPlusCircle, FaSearch, FaBox, FaCalendarAlt, FaClipboardList } from 'react-icons/fa';
import Swal from 'sweetalert2';

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

        // Fetch data kualitas
        const kualitasResponse = await fetch('http://localhost:8000/api/kbarang', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const kualitasResult = await kualitasResponse.json();
        
        if (Array.isArray(kualitasResult)) {
          setKualitasList(kualitasResult);
        } else if (kualitasResult.data && Array.isArray(kualitasResult.data)) {
          setKualitasList(kualitasResult.data);
        } else {
          console.error('Format data kualitas tidak valid:', kualitasResult);
          setKualitasList([]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setKualitasList([]);
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
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Pilih barang dan kualitas terlebih dahulu!',
        confirmButtonColor: '#3B82F6',
        confirmButtonText: 'Mengerti'
      });
      return;
    }
    
    setLoading(true);

    const jumlahNum = Number(form.jumlah);
    if (form.tanggal_pengembalian < form.tanggal_pinjam) {
      Swal.fire({
        icon: 'error',
        title: 'Tanggal Tidak Valid',
        text: 'Tanggal pengembalian tidak boleh kurang dari tanggal pinjam!',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Perbaiki'
      });
      setLoading(false);
      return;
    }
    
    if (selectedBarang && jumlahNum > Number(selectedBarang.jumlah_barang)) {
      Swal.fire({
        icon: 'error',
        title: 'Stok Tidak Cukup',
        html: `Jumlah yang diminta melebihi stok yang tersedia!<br><span class="font-bold">Stok tersedia: ${selectedBarang.jumlah_barang}</span>`,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Mengerti'
      });
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
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          html: `
            <div class="text-center">
              <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h3 class="text-xl font-bold text-gray-800 mt-4">Pengajuan Berhasil!</h3>
              <p class="text-gray-600 mt-2">Peminjaman Anda telah diajukan dan sedang menunggu persetujuan</p>
            </div>
          `,
          showConfirmButton: true,
          confirmButtonColor: '#10B981',
          confirmButtonText: 'Selesai',
          timer: 5000
        });
        
        // Reset form
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
        Swal.fire({
          icon: 'error',
          title: 'Gagal Mengajukan',
          text: result.message || 'Terjadi kesalahan saat mengajukan peminjaman',
          confirmButtonColor: '#EF4444',
          confirmButtonText: 'Coba Lagi'
        });
      }
    } catch (err) {
      console.error('Submit error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan Sistem',
        text: 'Terjadi kesalahan saat menghubungi server',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Mengerti'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <SidebarP />
      <div className="ml-64 flex flex-col items-center justify-center w-full">
        {/* Profile di pojok kanan atas */}
        <div className="fixed top-6 right-10 z-20">
          <div className="relative" ref={profileRef}>
            <button
              className="focus:outline-none group"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                <FaUserCircle className="text-3xl text-white" />
              </div>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-10 animate-fade-in border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b text-indigo-700 font-semibold flex items-center gap-2">
                  <FaUserCircle className="text-blue-500" />
                  {nama}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content - Centered Form */}
        <div className="w-full max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full opacity-30 -m-16"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-full opacity-40 -m-24"></div>
            
            {/* Form Header */}
            <div className="relative z-10 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow">
                  <FaClipboardList className="text-2xl text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Form Pengajuan Peminjaman
                </h1>
              </div>
              <p className="text-slate-500 mt-2 max-w-2xl">
                Lengkapi formulir di bawah ini untuk mengajukan peminjaman barang. Pastikan semua informasi yang Anda berikan akurat dan sesuai.
              </p>
            </div>

            {/* Item Preview Section */}
            {selectedBarang && (
              <div className="relative z-10 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex items-center gap-6 shadow-sm">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-xl bg-white border border-blue-200 flex items-center justify-center overflow-hidden shadow-sm">
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
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800">{selectedBarang.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <div className="text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                      Kategori: {form.kategori || '-'}
                    </div>
                    <div className="text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium">
                      Stok: {selectedBarang.jumlah_barang}
                    </div>
                    <div className="text-sm bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-medium">
                      ID: {selectedBarang.id}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
                      <FaUserCircle className="text-blue-500" />
                      Informasi Peminjam
                    </h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nama Peminjam</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={nama}
                          disabled
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pl-12 text-slate-700 font-medium focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <FaUserCircle className="text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
                      <FaBox className="text-indigo-500" />
                      Pilih Barang
                    </h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Cari Barang</label>
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
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 pl-12 bg-white focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                          autoComplete="off"
                        />
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                      {showBarangList && barangSearch && (
                        <ul className="absolute z-20 bg-white border border-slate-200 rounded-xl mt-1 w-full max-h-64 overflow-auto shadow-xl">
                          {filteredBarang.length > 0 ? (
                            filteredBarang.map(barang => (
                              <li
                                key={barang.id}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition flex items-center gap-3 border-b border-slate-100 last:border-0"
                                onClick={() => handleSelectBarang(barang)}
                              >
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  {barang.image_url ? (
                                    <img 
                                      src={barang.image_url} 
                                      alt={barang.name}
                                      className="w-full h-full object-cover rounded-lg"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/40x40?text=No+Img';
                                      }}
                                    />
                                  ) : (
                                    <FaBox className="text-blue-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-slate-800 truncate">{barang.name}</div>
                                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                    <span>Stok: {barang.jumlah_barang}</span>
                                    <span className="mx-1">•</span>
                                    <span>{barang.category || '-'}</span>
                                  </div>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-3 text-slate-400 text-center">Barang tidak ditemukan</li>
                          )}
                        </ul>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                      <input
                        type="text"
                        value={form.kategori}
                        disabled
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 13.047 14.01c-.04.3-.25.536-.547.58-.297.045-.577-.12-.688-.416l-.99-2.5-2.432.809c-.3.1-.63-.05-.776-.33l-1.5-2.5a.5.5 0 01.23-.73l2.5-1 .5-1.5a.5.5 0 01.69-.31l2.5 1 .5 1.5a.5.5 0 01-.23.73l-2.5 1-.5 1.5.23.73 2.432-.81.99 2.5c.111.296.39.46.688.416.298-.044.508-.28.547-.58L15.854 7.8l1.099-4.056A1 1 0 0118 3h-5a1 1 0 01-1-1V2z" clipRule="evenodd" />
                      </svg>
                      Detail Peminjaman
                    </h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Kualitas Barang</label>
                      <select
                        name="kbarang_id"
                        value={form.kbarang_id}
                        onChange={handleChange}
                        required
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-300 focus:border-transparent"
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
                        <p className="text-xs text-blue-500 mt-2">Sedang memuat data kualitas...</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah Pinjam</label>
                      <input
                        type="number"
                        name="jumlah"
                        value={form.jumlah}
                        min={1}
                        max={selectedBarang?.jumlah_barang || 100}
                        onChange={handleChange}
                        required
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                      />
                      {selectedBarang && (
                        <div className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Maksimal: {selectedBarang.jumlah_barang} tersedia
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                          <FaCalendarAlt className="text-blue-500" />
                          Tanggal Pinjam
                        </label>
                        <input
                          type="date"
                          name="tanggal_pinjam"
                          value={form.tanggal_pinjam}
                          onChange={handleChange}
                          required
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                          <FaCalendarAlt className="text-indigo-500" />
                          Tanggal Kembali
                        </label>
                        <input
                          type="date"
                          name="tanggal_pengembalian"
                          value={form.tanggal_pengembalian}
                          onChange={handleChange}
                          required
                          min={form.tanggal_pinjam}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8 pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-lg flex items-center gap-2 tracking-wide transform hover:scale-[1.02]"
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