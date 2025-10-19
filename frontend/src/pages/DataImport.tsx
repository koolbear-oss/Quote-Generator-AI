// frontend/src/pages/DataImport.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function DataImport() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);

  // Add a log message to the status array
  const addLog = (message: string) => {
    setStatus(prev => [...prev, message]);
  };

  // Parse CSV with custom separator
  const parseCSV = (text: string, separator = ';') => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(separator);
    
    return lines.slice(1).map(line => {
      const values = line.split(separator);
      const entry: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        entry[header] = values[index] || '';
      });
      
      return entry;
    });
  };

  // Read a file from the data directory
  const readFile = async (filename: string) => {
    try {
      const response = await fetch(`/data/${filename}`);
      if (!response.ok) throw new Error(`Failed to load ${filename}`);
      return await response.text();
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error);
      throw error;
    }
  };

  // Import DAS Solutions
  const importDasSolutions = async () => {
    try {
      addLog('Importing DAS solutions...');
      const text = await readFile('das_solutions.csv');
      const data = parseCSV(text);
      
      const solutions = data.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        active: true
      }));
      
      const { error } = await supabase
        .from('das_solutions')
        .upsert(solutions, { onConflict: 'id' });
      
      if (error) throw error;
      addLog(`✅ Successfully imported ${solutions.length} DAS solutions`);
      return solutions;
    } catch (error) {
      addLog(`❌ Error importing DAS solutions: ${error.message}`);
      throw error;
    }
  };

  // Import Product Categories
  const importProductCategories = async () => {
    try {
      addLog('Importing product categories...');
      const text = await readFile('products.csv');
      const data = parseCSV(text);
      
      // Extract unique subgroup codes and names
      const uniqueCategories = new Map();
      data.forEach(row => {
        if (row.subGroup && row.subGroupName) {
          uniqueCategories.set(row.subGroup, {
            subgroup_code: row.subGroup,
            name: row.subGroupName,
            // Find the matching DAS solution based on subBrand
            das_solution_id: findSolutionIdByName(row.subBrand)
          });
        }
      });
      
      const categories = Array.from(uniqueCategories.values());
      
      const { error } = await supabase
        .from('product_categories')
        .upsert(categories, { onConflict: 'subgroup_code' });
      
      if (error) throw error;
      addLog(`✅ Successfully imported ${categories.length} product categories`);
      return categories;
    } catch (error) {
      addLog(`❌ Error importing product categories: ${error.message}`);
      throw error;
    }
  };

  // Import Products
  const importProducts = async () => {
    try {
      addLog('Importing products...');
      const text = await readFile('products.csv');
      const data = parseCSV(text);
      
      // Get category map
      const { data: categories, error: categoryError } = await supabase
        .from('product_categories')
        .select('id, subgroup_code');
      
      if (categoryError) throw categoryError;
      
      // Create category map for lookups
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.subgroup_code] = cat.id;
      });
      
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
      }));
      
      // Insert in batches to avoid size limitations
      const batchSize = 50;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const { error } = await supabase
          .from('products')
          .upsert(batch, { onConflict: 'product_id' });
        
        if (error) throw error;
        addLog(`✅ Imported batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(products.length/batchSize)}`);
      }
      
      addLog(`✅ Successfully imported ${products.length} products`);
    } catch (error) {
      addLog(`❌ Error importing products: ${error.message}`);
      throw error;
    }
  };

  // Import Customer Groups
  const importCustomerGroups = async () => {
    try {
      addLog('Importing customer groups...');
      const text = await readFile('discounts.csv');
      const data = parseCSV(text);
      
      // The first row contains the discount groups
      if (data.length === 0) {
        throw new Error('No discount data found');
      }
      
      // Get the first row and extract column names (after the first column)
      const firstRow = data[0];
      const discountGroups = Object.keys(firstRow).filter(key => key !== 'Product Discount Group');
      
      const customerGroups = discountGroups.map(group => ({
        code: group,
        name: getCustomerGroupName(group),
      }));
      
      const { error } = await supabase
        .from('customer_groups')
        .upsert(customerGroups, { onConflict: 'code' });
      
      if (error) throw error;
      addLog(`✅ Successfully imported ${customerGroups.length} customer groups`);
      return customerGroups;
    } catch (error) {
      addLog(`❌ Error importing customer groups: ${error.message}`);
      throw error;
    }
  };

  // Import Customers
  const importCustomers = async () => {
    try {
      addLog('Importing customers...');
      const text = await readFile('customers.csv');
      const data = parseCSV(text);
      
      // Get customer groups
      const { data: groups, error: groupError } = await supabase
        .from('customer_groups')
        .select('id, code');
      
      if (groupError) throw groupError;
      
      // Create group map for lookups
      const groupMap = {};
      groups.forEach(group => {
        groupMap[group.code] = group.id;
      });
      
      const customers = data.map(row => ({
        customer_id: row.customerId,
        account: row.account,
        contact: row.contact,
        discount_group_id: groupMap[row.discountGroup] || null,
        account_type: row.accountType
      }));
      
      const { error } = await supabase
        .from('customers')
        .upsert(customers, { onConflict: 'customer_id' });
      
      if (error) throw error;
      addLog(`✅ Successfully imported ${customers.length} customers`);
    } catch (error) {
      addLog(`❌ Error importing customers: ${error.message}`);
      throw error;
    }
  };

  // Import Discount Matrix
  const importDiscountMatrix = async () => {
    try {
      addLog('Importing discount matrix...');
      const text = await readFile('discounts.csv');
      const data = parseCSV(text);
      
      // Get customer groups
      const { data: groups, error: groupError } = await supabase
        .from('customer_groups')
        .select('id, code');
      
      if (groupError) throw groupError;
      
      // Create group map for lookups
      const groupMap = {};
      groups.forEach(group => {
        groupMap[group.code] = group.id;
      });
      
      let discountMatrix = [];
      
      // Each row represents a product discount group
      data.forEach(row => {
        // The first column is the product discount group
        const productDiscountGroup = row['Product Discount Group'];
        
        // Process each customer group
        Object.keys(row).forEach(key => {
          // Skip the product discount group column
          if (key === 'Product Discount Group') return;
          
          // Add to the discount matrix
          discountMatrix.push({
            product_discount_group: productDiscountGroup,
            customer_group_id: groupMap[key] || null,
            discount_percentage: parseFloat(row[key]) || 0
          });
        });
      });
      
      const { error } = await supabase
        .from('discount_matrix')
        .upsert(discountMatrix, { 
          onConflict: ['product_discount_group', 'customer_group_id'] 
        });
      
      if (error) throw error;
      addLog(`✅ Successfully imported ${discountMatrix.length} discount matrix entries`);
    } catch (error) {
      addLog(`❌ Error importing discount matrix: ${error.message}`);
      throw error;
    }
  };

  // Helper function to find solution ID by name
  const findSolutionIdByName = (name) => {
    // This is a simplified example - you'll need to map solution names to IDs
    // based on your actual data
    const solutions = {
      'SMARTair': 1,
      'Aperio': 2,
      'Access': 3,
      'eCLIQ': 4
    };
    
    return solutions[name] || null;
  };

  // Helper function to get a friendly customer group name
  const getCustomerGroupName = (code) => {
    // Map codes to friendly names
    const names = {
      'P25 - FAC MAN': 'Facility Management',
      'P28 - PEU': 'Premium End User',
      'P34 - INSTALL': 'Installers',
      'P40 - INSTALL': 'Premium Installers',
      'P43 - SYS INT': 'System Integrators',
      'P38 - FRAME': 'Frame Manufacturers'
    };
    
    return names[code] || code;
  };

  // Run all imports in sequence
  const runAllImports = async () => {
    setLoading(true);
    setStatus([]);
    setComplete(false);
    
    try {
      await importDasSolutions();
      await importProductCategories();
      await importProducts();
      await importCustomerGroups();
      await importCustomers();
      await importDiscountMatrix();
      
      addLog('🎉 All data imported successfully!');
      setComplete(true);
    } catch (error) {
      addLog(`❌ Import process halted due to error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Data Import Utility</h1>
      
      <div className="mb-6">
        <button
          onClick={runAllImports}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Importing...' : 'Start Import'}
        </button>
      </div>
      
      <div className="border rounded-md p-4 bg-gray-50 max-h-96 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Import Log</h2>
        {status.length === 0 ? (
          <p className="text-gray-500">Import not started. Click the button above to begin.</p>
        ) : (
          <div className="space-y-1 font-mono text-sm">
            {status.map((message, index) => (
              <div key={index} className="border-b border-gray-200 py-1">{message}</div>
            ))}
          </div>
        )}
      </div>
      
      {complete && (
        <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-md">
          <h2 className="text-lg font-semibold">Import Complete</h2>
          <p>All data has been successfully imported into the database.</p>
        </div>
      )}
    </div>
  );
}