import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PaymentComplete: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('Verifying payment...');
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    const verify = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const txRef = params.get('tx_ref') || params.get('trx_ref') || params.get('reference') || '';
        console.log('[PaymentComplete] Extracted txRef:', txRef);
        if (!txRef) {
          setMessage('Missing transaction reference, redirecting to wallet...');
          setStatus('error');
          setTimeout(() => navigate('/wallet'), 1500);
          return;
        }
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim();
        if (!backendUrl) {
          setMessage('Server URL not configured. Please set VITE_BACKEND_URL.');
          setStatus('error');
          return;
        }
        const token = await user?.getIdToken?.();
        console.log('[PaymentComplete] Sending to backend:', backendUrl + '/api/payment/verify-and-update', { tx_ref: txRef });
        const res = await fetch(backendUrl.replace(/\/$/, '') + '/api/payment/verify-and-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ tx_ref: txRef })
        });
        const data = await res.json();
        console.log('[PaymentComplete] Backend response:', data);
        if (!res.ok || data.status !== 'success') {
          setMessage(data.error || data.message || 'Verification failed');
          setStatus('error');
          setTimeout(() => navigate('/wallet'), 2000);
          return;
        }
        setMessage('Payment verified! Updating your wallet...');
        setStatus('success');
        setTimeout(() => navigate('/wallet?refresh=1'), 1200);
      } catch (e: any) {
        console.log('[PaymentComplete] Exception:', e);
        setMessage(e?.message || 'Verification error');
        setStatus('error');
        setTimeout(() => navigate('/wallet'), 2000);
      }
    };
    verify();
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-blue-600 text-white">
      <div className="bg-white/10 p-8 rounded-2xl shadow-lg flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">Payment Complete</h1>
        <p className="mb-2">{message}</p>
        <p className="mb-6">You will be redirected to your wallet shortly.</p>
        <button
          className="btn-modern"
          onClick={() => navigate('/wallet')}
        >
          Go to Wallet Now
        </button>
        {status === 'error' && (
          <div className="mt-3 text-sm text-red-200">If your balance doesn’t update, please contact support.</div>
        )}
      </div>
    </div>
  );
};

export default PaymentComplete;
