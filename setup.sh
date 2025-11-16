#!/bin/bash

# ElctrDc Setup Script
# This script sets up the complete ElctrDc environment

set -e  # Exit on error

echo "======================================"
echo "  ElctrDc Setup Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if Node.js is installed
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version 20+ is required (you have $(node -v))"
    exit 1
fi
print_success "Node.js $(node -v) found"

# Check if pnpm is installed
print_info "Checking pnpm installation..."
if ! command -v pnpm &> /dev/null; then
    print_info "pnpm not found. Installing pnpm..."
    npm install -g pnpm
    print_success "pnpm installed"
else
    print_success "pnpm $(pnpm -v) found"
fi

# Check if PostgreSQL is available
print_info "Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL not found on PATH"
    echo ""
    echo "PostgreSQL options:"
    echo "1. Install locally: https://www.postgresql.org/download/"
    echo "2. Use Docker: docker run --name elctrdc-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16"
    echo "3. Use cloud service: Neon, Supabase, AWS RDS"
    echo ""
    read -p "Do you want to continue without local PostgreSQL? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "PostgreSQL found"
fi

# Check if Ollama is installed
print_info "Checking Ollama installation..."
if ! command -v ollama &> /dev/null; then
    print_error "Ollama not found"
    echo ""
    echo "Ollama is required for AI features."
    echo "Install from: https://ollama.com/download"
    echo ""
    echo "After installing Ollama, run:"
    echo "  ollama pull llama3.1:8b"
    echo "  ollama pull mistral:7b"
    echo ""
    read -p "Do you want to continue without Ollama? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "Ollama found"

    # Check if required models are available
    print_info "Checking Ollama models..."
    if ollama list | grep -q "llama3.1"; then
        print_success "llama3.1 model found"
    else
        print_info "Pulling llama3.1:8b model (this may take a while)..."
        ollama pull llama3.1:8b
        print_success "llama3.1:8b model installed"
    fi
fi

# Install dependencies
echo ""
print_info "Installing Node.js dependencies..."
pnpm install
print_success "Dependencies installed"

# Setup environment variables
echo ""
if [ ! -f .env ]; then
    print_info "Creating .env file from template..."
    cp .env.example .env

    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "CHANGE-THIS-SECRET-$(date +%s)")

    # Update .env with generated secret
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" .env
    else
        # Linux
        sed -i "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" .env
    fi

    print_success ".env file created"
    echo ""
    print_info "Please configure your .env file with:"
    echo "  - DATABASE_URL (PostgreSQL connection string)"
    echo "  - BLOB_READ_WRITE_TOKEN (for file storage, if using Vercel Blob)"
    echo ""
    echo "Example DATABASE_URL:"
    echo "  postgresql://user:password@localhost:5432/elctrdc"
    echo ""
else
    print_success ".env file already exists"
fi

# Setup database
echo ""
read -p "Do you want to setup the database now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Setting up database..."

    # Check if DATABASE_URL is set
    if grep -q "postgresql://" .env; then
        pnpm prisma generate
        print_success "Prisma client generated"

        pnpm prisma db push
        print_success "Database schema created"
    else
        print_error "DATABASE_URL not configured in .env"
        echo "Please set your DATABASE_URL in .env and run: pnpm prisma db push"
    fi
fi

# Create uploads directory
echo ""
print_info "Creating uploads directory..."
mkdir -p public/uploads
print_success "Uploads directory created"

# Final instructions
echo ""
echo "======================================"
print_success "Setup complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your .env file (if not done already):"
echo "   - Set DATABASE_URL to your PostgreSQL connection"
echo "   - (Optional) Set BLOB_READ_WRITE_TOKEN for cloud storage"
echo ""
echo "2. Setup the database (if not done already):"
echo "   pnpm prisma db push"
echo ""
echo "3. Start the development server:"
echo "   ./run.sh"
echo "   or: pnpm dev"
echo ""
echo "4. Make sure Ollama is running:"
echo "   ollama serve"
echo ""
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "======================================"
echo ""
