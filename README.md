# DAS Quote Configurator - Cloud Migration

A modern, cloud-based quote generation system for Digital Access Solutions (DAS) built with React, TypeScript, Supabase, and Netlify.

## 🚀 Features

- **6-Step Quote Workflow**: Complete quote generation from DAS solution selection to export
- **Real-time Pricing**: Dynamic discount calculations based on customer tiers and project size
- **Professional PDF Generation**: Branded quote documents with React-PDF
- **Customer Management**: Comprehensive customer database with discount groups
- **Product Catalog**: Full product management with filtering and search
- **Multi-format Export**: PDF, CSV, and email export capabilities
- **Responsive Design**: Optimized for desktop and tablet use
- **Authentication**: Secure user authentication with Supabase Auth
- **Real-time Updates**: Live data synchronization with Supabase

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **React-PDF** for PDF generation
- **Headless UI** for accessible components

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** database
- **Row Level Security** for data protection
- **Edge Functions** for serverless operations

### Deployment
- **Netlify** for frontend hosting
- **Supabase** for backend services
- **CI/CD** with GitHub integration

## 📁 Project Structure

```
das-quote-tool/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── context/          # React context providers
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
│   ├── public/               # Static assets
│   └── package.json          # Frontend dependencies
├── supabase/                 # Supabase configuration
│   ├── migrations/           # Database migrations
│   ├── seed/                 # Sample data
│   └── functions/            # Edge functions
├── scripts/                  # Utility scripts
├── shared/                   # Shared types and constants
└── README.md                 # Documentation
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Netlify account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/das-quote-tool.git
   cd das-quote-tool
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update the environment variables with your Supabase credentials:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

### Database Setup

1. **Create Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy the project URL and anon key

2. **Run migrations**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Initialize Supabase
   supabase init

   # Link to your project
   supabase link --project-ref your-project-id

   # Run migrations
   supabase db push
   ```

3. **Seed sample data**
   ```bash
   supabase db reset --seed
   ```

## 📊 Database Schema

### Core Tables
- `das_solutions`: DAS solution types (SMARTair, Aperio, etc.)
- `products`: Product catalog with pricing
- `customers`: Customer database with discount groups
- `customer_groups`: Customer tier definitions
- `quotes`: Quote headers
- `quote_items`: Quote line items
- `discount_matrix`: Discount rules by customer/product groups

### Key Relationships
- Customers belong to discount groups
- Products have discount groups
- Quotes have customers and DAS solutions
- Quote items link quotes to products

## 🔐 Authentication

The system uses Supabase Auth with the following features:
- Email/password authentication
- Session management
- Protected routes
- User roles and permissions

Default demo credentials:
- Email: `demo@example.com`
- Password: `password`

## 🎯 Quote Workflow

### Step 1: Choose DAS Solution
Select from available DAS solutions (SMARTair, Aperio, Access, eCLIQ)

### Step 2: Select Products
Browse and select compatible products with filtering and search

### Step 3: Configure Quantities
Set quantities for selected products with real-time pricing

### Step 4: Choose Customer
Select customer to apply appropriate discounts

### Step 5: Apply Discounts
Review and apply customer and volume discounts

### Step 6: Export Quote
Generate PDF, CSV, or email the completed quote

## 📈 Business Rules

### Discount Calculations
- Customer tier discounts (Bronze: 10%, Silver: 15%, Gold: 25%, Platinum: 35%)
- Volume discounts based on project value
- Special pricing overrides available

### Product Compatibility
- Products filtered by selected DAS solution
- Real-time availability checking
- Compatibility warnings for mismatched products

### Quote Management
- 30-day quote validity
- Unique quote numbering
- Status tracking (Draft, Pending, Approved, Rejected)

## 🚀 Deployment

### Netlify Deployment
1. **Connect to GitHub**
   - Push your code to GitHub
   - Connect repository to Netlify

2. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Set environment variables**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Deploy**
   - Automatic deployments on push to main branch
   - Preview deployments for pull requests

### Supabase Production
1. **Create production project**
2. **Run migrations on production**
3. **Configure production environment variables**
4. **Set up backup and monitoring**

## 🔧 Configuration

### Environment Variables
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application
VITE_APP_NAME=DAS Quote Configurator
VITE_APP_VERSION=1.0.0
VITE_COMPANY_NAME=Digital Access Solutions
```

### Netlify Configuration
The `netlify.toml` file contains:
- Build settings
- Redirect rules
- Headers for caching
- Environment variable mappings

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Coverage Report
```bash
npm run test:coverage
```

## 📚 API Documentation

### Supabase Client API
The application uses the Supabase JavaScript client for:
- Authentication
- Database operations
- Real-time subscriptions
- File storage

### Custom Hooks
- `useAuth()`: Authentication state and methods
- `useQuote()`: Quote workflow state management
- `useProducts()`: Product data fetching
- `useCustomers()`: Customer data fetching

## 🔒 Security

### Authentication
- JWT-based authentication
- Secure session management
- Password policies

### Authorization
- Row Level Security (RLS) policies
- Role-based access control
- Field-level permissions

### Data Protection
- Encrypted data at rest
- HTTPS-only communication
- Input validation and sanitization

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please contact:
- Email: support@digitalsolutions.com
- Documentation: [docs.digitalsolutions.com](https://docs.digitalsolutions.com)
- Issues: [GitHub Issues](https://github.com/your-org/das-quote-tool/issues)

## 🗺️ Roadmap

### Phase 1 (Completed)
- [x] Basic quote workflow
- [x] PDF generation
- [x] Customer management
- [x] Product catalog

### Phase 2 (In Progress)
- [ ] Advanced reporting
- [ ] Integration APIs
- [ ] Mobile optimization
- [ ] Advanced pricing rules

### Phase 3 (Planned)
- [ ] CRM integration
- [ ] Inventory management
- [ ] Multi-language support
- [ ] Advanced analytics

---

Built with ❤️ by the Digital Access Solutions team