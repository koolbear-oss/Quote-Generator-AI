// src/components/quote/QuotePDF.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: {
    backgroundColor: '#00aedb',
    padding: 20,
    color: 'white',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 20,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
    padding: 5,
  },
  col10: { width: '10%' },
  col15: { width: '15%' },
  col20: { width: '20%' },
  col25: { width: '25%' },
  col30: { width: '30%' },
  col40: { width: '40%' },
  col50: { width: '50%' },
  total: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#bfbfbf',
    paddingTop: 10,
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: 'grey',
  },
});

export function QuotePDF({ quoteName, quoteState }) {
  // Calculate totals
  const grossTotal = quoteState.products.reduce(
    (sum, product) => sum + (product.gross_price * (product.quantity || 1)), 
    0
  );
  
  // Function to calculate discount for a product (simplified)
  const calculateDiscountForProduct = (product) => {
    return product.discount_percentage || 0;
  };
  
  // Calculate net total with discounts
  const netTotal = quoteState.products.reduce(
    (sum, product) => {
      const discount = calculateDiscountForProduct(product) / 100;
      const price = product.gross_price * (1 - discount);
      return sum + (price * (product.quantity || 1));
    },
    0
  );
  
  // Apply project discount if any
  const finalTotal = netTotal * (1 - (quoteState.projectDiscount || 0) / 100);

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Quote: {quoteName}</Text>
          <Text>Digital Access Solutions</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.subtitle}>
            Experience a safer and more open world
          </Text>
          
          <Text>DAS Solution: {quoteState.dasSolution?.name}</Text>
          <Text>Customer: {quoteState.customer?.account}</Text>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
      
      {/* Products Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Product Details</Text>
        
        <View style={styles.table}>
          {/* Table Headers */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, styles.col10]}><Text>Quantity</Text></View>
            <View style={[styles.tableCell, styles.col15]}><Text>Product ID</Text></View>
            <View style={[styles.tableCell, styles.col40]}><Text>Description</Text></View>
            <View style={[styles.tableCell, styles.col15]}><Text>Unit Price</Text></View>
            <View style={[styles.tableCell, styles.col10]}><Text>Discount</Text></View>
            <View style={[styles.tableCell, styles.col10]}><Text>Total</Text></View>
          </View>
          
          {/* Table Rows */}
          {quoteState.products.map((product, index) => {
            const discount = calculateDiscountForProduct(product);
            const price = product.gross_price * (1 - discount / 100);
            const total = price * (product.quantity || 1);
            
            return (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.col10]}>
                  <Text>{product.quantity || 1}</Text>
                </View>
                <View style={[styles.tableCell, styles.col15]}>
                  <Text>{product.product_id}</Text>
                </View>
                <View style={[styles.tableCell, styles.col40]}>
                  <Text>{product.short_description}</Text>
                </View>
                <View style={[styles.tableCell, styles.col15]}>
                  <Text>${product.gross_price.toFixed(2)}</Text>
                </View>
                <View style={[styles.tableCell, styles.col10]}>
                  <Text>{discount}%</Text>
                </View>
                <View style={[styles.tableCell, styles.col10]}>
                  <Text>${total.toFixed(2)}</Text>
                </View>
              </View>
            );
          })}
        </View>
        
        {/* Totals */}
        <View style={styles.total}>
          <Text>Gross Total: ${grossTotal.toFixed(2)}</Text>
          <Text>Net Total: ${netTotal.toFixed(2)}</Text>
          {quoteState.projectDiscount > 0 && (
            <Text>Project Discount: {quoteState.projectDiscount}%</Text>
          )}
          <Text style={{ fontSize: 14, marginTop: 5 }}>
            Final Total: ${finalTotal.toFixed(2)}
          </Text>
        </View>
        
        {/* Notes */}
        {quoteState.notes && (
          <View style={styles.section}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Notes:</Text>
            <Text>{quoteState.notes}</Text>
          </View>
        )}
        
        <View style={styles.footer}>
          <Text>Digital Access Solutions Quote {new Date().toISOString().split('T')[0]}</Text>
          <Text>Page 2</Text>
        </View>
      </Page>
    </Document>
  );
}