#!/bin/bash

# ElctrDc Run Script
# This script starts the ElctrDc application and all required services

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if .env exists
if [ ! -f .env ]; then
    print_error ".env file not found"
    echo "Please run ./setup.sh first"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_error "Dependencies not installed"
    echo "Please run ./setup.sh first"
    exit 1
fi

echo ""
print_header "======================================"
print_header "  Starting ElctrDc"
print_header "======================================"
echo ""

# Check if Ollama is running
print_info "Checking Ollama service..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    print_success "Ollama is running"
else
    print_error "Ollama is not running"
    echo ""
    echo "Please start Ollama in a separate terminal:"
    echo "  ollama serve"
    echo ""
    read -p "Continue without Ollama? (AI features will not work) (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check database connection
print_info "Checking database connection..."
if pnpm prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_error "Cannot connect to database"
    echo ""
    echo "Please check your DATABASE_URL in .env"
    echo "Make sure PostgreSQL is running"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start the application
echo ""
print_header "Starting Next.js development server..."
echo ""
print_info "The application will be available at:"
echo "  http://localhost:3000"
echo ""
print_info "Press Ctrl+C to stop the server"
echo ""

# Run the Next.js development server
pnpm dev
