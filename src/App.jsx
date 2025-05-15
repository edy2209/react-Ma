import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './atasan/Dashboard';
import DashboardPeminjam from './peminjam/DashboardP';
import ProtectedRoute from './protectedRoute';





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

      
        
      </Routes>
    </Router>
  );
};

export default App;
