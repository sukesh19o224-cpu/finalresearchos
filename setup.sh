#!/bin/bash

echo "🚀 ResearchOS Complete Setup Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

if [ ! -f "package.json" ]; then
    print_error "Please run this script from the ResearchOS project directory"
    exit 1
fi

echo "Step 1: Cleaning old installation..."
killall node 2>/dev/null || true
rm -rf .next
rm -rf node_modules/.cache
rm -rf node_modules/.prisma
print_status "Cleaned old build files"

echo ""
echo "Step 2: Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL not found. Installing..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

if ! sudo systemctl is-active --quiet postgresql; then
    print_warning "Starting PostgreSQL..."
    sudo systemctl start postgresql
fi
print_status "PostgreSQL is running"

echo ""
echo "Step 3: Configuring PostgreSQL authentication..."
PG_VERSION=$(ls /etc/postgresql/ 2>/dev/null | head -n 1)

if [ -n "$PG_VERSION" ]; then
    PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
    sudo cp "$PG_HBA" "$PG_HBA.backup" 2>/dev/null || true
    sudo sed -i 's/local\s\+all\s\+all\s\+peer/local   all             all                                     md5/g' "$PG_HBA"
    sudo sed -i 's/host\s\+all\s\+all\s\+127\.0\.0\.1\/32\s\+scram-sha-256/host    all             all             127.0.0.1\/32            md5/g' "$PG_HBA"
    sudo systemctl restart postgresql
    sleep 2
    print_status "PostgreSQL authentication configured"
else
    print_warning "Could not find PostgreSQL config, using host-based connection"
fi

echo ""
echo "Step 4: Setting up database..."
sudo -u postgres psql << 'SQL'
DROP DATABASE IF EXISTS researchos;
DROP USER IF EXISTS researchos_user;
CREATE DATABASE researchos;
CREATE USER researchos_user WITH PASSWORD 'researchos123';
ALTER USER researchos_user WITH SUPERUSER;
GRANT ALL PRIVILEGES ON DATABASE researchos TO researchos_user;
\c researchos
GRANT ALL ON SCHEMA public TO researchos_user;
SQL

if [ $? -eq 0 ]; then
    print_status "Database created successfully"
else
    print_error "Database creation failed"
    exit 1
fi

echo ""
echo "Step 5: Creating environment files..."
cat > .env << 'ENV'
DATABASE_URL="postgresql://researchos_user:researchos123@127.0.0.1:5432/researchos"
NEXTAUTH_SECRET="researchos-secret-key-change-in-production-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"
ENV

cp .env .env.local
print_status "Environment files created"

echo ""
echo "Step 6: Installing dependencies..."
export NPM_CONFIG_CACHE="$(pwd)/.npm-cache"
mkdir -p .npm-cache

npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    print_status "Dependencies installed"
else
    print_error "Dependency installation failed"
    exit 1
fi

echo ""
echo "Step 7: Setting up database schema..."
npx prisma generate
npx prisma db push --force-reset --skip-generate

if [ $? -eq 0 ]; then
    print_status "Database schema created"
else
    print_error "Database schema creation failed"
    exit 1
fi

echo ""
echo "Step 8: Verifying installation..."
TABLE_COUNT=$(psql -h 127.0.0.1 -U researchos_user -d researchos -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")

if [ "$TABLE_COUNT" -gt 0 ]; then
    print_status "Found $TABLE_COUNT database tables"
else
    print_warning "Could not verify database tables"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "To start the application, run:"
echo "  ./run.sh"
echo ""
echo "Then open your browser to:"
echo "  http://localhost:3000"
echo ""
