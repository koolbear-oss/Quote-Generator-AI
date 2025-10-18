import { useEffect, useState } from 'react'
import { useQuote } from '../../context/QuoteContext'
import { supabase } from '../../services/supabase'

const solutionIcons = {
  SMARTair: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
    </svg>
  ),
  Aperio: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
    </svg>
  ),
  Access: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
    </svg>
  ),
  eCLIQ: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
    </svg>
  ),
}

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
      const { data } = await supabase
        .from('das_solutions')
        .select('*')
        .eq('active', true)
        .order('name')

      if (data) {
        setSolutions(data)
      }
    } catch (error) {
      console.error('Error loading DAS solutions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (solution: any) => {
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
                {solutionIcons[solution.name as keyof typeof solutionIcons] || solutionIcons.SMARTair}
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-slate-800 mb-2 text-center">{solution.name}</h3>
            <p className="text-slate-600 text-sm mb-4 text-center">{solution.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="text-slate-700 capitalize">{solution.type || 'Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className={`text-slate-700 ${solution.active ? 'text-green-600' : 'text-red-600'}`}>
                  {solution.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {state.dasSolution && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-green-800">
              Selected: <strong>{state.dasSolution.name}</strong> - {state.dasSolution.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}