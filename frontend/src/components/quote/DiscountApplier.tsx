import { useEffect, useState } from 'react'
import { useQuote } from '../../context/QuoteContext'

export default function DiscountApplier() {
  const { state, dispatch } = useQuote()
  const [customerDiscount, setCustomerDiscount] = useState(0)
  const [volumeDiscount, setVolumeDiscount] = useState(0)
  const [additionalDiscount, setAdditionalDiscount] = useState(0)

  useEffect(() => {
    if (state.customer) {
      setCustomerDiscount(state.customer.discount_group?.discount_percentage || 0)
    }
  }, [state.customer])

  useEffect(() => {
    // Calculate volume discount based on total value
    const subtotal = state.products.reduce((sum, product) => sum + (product.price * product.quantity), 0)
    
    let volumeDisc = 0
    if (subtotal > 50000) {
      volumeDisc = 12
    } else if (subtotal > 25000) {
      volumeDisc = 8
    } else if (subtotal > 10000) {
      volumeDisc = 5
    } else if (subtotal > 5000) {
      volumeDisc = 3
    }
    
    setVolumeDiscount(volumeDisc)
  }, [state.products])

  const handleAdditionalDiscountChange = (value: number) => {
    setAdditionalDiscount(value)
    dispatch({ type: 'SET_ADDITIONAL_DISCOUNT', payload: value })
  }

  const calculateSubtotal = () => {
    return state.products.reduce((sum, product) => sum + (product.price * product.quantity), 0)
  }

  const calculateDiscountAmount = (amount: number, discount: number) => {
    return amount * (discount / 100)
  }

  const subtotal = calculateSubtotal()
  const customerDiscountAmount = calculateDiscountAmount(subtotal, customerDiscount)
  const volumeDiscountAmount = calculateDiscountAmount(subtotal, volumeDiscount)
  const additionalDiscountAmount = calculateDiscountAmount(subtotal, additionalDiscount)
  
  const totalDiscount = customerDiscount + volumeDiscount + additionalDiscount
  const totalDiscountAmount = customerDiscountAmount + volumeDiscountAmount + additionalDiscountAmount
  const finalTotal = subtotal - totalDiscountAmount

  if (!state.customer) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">No customer selected</h3>
        <p className="mt-1 text-sm text-slate-500">Please select a customer in the previous step to apply discounts.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="fade-in">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Apply Discounts</h2>
        <p className="text-slate-600">Review and apply discounts based on customer tier and project size.</p>
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
                <span className="text-slate-600">Tier:</span>
                <span className="font-medium text-slate-800">{state.customer.discount_group?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Standard Discount:</span>
                <span className="font-medium text-green-600">{customerDiscount}%</span>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Discount Amount:</span>
                  <span className="font-medium text-green-600 mono">${customerDiscountAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Discount */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Project Discount</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Project Value:</span>
                <span className="font-medium mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Volume Discount:</span>
                <span className="font-medium text-green-600">{volumeDiscount}%</span>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Discount Amount:</span>
                  <span className="font-medium text-green-600 mono">${volumeDiscountAmount.toFixed(2)}</span>
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
                    <span className="font-medium text-green-600 mono">
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
              <span className="text-slate-600">Subtotal:</span>
              <span className="mono">${subtotal.toFixed(2)}</span>
            </div>
            
            {customerDiscountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Customer Discount:</span>
                <span className="text-green-600 mono">-${customerDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            
            {volumeDiscountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Volume Discount:</span>
                <span className="text-green-600 mono">-${volumeDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            
            {additionalDiscountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Additional Discount:</span>
                <span className="text-green-600 mono">-${additionalDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-slate-800">Total:</span>
                <span className="text-2xl font-bold text-primary-800 mono">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
            
            {totalDiscount > 0 && (
              <div className="pt-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Total Savings:</span>
                  <span className="font-medium text-green-600">
                    {totalDiscount}% (${totalDiscountAmount.toFixed(2)})
                  </span>
                </div>
              </div>
            )}
            
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