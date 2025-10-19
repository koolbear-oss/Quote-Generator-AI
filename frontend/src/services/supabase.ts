// frontend/src/services/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Authentication helpers
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

// Data access functions
export async function fetchDasSolutions() {
  return supabase
    .from('das_solutions')
    .select('*')
    .eq('active', true)
    .order('name')
}

export async function fetchProductsBySolution(solutionId: string) {
  if (!solutionId) {
    // If no solution selected, fetch all products
    return supabase
      .from('products')
      .select(`
        *,
        category:product_categories(id, name, das_solution_id)
      `)
      .eq('active', true)
      .order('name');
  }

  // With solution selected, filter by product_categories
  return supabase
    .from('products')
    .select(`
      *,
      category:product_categories!inner(id, name, das_solution_id)
    `)
    .eq('category.das_solution_id', solutionId)
    .eq('active', true)
    .order('name');
}

export async function fetchCustomers() {
  return supabase
    .from('customers')
    .select(`*, discount_group:customer_groups(name, discount_percentage)`)
    .order('account')
}

export async function fetchCustomerGroups() {
  return supabase
    .from('customer_groups')
    .select('*')
    .order('name')
}

export async function fetchDiscountMatrix() {
  return supabase
    .from('discount_matrix')
    .select('*')
}

// Quote management
export async function createQuote(quoteData: any) {
  return supabase
    .from('quotes')
    .insert(quoteData)
    .select()
    .single()
}

export async function saveQuoteItems(quoteId: string, items: any[]) {
  const itemsWithQuoteId = items.map(item => ({
    ...item,
    quote_id: quoteId
  }))
  
  return supabase
    .from('quote_items')
    .insert(itemsWithQuoteId)
}

export async function fetchQuotes() {
  return supabase
    .from('quotes')
    .select(`
      *,
      customer:customers(account, contact),
      das_solution:das_solutions(name),
      items:quote_items(*, product:products(name, product_id))
    `)
    .order('created_at', { ascending: false })
}

// Generate quote number
export async function generateQuoteNumber() {
  const year = new Date().getFullYear()
  const { data: latestQuote } = await supabase
    .from('quotes')
    .select('quote_number')
    .ilike('quote_number', `Q-${year}-%`)
    .order('quote_number', { ascending: false })
    .limit(1)
    .single()
  
  let sequenceNumber = 1
  if (latestQuote) {
    const parts = latestQuote.quote_number.split('-')
    sequenceNumber = parseInt(parts[2]) + 1
  }
  
  return `Q-${year}-${sequenceNumber.toString().padStart(4, '0')}`
}