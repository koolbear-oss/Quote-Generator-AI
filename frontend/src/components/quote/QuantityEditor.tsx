// frontend/src/components/quote/QuantityEditor.tsx
import { useQuote } from '../../context/QuoteContext';
import { useState } from 'react';

export default function QuantityEditor() {
  const { state, dispatch } = useQuote();
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity > 0) {
      dispatch({ type: 'UPDATE_PRODUCT_QUANTITY', payload: { id: productId, quantity } });
    }
  };

  const increaseQuantity = (productId: string, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const decreaseQuantity = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  const calculateSubtotal = (price: number, quantity: number) => {
    return (price || 0) * (quantity || 1);
  };

  const total = state.products.reduce(
    (sum, product) => sum + calculateSubtotal(product.price || product.gross_price || 0, product.quantity || 1), 
    0
  );

  // Group products by category
  const groupProductsByCategory = () => {
    const grouped: Record<string, any[]> = {};
    
    state.products.forEach(product => {
      const category = product.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(product);
    });
    
    return grouped;
  };

  // Toggle description expansion
  const toggleDescription = (productId: string) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null);
    } else {
      setExpandedProduct(productId);
    }
  };

  // Format description with reasonable length
  const formatDescription = (description: string, productId: string) => {
    const isExpanded = expandedProduct === productId;
    
    if (!description) return "No description available";
    
    if (isExpanded || description.length < 100) {
      return description;
    }
    
    return description.substring(0, 100) + '...';
  };

  if (state.products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">No products selected</h3>
        <p className="mt-1 text-sm text-slate-500">Please select products in the previous step.</p>
      </div>
    );
  }

  const groupedProducts = groupProductsByCategory();

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

        {Object.entries(groupedProducts).map(([category, products]) => (
          <div key={category} className="mb-4">
            {/* Category header */}
            <div className="bg-slate-100 px-6 py-2">
              <h4 className="font-semibold text-slate-700">{category}</h4>
            </div>
            
            {/* Products in this category */}
            <div className="divide-y divide-slate-200">
              {products.map((product) => {
                const isExpanded = expandedProduct === product.id;
                return (
                  <div key={product.id} className="p-4 hover:bg-slate-50">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Product Info (spans 6 columns on desktop, 12 on mobile) */}
                      <div className="col-span-12 md:col-span-6">
                        <div className="font-medium text-slate-800 mb-1">{product.product_id}</div>
                        <div className="text-sm text-slate-600 mb-1">{product.brand}</div>
                        <div className="text-sm text-slate-700 mb-2 break-words">
                          {formatDescription(product.description, product.id)}
                          {product.description && product.description.length > 100 && (
                            <button 
                              onClick={() => toggleDescription(product.id)}
                              className="ml-1 text-primary-600 text-xs hover:underline"
                            >
                              {isExpanded ? 'Show less' : 'Show more'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Unit Price (spans 2 columns) */}
                      <div className="col-span-3 md:col-span-2 text-right">
                        <div className="text-sm text-slate-500">Unit Price</div>
                        <div className="font-medium">${(product.price || product.gross_price || 0).toFixed(2)}</div>
                      </div>

                      {/* Quantity Controls (spans 2 columns) */}
                      <div className="col-span-5 md:col-span-2">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => decreaseQuantity(product.id, product.quantity || 1)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-800"
                            disabled={(product.quantity || 1) <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={product.quantity || 1}
                            onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                            className="w-16 mx-2 px-2 py-1 border border-slate-300 rounded text-center text-sm"
                          />
                          <button
                            onClick={() => increaseQuantity(product.id, product.quantity || 1)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-800"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal (spans 1 column) */}
                      <div className="col-span-2 md:col-span-1 text-right">
                        <div className="text-sm text-slate-500">Subtotal</div>
                        <div className="font-medium">${calculateSubtotal(product.price || product.gross_price || 0, product.quantity || 1).toFixed(2)}</div>
                      </div>

                      {/* Remove Button (spans 1 column) */}
                      <div className="col-span-2 md:col-span-1 text-right">
                        <button
                          onClick={() => dispatch({ type: 'REMOVE_PRODUCT', payload: product.id })}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

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
  );
}