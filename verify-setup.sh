#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 LiquidVotes - Installation Verification${NC}\n"

# Check Node version
echo "Checking Node.js version..."
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
  if [ "$NODE_MAJOR" -ge 18 ]; then
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION (OK)"
  else
    echo -e "${RED}✗${NC} Node.js $NODE_VERSION (requires 18+)"
  fi
else
  echo -e "${RED}✗${NC} Node.js not found"
fi

# Check package manager
echo ""
echo "Checking package manager..."
if command -v pnpm &> /dev/null; then
  PNPM_VERSION=$(pnpm --version)
  echo -e "${GREEN}✓${NC} pnpm $PNPM_VERSION"
elif command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  echo -e "${GREEN}✓${NC} npm $NPM_VERSION"
elif command -v yarn &> /dev/null; then
  YARN_VERSION=$(yarn --version)
  echo -e "${GREEN}✓${NC} yarn $YARN_VERSION"
else
  echo -e "${RED}✗${NC} No package manager found"
fi

# Check dependencies
echo ""
echo "Checking project dependencies..."
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} node_modules directory exists"
else
  echo -e "${RED}✗${NC} node_modules not found - run 'pnpm install'"
fi

# Check package.json
echo ""
echo "Checking package.json..."
if [ -f "package.json" ]; then
  echo -e "${GREEN}✓${NC} package.json found"
  
  # Check for key dependencies
  DEPS=("next" "react" "@supabase/supabase-js" "zod" "react-hook-form")
  for dep in "${DEPS[@]}"; do
    if grep -q "\"$dep\"" package.json; then
      echo -e "${GREEN}  ✓${NC} $dep"
    else
      echo -e "${RED}  ✗${NC} $dep missing"
    fi
  done
else
  echo -e "${RED}✗${NC} package.json not found"
fi

# Check environment setup
echo ""
echo "Checking environment configuration..."
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✓${NC} .env.local file exists"
  
  # Check for required variables
  VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
  for var in "${VARS[@]}"; do
    if grep -q "$var" .env.local; then
      echo -e "${GREEN}  ✓${NC} $var configured"
    else
      echo -e "${YELLOW}  ⚠${NC} $var not found"
    fi
  done
else
  echo -e "${YELLOW}⚠${NC} .env.local not found - copy from .env.example"
fi

# Check configuration files
echo ""
echo "Checking configuration files..."
CONFIG_FILES=("next.config.mjs" "tsconfig.json" "tailwind.config.ts" "package.json")
for file in "${CONFIG_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file missing"
  fi
done

# Check documentation
echo ""
echo "Checking documentation..."
DOCS=("README.md" "SETUP.md" ".env.example")
for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    echo -e "${GREEN}✓${NC} $doc"
  else
    echo -e "${RED}✗${NC} $doc missing"
  fi
done

# Check source structure
echo ""
echo "Checking source directories..."
DIRS=("app" "components" "lib" "types" "public")
for dir in "${DIRS[@]}"; do
  if [ -d "$dir" ]; then
    FILE_COUNT=$(find "$dir" -type f -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | wc -l)
    echo -e "${GREEN}✓${NC} $dir ($FILE_COUNT files)"
  else
    echo -e "${RED}✗${NC} $dir directory missing"
  fi
done

# Summary
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "- Run 'pnpm install' if dependencies aren't installed"
echo "- Copy .env.example to .env.local and fill in Supabase credentials"
echo "- Run 'pnpm dev' to start the development server"
echo "- Visit http://localhost:3000 in your browser"
echo ""
echo -e "${GREEN}✓ Setup verification complete!${NC}"
