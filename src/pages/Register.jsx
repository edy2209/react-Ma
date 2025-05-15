import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [otp, setOtp] = useState(''); // State untuk OTP
  const [isOtpSent, setIsOtpSent] = useState(false); // Status apakah OTP sudah dikirim
  const [message, setMessage] = useState('');
  const [emailForOtp, setEmailForOtp] = useState(''); // Menyimpan email untuk verifikasi OTP

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
        setIsOtpSent(true); // Tampilkan form OTP
        setEmailForOtp(formData.email); // Simpan email untuk verifikasi OTP
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
        setIsOtpSent(false); // Sembunyikan form OTP
        setFormData({ name: '', email: '', password: '' }); // Reset form
        setOtp(''); // Reset OTP
      } else {
        setMessage(result.message || 'Verifikasi OTP gagal');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan saat verifikasi OTP');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {message && <div className="mb-4 text-center text-green-600 font-semibold">{message}</div>}

      {!isOtpSent ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Register
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otp">
              Masukkan Kode OTP
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={handleOtpChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your OTP"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Verifikasi OTP
          </button>
        </form>
      )}

      <p className="mt-4">
        Already have an account? <Link to="/" className="text-blue-500">Login</Link>
      </p>
    </div>
  );
};

export default Register;