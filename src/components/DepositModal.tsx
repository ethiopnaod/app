import React, { useState } from 'react';
import { useToast } from './ui/useToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './ui/Dialog';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';


interface DepositModalProps {
  onClose: () => void;
  userId: string;
  onSuccess?: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ onClose, userId, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      const msg = t('pleaseEnterValidAmountMin10') || 'Please enter a valid amount (minimum ETB 10)';
      setError(msg);
      toast({ title: t('depositError') || 'Deposit Error', description: msg, status: 'error' });
      return;
    }
    setIsLoading(true);
    setError('');

    const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim();
    if (!backendUrl) {
      const msg = t('backendUrlNotConfigured') || 'Server URL is not configured. Please set VITE_BACKEND_URL.';
      setError(msg);
      toast({ title: t('depositError') || 'Deposit Error', description: msg, status: 'error' });
      setIsLoading(false);
      return;
    }

    const token = await user?.getIdToken?.();

    // Always use a valid email for Chapa
    let email = user?.email;
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      email = `${userId}@bingogame.com`;
    }

    const url = backendUrl.replace(/\/$/, '') + '/api/wallet/deposit';

    try {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          amount: numAmount,
          email,
          first_name: user?.displayName || 'Player',
          last_name: 'Player',
          phone: user?.phoneNumber || '0911000000'
        }),
      });

      if (!response.ok) {
        let errorBody = '';
        try {
          const parsed = await response.json();
          errorBody = parsed.error || parsed.message || JSON.stringify(parsed);
        } catch (e) {
          try { errorBody = await response.text(); } catch { errorBody = response.statusText || `HTTP ${response.status}`; }
        }
        throw new Error(errorBody || `HTTP ${response.status}`);
      }

      const result = await response.json();
      const checkoutUrl = result.checkout_url || result?.data?.checkout_url;

      if (checkoutUrl) {
        toast({ title: t('redirectingToChapa') || 'Redirecting to Chapa', description: t('completePaymentInChapa') || 'Complete your payment in the Chapa window.', status: 'info' });
        window.location.href = checkoutUrl;
        return;
      }

      if (result?.error && typeof result.error === 'string' && result.error.includes('validation.email')) {
        let userEmail = '';
        while (!userEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(userEmail)) {
          userEmail = window.prompt('Please enter a valid email address for payment:') || '';
          if (!userEmail) break;
        }
        if (userEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(userEmail)) {
          // retry
          const retryRes = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              amount: numAmount,
              email: userEmail,
              first_name: user?.displayName || 'Player',
              last_name: 'Player',
              phone: user?.phoneNumber || '0911000000'
            }),
          });

          if (!retryRes.ok) {
            let rb = '';
            try { rb = JSON.stringify(await retryRes.json()); } catch { rb = await retryRes.text().catch(() => ''); }
            throw new Error(rb || `HTTP ${retryRes.status}`);
          }

          const retryResult = await retryRes.json();
          const retryCheckoutUrl = retryResult.checkout_url || retryResult?.data?.checkout_url;
          if (retryCheckoutUrl) {
            toast({ title: t('redirectingToChapa') || 'Redirecting to Chapa', description: t('completePaymentInChapa') || 'Complete your payment in the Chapa window.', status: 'info' });
            window.location.href = retryCheckoutUrl;
            return;
          }

          const msg = retryResult.error || retryResult.message || t('paymentInitializationFailed') || 'Payment initialization failed';
          setError(msg);
          toast({ title: t('depositError') || 'Deposit Error', description: msg, status: 'error' });
          return;
        }

        const msg = t('invalidEmailProvided') || 'A valid email is required to complete payment.';
        setError(msg);
        toast({ title: t('depositError') || 'Deposit Error', description: msg, status: 'error' });
        return;
      }

      const msg = result.error || result.message || t('paymentInitializationFailed') || 'Payment initialization failed';
      setError(msg);
      toast({ title: t('depositError') || 'Deposit Error', description: msg, status: 'error' });
    } catch (err: any) {
      const msg = (err && err.message) ? err.message : t('failedToCreateDeposit') || 'Failed to create deposit. Please try again.';
      setError(msg);
      toast({ title: t('depositError') || 'Deposit Error', description: msg, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="panel-cyber">
        <DialogHeader>
          <div>
            <DialogTitle>{t('depositFunds') || 'Deposit Funds'}</DialogTitle>
            <DialogDescription>{t('instantlyTopUpWallet') || 'Instantly top up your wallet'}</DialogDescription>
          </div>
          <DialogClose asChild>
            <button aria-label="Close" className="text-slate-400 hover:text-white transition-colors">✕</button>
          </DialogClose>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-300 font-medium mb-3">{t('amountEtb') || 'Amount (ETB)'}</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('enterAmount') || 'Enter amount...'}
              min="1"
              step="0.01"
              required
              className="input-modern"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-3">{t('quickAmounts') || 'Quick Amounts'}</label>
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((presetAmount) => (
                <button
                  key={presetAmount}
                  type="button"
                  onClick={() => setAmount(presetAmount.toString())}
                  className="pill"
                >
                  {t('etb') || 'ETB'} {presetAmount}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <DialogClose asChild>
              <button type="button" className="flex-1 btn-secondary">
                {t('cancel') || 'Cancel'}
              </button>
            </DialogClose>
            <button type="submit" className="flex-1 btn-modern" disabled={isLoading || !amount}>
              {isLoading ? t('processing') || 'Processing...' : t('deposit') || 'Deposit'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepositModal;
