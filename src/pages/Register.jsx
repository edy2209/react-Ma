import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCheckCircle, FaArrowLeft, FaKey, FaShieldAlt } from 'react-icons/fa';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setIsOtpSent(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Floating bubbles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full opacity-20 animate-float"
            style={{
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              background: `radial-gradient(circle, rgba(${
                Math.random() > 0.5 ? '56, 189, 248' : '139, 92, 246'
              }, 0.7), transparent)`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 20 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl px-8 py-10 border border-white/10 transform transition-all duration-500 hover:shadow-2xl">
          {/* Logo and title */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl blur-md opacity-70 animate-pulse"></div>
              <div className="relative bg-gradient-to-tr from-blue-600 to-purple-700 rounded-2xl p-5 shadow-lg">
                <svg 
                  width="48" 
                  height="48" 
                  viewBox="0 0 48 48" 
                  className="text-white"
                  fill="currentColor"
                >
                  <path d="M24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42Z" />
                  <path d="M24 32C28.4183 32 32 28.4183 32 24C32 19.5817 28.4183 16 24 16C19.5817 16 16 19.5817 16 24C16 28.4183 19.5817 32 24 32Z" fill="#111827"/>
                  <path d="M24 28C26.2091 28 28 26.2091 28 24C28 21.7909 26.2091 20 24 20C21.7909 20 20 21.7909 20 24C20 26.2091 21.7909 28 24 28Z" fill="white"/>
                </svg>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              {isOtpSent ? 'Verifikasi OTP' : 'Buat Akun Baru'}
            </h2>
            <p className="text-blue-200 text-center text-sm font-medium max-w-xs">
              {isOtpSent 
                ? 'Masukkan kode OTP yang telah dikirim ke email Anda' 
                : 'Daftar untuk mengakses sistem manajemen aset teknologi'}
            </p>
          </div>
          
          {/* Message */}
          {message && (
            <div className={`mb-6 bg-${message.includes('berhasil') ? 'green' : 'red'}-500/20 backdrop-blur-sm border border-${
              message.includes('berhasil') ? 'green' : 'red'
            }-400/30 rounded-xl px-4 py-3 text-${
              message.includes('berhasil') ? 'green' : 'red'
            }-200 text-center font-medium shadow-lg animate-shake`}>
              {message}
            </div>
          )}
          
          {/* Registration form */}
          {!isOtpSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors">
                  <FaUser />
                </div>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-blue-300/70 shadow-inner transition-all duration-300 group-hover:bg-white/10"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              
              {/* Email input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-blue-300/70 shadow-inner transition-all duration-300 group-hover:bg-white/10"
                  placeholder="Masukkan email"
                  required
                />
              </div>
              
              {/* Password input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors">
                  <FaLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-blue-300/70 shadow-inner transition-all duration-300 group-hover:bg-white/10"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-400 transition-colors"
                >
                  {showPassword ? <FaEye /> : <FaLock />}
                </button>
              </div>
              
              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-lg tracking-wide flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </div>
                ) : (
                  <>
                    <FaUser className="text-xl" />
                    Buat Akun
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* Back button */}
              <button
                type="button"
                onClick={handleBackToRegister}
                className="flex items-center text-blue-300 hover:text-blue-400 transition-colors mb-4"
              >
                <FaArrowLeft className="mr-2" /> Kembali ke Registrasi
              </button>
              
              {/* OTP input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors">
                  <FaKey />
                </div>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 text-white placeholder-blue-300/70 shadow-inner transition-all duration-300 group-hover:bg-white/10 text-center tracking-widest text-xl"
                  placeholder="Kode OTP"
                  maxLength={6}
                  autoFocus
                  required
                />
              </div>
              
              {/* OTP Info */}
              <div className="text-center text-blue-300 text-sm mb-4">
                Kode OTP telah dikirim ke: <span className="font-semibold">{emailForOtp}</span>
              </div>
              
              {/* Verify button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 text-lg tracking-wide flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memverifikasi...
                  </div>
                ) : (
                  <>
                    <FaShieldAlt className="text-xl" />
                    Verifikasi OTP
                  </>
                )}
              </button>
            </form>
          )}
          
          {/* Login link */}
          <p className="mt-8 text-center text-blue-300 font-medium">
            Sudah punya akun?{' '}
            <Link 
              to="/" 
              className="text-blue-400 hover:text-white font-bold transition-colors group"
            >
              <span className="relative">
                Login di sini
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
          </p>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-xs text-blue-300/60 font-medium tracking-wider">
          &copy; {new Date().getFullYear()} Management Asset System &mdash; Powered by Teknologi
        </div>
      </div>
      
      {/* Custom animations */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
            opacity: 0.3;
          }
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.3; }
        }
        
        .animate-float {
          animation: float 10s infinite ease-in-out;
        }
        
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
      `}</style>
    </div>
  );
};

export default Register;