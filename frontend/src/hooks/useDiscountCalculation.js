// src/hooks/useDiscountCalculation.js
import { useCallback } from 'react';

export function useDiscountCalculation() {
  const calculateItemDiscount = useCallback((product, customer, quantity) => {
    if (!product || !customer || !quantity) return { 
      unitPrice: 0, 
      discountPercentage: 0, 
      discountAmount: 0, 
      netPrice: 0 
    };
    
    let discountPercentage = 0;
    
    // Find applicable discount from matrix
    // This logic should come from your original implementation
    if (product.discountGroup && customer.discountGroup) {
      // Implement your specific discount calculation here
      // This is where we'll blend in your original business logic
    }
    
    const unitPrice = product.grossPrice || 0;
    const discountAmount = (unitPrice * quantity * discountPercentage) / 100;
    const netPrice = unitPrice * quantity * (1 - discountPercentage / 100);
    
    return {
      unitPrice,
      discountPercentage,
      discountAmount,
      netPrice
    };
  }, []);
  
  return { calculateItemDiscount };
}