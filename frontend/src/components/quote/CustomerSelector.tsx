import { useEffect, useState } from 'react'
import { useQuote } from '../../context/QuoteContext'
import { supabase } from '../../services/supabase'

export default function CustomerSelector() {
  const { state, dispatch } = useQuote()
  const [customerGroups, setCustomerGroups] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  // Load customer groups on component mount
  useEffect(() => {
    loadCustomerGroups()
  }, [])

  // Load customers when a group is selected
  useEffect(() => {
    if (selectedGroup) {
      loadCustomersByGroup(selectedGroup.id)
    } else {
      setCustomers([])
    }
  }, [selectedGroup])

  async function loadCustomerGroups() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('customer_groups')
        .select('*')
        .order('name')

      if (error) throw error
      setCustomerGroups(data || [])
    } catch (error) {
      console.error('Error loading customer groups:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCustomersByGroup(groupId) {
    setLoadingCustomers(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('discount_group_id', groupId)
        .order('account')

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  const handleSelectGroup = (group) => {
    setSelectedGroup(group)
  }

  const handleSelectCustomer = (customer) => {
    // Add the customer group to the customer object for discount calculation
    const customerWithGroup = {
      ...customer,
      customer_group: selectedGroup
    }
    dispatch({ type: 'SET_CUSTOMER', payload: customerWithGroup })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Select Customer Group */}
      <div className="fade-in">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Select Customer Type</h2>
        <p className="text-slate-600">Choose the type of customer for appropriate pricing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {customerGroups.map((group) => (
          <div
            key={group.id}
            className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all ${
              selectedGroup?.id === group.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => handleSelectGroup(group)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                {group.code}
              </div>
            </div>
            
            <h3 className="font-semibold text-slate-800 mb-1">{group.name}</h3>
          </div>
        ))}
      </div>

      {/* Step 2: Select Customer (only shown when a group is selected) */}
      {selectedGroup && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Select Customer</h2>
            <button 
              className="text-sm text-primary-600 hover:text-primary-800"
              onClick={() => setSelectedGroup(null)}
            >
              Change Customer Type
            </button>
          </div>

          {loadingCustomers ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-800"></div>
            </div>
          ) : customers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all ${
                    state.customer?.id === customer.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <h3 className="font-semibold text-slate-800 mb-1">{customer.account}</h3>
                  {customer.contact && <p className="text-sm text-slate-600">Contact: {customer.contact}</p>}
                  {customer.customer_id && <p className="text-xs text-slate-500 mt-1">ID: {customer.customer_id}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">No customers found for this customer type. Please add customers or select a different type.</p>
            </div>
          )}
        </div>
      )}

      {state.customer && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-green-800">
              Selected: <strong>{state.customer.account}</strong> ({selectedGroup?.name})
            </p>
          </div>
        </div>
      )}
    </div>
  )
}