import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuote } from '../context/QuoteContext'
import DasSolutionSelector from '../components/quote/DasSolutionSelector'
import ProductSelector from '../components/quote/ProductSelector'
import QuantityEditor from '../components/quote/QuantityEditor'
import CustomerSelector from '../components/quote/CustomerSelector'
import DiscountApplier from '../components/quote/DiscountApplier'
import QuoteExporter from '../components/quote/QuoteExporter'

const STEPS = [
  { id: 1, name: 'Choose DAS Solution', component: DasSolutionSelector },
  { id: 2, name: 'Select Products', component: ProductSelector },
  { id: 3, name: 'Add Quantities', component: QuantityEditor },
  { id: 4, name: 'Choose Customer', component: CustomerSelector },
  { id: 5, name: 'Apply Discounts', component: DiscountApplier },
  { id: 6, name: 'Export Quote', component: QuoteExporter },
]

export default function QuoteWorkflow() {
  const { id } = useParams()
  const { state, dispatch } = useQuote()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      loadQuote(id)
    }
  }, [id])

  async function loadQuote(quoteId: string) {
    setLoading(true)
    try {
      const { data: quote } = await supabase
        .from('quotes')
        .select(`*, items:quote_items(*)`)
        .eq('id', quoteId)
        .single()

      if (quote) {
        // Load quote data into context
        // This would populate the entire workflow with existing quote data
      }
    } catch (error) {
      console.error('Error loading quote:', error)
    } finally {
      setLoading(false)
    }
  }

  const CurrentStepComponent = STEPS[state.currentStep - 1].component

  const handleNext = () => {
    if (state.currentStep < STEPS.length) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 })
    }
  }

  const handlePrevious = () => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep - 1 })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Quote Progress</h2>
          <span className="text-sm text-slate-500">
            Step {state.currentStep} of {STEPS.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`step-indicator ${
                  index + 1 === state.currentStep
                    ? 'active'
                    : index + 1 < state.currentStep
                    ? 'completed'
                    : 'inactive'
                }`}
              >
                {index + 1 < state.currentStep ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  index + 1 < state.currentStep ? 'bg-green-600' : 'bg-slate-300'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-slate-800">
            {STEPS[state.currentStep - 1].name}
          </h3>
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <CurrentStepComponent />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={state.currentStep === 1}
          className="btn-secondary"
        >
          Previous
        </button>
        
        <div className="flex space-x-4">
          <button
            onClick={() => dispatch({ type: 'CLEAR_QUOTE' })}
            className="btn-secondary"
          >
            Clear Quote
          </button>
          
          {state.currentStep === STEPS.length ? (
            <button className="btn-primary">
              Complete Quote
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-primary"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}