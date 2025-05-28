import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './atasan/Dashboard';
import DashboardPeminjam from './peminjam/DashboardP';
import ProtectedRoute from './protectedRoute';
import LaporanAset from './atasan/LaporanAset';
import StatusMaintenance from './atasan/StatusMaintenance';
import LaporanPeminjaman from './atasan/LaporanPeminjaman';
import MengajukanPeminjaman from './peminjam/MengajukanPeminjaman';
import BarangDipinjam from './peminjam/BarangDipinjam';
import DataAset from './peminjam/DataAset';
import BarangDikembalikan from './peminjam/BarangDikembalikan';
import BayarDenda from './peminjam/BayarDenda';







// Peminjam Pages
// import DashboardPeminjam from './peminjam/Dashboard';
// import PinjamBarang from './peminjam/PinjamBarang';
// import RiwayatPeminjamanPeminjam from './peminjam/RiwayatPeminjaman';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      
        {/* Dashboard */}
        <Route path="/dashboard-a" element={<ProtectedRoute element={<Dashboard />} />} /> 
      

        <Route path="/dashboard-p" element={<ProtectedRoute element={<DashboardPeminjam />} />} />

        <Route path="/atasan/laporan-aset" element={<ProtectedRoute element={<LaporanAset />} />} />
        
        <Route path="/atasan/status-maintenance" element={<ProtectedRoute element={<StatusMaintenance />} />} />
      
        <Route path="/atasan/laporan-peminjaman" element={<ProtectedRoute element={<LaporanPeminjaman />} />} />

        <Route path="/peminjam/ajukan-peminjaman" element={<ProtectedRoute element={<MengajukanPeminjaman />} />} />
        <Route path="/peminjam/barang-dipinjam" element={<ProtectedRoute element={<BarangDipinjam />} />} />
        <Route path="/peminjam/data-aset" element={<ProtectedRoute element={<DataAset />} />} />
        <Route path="/peminjam/barang-dikembalikan" element={<ProtectedRoute element={<BarangDikembalikan />} />} />
        <Route path="/peminjam/denda" element={<ProtectedRoute element={<BayarDenda />} />} />
        
      </Routes>
    </Router>
  );
};

export default App;
