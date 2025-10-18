import { createContext, useContext, useReducer, ReactNode } from 'react'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  category: string
}

export type Customer = {
  id: string
  company: string
  contact: string
  email: string
  type: string
  tier: string
  discount: number
}

export type DasSolution = {
  id: string
  name: string
  description: string
  icon: string
}

type QuoteState = {
  dasSolution: DasSolution | null
  products: Product[]
  customer: Customer | null
  projectDiscount: number
  additionalDiscount: number
  notes: string
  currentStep: number
}

type QuoteAction = 
  | { type: 'SET_DAS_SOLUTION', payload: DasSolution }
  | { type: 'ADD_PRODUCT', payload: Product }
  | { type: 'UPDATE_PRODUCT_QUANTITY', payload: { id: string, quantity: number } }
  | { type: 'REMOVE_PRODUCT', payload: string }
  | { type: 'SET_CUSTOMER', payload: Customer }
  | { type: 'SET_PROJECT_DISCOUNT', payload: number }
  | { type: 'SET_ADDITIONAL_DISCOUNT', payload: number }
  | { type: 'SET_NOTES', payload: string }
  | { type: 'SET_CURRENT_STEP', payload: number }
  | { type: 'CLEAR_QUOTE' }

const initialState: QuoteState = {
  dasSolution: null,
  products: [],
  customer: null,
  projectDiscount: 0,
  additionalDiscount: 0,
  notes: '',
  currentStep: 1
}

function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  switch (action.type) {
    case 'SET_DAS_SOLUTION':
      return { ...state, dasSolution: action.payload }
      
    case 'ADD_PRODUCT':
      const existingProduct = state.products.find(p => p.id === action.payload.id)
      if (existingProduct) {
        return state
      }
      return { 
        ...state, 
        products: [...state.products, { ...action.payload, quantity: 1 }] 
      }
      
    case 'UPDATE_PRODUCT_QUANTITY':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id
            ? { ...product, quantity: action.payload.quantity }
            : product
        )
      }
      
    case 'REMOVE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      }
      
    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload }
      
    case 'SET_PROJECT_DISCOUNT':
      return { ...state, projectDiscount: action.payload }
      
    case 'SET_ADDITIONAL_DISCOUNT':
      return { ...state, additionalDiscount: action.payload }
      
    case 'SET_NOTES':
      return { ...state, notes: action.payload }
      
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload }
      
    case 'CLEAR_QUOTE':
      return initialState
      
    default:
      return state
  }
}

const QuoteContext = createContext<{
  state: QuoteState
  dispatch: React.Dispatch<QuoteAction>
}>({
  state: initialState,
  dispatch: () => null
})

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quoteReducer, initialState)
  
  return (
    <QuoteContext.Provider value={{ state, dispatch }}>
      {children}
    </QuoteContext.Provider>
  )
}

export function useQuote() {
  return useContext(QuoteContext)
}