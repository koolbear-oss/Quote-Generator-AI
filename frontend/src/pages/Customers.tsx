import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export default function Customers() {
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
        .select(`*, discount_group:customer_groups(name)`)
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Customer Management</h1>
        <p className="text-slate-600">Manage your customer database and discount groups.</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
              Search Customers
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company, contact, or email..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="md:w-48">
            <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-2">
              Customer Type
            </label>
            <select
              id="type"
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
          
          <div className="flex items-end">
            <button className="btn-primary">
              Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-sm p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                customer.discount_group?.name === 'Platinum Partner' ? 'bg-purple-100 text-purple-800' :
                customer.discount_group?.name === 'Gold Partner' ? 'bg-yellow-100 text-yellow-800' :
                customer.discount_group?.name === 'Silver Partner' ? 'bg-gray-100 text-gray-800' :
                customer.discount_group?.name === 'Bronze Partner' ? 'bg-orange-100 text-orange-800' :
                customer.discount_group?.name === 'Government' ? 'bg-blue-100 text-blue-800' :
                customer.discount_group?.name === 'Education' ? 'bg-green-100 text-green-800' :
                'bg-slate-100 text-slate-600'
              }`}>
                {customer.discount_group?.name || 'Standard'}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{customer.account}</h3>
            <p className="text-sm text-slate-600 mb-2">{customer.contact}</p>
            <p className="text-sm text-slate-500 mb-4">{customer.email}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Type:</span>
                <span className="text-slate-800 capitalize">{customer.account_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Discount:</span>
                <span className="text-slate-800 font-medium">{customer.discount_percentage}%</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors">
                  Edit
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                  View Quotes
                </button>
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
  )
}