// src/hooks/useDiscountCalculation.js
import { useCallback } from 'react';
import { supabase } from '../services/supabase';

export function useDiscountCalculation() {
  // Function to fetch the discount matrix
  const fetchDiscountMatrix = useCallback(async () => {
    const { data, error } = await supabase
      .from('discount_matrix')
      .select('*');
    
    if (error) {
      console.error('Error fetching discount matrix:', error);
      return [];
    }
    
    return data;
  }, []);

  // Main calculation function
  const calculateItemDiscount = useCallback(async (product, customer, quantity) => {
    if (!product || !customer || !quantity) {
      return { 
        unitPrice: 0, 
        discountPercentage: 0, 
        discountAmount: 0, 
        netPrice: 0 
      };
    }
    
    let discountPercentage = 0;
    
    // Only fetch discount matrix if we have both product and customer
    if (product.discount_group && customer.discount_group_id) {
      // Fetch the discount matrix
      const discountMatrix = await fetchDiscountMatrix();
      
      // Find the matching discount
      const discountEntry = discountMatrix.find(entry => 
        entry.product_discount_group === product.discount_group && 
        entry.customer_group_id === customer.discount_group_id
      );
      
      if (discountEntry) {
        discountPercentage = discountEntry.discount_percentage || 0;
      }
    }
    
    const unitPrice = product.gross_price || 0;
    const discountAmount = (unitPrice * quantity * discountPercentage) / 100;
    const netPrice = unitPrice * quantity * (1 - discountPercentage / 100);
    
    return {
      unitPrice,
      discountPercentage,
      discountAmount,
      netPrice
    };
  }, [fetchDiscountMatrix]);
  
  return { calculateItemDiscount };
}