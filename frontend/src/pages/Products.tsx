import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export default function Products() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSolution, setSelectedSolution] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [solutions, setSolutions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    loadProducts()
    loadSolutions()
    loadCategories()
  }, [])

  async function loadProducts() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('products')
        .select(`*, category:product_categories(name), solution:das_solutions(name)`)
        .eq('active', true)
        .order('name')

      if (data) {
        setProducts(data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadSolutions() {
    const { data } = await supabase
      .from('das_solutions')
      .select('*')
      .eq('active', true)
      .order('name')
    
    if (data) {
      setSolutions(data)
    }
  }

  async function loadCategories() {
    const { data } = await supabase
      .from('product_categories')
      .select('*')
      .order('name')
    
    if (data) {
      setCategories(data)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSolution = !selectedSolution || product.solution?.name === selectedSolution
    const matchesCategory = !selectedCategory || product.category?.name === selectedCategory
    
    return matchesSearch && matchesSolution && matchesCategory
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Product Catalog</h1>
        <p className="text-slate-600">Browse and manage your DAS product catalog.</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
              Search Products
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, description, or brand..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor="solution" className="block text-sm font-medium text-slate-700 mb-2">
              DAS Solution
            </label>
            <select
              id="solution"
              value={selectedSolution}
              onChange={(e) => setSelectedSolution(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Solutions</option>
              {solutions.map(solution => (
                <option key={solution.id} value={solution.name}>{solution.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        <button className="btn-primary">
          Add Product
        </button>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                  {product.category?.name || 'Other'}
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                  {product.solution?.name || 'All'}
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{product.name}</h3>
            <p className="text-sm text-slate-500 mb-2">{product.brand}</p>
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{product.short_description}</p>
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Product ID:</span>
                <span className="text-slate-800 mono">{product.product_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Discount Group:</span>
                <span className="text-slate-800">{product.discount_group}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-primary-800 mono">${product.gross_price}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors">
                Edit
              </button>
              <button className="flex-1 px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900">No products found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchTerm || selectedSolution || selectedCategory ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first product.'}
          </p>
        </div>
      )}
    </div>
  )
}