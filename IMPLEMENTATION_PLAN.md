# DAS Quote Configurator - Cloud Migration Implementation Plan

## Executive Summary
This plan outlines the transformation of the local DAS Quote Configurator into a modern, cloud-based solution using Netlify and Supabase, designed for future integration into larger systems.

## Phase 1: Architecture Planning & Setup (Week 1)

### 1.1 Project Structure
```
das-quote-tool/
├── frontend/                 # Netlify-deployed frontend
│   ├── src/                  # Source code
│   │   ├── components/       # UI components 
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API services
│   │   ├── context/          # State management
│   │   ├── utils/            # Utility functions
│   │   └── pages/            # Page components
│   ├── public/               # Static assets
│   └── netlify.toml          # Netlify configuration
├── supabase/                 # Supabase configuration
│   ├── migrations/           # Database migrations
│   ├── functions/            # Edge functions
│   ├── seed/                 # Seed data scripts
│   └── types/                # Generated TypeScript types
├── scripts/                  # Migration/utility scripts
└── shared/                   # Shared types & constants
```

### 1.2 Technology Stack
- **Frontend**: React + TypeScript (modular, maintainable, future-proof)
- **UI Components**: Tailwind CSS + Headless UI (lightweight, customizable)
- **State Management**: React Context + useReducer or Zustand (simple, effective)
- **API Layer**: Supabase JS client + custom hooks
- **PDF Generation**: React-PDF (more maintainable than direct jsPDF)
- **Build Tools**: Vite (faster than Create React App)

### 1.3 Supabase Project Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase project
supabase init
supabase start

# Link to remote project
supabase link --project-ref <project-id>
```

## Phase 2: Database Schema Design (Week 1-2)

### 2.1 Core Tables
```sql
-- DAS Solutions
CREATE TABLE das_solutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(20),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Categories (Subgroups)
CREATE TABLE product_categories (
  id SERIAL PRIMARY KEY,
  das_solution_id INTEGER REFERENCES das_solutions(id),
  subgroup_code VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL UNIQUE,
  brand VARCHAR(100) NOT NULL,
  sub_brand VARCHAR(100),
  category_id INTEGER REFERENCES product_categories(id),
  short_description VARCHAR(255) NOT NULL,
  long_description TEXT,
  gross_price DECIMAL(10, 2) NOT NULL,
  discount_group VARCHAR(50) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Groups
CREATE TABLE customer_groups (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL UNIQUE,
  account VARCHAR(255) NOT NULL,
  contact VARCHAR(255),
  discount_group_id INTEGER REFERENCES customer_groups(id),
  account_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount Matrix
CREATE TABLE discount_matrix (
  id SERIAL PRIMARY KEY,
  product_discount_group VARCHAR(50) NOT NULL,
  customer_group_id INTEGER REFERENCES customer_groups(id),
  discount_percentage DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_discount_group, customer_group_id)
);

-- Quotes
CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  quote_number VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  das_solution_id INTEGER REFERENCES das_solutions(id),
  project_discount DECIMAL(5, 2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quote Items
CREATE TABLE quote_items (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER REFERENCES quotes(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE das_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Create policies (example for quotes)
CREATE POLICY "Users can view their own quotes"
  ON quotes FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own quotes"
  ON quotes FOR INSERT
  WITH CHECK (created_by = auth.uid());
  
-- Similar policies for other tables
```

## Phase 3: Data Migration (Week 2)

### 3.1 CSV to Supabase Migration Script
```javascript
// scripts/migrate-csv-to-supabase.js
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import csv from 'csv-parser'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Import DAS solutions
async function importDasSolutions() {
  const results = []
  fs.createReadStream('./csv_data/das_solutions.csv')
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      const { data, error } = await supabase
        .from('das_solutions')
        .insert(results.map(row => ({
          id: parseInt(row.id),
          name: row.name,
          description: row.description,
          icon: getIconForSolution(row.name)
        })))
      
      console.log('DAS Solutions import:', error ? 'Error' : 'Success')
      if (error) console.error(error)
    })
}

// Similar functions for other CSV imports
// ...

// Run migrations
async function runMigration() {
  await importDasSolutions()
  // Other imports
}

runMigration()
```

## Phase 4: Frontend Implementation (Week 3-4)

### 4.1 Project Setup
```bash
# Create new React project with Vite
npm create vite@latest frontend -- --template react-ts

# Install dependencies
cd frontend
npm install @supabase/supabase-js react-router-dom @headlessui/react @heroicons/react 
npm install tailwindcss postcss autoprefixer @react-pdf/renderer
npm install -D typescript @types/react

# Initialize Tailwind CSS
npx tailwindcss init -p
```

### 4.2 Core Components
- DAS Solution Selector
- Product Selector with filtering
- Quantity Editor
- Customer Selector
- Discount Applier
- Quote Exporter

### 4.3 State Management
```typescript
// src/context/QuoteContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react'

type QuoteState = {
  dasSolution: any | null
  products: any[]
  customer: any | null
  projectDiscount: number
  notes: string
}

type QuoteAction = 
  | { type: 'SET_DAS_SOLUTION', payload: any }
  | { type: 'ADD_PRODUCT', payload: any }
  | { type: 'UPDATE_PRODUCT', payload: { id: number, quantity: number } }
  | { type: 'REMOVE_PRODUCT', payload: number }
  | { type: 'SET_CUSTOMER', payload: any }
  | { type: 'SET_PROJECT_DISCOUNT', payload: number }
  | { type: 'SET_NOTES', payload: string }
  | { type: 'CLEAR_QUOTE' }

const initialState: QuoteState = {
  dasSolution: null,
  products: [],
  customer: null,
  projectDiscount: 0,
  notes: ''
}

function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  switch (action.type) {
    case 'SET_DAS_SOLUTION':
      return { ...state, dasSolution: action.payload }
    case 'ADD_PRODUCT':
      return { 
        ...state, 
        products: [...state.products, { ...action.payload, quantity: 1 }] 
      }
    // Other case handlers...
    case 'CLEAR_QUOTE':
      return initialState
    default:
      return state
  }
}

const QuoteContext = createContext<{
  state: QuoteState
  dispatch: React.Dispatch<QuoteAction>
}>({
  state: initialState,
  dispatch: () => null
})

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quoteReducer, initialState)
  
  return (
    <QuoteContext.Provider value={{ state, dispatch }}>
      {children}
    </QuoteContext.Provider>
  )
}

export function useQuote() {
  return useContext(QuoteContext)
}
```

## Phase 5: Integration & Module Design (Week 5-6)

### 5.1 Module API Design
```typescript
// src/api/QuoteModuleAPI.ts
import { QuoteProvider } from '../context/QuoteContext'

export type QuoteModuleConfig = {
  supabaseUrl?: string
  supabaseKey?: string
  initialData?: any
  onSave?: (quote: any) => void
  onExport?: (format: 'pdf' | 'csv', data: any) => void
}

export function initializeQuoteModule(config: QuoteModuleConfig) {
  // Setup any module-specific configuration
  if (config.supabaseUrl && config.supabaseKey) {
    // Configure custom Supabase connection
  }
  
  return {
    Provider: ({ children }: { children: React.ReactNode }) => (
      <QuoteProvider>
        {children}
      </QuoteProvider>
    ),
    Workflow: () => <QuoteWorkflow />,
    // Other exported components/functions
  }
}
```

### 5.2 Event System for External Communication
```typescript
// src/utils/eventBus.ts
type EventHandler = (...args: any[]) => void

const eventHandlers: Record<string, EventHandler[]> = {}

export const eventBus = {
  on(event: string, handler: EventHandler) {
    if (!eventHandlers[event]) {
      eventHandlers[event] = []
    }
    eventHandlers[event].push(handler)
    return () => this.off(event, handler)
  },
  
  off(event: string, handler: EventHandler) {
    if (!eventHandlers[event]) return
    eventHandlers[event] = eventHandlers[event].filter(h => h !== handler)
  },
  
  emit(event: string, ...args: any[]) {
    if (!eventHandlers[event]) return
    eventHandlers[event].forEach(handler => handler(...args))
  }
}
```

## Phase 6: Deployment (Week 7)

### 6.1 Netlify Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  environment = { NODE_VERSION = "18" }

[build.environment]
  VITE_SUPABASE_URL = "https://your-project.supabase.co"
  VITE_SUPABASE_ANON_KEY = "your-public-anon-key"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 6.2 CI/CD Pipeline
Configure Netlify to:
- Connect to your GitHub repository
- Build on each commit to the main branch
- Set up preview deployments for pull requests
- Configure environment variables securely

## Phase 7: Testing & QA (Week 8)

### 7.1 Unit Tests
```typescript
// src/components/__tests__/DasSolutionSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { DasSolutionSelector } from '../DasSolutionSelector'
import * as supabaseService from '../../services/supabase'

// Mock the Supabase service
jest.mock('../../services/supabase')

describe('DasSolutionSelector', () => {
  beforeEach(() => {
    // Mock data
    const mockSolutions = [
      { id: 1, name: 'SMARTair', description: 'Wireless access', icon: '📡' },
      { id: 2, name: 'Aperio', description: 'Battery-powered', icon: '🔋' }
    ]
    
    // Setup the mock
    jest.spyOn(supabaseService, 'fetchDasSolutions').mockResolvedValue({ 
      data: mockSolutions, 
      error: null 
    })
  })
  
  it('renders solutions correctly', async () => {
    const handleSelect = jest.fn()
    render(<DasSolutionSelector onSelect={handleSelect} />)
    
    // Wait for solutions to load
    const smartairElement = await screen.findByText('SMARTair')
    expect(smartairElement).toBeInTheDocument()
    
    // Check all solutions are rendered
    expect(screen.getByText('Aperio')).toBeInTheDocument()
  })
  
  it('calls onSelect when a solution is clicked', async () => {
    const handleSelect = jest.fn()
    render(<DasSolutionSelector onSelect={handleSelect} />)
    
    // Wait for solutions to load
    const smartairElement = await screen.findByText('SMARTair')
    
    // Click on a solution
    fireEvent.click(smartairElement)
    
    // Check if handler was called
    expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      name: 'SMARTair'
    }))
  })
})
```

## Phase 8: Future-Proofing & Integration (Week 8)

### 8.1 Embedding API
To allow embedding in a larger application in the future:
```typescript
// src/embed.ts
import React from 'react'
import ReactDOM from 'react-dom/client'
import { initializeQuoteModule } from './api/QuoteModuleAPI'

class DASQuoteConfigurator extends HTMLElement {
  connectedCallback() {
    const mountPoint = document.createElement('div')
    this.attachShadow({ mode: 'open' }).appendChild(mountPoint)
    
    const config = {
      supabaseUrl: this.getAttribute('supabase-url') || undefined,
      supabaseKey: this.getAttribute('supabase-key') || undefined,
      onSave: (data: any) => {
        this.dispatchEvent(new CustomEvent('quoteSaved', { detail: data }))
      },
      onExport: (format: string, data: any) => {
        this.dispatchEvent(new CustomEvent('quoteExported', { 
          detail: { format, data } 
        }))
      }
    }
    
    const QuoteModule = initializeQuoteModule(config)
    
    const root = ReactDOM.createRoot(mountPoint)
    root.render(
      <React.StrictMode>
        <QuoteModule.Provider>
          <QuoteModule.Workflow />
        </QuoteModule.Provider>
      </React.StrictMode>
    )
  }
}

// Register custom element
customElements.define('das-quote-configurator', DASQuoteConfigurator)
```

### 8.2 JavaScript SDK
For programmatic integration:
```typescript
// src/sdk.ts
export class DASQuoteConfiguratorSDK {
  constructor(private config: {
    supabaseUrl: string;
    supabaseKey: string;
  }) {}
  
  async createQuote(quoteData: any) {
    // Implementation
  }
  
  async getQuote(id: string) {
    // Implementation
  }
  
  async generatePDF(quoteId: string) {
    // Implementation
  }
  
  // Other methods
}
```

## Implementation Timeline

| Week | Phase | Key Deliverables |
|------|-------|------------------|
| 1 | Architecture Planning & Setup | Supabase project, Netlify setup, database schema |
| 2 | Database & Backend | Migrations, seed data, authentication, edge functions |
| 3-4 | Core Frontend Implementation | React project, state management, UI components |
| 5-6 | Workflow & Business Logic | 6-step workflow, discount calculations, product filtering |
| 7 | Export & PDF Generation | PDF generator, CSV export, quote saving/loading |
| 8 | Testing & Refinement | Unit tests, integration tests, performance optimization |
| 9 | Deployment & Documentation | Production deployment, user guides, admin docs |
| 10 | Future Integration Features | Embedding API, SDK, modular architecture |

## Key Success Factors

1. **Data Integrity**: Ensure all CSV data is accurately migrated
2. **User Experience**: Maintain the intuitive 6-step workflow
3. **Performance**: Optimize for speed and responsiveness
4. **Security**: Implement proper authentication and authorization
5. **Scalability**: Design for future growth and integration
6. **Maintainability**: Use modern development practices and tools

## Risk Mitigation

- **Data Migration**: Test migration scripts thoroughly before production
- **Performance**: Implement caching and optimization strategies
- **Security**: Regular security audits and updates
- **User Adoption**: Provide comprehensive training and documentation
- **Integration**: Design flexible APIs for future system integration

This implementation plan provides a clear roadmap for transforming your local DAS Quote Configurator into a modern, cloud-based solution that can serve as both a standalone application and a modular component in larger systems.