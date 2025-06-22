import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
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
          <div className="flex flex-col items-center mb-10">
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
              Selamat Datang
            </h2>
            <p className="text-blue-200 text-center text-sm font-medium max-w-xs">
              Masuk ke sistem manajemen aset untuk mengelola inventaris teknologi
            </p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl px-4 py-3 text-red-200 text-center font-medium shadow-lg animate-shake">
              {error}
            </div>
          )}
          
          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email input */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors">
                <FaEnvelope />
              </div>
              <input
                type="email"
                value={email}
                autoComplete="username"
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-blue-300/70 shadow-inner transition-all duration-300 group-hover:bg-white/10"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-400 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-blue-200">
                  Ingat saya
                </label>
              </div>
              <Link to="#" className="text-sm text-blue-300 hover:text-blue-400 transition-colors">
                Lupa password?
              </Link>
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
                  <FaSignInAlt className="text-xl" />
                  Masuk ke Akun
                </>
              )}
            </button>
          </form>
          
          {/* Register link */}
          <p className="mt-8 text-center text-blue-300 font-medium">
            Belum punya akun?{' '}
            <Link 
              to="/register" 
              className="text-blue-400 hover:text-white font-bold transition-colors group"
            >
              <span className="relative">
                Daftar sekarang
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
        
        .animate-float {
          animation: float 10s infinite ease-in-out;
        }
        
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default Login;