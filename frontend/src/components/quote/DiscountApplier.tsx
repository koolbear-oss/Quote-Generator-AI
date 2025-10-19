// src/components/quote/DiscountApplier.tsx
import { useEffect, useState } from 'react'
import { useQuote } from '../../context/QuoteContext'
import { supabase } from '../../services/supabase'

export default function DiscountApplier() {
  const { state, dispatch } = useQuote()
  
  // State for storing discount matrix and calculations
  const [discountMatrix, setDiscountMatrix] = useState({})
  const [productDiscounts, setProductDiscounts] = useState([])
  const [volumeDiscount, setVolumeDiscount] = useState(0)
  const [additionalDiscount, setAdditionalDiscount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Load discount matrix when a customer is selected
  useEffect(() => {
    if (state.customer) {
      loadDiscountMatrix();
    }
  }, [state.customer]);

  // Apply discounts to products when discount matrix or products change
  useEffect(() => {
    if (Object.keys(discountMatrix).length > 0 && state.products.length > 0) {
      applyProductDiscounts();
    }
  }, [discountMatrix, state.products]);

  // Calculate volume discount based on total value
  useEffect(() => {
    calculateVolumeDiscount();
  }, [productDiscounts]);

  // Load discount matrix from database
  async function loadDiscountMatrix() {
    setIsLoading(true);
    
    try {
      // Get customer's discount group
      const customerGroupId = state.customer?.discount_group_id;
      
      if (!customerGroupId) {
        console.error('Customer has no discount group');
        setIsLoading(false);
        return;
      }
      
      // Fetch discount matrix from database
      const { data, error } = await supabase
        .from('discount_matrix')
        .select('product_discount_group, discount_percentage')
        .eq('customer_group_id', customerGroupId);
      
      if (error) throw error;
      
      // Convert array to lookup object for faster access
      const matrix = {};
      data.forEach(item => {
        matrix[item.product_discount_group] = item.discount_percentage;
      });
      
      setDiscountMatrix(matrix);
      console.log('Loaded discount matrix:', matrix);
    } catch (error) {
      console.error('Error loading discount matrix:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Apply appropriate discount to each product
  function applyProductDiscounts() {
    const discounts = state.products.map(product => {
      const discountGroup = product.discount_group || 'DEFAULT';
      const discountPercentage = discountMatrix[discountGroup] || 0;
      
      return {
        id: product.id,
        discount_percentage: discountPercentage
      };
    });
    
    setProductDiscounts(discounts);
    
    // Update discount in the global quote state
    discounts.forEach(item => {
      dispatch({ 
        type: 'UPDATE_PRODUCT_DISCOUNT', 
        payload: { 
          id: item.id, 
          discount_percentage: item.discount_percentage 
        }
      });
    });
  }
  
  // Calculate volume discount based on total value
  function calculateVolumeDiscount() {
    const grossTotal = state.products.reduce(
      (sum, product) => sum + ((product.gross_price || product.price || 0) * (product.quantity || 1)), 
      0
    );
    
    let newVolumeDiscount = 0;
    
    if (grossTotal > 200000) {
      newVolumeDiscount = 12;
    } else if (grossTotal > 150000) {
      newVolumeDiscount = 11;
    } else if (grossTotal > 100000) {
      newVolumeDiscount = 9;
    } else if (grossTotal > 50000) {
      newVolumeDiscount = 7;
    } else if (grossTotal > 25000) {
      newVolumeDiscount = 5;
    } else if (grossTotal > 12500) {
      newVolumeDiscount = 3;
    } else if (grossTotal > 5000) {
      newVolumeDiscount = 1;
    }
    
    setVolumeDiscount(newVolumeDiscount);
    dispatch({ type: 'SET_VOLUME_DISCOUNT', payload: newVolumeDiscount });
  }
  
  // Handle additional discount change
  const handleAdditionalDiscountChange = (value) => {
    setAdditionalDiscount(value);
    dispatch({ type: 'SET_ADDITIONAL_DISCOUNT', payload: value });
  }
  
  // Calculate various totals for display
  const grossTotal = state.products.reduce(
    (sum, product) => sum + ((product.gross_price || product.price || 0) * (product.quantity || 1)), 
    0
  );
  
  // Calculate the total discount amount (sum of all product discounts + volume + additional)
  const productDiscountAmount = state.products.reduce((sum, product) => {
    const discountPercentage = product.discount_percentage || 0;
    const price = product.gross_price || product.price || 0;
    const quantity = product.quantity || 1;
    return sum + (price * quantity * discountPercentage / 100);
  }, 0);
  
  const volumeDiscountAmount = grossTotal * (volumeDiscount / 100);
  const additionalDiscountAmount = grossTotal * (additionalDiscount / 100);
  
  const totalDiscount = productDiscountAmount + volumeDiscountAmount + additionalDiscountAmount;
  const totalDiscountPercentage = (totalDiscount / grossTotal) * 100 || 0;
  const netTotal = grossTotal - totalDiscount;

  // If no customer selected, show a message
  if (!state.customer) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">No customer selected</h3>
        <p className="mt-1 text-sm text-slate-500">Please select a customer in the previous step to apply discounts.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="fade-in">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Apply Discounts</h2>
        <p className="text-slate-600">Review and apply discounts based on customer type and project size.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discount Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Discount */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Customer Discount</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Customer:</span>
                <span className="font-medium text-slate-800">{state.customer.account}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Discount Group:</span>
                <span className="font-medium text-slate-800">{state.customer.discount_group?.name || "Standard"}</span>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Product Discount Amount:</span>
                  <span className="font-medium text-green-600">${productDiscountAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Volume Discount */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Volume Discount</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Project Value:</span>
                <span className="font-medium">${grossTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Volume Discount Rate:</span>
                <span className="font-medium text-green-600">{volumeDiscount}%</span>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Volume Discount Amount:</span>
                  <span className="font-medium text-green-600">${volumeDiscountAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Discount */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Additional Discount</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Special Pricing Override
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={additionalDiscount}
                    onChange={(e) => handleAdditionalDiscountChange(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-lg font-medium text-slate-800 w-12">
                    {additionalDiscount}%
                  </span>
                </div>
              </div>
              {additionalDiscount > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Additional Discount Amount:</span>
                    <span className="font-medium text-green-600">
                      ${additionalDiscountAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Pricing Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-600">Gross Total:</span>
              <span className="font-medium">${grossTotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-600">Total Project Discount:</span>
              <span className="text-green-600">-${totalDiscount.toFixed(2)} ({totalDiscountPercentage.toFixed(1)}%)</span>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-slate-800">Net Total:</span>
                <span className="text-2xl font-bold text-primary-800">${netTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="pt-2 text-sm text-slate-500">
              <p>Quote valid for 30 days</p>
              <p>All prices exclude VAT where applicable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}