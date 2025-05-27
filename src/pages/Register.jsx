import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [emailForOtp, setEmailForOtp] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Registrasi berhasil! Kode OTP telah dikirim ke email Anda.');
        setIsOtpSent(true);
        setEmailForOtp(formData.email);
      } else {
        setMessage(result.message || 'Registrasi gagal');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan saat registrasi');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailForOtp,
          otp_code: otp,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Kode OTP berhasil diverifikasi! Akun Anda telah aktif.');
        setIsOtpSent(false);
        setFormData({ name: '', email: '', password: '' });
        setOtp('');
      } else {
        setMessage(result.message || 'Verifikasi OTP gagal');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan saat verifikasi OTP');
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
            <h2 className="text-3xl font-extrabold text-blue-800 mb-2 tracking-wide drop-shadow">Register</h2>
            <p className="text-blue-400 text-sm font-medium">Buat akun untuk mengakses sistem manajemen aset teknologi</p>
          </div>
          {message && (
            <div className="mb-4 text-center text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2 font-semibold shadow">
              {message}
            </div>
          )}

          {!isOtpSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-blue-700 text-sm font-bold mb-2" htmlFor="name">
                  Nama
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:ring-2 focus:ring-blue-400 text-blue-800 font-semibold shadow-inner transition"
                  placeholder="Masukkan nama"
                />
              </div>
              <div>
                <label className="block text-blue-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:ring-2 focus:ring-blue-400 text-blue-800 font-semibold shadow-inner transition"
                  placeholder="Masukkan password"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-400 text-white font-extrabold rounded-xl shadow-lg hover:from-green-600 hover:to-blue-500 transition-all text-lg tracking-wide flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
                Register
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-blue-700 text-sm font-bold mb-2" htmlFor="otp">
                  Masukkan Kode OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:ring-2 focus:ring-green-400 text-blue-800 font-semibold shadow-inner transition tracking-widest text-center text-lg"
                  placeholder="Kode OTP"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold rounded-xl shadow-lg hover:from-blue-700 hover:to-green-500 transition-all text-lg tracking-wide flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
                Verifikasi OTP
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-blue-600 font-medium">
            Sudah punya akun?{' '}
            <Link to="/" className="text-blue-500 hover:underline font-bold">
              Login
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

export default Register;