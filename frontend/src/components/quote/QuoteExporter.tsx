// src/components/quote/QuoteExporter.tsx
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useQuote } from '../../context/QuoteContext';
import { supabase } from '../../services/supabase';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { QuotePDF } from './QuotePDF';

export const QuoteExporter = forwardRef(function QuoteExporter(props, ref) {
  const { state, dispatch } = useQuote();
  const [quoteName, setQuoteName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  
  // Calculate total amounts with fallbacks for missing properties
  const grossTotal = state.products.reduce(
    (sum, product) => {
      const unitPrice = product.gross_price || product.price || 0;
      const quantity = product.quantity || 1;
      return sum + (unitPrice * quantity);
    }, 
    0
  );
  
  // Function to calculate discount for a product
  const calculateDiscountForProduct = (product) => {
    return product.discount_percentage || 0;
  };
  
  // Expose the completeQuote function to parent components
  useImperativeHandle(ref, () => ({
    completeQuote
  }));
  
  // Debug function to check authentication status
  const checkAuthStatus = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      console.log("Auth status:", data.session ? "Authenticated" : "Not authenticated");
      if (data.session) {
        console.log("User ID:", data.session.user.id);
        console.log("Session expires at:", new Date(data.session.expires_at * 1000));
      }
      return data.session;
    } catch (error) {
      console.error("Error checking auth status:", error);
      return null;
    }
  };
  
  // Complete quote function
  const completeQuote = async () => {
    try {
      setIsSubmitting(true);
      
      // Get the current user session and check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error("Auth error:", authError);
        alert("Authentication error. Please sign in again.");
        setIsSubmitting(false);
        return;
      }
      
      if (!session) {
        console.error("No active session");
        alert("Please sign in to complete a quote");
        setIsSubmitting(false);
        return;
      }
      
      console.log("Authenticated user ID:", session.user.id);
      
      // Validate required fields
      if (!state.dasSolution) {
        alert("Please select a DAS solution");
        setIsSubmitting(false);
        return;
      }
      
      if (!state.customer) {
        alert("Please select a customer");
        setIsSubmitting(false);
        return;
      }
      
      if (state.products.length === 0) {
        alert("Please add at least one product");
        setIsSubmitting(false);
        return;
      }
      
      // Generate quote number
      const year = new Date().getFullYear();
      
      // Try to get the latest quote (if any)
      const { data: latestQuotes, error: quoteError } = await supabase
        .from('quotes')
        .select('quote_number')
        .ilike('quote_number', `Q-${year}-%`)
        .order('quote_number', { ascending: false })
        .limit(1);
      
      if (quoteError) {
        console.error("Error fetching latest quote:", quoteError);
      }
      
      // Generate the next sequence number
      let sequenceNumber = 1;
      if (latestQuotes && latestQuotes.length > 0) {
        const parts = latestQuotes[0].quote_number.split('-');
        if (parts.length === 3) {
          sequenceNumber = parseInt(parts[2]) + 1;
        }
      }
      
      const quoteNumber = `Q-${year}-${sequenceNumber.toString().padStart(4, '0')}`;
      
      // Create the quote with explicit created_by field
      const quoteData = {
        quote_number: quoteNumber,
        name: quoteName || 'Untitled Quote',
        customer_id: state.customer?.id,
        das_solution_id: state.dasSolution?.id,
        project_discount: state.projectDiscount || 0,
        notes: state.notes || '',
        status: 'completed',
        created_by: session.user.id  // CRITICAL: This must match auth.uid()
      };
      
      console.log("About to insert quote with auth ID:", session.user.id);
      console.log("Inserting quote with data:", quoteData);
      
      // Insert the quote
      const { data: newQuote, error: insertError } = await supabase
        .from('quotes')
        .insert(quoteData)
        .select()
        .single();
      
      if (insertError) {
        console.error("Error inserting quote:", insertError);
        alert(`Failed to create quote: ${insertError.message}`);
        setIsSubmitting(false);
        return;
      }
      
      console.log("Quote created successfully:", newQuote);
      
      // Continue with saving quote items...
      if (state.products.length > 0) {
      const quoteItems = state.products.map(product => {
        // Calculate unit price with fallback
        const unitPrice = product.gross_price || product.price || 0;
        const quantity = product.quantity || 1;
        const discountPercentage = product.discount_percentage || 0;
        
        // Calculate the discounted price
        const discountedPrice = unitPrice * (1 - (discountPercentage / 100));
        
        // Calculate the total price
        const totalPrice = discountedPrice * quantity;
        
        return {
          quote_id: newQuote.id,
          product_id: product.id,
          quantity: quantity,
          unit_price: unitPrice,
          discount_percentage: discountPercentage,
          total_price: totalPrice // Add this field
        };
      });
      
      console.log("Adding quote items with total_price:", quoteItems);
      
      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems);
      
      if (itemsError) {
        console.error("Error adding quote items:", itemsError);
      }
    }
      
      alert(`Quote ${quoteNumber} completed successfully!`);
      
      // Clear the quote
      dispatch({ type: 'CLEAR_QUOTE' });
      setQuoteName('');
      
    } catch (error) {
      console.error("Error completing quote:", error);
      alert("Failed to complete the quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to show PDF preview
  const handleShowPdfPreview = () => {
    setPdfReady(true);
    setShowPdfPreview(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Quote Summary</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Quote Name</label>
          <input
            type="text"
            value={quoteName}
            onChange={(e) => setQuoteName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter quote name"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">DAS Solution</p>
            <p className="font-semibold">{state.dasSolution?.name || "Not selected"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-semibold">{state.customer?.account || "Not selected"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Number of Products</p>
            <p className="font-semibold">{state.products.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Project Discount</p>
            <p className="font-semibold">{state.projectDiscount || 0}%</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center font-bold">
            <span>Total Amount</span>
            <span className="text-xl">
              ${grossTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Complete Quote button */}
        <button
          onClick={completeQuote}
          disabled={isSubmitting}
          className="btn btn-primary flex-grow"
        >
          {isSubmitting ? "Processing..." : "Complete Quote"}
        </button>
        
        {/* Preview PDF button */}
        <button
          onClick={handleShowPdfPreview}
          className="btn btn-secondary flex-grow"
        >
          Preview PDF
        </button>
        
        {/* Export PDF link - only show when data is ready */}
        {pdfReady && (
          <PDFDownloadLink 
            document={<QuotePDF quoteName={quoteName} quoteState={state} />}
            fileName={`${quoteName || 'Quote'}.pdf`}
            className="btn btn-outline flex-grow"
          >
            {({ loading }) => (loading ? 'Preparing PDF...' : 'Download PDF')}
          </PDFDownloadLink>
        )}
      </div>
      
      {/* PDF Preview */}
      {showPdfPreview && pdfReady && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl h-5/6 flex flex-col">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">PDF Preview</h3>
              <button 
                onClick={() => setShowPdfPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PDFViewer width="100%" height="100%" className="border border-gray-300 rounded">
                <QuotePDF quoteName={quoteName} quoteState={state} />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Add this line at the end to support both default and named exports
export default QuoteExporter;