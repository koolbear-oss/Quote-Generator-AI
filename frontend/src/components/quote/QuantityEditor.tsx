// frontend/src/components/quote/QuantityEditor.tsx
import { useQuote } from '../../context/QuoteContext'

export default function QuantityEditor() {
  const { state, dispatch } = useQuote()

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity > 0) {
      dispatch({ type: 'UPDATE_PRODUCT_QUANTITY', payload: { id: productId, quantity } })
    }
  }

  const increaseQuantity = (productId: string, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1)
  }

  const decreaseQuantity = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1)
    }
  }

  const calculateSubtotal = (price: number, quantity: number) => {
    return (price || 0) * (quantity || 1)
  }

  const total = state.products.reduce(
    (sum, product) => sum + calculateSubtotal(product.price || 0, product.quantity || 1), 
    0
  )

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

  if (state.products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">No products selected</h3>
        <p className="mt-1 text-sm text-slate-500">Please select products in the previous step.</p>
      </div>
    )
  }

  const groupedProducts = groupProductsByCategory()

  return (
    <div className="space-y-6">
      <div className="fade-in">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Configure Quantities</h2>
        <p className="text-slate-600">Set quantities and specifications for your selected products.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Selected Products</h3>
            <button className="text-sm text-primary-600 hover:text-primary-800">
              Bulk Import
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Map through grouped products by category */}
          {Object.entries(groupedProducts).map(([category, products]) => (
            <div key={category} className="mb-2">
              {/* Category header */}
              <div className="bg-slate-100 px-6 py-2">
                <h4 className="font-semibold text-slate-700">{category}</h4>
              </div>
              
              {/* Products in this category */}
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subtotal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{product.name}</div>
                          <div className="text-sm text-slate-500">{product.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {product.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 mono">
                        ${(product.price || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => decreaseQuantity(product.id, product.quantity || 1)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors"
                            disabled={(product.quantity || 1) <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={product.quantity || 1}
                            onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-sm"
                          />
                          <button
                            onClick={() => increaseQuantity(product.id, product.quantity || 1)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 mono">
                        ${calculateSubtotal(product.price || 0, product.quantity || 1).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => dispatch({ type: 'REMOVE_PRODUCT', payload: product.id })}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-slate-800">Total:</span>
            <span className="text-2xl font-bold text-primary-800 mono">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-primary-800">{state.products.length}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Total Quantity</h3>
          <p className="text-3xl font-bold text-primary-800">
            {state.products.reduce((sum, p) => sum + (p.quantity || 1), 0)}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Subtotal</h3>
          <p className="text-3xl font-bold text-primary-800 mono">${total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}