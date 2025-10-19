// src/hooks/useDiscountCalculation.ts
import { useCallback } from 'react';
import { supabase } from '../services/supabase';

// You can add these type definitions if helpful
interface Product {
  discount_group?: string;
  gross_price?: number;
  [key: string]: any;
}

interface Customer {
  discount_group_id?: string;
  [key: string]: any;
}

interface DiscountResult {
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  netPrice: number;
}

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
  const calculateItemDiscount = useCallback(async (
    product: Product, 
    customer: Customer, 
    quantity: number
  ): Promise<DiscountResult> => {
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
      
      // Find t