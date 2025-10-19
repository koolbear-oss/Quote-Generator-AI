// src/components/quote/CustomerSelector.tsx
import { useEffect, useState } from 'react'
import { useQuote } from '../../context/QuoteContext'
import { supabase } from '../../services/supabase'

export default function CustomerSelector() {
  const { state, dispatch } = useQuote()
  const [customerTypes, setCustomerTypes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomerTypes()
  }, [])

  async function loadCustomerTypes() {
    setLoading(true)
    try {
      // Load template customers (one for each customer type)
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id, 
          customer_id,
          account,
          contact,
          account_type,
          discount_group_id,
          customer_groups(id, name, code)
        `)
        .in('account_type', [
          'digital_oem',
          'system_integrator',
          'system_installer',
          'end_user',
          'physical_oem'
        ])
        .order('account')

      if (error) throw error

      if (data) {
        // Transform data to include customer group
        const customersWithGroups = data.map(customer => ({
          ...customer,
          discount_group: customer.customer_groups
        }))
        setCustomerTypes(customersWithGroups)
      }
    } catch (error) {
      console.error('Error loading customer types:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCustomer = (customer) => {
    dispatch({ type: 'SET_CUSTOMER', payload: customer })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="fade-in">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Select Customer Type</h2>
        <p className="text-slate-600">Choose the type of customer for appropriate pricing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {customerTypes.map((customer) => (
          <div
            key={customer.id}
            className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all ${
              state.customer?.id === customer.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => handleSelectCustomer(customer)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                {customer.discount_group?.name || 'No Group'}
              </div>
            </div>
            
            <h3 className="font-semibold text-slate-800 mb-1">{customer.account}</h3>
            <p className="text-sm text-slate-500 mb-2">Type: {customer.account_type}</p>
            
            {customer.customer_groups && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">Discount Group: {customer.discount_group?.code}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {state.customer && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-green-800">
              Selected: <strong>{state.customer.account}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}