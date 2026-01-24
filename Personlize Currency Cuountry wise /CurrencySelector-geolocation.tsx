'use client';

import { useState, useEffect, useRef } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Currency, CURRENCY_SYMBOLS } from '@/lib/personalize';

export default function CurrencySelector() {
  const { 
    currency, 
    detectedCountry, 
    isAutoDetected, 
    setCurrency, 
    isLoading,
    isDetecting 
  } = useCurrency();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currencies: Currency[] = ['USD', 'INR'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCurrencySelect = (selectedCurrency: Currency) => {
    setCurrency(selectedCurrency, true); // true = manual override
    setIsOpen(false);
  };

  // Show loading state during detection
  if (isDetecting) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded bg-gray-50">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span className="text-sm text-gray-600">Detecting location...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Currency Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 border border-gray-300 rounded
          hover:bg-gray-50 transition-colors min-w-[160px]
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Currency Symbol */}
        <span className="text-lg font-bold">{CURRENCY_SYMBOLS[currency]}</span>
        
        {/* Currency Code */}
        <span className="font-medium">{currency}</span>
        
        {/* Auto-detected badge */}
        {isAutoDetected && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            Auto
          </span>
        )}
        
        {/* Dropdown arrow */}
        <svg 
          className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[240px]">
          {/* Header with location info */}
          {detectedCountry && isAutoDetected && (
            <div className="px-4 py-3 border-b bg-blue-50">
              <div className="text-xs text-blue-600 font-medium mb-1">
                🌍 Detected Location
              </div>
              <div className="text-sm text-gray-700">
                {detectedCountry}
              </div>
            </div>
          )}

          {/* Currency Options */}
          <div className="py-2">
            {currencies.map((curr) => (
              <button
                key={curr}
                onClick={() => handleCurrencySelect(curr)}
                className={`
                  w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                  flex items-center justify-between
                  ${currency === curr ? 'bg-blue-50' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Currency Symbol */}
                  <span className="text-2xl font-bold w-8 text-center">
                    {CURRENCY_SYMBOLS[curr]}
                  </span>
                  
                  {/* Currency Info */}
                  <div>
                    <div className="font-medium">{curr}</div>
                    <div className="text-xs text-gray-500">
                      {curr === 'USD' ? 'United States Dollar' : 
                       curr === 'INR' ? 'Indian Rupee' : 
                       'Euro'}
                    </div>
                  </div>
                </div>

                {/* Selected checkmark */}
                {currency === curr && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Footer note */}
          <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-600">
            {isAutoDetected ? (
              <span>💡 Currency auto-detected. Select to override.</span>
            ) : (
              <span>✓ Manual override active</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
