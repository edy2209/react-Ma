import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.role === 'atasan') {
          navigate('/dashboard-a');
        } else if (response.data.role === 'peminjam') {
          navigate('/dashboard-p');
        }
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Email atau password salah.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg className="absolute top-0 left-0 opacity-30" width="600" height="600">
          <circle cx="300" cy="300" r="300" fill="#2563eb" />
        </svg>
        <svg className="absolute bottom-0 right-0 opacity-20" width="400" height="400">
          <circle cx="200" cy="200" r="200" fill="#38bdf8" />
        </svg>
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl px-10 py-12 border border-blue-200">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-tr from-blue-500 to-blue-400 rounded-full p-4 shadow-lg mb-4">
              <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
                <rect width="48" height="48" rx="24" fill="#2563eb" />
                <path d="M16 32L32 16M16 16h16v16" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-blue-800 mb-2 tracking-wide drop-shadow">Login</h2>
            <p className="text-blue-400 text-sm font-medium">Akses sistem manajemen aset teknologi</p>
          </div>
          {error && (
            <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center font-semibold shadow">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-blue-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                autoComplete="username"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:ring-2 focus:ring-blue-400 text-blue-800 font-semibold shadow-inner transition"
                placeholder="Masukkan email"
              />
            </div>
            <div>
              <label className="block text-blue-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:ring-2 focus:ring-blue-400 text-blue-800 font-semibold shadow-inner transition"
                placeholder="Masukkan password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-extrabold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-500 transition-all text-lg tracking-wide flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm0 0V7m0 4v4m0 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
              </svg>
              Login
            </button>
          </form>
          <p className="mt-6 text-center text-blue-600 font-medium">
            Belum punya akun?{' '}
            <Link to="/register" className="text-blue-500 hover:underline font-bold">
              Daftar di sini
            </Link>
          </p>
        </div>
        <div className="mt-8 text-center text-xs text-blue-200 font-mono tracking-widest">
          &copy; {new Date().getFullYear()} Management Asset System &mdash; Powered by Teknologi
        </div>
      </div>
    </div>
  );
};

export default Login;