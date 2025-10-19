// frontend/src/components/quote/QuoteExporter.tsx
import { useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { useQuote } from '../../context/QuoteContext'
import QuotePDF from '../pdf/QuotePDF'
import { generateQuoteNumber, createQuote, saveQuoteItems } from '../../services/supabase'

export default function QuoteExporter() {
  const { state, dispatch } = useQuote()
  const [exporting, setExporting] = useState(false)

  // Group products by category
  const groupProductsByCategory = () => {
    const grouped: Record<string, any[]> = {}
    
    state.products.forEach(product => {
      const category = product.category || 'Other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(product)
    })
    
    return grouped
  }

  const groupedProducts = groupProductsByCategory()

  const generateCSV = () => {
    const headers = ['Product', 'Category', 'Brand', 'Quantity', 'Unit Price', 'Total Price']
    const rows = state.products.map(product => [
      product.name || 'Unknown Product',
      product.category || 'Other',
      product.brand || '',
      (product.quantity || 1).toString(),
      (product.price || 0).toFixed(2),
      ((product.price || 0) * (product.quantity || 1)).toFixed(2)
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quote-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const emailQuote = () => {
    if (!state.customer?.email) {
      alert('Please select a customer with an email address first.')
      return
    }
    
    const subject = `Quote from Digital Access Solutions`
    const body = `Dear ${state.customer.contact || 'Customer'},\n\nPlease find attached your quote for ${state.dasSolution?.name || 'DAS'} products.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nDigital Access Solutions Team`
    
    window.location.href = `mailto:${state.customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const completeQuote = async () => {
    setExporting(true)
    try {
      // Generate quote number
      const quoteNumber = await generateQuoteNumber()
      
      // Create quote
      const { data: quote, error } = await createQuote({
        quote_number: quoteNumber,
        name: state.dasSolution?.name || 'New Quote',
        customer_id: state.customer?.id,
        das_solution_id: state.dasSolution?.id,
        project_discount: state.additionalDiscount || 0,
        notes: state.notes,
        status: 'completed'
      })
      
      if (error) throw error

      // Save quote items
      if (quote) {
        await saveQuoteItems(quote.id, state.products.map(product => ({
          product_id: product.id,
          quantity: product.quantity || 1,
          unit_price: product.price || 0,
          discount_percentage: product.discountPercentage || 0
        })))
        
        alert('Quote completed successfully!')
        dispatch({ type: 'CLEAR_QUOTE' })
        // Navigate to dashboard or reload
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error completing quote:', error)
      alert('Error completing quote. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  if (state.products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">No products selected</h3>
        <p className="mt-1 text-sm text-slate-500">Please select products before exporting your quote.</p>
      </div>
    )
  }

  // Fix calculations by ensuring safe numeric values
  const subtotal = state.products.reduce(
    (sum, product) => sum + ((product.price || 0) * (product.quantity || 1)), 
    0
  )
  
  const discountPercentage = (state.customer?.discount_group?.discount_percentage || 0)
  const additionalDiscount = (state.additionalDiscount || 0)
  const totalDiscount = discountPercentage + additionalDiscount
  
  const discountAmount = subtotal * (totalDiscount / 100)
  const finalTotal = subtotal - discountAmount

  return (
    <div className="space-y-6">
      <div className="fade-in">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Export Quote</h2>
        <p className="text-slate-600">Review your quote and choose export options.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Quote Preview</h3>
            </div>
            <div className="p-6">
              <div className="border border-slate-200 rounded-lg p-6 bg-white">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-200">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">QUOTE</h1>
                    <p className="text-slate-600">Quote #: QT-{new Date().toISOString().split('T')[0]}-001</p>
                    <p className="text-slate-600">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-16 bg-primary-800 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-white font-bold text-sm">DAS</span>
                    </div>
                    <p className="text-sm text-slate-600">Digital Access Solutions</p>
                  </div>
                </div>
                
                {/* Customer Info */}
                {state.customer && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Bill To:</h4>
                    <p className="text-slate-700">{state.customer.account}</p>
                    <p className="text-slate-600">{state.customer.contact}</p>
                    <p className="text-slate-600">{state.customer.email}</p>
                  </div>
                )}
                
                {/* Solution */}
                {state.dasSolution && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-800 mb-2">Selected Solution: {state.dasSolution.name}</h4>
                  </div>
                )}
                
                {/* Products Table */}
                <div className="mb-6">
                  {/* Map through grouped products by category */}
                  {Object.entries(groupedProducts).map(([category, products]) => (
                    <div key={category} className="mb-4">
                      <h5 className="font-medium text-slate-700 mb-2">{category}</h5>
                      <table className="w-full mb-4">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 font-medium text-slate-600">Product</th>
                            <th className="text-right py-2 font-medium text-slate-600">Qty</th>
                            <th className="text-right py-2 font-medium text-slate-600">Price</th>
                            <th className="text-right py-2 font-medium text-slate-600">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr key={product.id} className="border-b border-slate-100">
                              <td className="py-2 text-slate-700">{product.name}</td>
                              <td className="py-2 text-right text-slate-700">{product.quantity || 1}</td>
                              <td className="py-2 text-right text-slate-700 mono">${(product.price || 0).toFixed(2)}</td>
                              <td className="py-2 text-right text-slate-700 mono">
                                ${((product.price || 0) * (product.quantity || 1)).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
                
                {/* Summary */}
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="mono">${subtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-600">Discount ({totalDiscount}%):</span>
                        <span className="text-green-600 mono">-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="text-lg font-semibold text-slate-800">Total:</span>
                      <span className="text-2xl font-bold text-primary-800 mono">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-200 text-sm text-slate-500">
                  <p>Quote valid until {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                  <p>Thank you for choosing Digital Access Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Export Options</h3>
            <div className="space-y-4">
              <PDFDownloadLink
                document={<QuotePDF quote={state} />}
                fileName={`quote-${new Date().toISOString().split('T')[0]}.pdf`}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {({ loading }) => (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    {loading ? 'Generating PDF...' : 'Download PDF'}
                  </>
                )}
              </PDFDownloadLink>
              
              <button
                onClick={generateCSV}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Export CSV
              </button>

              <button
                onClick={emailQuote}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Email Quote
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quote Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Quote ID:</span>
                <span className="mono">QT-{new Date().toISOString().split('T')[0]}-001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Created:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Expires:</span>
                <span>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Value:</span>
                <span className="font-medium mono">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Consolidated action buttons */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={completeQuote}
                disabled={exporting}
                className="w-full px-4 py-3 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {exporting ? 'Completing...' : 'Complete Quote'}
              </button>
              <button 
                onClick={() => dispatch({ type: 'CLEAR_QUOTE' })}
                className="w-full px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Start New Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}