'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useState, useRef, useEffect } from 'react';
import { Currency } from '@/lib/personalize';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  INR: '₹',
};

const CURRENCY_NAMES: Record<Currency, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  INR: 'Indian Rupee',
};

export default function CurrencySelector() {
  const { currency, setCurrency, isLoading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies: Currency[] = ['USD', 'EUR', 'INR'];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold uppercase tracking-wider bg-white border-2 border-black hover:bg-black hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Select currency"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <span className="text-base">{CURRENCY_SYMBOLS[currency]}</span>
            <span>{currency}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && !isLoading && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border-2 border-black shadow-xl z-50 animate-fade-in">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              Select Currency
            </p>
            {currencies.map((curr) => (
              <button
                key={curr}
                onClick={() => {
                  setCurrency(curr);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-3 text-sm transition-all duration-200 ${
                  currency === curr
                    ? 'bg-black text-white font-bold'
                    : 'hover:bg-gray-100 text-black'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg font-bold">{CURRENCY_SYMBOLS[curr]}</span>
                  <span className="font-semibold">{curr}</span>
                </span>
                <span className="text-xs opacity-75">{CURRENCY_NAMES[curr]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
