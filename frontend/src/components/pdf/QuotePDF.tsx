import React from 'react'
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer'
import { useQuote } from '../../context/QuoteContext'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: '#1e3a8a',
    padding: 20,
    color: 'white',
    marginBottom: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  content: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e3a8a',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    width: '100%',
    marginBottom: 15,
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
  },
  tableCell: {
    fontSize: 11,
    flex: 1,
  },
  totalSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  finalTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    fontSize: 10,
    color: '#64748b',
  },
})

interface QuotePDFProps {
  quote: any
}

export default function QuotePDF({ quote }: QuotePDFProps) {
  const calculateSubtotal = () => {
    return quote.products.reduce((sum: number, product: any) => sum + (product.price * product.quantity), 0)
  }

  const calculateDiscount = () => {
    const customerDiscount = quote.customer?.discount_group?.discount_percentage || 0
    const additionalDiscount = quote.additionalDiscount || 0
    const totalDiscount = customerDiscount + additionalDiscount
    return calculateSubtotal() * (totalDiscount / 100)
  }

  const subtotal = calculateSubtotal()
  const discount = calculateDiscount()
  const total = subtotal - discount

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Digital Access Solutions</Text>
          <Text style={styles.subtitle}>Experience a safer and more open world</Text>
          <Text style={styles.text}>Quote #: QT-{new Date().toISOString().split('T')[0]}-001</Text>
          <Text style={styles.text}>Date: {new Date().toLocaleDateString()}</Text>
        </View>

        {/* Customer Information */}
        {quote.customer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.content}>
              <Text style={styles.text}>Company: {quote.customer.account}</Text>
              <Text style={styles.text}>Contact: {quote.customer.contact}</Text>
              <Text style={styles.text}>Email: {quote.customer.email}</Text>
              <Text style={styles.text}>Customer Type: {quote.customer.account_type}</Text>
            </View>
          </View>
        )}

        {/* DAS Solution */}
        {quote.dasSolution && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Solution</Text>
            <View style={styles.content}>
              <Text style={styles.text}>Solution: {quote.dasSolution.name}</Text>
              <Text style={styles.text}>Description: {quote.dasSolution.description}</Text>
            </View>
          </View>
        )}

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Product</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>Qty</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>Price</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>Total</Text>
            </View>
            
            {/* Table Rows */}
            {quote.products.map((product: any, index: number) => (
              <View key={product.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{product.name}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{product.quantity}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>${product.price.toFixed(2)}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                  ${(product.price * product.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing Summary */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>-${discount.toFixed(2)}</Text>
            </View>
          )}
          
          <View style={[styles.totalRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#cbd5e1' }]}>
            <Text style={[styles.totalLabel, { fontSize: 14, fontWeight: 'bold' }]}>Total:</Text>
            <Text style={styles.finalTotal}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Quote valid for 30 days from the date of issue.</Text>
          <Text>All prices exclude VAT where applicable.</Text>
          <Text>Thank you for choosing Digital Access Solutions.</Text>
        </View>
      </Page>
    </Document>
  )
}