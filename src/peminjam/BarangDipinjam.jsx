import React, { useEffect, useState, useRef } from 'react';
import SidebarP from './SidebarP';
import { FaUserCircle, FaSearch, FaBoxOpen, FaUndoAlt, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';

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
    if (!kbarang_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Pilih kualitas barang saat dikembalikan!',
        confirmButtonColor: '#3B82F6',
        confirmButtonText: 'Mengerti'
      });
      return;
    }
    
    setModalLoading(true);
    
    try {
      const res = await fetch('http://localhost:8000/api/pengembalian', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
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
      
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          html: `
            <div class="text-center">
              <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h3 class="text-xl font-bold text-gray-800 mt-4">Pengembalian Diajukan!</h3>
              <p class="text-gray-600 mt-2">Barang ${selected.barang?.name} berhasil diajukan untuk dikembalikan</p>
            </div>
          `,
          showConfirmButton: true,
          confirmButtonColor: '#10B981',
          confirmButtonText: 'Selesai',
        });
        
        // Update state
        setData(data.filter(d => d.id !== selected.id));
        setShowModal(false);
        setSelected(null);
      } else {
        const result = await res.json();
        Swal.fire({
          icon: 'error',
          title: 'Gagal Mengajukan',
          text: result.message || 'Terjadi kesalahan saat mengajukan pengembalian',
          confirmButtonColor: '#EF4444',
          confirmButtonText: 'Coba Lagi'
        });
      }
    } catch (err) {
      console.error('Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan Sistem',
        text: 'Terjadi kesalahan saat menghubungi server',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Mengerti'
      });
    } finally {
      setModalLoading(false);
    }
  };

  // Filter data berdasarkan search
  const filteredData = data.filter((p) =>
    (p.barang?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <SidebarP />
      <div className="ml-64 w-full min-h-screen flex flex-col px-6 py-10">
        {/* Header profile dengan dropdown */}
        <div className="flex justify-end items-center mb-8">
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
        
        {/* Judul & Search */}
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow">
                <FaBoxOpen className="text-2xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800">
                Barang Dipinjam
              </h2>
            </div>
            <p className="text-slate-500 text-lg max-w-2xl">
              Daftar barang yang sedang Anda pinjam beserta status peminjamannya.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama barang..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow focus:ring-2 focus:ring-blue-300 text-base min-w-[280px] focus:outline-none"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            </div>
          </div>
        </div>
        
        {/* Card Container */}
        <div className="w-full max-w-7xl mx-auto">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full mb-4"></div>
                <div className="h-4 bg-blue-100 rounded w-48 mb-2"></div>
                <div className="h-4 bg-blue-100 rounded w-32"></div>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-100 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mb-6">
                <FaBoxOpen className="text-4xl text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">Tidak Ada Barang Dipinjam</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Saat ini tidak ada barang yang sedang Anda pinjam. Silakan ajukan peminjaman barang melalui menu Peminjaman.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((p, idx) => (
                <div 
                  key={p.id || idx} 
                  className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-slate-200 flex items-center justify-center">
                      {p.barang?.image ? (
                        <img
                          src={`http://localhost:8000/storage/${p.barang.image}`}
                          alt={p.barang?.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <FaBoxOpen className="text-blue-400 text-2xl" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{p.barang?.name || '-'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold
                          ${p.status === 'dipinjam' ? 'bg-yellow-100 text-yellow-700' :
                            p.status === 'disetujui' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-500'}`}>
                          {p.status || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Tanggal Pinjam</div>
                        <div className="font-medium text-slate-800">{p.tanggal_pinjam || '-'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Tanggal Kembali</div>
                        <div className="font-medium text-slate-800">{p.tanggal_pengembalian || '-'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Jumlah</div>
                        <div className="font-medium text-slate-800">{p.jumlah || '-'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                        <FaInfoCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">ID Barang</div>
                        <div className="font-medium text-slate-800">{p.barang?.id || '-'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-gradient-to-r from-slate-50 to-slate-100">
                    <button
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-bold shadow hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                      onClick={() => handleKembalikan(p)}
                    >
                      <FaUndoAlt /> Kembalikan Barang
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Pengembalian */}
        {showModal && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-slate-100 animate-scale-in">
              <button
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-2xl transition-colors"
                onClick={() => setShowModal(false)}
                disabled={modalLoading}
              >
                &times;
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow">
                  <FaUndoAlt className="text-xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Konfirmasi Pengembalian</h3>
              </div>
              
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                    {selected.barang?.image ? (
                      <img
                        src={`http://localhost:8000/storage/${selected.barang.image}`}
                        alt={selected.barang?.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <FaBoxOpen className="text-blue-400 text-2xl" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{selected.barang?.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {selected.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500">Jumlah</div>
                    <div className="font-bold text-slate-800">{selected.jumlah}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500">ID Peminjaman</div>
                    <div className="font-bold text-slate-800">{selected.id}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500">Tanggal Pinjam</div>
                    <div className="font-bold text-slate-800">{selected.tanggal_pinjam}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500">Tanggal Kembali</div>
                    <div className="font-bold text-slate-800">{selected.tanggal_pengembalian}</div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmitPengembalian}>
                <div className="mb-6">
                  <label className="block mb-2 font-medium text-slate-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 13.047 14.01c-.04.3-.25.536-.547.58-.297.045-.577-.12-.688-.416l-.99-2.5-2.432.809c-.3.1-.63-.05-.776-.33l-1.5-2.5a.5.5 0 01.23-.73l2.5-1 .5-1.5a.5.5 0 01.69-.31l2.5 1 .5 1.5a.5.5 0 01-.23.73l-2.5 1-.5 1.5.23.73 2.432-.81.99 2.5c.111.296.39.46.688.416.298-.044.508-.28.547-.58L15.854 7.8l1.099-4.056A1 1 0 0118 3h-5a1 1 0 01-1-1V2z" clipRule="evenodd" />
                    </svg>
                    Kualitas Barang Saat Dikembalikan
                  </label>
                  <select
                    value={kbarang_id}
                    onChange={e => setKbarangId(e.target.value)}
                    required
                    className="border border-slate-200 rounded-xl px-4 py-3 w-full bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  >
                    <option value="">Pilih Kualitas</option>
                    {kualitasList.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-2">
                    Pilih kondisi barang saat dikembalikan sesuai dengan keadaan sebenarnya
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-80"
                  disabled={modalLoading}
                >
                  {modalLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
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

export default BarangDipinjam;