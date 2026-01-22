'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { formatPrice } from '@/lib/personalize';

interface ShoePriceProps {
  price: string;
  className?: string;
}

export default function ShoePrice({ price, className = '' }: ShoePriceProps) {
  const { currency } = useCurrency();

  return (
    <p className={className}>
      {formatPrice(price, currency)}
    </p>
  );
}
