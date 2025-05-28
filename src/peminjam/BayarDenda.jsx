import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarP from './SidebarP';

const BayarDenda = () => {
  const [dendaData, setDendaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/denda/user/1');
        if (response.data.success && response.data.data.length > 0) {
          setDendaData(response.data.data[0]);
        } else {
          setError('Tidak ada data denda ditemukan');
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
        alert("Pembayaran berhasil!");
        console.log("Success:", result);
        updateStatusDenda('lunas');
      },
      onPending: function(result) {
        alert("Menunggu pembayaran...");
        console.log("Pending:", result);
        updateStatusDenda('pending');
      },
      onError: function(result) {
        alert("Pembayaran gagal!");
        console.log("Error:", result);
      },
      onClose: function() {
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
    } catch (err) {
      console.error('Gagal update status denda:', err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      );
    }

    if (!dendaData) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-700">Tidak ada denda yang perlu dibayar</span>
          </div>
        </div>
      );
    }

    return (
      <>
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-6">Bayar Denda</h2>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p><strong>Nama:</strong> {dendaData.peminjam.name}</p>
          <p><strong>Email:</strong> {dendaData.peminjam.email}</p>
          <p><strong>Jumlah Denda:</strong> Rp {dendaData.jumlah_denda.toLocaleString('id-ID')}</p>
          <p><strong>Keterangan:</strong> {dendaData.keterangan}</p>
          <p><strong>Status:</strong> 
            <span className={`ml-2 font-bold ${
              dendaData.status === 'belum_dibayar' ? 'text-red-500' : 
              dendaData.status === 'lunas' ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {dendaData.status === 'belum_dibayar' ? 'Belum Dibayar' : 
              dendaData.status === 'lunas' ? 'Lunas' : 'Pending'}
            </span>
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Metode Pembayaran Tersedia:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <PaymentMethodCard icon="💳" name="Kartu Kredit" />
            <PaymentMethodCard icon="🏦" name="Transfer Bank" />
            <PaymentMethodCard icon="🟢" name="Gopay" />
            <PaymentMethodCard icon="🛍️" name="ShopeePay" />
            <PaymentMethodCard icon="📱" name="QRIS" />
            <PaymentMethodCard icon="🔵" name="BCA KlikPay" />
            <PaymentMethodCard icon="🔴" name="Indomaret" />
            <PaymentMethodCard icon="🟢" name="Alfamart" />
          </div>
        </div>

        <button
          onClick={handleBayar}
          disabled={dendaData.status === 'lunas'}
          className={`w-full py-3 px-4 rounded-md font-bold text-white ${
            dendaData.status === 'lunas' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
          } transition-colors`}
        >
          {dendaData.status === 'lunas' ? 'Denda Sudah Dibayar' : 'Bayar Sekarang'}
        </button>
      </>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <SidebarP />
      <div className="ml-64 w-full min-h-screen flex flex-col px-6 py-12">
        <div className="w-full max-w-3xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const PaymentMethodCard = ({ icon, name }) => {
  return (
    <div className="flex items-center gap-2 p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
      <span className="text-xl">{icon}</span>
      <span className="text-sm">{name}</span>
    </div>
  );
};

export default BayarDenda;