// frontend/src/components/quote/ProductSelector.tsx
import { useEffect, useState } from 'react'
import { useQuote } from '../../context/QuoteContext'
import { supabase } from '../../services/supabase'

export default function ProductSelector() {
  const { state, dispatch } = useQuote()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState(2000)
  const [selectedProductDetail, setSelectedProductDetail] = useState<any>(null)

  useEffect(() => {
    if (state.dasSolution) {
      loadProducts()
    }
  }, [state.dasSolution])

  async function loadProducts() {
    if (!state.dasSolution) return
    
    setLoading(true)
    try {
      // Filter products by the selected sub_brand
      console.log("Loading products for sub_brand:", state.dasSolution.name);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sub_brand', state.dasSolution.name)
        .eq('active', true)
        .order('name')

      if (error) {
        throw error;
      }
      
      console.log(`Loaded ${data?.length || 0} products for ${state.dasSolution.name}`);
      
      if (data) {
        setProducts(data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories from the loaded products
  const categories = [...new Set(products.map(p => p.subgroup_name).filter(Boolean))].sort();
  
  const filteredProducts = products.filter(product => {
    // Multi-word search - split search term into words
    const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    // If no search words, don't filter by search
    const matchesSearch = searchWords.length === 0 || searchWords.every(word => {
      // Check if this word appears in any of the searchable fields
      return (
        (product.product_id?.toLowerCase().includes(word) || false) ||
        (product.short_description?.toLowerCase().includes(word) || false) ||
        (product.long_description?.toLowerCase().includes(word) || false) ||
        (product.brand?.toLowerCase().includes(word) || false) ||
        (product.sub_brand?.toLowerCase().includes(word) || false)
      );
    });
    
    const matchesCategory = !selectedCategory || product.subgroup_name === selectedCategory;
    const matchesPrice = product.gross_price <= priceRange;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const toggleProduct = (product: any) => {
    const isSelected = state.products.some(p => p.id === product.id);
    
    if (isSelected) {
      dispatch({ type: 'REMOVE_PRODUCT', payload: product.id });
    } else {
      dispatch({ 
        type: 'ADD_PRODUCT', 
        payload: {
          id: product.id,
          name: product.name || product.product_id,
          product_id: product.product_id,
          description: product.short_description,
          price: product.gross_price,
          gross_price: product.gross_price,
          category: product.subgroup_name || 'Other',
          brand: product.brand,
          discount_percentage: 0
        }
      });
    }
  };

  // Clear all selected products
  const handleClearAll = () => {
    dispatch({ type: 'REMOVE_ALL_PRODUCTS' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="fade-in">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Select Products</h2>
        <p className="text-slate-600">Choose products compatible with {state.dasSolution?.name || 'your selected solution'}.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80 bg-slate-50 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Filter Products</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={selectedCategory === ''}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded border-slate-300 text-primary-600"
                  />
                  <span className="ml-2 text-sm text-slate-600">All Categories</span>
                </label>
                {categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="rounded border-slate-300 text-primary-600"
                    />
                    <span className="ml-2 text-sm text-slate-600">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price Range: ${priceRange}
              </label>
              <input
                type="range"
                min="0"
                max="2000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>$0</span>
                <span>$2000+</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">
              Available Products ({filteredProducts.length})
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Selected: {state.products.length}
              </span>
              <button
                onClick={handleClearAll}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => {
              const isSelected = state.products.some(p => p.id === product.id);
              
              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => toggleProduct(product)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                      </svg>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                        {product.subgroup_name || 'Other'}
                      </span>
                      {isSelected && (
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-slate-800 mb-1">{product.product_id}</h4>
                  <p className="text-sm text-slate-500 mb-2">{product.brand}</p>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{product.short_description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary-800 mono">${product.gross_price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card selection
                        setSelectedProductDetail(product);
                      }}
                      className="text-sm text-primary-600 hover:text-primary-800 px-2 py-1 rounded hover:bg-primary-50"
                    >
                      View details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">No products found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProductDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedProductDetail.product_id}</h2>
              <button 
                onClick={() => setSelectedProductDetail(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {selectedProductDetail.subgroup_name || 'Category N/A'}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                  {selectedProductDetail.sub_brand}
                </span>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg text-sm">
                <p className="text-slate-500 mb-1">Brand</p>
                <p className="font-medium">{selectedProductDetail.brand}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-500 mb-2 text-sm">Description</p>
                <p className="text-slate-800">{selectedProductDetail.short_description}</p>
                
                {selectedProductDetail.long_description && selectedProductDetail.long_description !== selectedProductDetail.short_description && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-slate-500 mb-2 text-sm">Technical Details</p>
                    <p className="text-slate-800">{selectedProductDetail.long_description}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-slate-500 text-sm">Price</p>
                    <p className="text-2xl font-bold text-primary-800">
                      ${selectedProductDetail.gross_price}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      toggleProduct(selectedProductDetail);
                      setSelectedProductDetail(null);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      state.products.some(p => p.id === selectedProductDetail.id)
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {state.products.some(p => p.id === selectedProductDetail.id) 
                      ? 'Remove from quote' 
                      : 'Add to quote'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}