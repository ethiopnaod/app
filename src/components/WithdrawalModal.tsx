import React, { useState } from 'react';
import { useToast } from './ui/useToast';
import * as Dialog from '@radix-ui/react-dialog';
import { useLanguage } from '../contexts/LanguageContext';

interface WithdrawalModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentBalance: number;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ onClose, onSuccess, currentBalance }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      const msg = t('pleaseEnterValidAmountMin1') || 'Please enter a valid amount (minimum ETB 1)';
      setError(msg);
      toast({ title: t('withdrawalError') || 'Withdrawal Error', description: msg, status: 'error' });
      return;
    }
    if (numAmount > currentBalance) {
      const msg = t('insufficientBalance') || 'Insufficient balance';
      setError(msg);
      toast({ title: t('withdrawalError') || 'Withdrawal Error', description: msg, status: 'error' });
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      setTimeout(() => {
  toast({ title: t('withdrawalSuccess') || 'Withdrawal Success', description: t('withdrawalRequestSubmitted') || 'Withdrawal request submitted.', status: 'success' });
        onSuccess();
      }, 2000);
    } catch {
  const msg = t('failedToCreateWithdrawal') || 'Failed to create withdrawal request. Please try again.';
  setError(msg);
  toast({ title: t('withdrawalError') || 'Withdrawal Error', description: msg, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 z-40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 panel-cyber p-8 w-full max-w-md mx-auto rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-2xl font-bold">{t('withdrawFunds') || 'Withdraw Funds'}</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="text-slate-400 hover:text-white transition-colors text-2xl">✕</button>
            </Dialog.Close>
          </div>
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <div className="card-cyber p-4 mb-6">
            <div className="text-center">
              <p className="text-slate-300 text-sm">{t('availableBalance') || 'Available Balance'}</p>
              <p className="text-2xl font-bold text-green-400">{t('etb') || 'ETB'} {currentBalance.toFixed(2)}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 font-medium mb-3">{t('amountEtb') || 'Amount (ETB)'}</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('enterAmount') || 'Enter amount...'}
                min="1"
                max={currentBalance}
                step="0.01"
                required
                className="input-modern w-full"
              />
              <p className="text-xs text-slate-400 mt-1">{t('maximum') || 'Maximum'}: {t('etb') || 'ETB'} {currentBalance.toFixed(2)}</p>
            </div>
            <div className="flex space-x-3">
              <Dialog.Close asChild>
                <button type="button" className="flex-1 btn-modern">
                  {t('cancel') || 'Cancel'}
                </button>
              </Dialog.Close>
              <button type="submit" className="flex-1 btn-modern" disabled={isLoading || !amount || parseFloat(amount) > currentBalance}>
                {isLoading ? t('processing') || 'Processing...' : t('withdraw') || 'Withdraw'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default WithdrawalModal;
