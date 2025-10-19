import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DataImport from './pages/DataImport';
import { AuthProvider } from './context/AuthContext'
import { QuoteProvider } from './context/QuoteContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import QuoteWorkflow from './pages/QuoteWorkflow'
import Customers from './pages/Customers'
import Products from './pages/Products'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import CustomerTypesAdmin from './pages/admin/CustomerTypesAdmin'
import './index.css';

function App() {
  return (
    <AuthProvider>
      <QuoteProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/quote/*" element={
            <ProtectedRoute>
              <Layout>
                <QuoteWorkflow />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute>
              <Layout>
                <Customers />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/import" element={<DataImport />} />
          <Route path="/admin/customer-types" element={
            <ProtectedRoute>
              <Layout>
                <CustomerTypesAdmin />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </QuoteProvider>
    </AuthProvider>
  )
}

export default App