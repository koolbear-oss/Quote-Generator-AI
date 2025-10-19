import { useEffect, useState } from 'react'
import { useQuote } from '../../context/QuoteContext'
import { supabase } from '../../services/supabase'

export default function DasSolutionSelector() {
  const { state, dispatch } = useQuote()
  const [solutions, setSolutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSolutions()
  }, [])

  async function loadSolutions() {
    setLoading(true)
    try {
      // Get unique sub_brands directly from products table
      const { data, error } = await supabase
        .from('products')
        .select('sub_brand')
        .eq('active', true)
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Extract unique values and format as solutions
        const uniqueValues = [...new Set(data.map(item => item.sub_brand))]
          .filter(Boolean) // Remove nulls/empty values
          .sort(); // Sort alphabetically
          
        const formattedSolutions = uniqueValues.map(name => ({
          id: name, // Use sub_brand as ID
          name: name, // Use sub_brand as display name
          description: `${name} solutions`, // Simple description
          type: 'system'
        }));
        
        console.log("Found unique systems:", formattedSolutions);
        setSolutions(formattedSolutions);
      }
    } catch (error) {
      console.error('Error loading DAS solutions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (solution: any) => {
    console.log("Selected solution:", solution);
    dispatch({ type: 'SET_DAS_SOLUTION', payload: solution })
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
      <div className="text-center fade-in">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Choose DAS Solution</h2>
        <p className="text-slate-600">Select the Digital Access Solution that best fits your project requirements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {solutions.map((solution) => (
          <div
            key={solution.id}
            className={`solution-card card-hover p-6 rounded-xl cursor-pointer ${
              state.dasSolution?.id === solution.id ? 'selected' : ''
            }`}
            onClick={() => handleSelect(solution)}
          >
            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <div className="text-primary-600">
                {/* Default icon */}
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-2 text-center">{solution.name}</h3>
            <p className="text-slate-600 text-sm mb-4 text-center">{solution.description}</p>
          </div>
        ))}
      </div>

      {state.dasSolution && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-green-800">
              Selected: <strong>{state.dasSolution.name}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}