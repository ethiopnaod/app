import { useCallback } from 'react';
import { Toast } from '@radix-ui/react-toast';

// Simple event-based toast trigger for global use
export function useToast() {
  // Dispatch a custom event to trigger a toast
  return useCallback(({
    title,
    description,
    status = 'info',
    duration = 4000
  }: {
    title: string;
    description?: string;
    status?: 'success' | 'error' | 'info';
    duration?: number;
  }) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { title, description, status, duration }
    }));
  }, []);
}

// ToastListener component to be placed at the root (e.g., in App.tsx)
import React, { useEffect, useState } from 'react';
import { Toast as RadixToast, ToastTitle, ToastDescription, ToastViewport } from './Toast';

export const ToastListener: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; description?: string; status?: string; duration?: number } | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setToast(e.detail);
      setOpen(true);
      setTimeout(() => setOpen(false), e.detail.duration || 4000);
    };
    window.addEventListener('show-toast', handler);
    return () => window.removeEventListener('show-toast', handler);
  }, []);

  return (
    <RadixToast open={open} onOpenChange={setOpen} className={toast?.status === 'error' ? 'border-red-500' : toast?.status === 'success' ? 'border-green-500' : ''}>
      {toast?.title && <ToastTitle>{toast.title}</ToastTitle>}
      {toast?.description && <ToastDescription>{toast.description}</ToastDescription>}
      <ToastViewport />
    </RadixToast>
  );
};
