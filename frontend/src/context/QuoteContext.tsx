// src/context/QuoteContext.jsx
import { createContext, useContext, useReducer, ReactNode } from 'react';

// Define initial state
const initialState = {
  dasSolution: null,
  products: [],
  customer: null,
  projectDiscount: 0,
  notes: ''
};

// Define action types
const ACTION_TYPES = {
  SET_DAS_SOLUTION: 'SET_DAS_SOLUTION',
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  REMOVE_PRODUCT: 'REMOVE_PRODUCT',
  SET_CUSTOMER: 'SET_CUSTOMER',
  SET_PROJECT_DISCOUNT: 'SET_PROJECT_DISCOUNT',
  SET_NOTES: 'SET_NOTES',
  CLEAR_QUOTE: 'CLEAR_QUOTE'
};

// Reducer function
function quoteReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_DAS_SOLUTION:
      return { ...state, dasSolution: action.payload };
      
    case ACTION_TYPES.ADD_PRODUCT:
      // Check if product already exists
      const existingProductIndex = state.products.findIndex(
        p => p.id === action.payload.id
      );
      
      if (existingProductIndex >= 0) {
        // Update quantity if product exists
        const updatedProducts = [...state.products];
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          quantity: updatedProducts[existingProductIndex].quantity + 1
        };
        return { ...state, products: updatedProducts };
      }
      
      // Add new product with quantity 1
      return { 
        ...state, 
        products: [...state.products, { ...action.payload, quantity: 1 }] 
      };
      
    case ACTION_TYPES.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id
            ? { ...product, quantity: action.payload.quantity }
            : product
        )
      };
      
    case ACTION_TYPES.REMOVE_PRODUCT:
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };
      
    case ACTION_TYPES.SET_CUSTOMER:
      return { ...state, customer: action.payload };
      
    case ACTION_TYPES.SET_PROJECT_DISCOUNT:
      return { ...state, projectDiscount: action.payload };
      
    case ACTION_TYPES.SET_NOTES:
      return { ...state, notes: action.payload };
      
    case ACTION_TYPES.CLEAR_QUOTE:
      return initialState;
      
    default:
      return state;
  }
}

// Create context
const QuoteContext = createContext();

// Provider component
export function QuoteProvider({ children }) {
  const [state, dispatch] = useReducer(quoteReducer, initialState);
  
  return (
    <QuoteContext.Provider value={{ state, dispatch }}>
      {children}
    </QuoteContext.Provider>
  );
}

// Custom hook for using the context
export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
}

// Action creators for easier dispatch
export const quoteActions = {
  setDasSolution: (solution) => ({
    type: ACTION_TYPES.SET_DAS_SOLUTION,
    payload: solution
  }),
  addProduct: (product) => ({
    type: ACTION_TYPES.ADD_PRODUCT,
    payload: product
  }),
  updateProduct: (id, quantity) => ({
    type: ACTION_TYPES.UPDATE_PRODUCT,
    payload: { id, quantity }
  }),
  removeProduct: (id) => ({
    type: ACTION_TYPES.REMOVE_PRODUCT,
    payload: id
  }),
  setCustomer: (customer) => ({
    type: ACTION_TYPES.SET_CUSTOMER,
    payload: customer
  }),
  setProjectDiscount: (discount) => ({
    type: ACTION_TYPES.SET_PROJECT_DISCOUNT,
    payload: discount
  }),
  setNotes: (notes) => ({
    type: ACTION_TYPES.SET_NOTES,
    payload: notes
  }),
  clearQuote: () => ({
    type: ACTION_TYPES.CLEAR_QUOTE
  })
};