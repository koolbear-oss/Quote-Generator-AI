import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

export default function CustomerTypesAdmin() {
  // Main state
  const [customerGroups, setCustomerGroups] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [discountMatrix, setDiscountMatrix] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupForm, setNewGroupForm] = useState({
    code: '',
    name: ''
  });
  const [showNewForm, setShowNewForm] = useState(false);
  
  // Load all data on initial render
  useEffect(() => {
    loadData();
  }, []);
  
  async function loadData() {
    setLoading(true);
    try {
      // Load customer groups
      const { data: groupData, error: groupError } = await supabase
        .from('customer_groups')
        .select('id, code, name')
        .order('name');
      
      if (groupError) throw groupError;
      setCustomerGroups(groupData || []);
      
      // Load unique product discount groups
      const { data: productData, error: productError } = await supabase
        .from('discount_matrix')
        .select('product_discount_group')
        .order('product_discount_group');
      
      if (productError) throw productError;
      const uniqueGroups = [...new Set(productData.map(p => p.product_discount_group))];
      setProductGroups(uniqueGroups);
      
      // Load the full discount matrix
      const { data: matrixData, error: matrixError } = await supabase
        .from('discount_matrix')
        .select('id, product_discount_group, customer_group_id, discount_percentage');
      
      if (matrixError) throw matrixError;
      
      // Organize matrix data by customer and product
      const matrix = {};
      groupData.forEach(group => {
        matrix[group.id] = {};
        uniqueGroups.forEach(productGroup => {
          const entry = matrixData.find(
            item => item.customer_group_id === group.id && 
                   item.product_discount_group === productGroup
          );
          
          matrix[group.id][productGroup] = entry ? {
            id: entry.id,
            discount_percentage: entry.discount_percentage
          } : {
            id: null,
            discount_percentage: 0  // Default to 0% for missing entries
          };
        });
      });
      
      setDiscountMatrix(matrix);
    } catch (error) {
      console.error('Error loading admin data:', error);
      alert('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  // Select a customer group to edit
  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
  };
  
  // Update a discount percentage
  const updateDiscount = (productGroup, newValue) => {
    if (!selectedGroup) return;
    
    setDiscountMatrix({
      ...discountMatrix,
      [selectedGroup.id]: {
        ...discountMatrix[selectedGroup.id],
        [productGroup]: {
          ...discountMatrix[selectedGroup.id][productGroup],
          discount_percentage: parseFloat(newValue) || 0
        }
      }
    });
  };
  
  // Save changes to a customer group's discount matrix
  const saveDiscounts = async () => {
    if (!selectedGroup) return;
    
    setSaving(true);
    try {
      // Prepare updates and inserts
      const updates = [];
      const inserts = [];
      
      Object.entries(discountMatrix[selectedGroup.id]).forEach(([productGroup, data]) => {
        if (data.id) {
          // Existing record - update
          updates.push({
            id: data.id,
            discount_percentage: data.discount_percentage
          });
        } else {
          // New record - insert
          inserts.push({
            customer_group_id: selectedGroup.id,
            product_discount_group: productGroup,
            discount_percentage: data.discount_percentage
          });
        }
      });
      
      // Execute updates if any
      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('discount_matrix')
          .upsert(updates);
        
        if (updateError) throw updateError;
      }
      
      // Execute inserts if any
      if (inserts.length > 0) {
        const { error: insertError } = await supabase
          .from('discount_matrix')
          .insert(inserts);
        
        if (insertError) throw insertError;
      }
      
      alert('Discounts saved successfully!');
      // Reload data to get new IDs
      loadData();
    } catch (error) {
      console.error('Error saving discounts:', error);
      alert('Failed to save discounts. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Add a new customer group
  const addNewGroup = async (e) => {
    e.preventDefault();
    
    if (!newGroupForm.code || !newGroupForm.name) {
      alert('Please fill in both code and name');
      return;
    }
    
    setSaving(true);
    try {
      // Insert the new customer group
      const { data, error } = await supabase
        .from('customer_groups')
        .insert({
          code: newGroupForm.code,
          name: newGroupForm.name
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Initialize default discounts (all 0%)
      const defaultDiscounts = {};
      productGroups.forEach(productGroup => {
        defaultDiscounts[productGroup] = {
          id: null,
          discount_percentage: 0
        };
      });
      
      // Update local state
      setCustomerGroups([...customerGroups, data]);
      setDiscountMatrix({
        ...discountMatrix,
        [data.id]: defaultDiscounts
      });
      
      // Reset form and close it
      setNewGroupForm({ code: '', name: '' });
      setShowNewForm(false);
      
      // Select the new group for editing
      setSelectedGroup(data);
      
      alert('New customer type added successfully!');
    } catch (error) {
      console.error('Error adding customer group:', error);
      alert('Failed to add customer type. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Delete a customer group (with confirmation)
  const deleteGroup = async (group) => {
    if (!confirm(`Are you sure you want to delete ${group.name}? This will also delete all associated discounts.`)) {
      return;
    }
    
    setSaving(true);
    try {
      // First delete related discount matrix entries
      const { error: matrixError } = await supabase
        .from('discount_matrix')
        .delete()
        .eq('customer_group_id', group.id);
      
      if (matrixError) throw matrixError;
      
      // Then delete the customer group
      const { error: groupError } = await supabase
        .from('customer_groups')
        .delete()
        .eq('id', group.id);
      
      if (groupError) throw groupError;
      
      // Update local state
      setCustomerGroups(customerGroups.filter(g => g.id !== group.id));
      
      // If the deleted group was selected, clear selection
      if (selectedGroup && selectedGroup.id === group.id) {
        setSelectedGroup(null);
      }
      
      alert('Customer type deleted successfully!');
    } catch (error) {
      console.error('Error deleting customer group:', error);
      alert('Failed to delete customer type. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Customer Types & Discount Matrix Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Customer Types List */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Customer Types</h2>
              <button
                onClick={() => setShowNewForm(true)}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                Add New
              </button>
            </div>
            
            {/* Customer Types List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {customerGroups.map(group => (
                <div 
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${
                    selectedGroup?.id === group.id 
                      ? 'bg-primary-100 border border-primary-300' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div>
                    <p className="font-medium">{group.name}</p>
                    <p className="text-sm text-gray-500">{group.code}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGroup(group);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            {/* New Customer Type Form */}
            {showNewForm && (
              <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="font-medium mb-3">Add New Customer Type</h3>
                <form onSubmit={addNewGroup} className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Code</label>
                    <input
                      type="text"
                      value={newGroupForm.code}
                      onChange={(e) => setNewGroupForm({...newGroupForm, code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="P43-SYS-INT"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={newGroupForm.name}
                      onChange={(e) => setNewGroupForm({...newGroupForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="System Integrator"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewForm(false)}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
        
        {/* Right panel - Discount Matrix Editor */}
        <div className="md:col-span-2">
          {selectedGroup ? (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">
                Edit Discounts for {selectedGroup.name}
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Group
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productGroups.map(productGroup => (
                      <tr key={productGroup} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{productGroup}</div>
                          <div className="text-xs text-gray-500">
                            {productGroup.includes('-SOFT') ? 'Software' : 'Hardware'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end items-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={discountMatrix[selectedGroup.id][productGroup]?.discount_percentage || 0}
                              onChange={(e) => updateDiscount(productGroup, e.target.value)}
                              className="w-16 px-2 py-1 text-right border border-gray-300 rounded-md"
                            />
                            <span className="ml-1">%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={saveDiscounts}
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Discounts'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center justify-center h-full">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              <p className="text-gray-500 text-lg">
                Select a customer type from the list to edit discounts
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}