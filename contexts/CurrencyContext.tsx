'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency, VARIANT_UIDS, setPersonalizeCurrency } from '@/lib/personalize';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  variantUid: string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [variantUid, setVariantUid] = useState<string>(VARIANT_UIDS['USD']);
  const [isLoading, setIsLoading] = useState(false);

  // Load currency from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = localStorage.getItem('selectedCurrency') as Currency;
    if (stored && ['USD', 'EUR', 'INR'].includes(stored)) {
      setCurrencyState(stored);
      setVariantUid(VARIANT_UIDS[stored]);
      // Initialize Personalize with stored currency
      initializePersonalize(stored);
    } else {
      // Initialize with default currency
      initializePersonalize('USD');
    }
  }, []);

  const initializePersonalize = async (curr: Currency) => {
    try {
      const variant = await setPersonalizeCurrency(curr);
      setVariantUid(variant);
      console.log('Personalize initialized - currency:', curr, 'variantUid:', variant);
    } catch (error) {
      console.error('Failed to initialize Personalize:', error);
      // Fallback to direct variant UID
      setVariantUid(VARIANT_UIDS[curr]);
    }
  };

  const setCurrency = async (newCurrency: Currency) => {
    setIsLoading(true);
    setCurrencyState(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency);
    
    // Update variant UID
    try {
      const variant = await setPersonalizeCurrency(newCurrency);
      setVariantUid(variant);
      console.log('Currency changed to:', newCurrency, 'variantUid:', variant);
    } catch (error) {
      console.error('Failed to update Personalize:', error);
      // Fallback to direct variant UID
      setVariantUid(VARIANT_UIDS[newCurrency]);
    }
    
    // Small delay to show loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, variantUid, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
