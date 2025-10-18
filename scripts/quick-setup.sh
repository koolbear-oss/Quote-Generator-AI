#!/bin/bash

# DAS Quote Configurator - Quick Setup Script
# This script helps you get started with the DAS Quote Configurator project

echo "🚀 DAS Quote Configurator - Quick Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to 18+."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed"
echo ""

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "⚙️  Setting up environment variables..."
    cp .env.example .env.local
    echo "✅ Environment file created"
    echo ""
    echo "📝 IMPORTANT: Please update .env.local with your Supabase credentials:"
    echo "   - VITE_SUPABASE_URL: Your Supabase project URL"
    echo "   - VITE_SUPABASE_ANON_KEY: Your Supabase anon key"
    echo ""
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"
echo ""

# Return to root directory
cd ..

echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Update frontend/.env.local with your Supabase credentials"
echo "2. Set up your Supabase project and run migrations"
echo "3. Start the development server: cd frontend && npm run dev"
echo ""
echo "For detailed setup instructions, see README.md"
echo ""
echo "Demo credentials:"
echo "- Email: demo@example.com"
echo "- Password: password"