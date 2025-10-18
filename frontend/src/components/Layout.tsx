import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { user, signOut } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/', current: location.pathname === '/' },
    { name: 'New Quote', href: '/quote', current: location.pathname.startsWith('/quote') },
    { name: 'Customers', href: '/customers', current: location.pathname === '/customers' },
    { name: 'Products', href: '/products', current: location.pathname === '/products' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DAS</span>
                </div>
                <span className="text-xl font-semibold text-slate-800">Quote Configurator</span>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8 ml-10">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      item.current
                        ? 'text-primary-800 bg-primary-50 rounded-lg'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Welcome, {user?.email || 'User'}
              </span>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-slate-500">
            <p>&copy; 2024 Digital Access Solutions. Professional quote generation system.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}