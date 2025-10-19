// frontend/src/services/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase' // You may need to create this type

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials are missing. Check your environment variables.')
}

// Initialize with proper auth options
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Authentication helpers with improved error handling
export async function signIn(email: string, password: string) {
  const response = await supabase.auth.signInWithPassword({ email, password })
  if (response.error) {
    console.error('Sign in error:', response.error)
  }
  return response
}

export async function signOut() {
  return supabase.auth.signOut()
}

// Check if user is authenticated
export async function isAuthenticated() {
  const { data } = await supabase.auth.getSession()
  return Boolean(data.session)
}

// Get current user
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

// Data access functions remain the same
export async function fetchDasSolutions() {
  return supabase
    .from('das_solutions')
    .select('*')
    .eq('active', true)
    .order('name')
}

export async function generateQuoteNumber() {
  try {
    const year = new Date().getFullYear();
    
    const { data, error } = await supabase
      .from('quotes')
      .select('quote_number')
      .ilike('quote_number', `Q-${year}-%`)
      .order('quote_number', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching quotes for number generation:', error);
      throw error;
    }
    
    let sequenceNumber = 1;
    if (data && data.length > 0) {
      try {
        const parts = data[0].quote_number.split('-');
        if (parts.length === 3) {
          sequenceNumber = parseInt(parts[2]) + 1;
        }
      } catch (err) {
        console.error('Error parsing quote number:', err);
        // Continue with default sequence number
      }
    }
    
    return `Q-${year}-${sequenceNumber.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Failed to generate quote number:', error);
    // Fallback to a random number
    return `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }
}

// Add a debug function to help troubleshoot
export async function debugSupabaseConnection() {
  try {
    // Check auth status
    const { data: { session } } = await supabase.auth.getSession()
    console.log("Auth session:", session ? "Present" : "Missing")
    
    // Test a basic query
    const { data, error } = await supabase
      .from('das_solutions')
      .select('name')
      .limit(1)
      
    console.log("Test query result:", data, error || "No error")
    
    return { session, testData: data, error }
  } catch (e) {
    console.error("Debug connection error:", e)
    return { error: e }
  }
}