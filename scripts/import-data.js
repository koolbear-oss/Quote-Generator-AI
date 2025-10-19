// scripts/import-data.js
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import csv from 'csv-parser'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY // Use service key for admin privileges
const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to read CSV
async function readCsv(filePath, separator = ';') {
  return new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream(filePath)
      .pipe(csv({ separator }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error))
  })
}

// Import DAS Solutions
async function importDasSolutions() {
  try {
    console.log('Importing DAS solutions...')
    const data = await readCsv('./data/das_solutions.csv')
    
    const solutions = data.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      active: true
    }))
    
    const { data: insertedData, error } = await supabase
      .from('das_solutions')
      .upsert(solutions, { onConflict: 'id' })
    
    if (error) throw error
    console.log(`Successfully imported ${solutions.length} DAS solutions`)
    return solutions
  } catch (error) {
    console.error('Error importing DAS solutions:', error)
    throw error
  }
}

// Import Product Categories
async function importProductCategories() {
  try {
    console.log('Importing product categories...')
    const data = await readCsv('./data/products.csv')
    
    // Extract unique subgroup codes and names
    const uniqueCategories = new Map()
    data.forEach(row => {
      if (row.subGroup && row.subGroupName) {
        uniqueCategories.set(row.subGroup, {
          subgroup_code: row.subGroup,
          name: row.subGroupName,
          // Find the matching DAS solution (you may need to adjust this mapping)
          das_solution_id: findSolutionIdByName(row.subBrand)
        })
      }
    })
    
    const categories = Array.from(uniqueCategories.values())
    
    const { data: insertedData, error } = await supabase
      .from('product_categories')
      .upsert(categories, { onConflict: 'subgroup_code' })
    
    if (error) throw error
    console.log(`Successfully imported ${categories.length} product categories`)
    return categories
  } catch (error) {
    console.error('Error importing product categories:', error)
    throw error
  }
}

// Import Products
async function importProducts() {
  try {
    console.log('Importing products...')
    const data = await readCsv('./data/products.csv')
    
    // Get category map
    const { data: categories, error: categoryError } = await supabase
      .from('product_categories')
      .select('id, subgroup_code')
    
    if (categoryError) throw categoryError
    
    // Create category map for lookups
    const categoryMap = {}
    categories.forEach(cat => {
      categoryMap[cat.subgroup_code] = cat.id
    })
    
    const products = data.map(row => ({
      product_id: row.productId,
      brand: row.brand,
      sub_brand: row.subBrand,
      category_id: categoryMap[row.subGroup] || null,
      short_description: row.shortDescription,
      long_description: row.longDescription,
      gross_price: parseFloat(row.grossPrice),
      discount_group: row.discountGroup,
      active: true
    }))
    
    // Insert in batches to avoid size limitations
    const batchSize = 100
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      const { error } = await supabase
        .from('products')
        .upsert(batch, { onConflict: 'product_id' })
      
      if (error) throw error
      console.log(`Imported batch ${i/batchSize + 1} of ${Math.ceil(products.length/batchSize)}`)
    }
    
    console.log(`Successfully imported ${products.length} products`)
  } catch (error) {
    console.error('Error importing products:', error)
    throw error
  }
}

// Import Customer Groups
async function importCustomerGroups() {
  try {
    console.log('Importing customer groups...')
    const data = await readCsv('./data/discounts.csv')
    
    // The first row contains the discount groups
    if (data.length === 0) {
      throw new Error('No discount data found')
    }
    
    // Get the first row and extract column names (after the first column)
    const firstRow = data[0]
    const discountGroups = Object.keys(firstRow).filter(key => key !== 'Product Discount Group')
    
    const customerGroups = discountGroups.map(group => ({
      code: group,
      name: getCustomerGroupName(group),
    }))
    
    const { data: insertedData, error } = await supabase
      .from('customer_groups')
      .upsert(customerGroups, { onConflict: 'code' })
    
    if (error) throw error
    console.log(`Successfully imported ${customerGroups.length} customer groups`)
    return customerGroups
  } catch (error) {
    console.error('Error importing customer groups:', error)
    throw error
  }
}

// Import Customers
async function importCustomers() {
  try {
    console.log('Importing customers...')
    const data = await readCsv('./data/customers.csv')
    
    // Get customer groups
    const { data: groups, error: groupError } = await supabase
      .from('customer_groups')
      .select('id, code')
    
    if (groupError) throw groupError
    
    // Create group map for lookups
    const groupMap = {}
    groups.forEach(group => {
      groupMap[group.code] = group.id
    })
    
    const customers = data.map(row => ({
      customer_id: row.customerId,
      account: row.account,
      contact: row.contact,
      discount_group_id: groupMap[row.discountGroup] || null,
      account_type: row.accountType
    }))
    
    const { data: insertedData, error } = await supabase
      .from('customers')
      .upsert(customers, { onConflict: 'customer_id' })
    
    if (error) throw error
    console.log(`Successfully imported ${customers.length} customers`)
  } catch (error) {
    console.error('Error importing customers:', error)
    throw error
  }
}

// Import Discount Matrix
async function importDiscountMatrix() {
  try {
    console.log('Importing discount matrix...')
    const data = await readCsv('./data/discounts.csv')
    
    // Get customer groups
    const { data: groups, error: groupError } = await supabase
      .from('customer_groups')
      .select('id, code')
    
    if (groupError) throw groupError
    
    // Create group map for lookups
    const groupMap = {}
    groups.forEach(group => {
      groupMap[group.code] = group.id
    })
    
    let discountMatrix = []
    
    // Each row represents a product discount group
    data.forEach(row => {
      // The first column is the product discount group
      const productDiscountGroup = row['Product Discount Group']
      
      // Process each customer group
      Object.keys(row).forEach(key => {
        // Skip the product discount group column
        if (key === 'Product Discount Group') return
        
        // Add to the discount matrix
        discountMatrix.push({
          product_discount_group: productDiscountGroup,
          customer_group_id: groupMap[key] || null,
          discount_percentage: parseFloat(row[key]) || 0
        })
      })
    })
    
    const { data: insertedData, error } = await supabase
      .from('discount_matrix')
      .upsert(discountMatrix, { 
        onConflict: ['product_discount_group', 'customer_group_id'] 
      })
    
    if (error) throw error
    console.log(`Successfully imported ${discountMatrix.length} discount matrix entries`)
  } catch (error) {
    console.error('Error importing discount matrix:', error)
    throw error
  }
}

// Helper function to find solution ID by name
function findSolutionIdByName(name) {
  // This is a simplified example - you'll need to map solution names to IDs
  // based on your actual data
  const solutions = {
    'SMARTair': 1,
    'Aperio': 2,
    'Access': 3,
    'eCLIQ': 4
  }
  
  return solutions[name] || null
}

// Helper function to get a friendly customer group name
function getCustomerGroupName(code) {
  // Map codes to friendly names
  const names = {
    'P25 - FAC MAN': 'Facility Management',
    'P28 - PEU': 'Premium End User',
    'P34 - INSTALL': 'Installers',
    'P40 - INSTALL': 'Premium Installers',
    'P43 - SYS INT': 'System Integrators',
    'P38 - FRAME': 'Frame Manufacturers'
  }
  
  return names[code] || code
}

// Main function to run all imports
async function importAll() {
  try {
    await importDasSolutions()
    await importProductCategories()
    await importProducts()
    await importCustomerGroups()
    await importCustomers()
    await importDiscountMatrix()
    console.log('All data imported successfully!')
  } catch (error) {
    console.error('Error importing data:', error)
  }
}

// Run the import
importAll()