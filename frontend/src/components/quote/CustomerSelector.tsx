import { useEffect, useState } from 'react'
import { useQuote } from '../../context/QuoteContext'
import { supabase } from '../../services/supabase'

export default function CustomerSelector() {
  const { state, dispatch } = useQuote()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('customers')
        .select(`*, discount_group:customer_groups(name, discount_percentage)`)
        .order('account')

      if (data) {
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchTerm || 
      customer.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !selectedType || customer.account_type === selectedType
    
    return matchesSearch && matchesType
  })

  const handleSelect = (customer: any) => {
    dispatch({ type: 'SET_CUSTOMER', payload: customer })
  }

  const getTierColor = (tier: string) => {
    const colors = {
      'Platinum Partner': 'bg-purple-100 text-purple-800',
      'Gold Partner': 'bg-yellow-100 text-yellow-800',
      'Silver Partner': 'bg-gray-100 text-gray-800',
      'Bronze Partner': 'bg-orange-100 text-orange-800',
      'Government': 'bg-blue-100 text-blue-800',
      'Education': 'bg-green-100 text-green-800',
    }
    return colors[tier as keyof typeof colors] || 'bg-slate-100 text-slate-600'
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
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Select Customer</h2>
        <p className="text-slate-600">Choose a customer to apply appropriate pricing and discounts.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search and Filter */}
        <div className="lg:w-80 bg-slate-50 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Find Customer</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by company or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Customer Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Types</option>
                <option value="reseller">Reseller</option>
                <option value="end-user">End User</option>
                <option value="government">Government</option>
                <option value="education">Education</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <button className="w-full px-4 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors">
                Add New Customer
              </button>
            </div>
          </div>
        </div>

        {/* Customer Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">
              Available Customers ({filteredCustomers.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all ${
                  state.customer?.id === customer.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleSelect(customer)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getTierColor(customer.discount_group?.name || '')}`}>
                      {customer.discount_group?.name || 'Standard'}
                    </span>
                    {state.customer?.id === customer.id && (
                      <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                
                <h4 className="font-semibold text-slate-800 mb-1">{customer.account}</h4>
                <p className="text-sm text-slate-600 mb-2">{customer.contact}</p>
                <p className="text-sm text-slate-500 mb-3">{customer.email}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Type:</span>
                    <span className="text-slate-800 capitalize">{customer.account_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Discount:</span>
                    <span className="text-slate-800 font-medium">{customer.discount_group?.discount_percentage || 0}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">No customers found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm || selectedType ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first customer.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {state.customer && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-green-800">
              Selected Customer: <strong>{state.customer.account}</strong> - {state.customer.contact} ({state.customer.discount_group?.discount_percentage || 0}% discount)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}