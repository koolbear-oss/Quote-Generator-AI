import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', current: location.pathname === '/' },
    { name: 'New Quote', href: '/quote', current: location.pathname.startsWith('/quote') },
    { name: 'Customers', href: '/customers', current: location.pathname === '/customers' },
    { name: 'Products', href: '/products', current: location.pathname === '/products' },
  ]

  // Close settings menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showSettingsMenu && !event.target.closest('.settings-dropdown')) {
        setShowSettingsMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettingsMenu])

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
                
                {/* Settings Dropdown */}
                <div className="settings-dropdown relative">
                  <button 
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)} 
                    className={`px-3 py-2 text-sm font-medium flex items-center transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'text-primary-800 bg-primary-50 rounded-lg'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Settings
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showSettingsMenu && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-1">
                      <Link 
                        to="/admin/customer-types" 
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        onClick={() => setShowSettingsMenu(false)}
                      >
                        Customer Types
                      </Link>
                      {/* Add more admin links here in the future */}
                    </div>
                  )}
                </div>
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
            <p>&copy; 2025 Digital Access Solutions. Professional quote generation system.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}