import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarP from './SidebarP';
import { FaCreditCard, FaMoneyBillWave, FaShoppingBag, FaQrcode, FaStore, FaCoins, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaArrowRight } from 'react-icons/fa';

const BayarDenda = () => {
  const [dendaData, setDendaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  // Ambil data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id;

        if (!userId) {
          setError("User belum login atau ID tidak ditemukan");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/denda/user/${userId}`);

        if (response.data.success) {
          const belumLunas = response.data.data.find(item => item.status !== 'lunas');
          if (belumLunas) {
            setDendaData(belumLunas);
          } else {
            setError('Tidak ada denda yang perlu dibayar');
          }
        }

      } catch (err) {
        setError('Gagal memuat data denda');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!dendaData) return;

    const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const myMidtransClientKey = 'SB-Mid-client-ANWiaMz2XnMbrlTs';

    if (!document.querySelector(`script[src="${midtransScriptUrl}"]`)) {
      const scriptTag = document.createElement('script');
      scriptTag.src = midtransScriptUrl;
      scriptTag.setAttribute('data-client-key', myMidtransClientKey);
      scriptTag.async = true;
      document.body.appendChild(scriptTag);
    }

    return () => {};
  }, [dendaData]);

  const handleBayar = () => {
    if (!dendaData?.snap_token) {
      alert('Token pembayaran tidak tersedia');
      return;
    }
    
    setIsPaying(true);
    
    window.snap.pay(dendaData.snap_token, {
      enabledPayments: [
        'credit_card',
        'bank_transfer',
        'gopay',
        'shopeepay',
        'qris',
        'bca_klikbca',
        'bca_klikpay',
        'bri_epay',
        'cimb_clicks',
        'danamon_online',
        'akulaku',
        'indomaret',
        'alfamart'
      ],
      onSuccess: function(result) {
        setIsPaying(false);
        alert("Pembayaran berhasil!");
        console.log("Success:", result);
        updateStatusDenda('lunas');
      },
      onPending: function(result) {
        setIsPaying(false);
        alert("Menunggu pembayaran...");
        console.log("Pending:", result);
        updateStatusDenda('pending');
      },
      onError: function(result) {
        setIsPaying(false);
        alert("Pembayaran gagal!");
        console.log("Error:", result);
      },
      onClose: function() {
        setIsPaying(false);
        alert("Kamu menutup popup tanpa menyelesaikan pembayaran.");
      }
    });
  };

  const updateStatusDenda = async (status) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/denda/${dendaData.id}`, {
        status: status
      });
      console.log('Status denda berhasil diupdate');
      // Refresh data setelah pembayaran
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id;
      const response = await axios.get(`http://127.0.0.1:8000/api/denda/user/${userId}`);
      const belumLunas = response.data.data.find(item => item.status !== 'lunas');
      setDendaData(belumLunas || null);
    } catch (err) {
      console.error('Gagal update status denda:', err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <span className="text-gray-600 font-medium">Memuat data denda...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-full">
              <FaExclamationTriangle className="text-red-500 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700 mb-1">Terjadi Kesalahan</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    if (!dendaData) {
      return (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaInfoCircle className="text-yellow-500 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-700 mb-1">Tidak Ada Denda</h3>
              <p className="text-yellow-600">Tidak ada denda yang perlu dibayar saat ini</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg overflow-hidden border border-blue-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaCoins className="text-yellow-300" /> 
            Pembayaran Denda
          </h2>
        </div>
        
        {/* Detail Denda */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Detail Denda</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                dendaData.status === 'belum_dibayar' ? 'bg-red-100 text-red-700' : 
                dendaData.status === 'lunas' ? 'bg-green-100 text-green-700' : 
                'bg-yellow-100 text-yellow-700'
              }`}>
                {dendaData.status === 'belum_dibayar' ? 'Belum Dibayar' : 
                dendaData.status === 'lunas' ? 'Lunas' : 'Pending'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Nama Peminjam</div>
                <div className="font-medium text-gray-800">{dendaData.peminjam.name}</div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Email</div>
                <div className="font-medium text-gray-800">{dendaData.peminjam.email}</div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Jumlah Denda</div>
                <div className="font-bold text-xl text-blue-700">Rp {dendaData.jumlah_denda.toLocaleString('id-ID')}</div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-sm text-gray-500 mb-1">Keterangan</div>
                <div className="font-medium text-gray-800">{dendaData.keterangan}</div>
              </div>
            </div>
          </div>
          
          {/* Metode Pembayaran */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Metode Pembayaran</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <PaymentMethodCard icon={<FaCreditCard />} name="Kartu Kredit" />
              <PaymentMethodCard icon={<FaMoneyBillWave />} name="Transfer Bank" />
              <PaymentMethodCard icon={<div className="bg-green-500 text-white p-2 rounded"><FaCoins /></div>} name="Gopay" />
              <PaymentMethodCard icon={<div className="bg-orange-500 text-white p-2 rounded"><FaShoppingBag /></div>} name="ShopeePay" />
              <PaymentMethodCard icon={<FaQrcode />} name="QRIS" />
              <PaymentMethodCard icon={<div className="bg-blue-800 text-white p-2 rounded">BCA</div>} name="BCA KlikPay" />
              <PaymentMethodCard icon={<div className="bg-red-600 text-white p-2 rounded">IN</div>} name="Indomaret" />
              <PaymentMethodCard icon={<div className="bg-green-600 text-white p-2 rounded">AL</div>} name="Alfamart" />
            </div>
          </div>
          
          {/* Tombol Pembayaran */}
          <button
            onClick={handleBayar}
            disabled={dendaData.status === 'lunas' || isPaying}
            className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-white text-lg ${
              dendaData.status === 'lunas' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : isPaying
                  ? 'bg-blue-600'
                  : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'
            } transition-all duration-300 shadow-lg hover:shadow-xl`}
          >
            {isPaying ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Memproses Pembayaran...
              </>
            ) : dendaData.status === 'lunas' ? (
              <>
                <FaCheckCircle className="text-xl" /> Denda Sudah Dibayar
              </>
            ) : (
              <>
                Bayar Sekarang <FaArrowRight className="text-lg" />
              </>
            )}
          </button>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            Pembayaran diproses menggunakan Midtrans Payment Gateway
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SidebarP />
      <div className="ml-0 md:ml-64 w-full min-h-screen flex flex-col px-4 md:px-8 py-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaCoins className="text-yellow-500" /> 
              <span>Bayar Denda</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Selesaikan pembayaran denda Anda dengan mudah melalui berbagai metode pembayaran
            </p>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const PaymentMethodCard = ({ icon, name }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4 border border-gray-200 rounded-xl bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 cursor-pointer">
      <div className="text-2xl">{icon}</div>
      <span className="text-sm font-medium text-gray-700">{name}</span>
    </div>
  );
};

export default BayarDenda;